import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { AvailabilityQuerySchema, ReservationStatus } from '@/lib/validations'

/**
 * GET /api/reservations/check-availability?cruiseId=X&departureDate=Y
 * Checks if a cruise+date combination is available (no pending_approval reservation).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cruiseId = searchParams.get('cruiseId')
    const departureDate = searchParams.get('departureDate')

    const parsed = AvailabilityQuerySchema.safeParse({ cruiseId, departureDate })
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { cruiseId: validCruiseId, departureDate: validDepartureDate } = parsed.data

    const conflicting = await prisma.reservation.findFirst({
      where: {
        cruiseId: validCruiseId,
        departureDate: validDepartureDate,
        status: ReservationStatus.enum.pending_approval,
      },
    })

    if (conflicting) {
      return Response.json({
        available: false,
        blockedBy: conflicting.id,
      })
    }

    return Response.json({ available: true })
  } catch (error) {
    console.error('GET /api/reservations/check-availability error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
