import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AvailabilityQuerySchema, ReservationStatus } from '@/lib/validations'
import { VESSEL_CAPACITY, sumClosedSpots } from '@/lib/reservation-config'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

/**
 * GET /api/reservations/check-availability?cruiseId=X&departureDate=Y
 * Reports remaining spots for a departure date: occupied = sum of closed spots
 * over active (non-expired, non-cancelled) reservations for that date.
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const cruiseId = searchParams.get('cruiseId')
    const departureDate = searchParams.get('departureDate')

    const parsed = AvailabilityQuerySchema.safeParse({ cruiseId, departureDate })
    if (!parsed.success) {
      return Response.json(
        {
          error: 'Validation failed',
          ...(process.env.NODE_ENV !== 'production' ? { details: parsed.error.flatten() } : {}),
        },
        { status: 400 }
      )
    }
    const { departureDate: validDepartureDate } = parsed.data

    const active = await prisma.reservation.findMany({
      where: {
        departureDate: validDepartureDate,
        status: { notIn: [ReservationStatus.enum.expired, ReservationStatus.enum.cancelled] },
      },
      select: { guestCount: true, charterType: true },
    })

    const occupied = sumClosedSpots(active)
    const remainingSpots = Math.max(0, VESSEL_CAPACITY - occupied)

    return Response.json({ available: remainingSpots > 0, remainingSpots })
  } catch (error) {
    console.error('GET /api/reservations/check-availability error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
