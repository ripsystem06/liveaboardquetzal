import { NextRequest } from 'next/server'
import { prisma, checkAndExpireHolds } from '@/lib/db'
import { auth, AuthError } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/reservations/[id]
 * Returns a single reservation with auto-expire check.
 * Requires ownership check - user can only access their own reservations.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const authUserId = session.user.id as string
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Ownership check
    if (reservation.userId !== authUserId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check and expire holds — if status changes from pending_approval to expired,
    // sendExpiryEmail will be called by checkAndExpireHolds
    const processedReservation = await checkAndExpireHolds(reservation)

    return Response.json(processedReservation)
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('GET /api/reservations/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
