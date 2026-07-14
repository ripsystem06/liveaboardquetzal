import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId, AuthError } from '@/lib/auth'
import { CreateReservationSchema, ReservationStatus } from '@/lib/validations'

/**
 * POST /api/reservations
 * Creates a new reservation with pending_approval status and calculated holdExpiry.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId()
    const rawBody = await request.json()

    const parsed = CreateReservationSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const body = parsed.data

    // Date blocking check: prevent duplicate reservations for same cruise+date
    const conflicting = await prisma.reservation.findFirst({
      where: {
        cruiseId: body.cruiseId,
        departureDate: body.departureDate,
        status: ReservationStatus.enum.pending_approval,
      },
    })

    if (conflicting) {
      return Response.json(
        { error: 'DATE_BLOCKED', message: 'Cruise date is currently held by another reservation' },
        { status: 409 }
      )
    }

    // Calculate holdExpiry based on day of week
    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sun, 6=Sat
    const holdHours = (dayOfWeek === 0 || dayOfWeek === 6) ? 72 : 48
    const holdExpiry = new Date(now.getTime() + holdHours * 60 * 60 * 1000)

    const reservation = await prisma.reservation.create({
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

    return Response.json(reservation, { status: 201 })
  } catch (error) {
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
