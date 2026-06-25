import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

interface CreateReservationBody {
  userId: string
  cruiseId: string
  cruiseName: string
  departureDate: string
  route: string
  tier: string
  tierPrice: number
  guestCount: number
  freeSpaces: number
  paidSpaces: number
  totalAmount: number
  paymentMethod: string
}

/**
 * POST /api/reservations
 * Creates a new reservation with pending_approval status and calculated holdExpiry.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateReservationBody = await request.json()

    // Basic validation
    const requiredFields: (keyof CreateReservationBody)[] = [
      'userId', 'cruiseId', 'cruiseName', 'departureDate', 'route',
      'tier', 'tierPrice', 'guestCount', 'freeSpaces', 'paidSpaces',
      'totalAmount', 'paymentMethod',
    ]
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return Response.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate paymentMethod
    if (body.paymentMethod !== 'paypal' && body.paymentMethod !== 'bank_transfer') {
      return Response.json(
        { error: 'Invalid paymentMethod. Must be "paypal" or "bank_transfer"' },
        { status: 400 }
      )
    }

    // Date blocking check: prevent duplicate reservations for same cruise+date
    const conflicting = await prisma.reservation.findFirst({
      where: {
        cruiseId: body.cruiseId,
        departureDate: body.departureDate,
        status: 'pending_approval',
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
        userId: body.userId,
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
        status: 'pending_approval',
        holdExpiry,
      },
    })

    return Response.json(reservation, { status: 201 })
  } catch (error) {
    console.error('POST /api/reservations error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/reservations?userId=X
 * Lists all reservations for a user with auto-expiry check.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return Response.json({ error: 'Missing required query param: userId' }, { status: 400 })
    }

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
    console.error('GET /api/reservations error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
