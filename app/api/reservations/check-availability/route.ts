import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/reservations/check-availability?cruiseId=X&departureDate=Y
 * Checks if a cruise+date combination is available (no pending_approval reservation).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cruiseId = searchParams.get('cruiseId')
    const departureDate = searchParams.get('departureDate')

    if (!cruiseId) {
      return Response.json({ error: 'Missing required query param: cruiseId' }, { status: 400 })
    }
    if (!departureDate) {
      return Response.json({ error: 'Missing required query param: departureDate' }, { status: 400 })
    }

    const conflicting = await prisma.reservation.findFirst({
      where: {
        cruiseId,
        departureDate,
        status: 'pending_approval',
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
