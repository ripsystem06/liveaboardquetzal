import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/reservations/[id]/confirm
 * Mock PayPal confirmation — transitions reservation to confirmed status.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
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
    console.error('POST /api/reservations/[id]/confirm error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
