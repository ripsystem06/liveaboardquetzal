import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId, AuthError } from '@/lib/auth'
import { CreateReservationSchema, ReservationStatus } from '@/lib/validations'
import { sendReservationCreatedEmail } from '@/lib/email'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

/**
 * POST /api/reservations
 * Creates a new reservation with pending_approval status and calculated holdExpiry.
 * Uses a database transaction to prevent double-booking race conditions.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 requests per minute per IP
    const ip = getClientIP(request)
    const rl = checkRateLimit(ip, 20, 60_000)
    if (!rl.allowed) {
      return Response.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter!) } },
      )
    }

    const userId = await getAuthUserId()
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

    // Calculate holdExpiry based on day of week
    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sun, 6=Sat
    const holdHours = (dayOfWeek === 0 || dayOfWeek === 6) ? 72 : 48
    const holdExpiry = new Date(now.getTime() + holdHours * 60 * 60 * 1000)

    // Wrap in transaction to prevent double-booking
    const reservation = await prisma.$transaction(async (tx) => {
      // Date blocking check: prevent duplicate reservations for same cruise+date
      const conflicting = await tx.reservation.findFirst({
        where: {
          cruiseId: body.cruiseId,
          departureDate: body.departureDate,
          status: ReservationStatus.enum.pending_approval,
        },
      })

      if (conflicting) {
        throw { code: 'DATE_BLOCKED' }
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
          paymentMethod: body.paymentMethod,
          status: ReservationStatus.enum.pending_approval,
          holdExpiry,
        },
      })
    })

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
    if (error && typeof error === 'object' && 'code' in error && (error as Record<string, unknown>).code === 'DATE_BLOCKED') {
      return Response.json(
        { error: 'DATE_BLOCKED', message: 'Cruise date is currently held by another reservation' },
        { status: 409 }
      )
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
    const userId = await getAuthUserId()

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
