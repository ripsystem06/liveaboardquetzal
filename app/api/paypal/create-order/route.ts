import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, AuthError } from '@/lib/auth'
import { PayPalCreateOrderSchema, ReservationStatus } from '@/lib/validations'
import { createPayPalOrder } from '@/lib/paypal'

/**
 * POST /api/paypal/create-order
 * Creates a PayPal CAPTURE order for an owned, payable reservation.
 * The amount is derived server-side from reservation.totalAmount (never client input).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const userId = session.user.id as string

    const rawBody = await request.json()
    const parsed = PayPalCreateOrderSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed' }, { status: 400 })
    }
    const { reservationId } = parsed.data

    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }
    if (reservation.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (reservation.status !== ReservationStatus.enum.pending_approval) {
      return Response.json(
        {
          error: 'INVALID_TRANSITION',
          message: `Cannot pay a reservation in status: ${reservation.status}`,
        },
        { status: 400 }
      )
    }

    const order = await createPayPalOrder({
      amountUsd: reservation.totalAmount,
      referenceId: reservation.id,
    })

    return Response.json({ orderId: order.id })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('POST /api/paypal/create-order error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
