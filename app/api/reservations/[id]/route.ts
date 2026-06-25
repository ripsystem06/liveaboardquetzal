import { NextRequest } from 'next/server'
import { prisma, checkAndExpireHolds } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/reservations/[id]
 * Returns a single reservation with auto-expire check.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Check and expire holds — if status changes from pending_approval to expired,
    // sendExpiryEmail will be called by checkAndExpireHolds
    const processedReservation = await checkAndExpireHolds(reservation)

    return Response.json(processedReservation)
  } catch (error) {
    console.error('GET /api/reservations/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
