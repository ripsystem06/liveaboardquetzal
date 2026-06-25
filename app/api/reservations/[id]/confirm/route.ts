import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUserId, AuthError } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/reservations/[id]/confirm
 * Mock PayPal confirmation — transitions reservation to confirmed status.
 * Requires ownership check - user can only confirm their own reservations.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authUserId = await getAuthUserId()
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

    // Only pending_approval reservations can be confirmed
    if (reservation.status !== 'pending_approval') {
      return Response.json(
        {
          error: 'INVALID_TRANSITION',
          message: `Cannot confirm reservation in status: ${reservation.status}`,
        },
        { status: 400 }
      )
    }

    // Mock confirmation: update status to confirmed
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: 'confirmed' },
    })

    return Response.json({
      id: updated.id,
      status: updated.status,
      message: 'PayPal mock confirmation received',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('POST /api/reservations/[id]/confirm error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
