import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, AuthError } from '@/lib/auth'
import { StripeCreateIntentSchema } from '@/lib/validations'
import { isReservationPaid } from '@/lib/reservation-config'
import { createPaymentIntent } from '@/lib/stripe'

/**
 * POST /api/stripe/create-payment-intent
 * Owned + `approved` + unpaid → creates a Stripe PaymentIntent and returns its
 * `clientSecret`. Creating an intent is NOT payment and does NOT mutate status
 * or `paymentMethod`: the webhook is the authoritative validation source.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const authUserId = session.user.id as string

    const parsed = StripeCreateIntentSchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed' }, { status: 400 })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: parsed.data.reservationId },
      include: { paymentRecords: true },
    })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Ownership: a user can only create a payment intent for their own reservation.
    if (reservation.userId !== authUserId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Approval gate: payment is only offered after admin approval.
    if (reservation.status !== 'approved') {
      return Response.json(
        {
          error: 'INVALID_TRANSITION',
          message: `Cannot create a payment intent for a reservation in status: ${reservation.status}`,
        },
        { status: 400 }
      )
    }

    // Unpaid gate: a completed receipt (or confirmed status) means no new intent.
    if (isReservationPaid(reservation)) {
      return Response.json(
        { error: 'ALREADY_PAID', message: 'Reservation is already paid' },
        { status: 400 }
      )
    }

    const { clientSecret } = await createPaymentIntent({
      reservationId: reservation.id,
      amountUsd: reservation.totalAmount,
    })

    return Response.json({ clientSecret })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('POST /api/stripe/create-payment-intent error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
