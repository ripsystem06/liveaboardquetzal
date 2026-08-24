import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { auth, AuthError } from '@/lib/auth'
import { CreateReservationSchema, ReservationStatus } from '@/lib/validations'
import { activeTermsVersion } from '@/lib/legal/terms'
import { VESSEL_CAPACITY, closedSpots, sumClosedSpots } from '@/lib/reservation-config'
import { sendReservationCreatedEmail } from '@/lib/email'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

/**
 * POST /api/reservations
 * Creates a new reservation with `pending_approval` status and a calculated
 * holdExpiry. Capacity is enforced per departure date (18 spots): requests over
 * 18 are rejected outright, terms are validated against the active server
 * version, and the atomic availability check runs inside a `$transaction`
 * guarded by a per-date advisory lock so concurrent bookings cannot over-commit.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 requests per minute per IP
    const ip = getClientIP(request)
    const rl = await checkRateLimit(ip, 20, 60_000)
    if (!rl.allowed) {
      return Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter!) } },
      )
    }

    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const userId = session.user.id as string
    const rawBody = await request.json()

    const parsed = CreateReservationSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json(
        {
          error: 'Validation failed',
          ...(process.env.NODE_ENV !== 'production' ? { details: parsed.error.flatten() } : {}),
        },
        { status: 400 }
      )
    }
    const body = parsed.data

    // Absolute capacity rejection: no reservation row may exceed the vessel.
    if (body.guestCount > VESSEL_CAPACITY) {
      return Response.json(
        {
          error: 'OVER_CAPACITY',
          message: `Maximum ${VESSEL_CAPACITY} guests per departure`,
        },
        { status: 400 }
      )
    }

    // Server-side T&C validation against the active version (design decision #10).
    if (body.termsVersion !== activeTermsVersion) {
      return Response.json(
        {
          error: 'TERMS_VERSION_MISMATCH',
          message: `Terms version ${body.termsVersion} is not active (current: ${activeTermsVersion})`,
        },
        { status: 400 }
      )
    }

    // Guest bookings are never admin-registered contracts: always "none".
    const charterType = 'none' as const
    const spotsToClose = closedSpots({ charterType, guestCount: body.guestCount })

    // Calculate holdExpiry based on day of week
    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sun, 6=Sat
    const holdHours = (dayOfWeek === 0 || dayOfWeek === 6) ? 72 : 48
    const holdExpiry = new Date(now.getTime() + holdHours * 60 * 60 * 1000)

    // Atomic availability check: per-date advisory lock + occupied-spots recount
    // inside a transaction to prevent over-capacity races.
    const reservation = await prisma.$transaction(async (tx) => {
      // Serialize capacity checks for this departure date (released on commit).
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${body.departureDate}, 0))`

      const active = await tx.reservation.findMany({
        where: {
          departureDate: body.departureDate,
          status: { notIn: [ReservationStatus.enum.expired, ReservationStatus.enum.cancelled] },
        },
        select: { guestCount: true, charterType: true },
      })

      const occupied = sumClosedSpots(active)
      const remainingSpots = VESSEL_CAPACITY - occupied
      if (remainingSpots < spotsToClose) {
        throw { code: 'INSUFFICIENT_SPOTS', remainingSpots }
      }

      return tx.reservation.create({
        data: {
          userId,
          cruiseId: body.cruiseId,
          cruiseName: body.cruiseName,
          departureDate: body.departureDate,
          route: body.route,
          tier: body.tier,
          tierPrice: body.tierPrice,
          guestCount: body.guestCount,
          freeSpaces: body.freeSpaces,
          paidSpaces: body.paidSpaces,
          totalAmount: body.totalAmount,
          charterType,
          cabinDetails: body.cabinDetails === undefined
            ? undefined
            : (body.cabinDetails as unknown as Prisma.InputJsonValue),
          termsVersion: body.termsVersion,
          termsAcceptedAt: now,
          status: ReservationStatus.enum.pending_approval,
          holdExpiry,
        },
      })
    })

    // Any occupancy change invalidates the calendar cache (design decision #11).
    revalidateTag('cruises-calendar', 'default')

    const user = await prisma.user.findUnique({ where: { id: reservation.userId } })

    if (user) {
      sendReservationCreatedEmail({
        id: reservation.id,
        userId: reservation.userId,
        userEmail: user.email,
        cruiseId: reservation.cruiseId,
        cruiseName: reservation.cruiseName,
        departureDate: reservation.departureDate,
        route: reservation.route,
        tier: reservation.tier,
        tierPrice: reservation.tierPrice,
        guestCount: reservation.guestCount,
        freeSpaces: reservation.freeSpaces,
        paidSpaces: reservation.paidSpaces,
        totalAmount: reservation.totalAmount,
        paymentMethod: reservation.paymentMethod,
        status: reservation.status,
        holdExpiry: reservation.holdExpiry,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,
      }).catch(err => console.error('Failed to send reservation created email:', err))
    }

    return Response.json(reservation, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      const coded = error as Record<string, unknown>
      if (coded.code === 'INSUFFICIENT_SPOTS') {
        return Response.json(
          {
            error: 'INSUFFICIENT_SPOTS',
            message: 'Not enough spots remaining for this departure',
            remainingSpots: coded.remainingSpots,
          },
          { status: 400 }
        )
      }
    }
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('POST /api/reservations error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/reservations
 * Lists all reservations for the authenticated user with auto-expiry check.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const userId = session.user.id as string

    const reservations = await prisma.reservation.findMany({
      where: { userId },
    })

    // Check and expire holds for each reservation before returning
    const { checkAndExpireHolds } = await import('@/lib/db')
    const processedReservations = await Promise.all(
      reservations.map((reservation) => checkAndExpireHolds(reservation))
    )

    return Response.json({ reservations: processedReservations })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('GET /api/reservations error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
