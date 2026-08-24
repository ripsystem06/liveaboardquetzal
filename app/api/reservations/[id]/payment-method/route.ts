import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, AuthError } from '@/lib/auth'
import { PaymentMethodSelectionSchema } from '@/lib/validations'
import { isReservationPaid } from '@/lib/reservation-config'
import { bankAccounts } from '@/lib/payment-config'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/reservations/[id]/payment-method
 * Owned + `approved` + unpaid → sets `paymentMethod = wire_transfer` and returns
 * the wire-transfer instructions sourced exclusively from `lib/payment-config.ts`.
 *
 * Selecting wire transfer is NOT proof of payment: the reservation stays
 * `approved` and unpaid until an admin confirms the receipt (design decision #5).
 * Stripe method selection is handled separately by `POST /api/stripe/create-payment-intent`
 * (creating an intent is not payment and mutates no method/status), so this
 * route only accepts `wire_transfer`.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const authUserId = session.user.id as string
    const { id } = await params

    const parsed = PaymentMethodSelectionSchema.safeParse(await request.json())
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed' }, { status: 400 })
    }

    // This route owns the wire-transfer method only; Stripe goes through the
    // create-payment-intent endpoint, never through a method-selection mutation.
    if (parsed.data.paymentMethod !== 'wire_transfer') {
      return Response.json(
        {
          error: 'INVALID_PAYMENT_METHOD',
          message: 'This endpoint only accepts the wire_transfer payment method',
        },
        { status: 400 }
      )
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { paymentRecords: true },
    })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Ownership: a user can only select a payment method for their own reservation.
    if (reservation.userId !== authUserId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Approval gate: payment is only offered after admin approval.
    if (reservation.status !== 'approved') {
      return Response.json(
        {
          error: 'INVALID_TRANSITION',
          message: `Cannot select a payment method for a reservation in status: ${reservation.status}`,
        },
        { status: 400 }
      )
    }

    // Unpaid gate: a completed receipt (or confirmed status) means no method change.
    if (isReservationPaid(reservation)) {
      return Response.json(
        { error: 'ALREADY_PAID', message: 'Reservation is already paid' },
        { status: 400 }
      )
    }

    // Selecting wire is a method mutation, NOT payment: status stays `approved`.
    await prisma.reservation.update({
      where: { id },
      data: { paymentMethod: 'wire_transfer' },
    })

    return Response.json({
      reservationId: id,
      paymentMethod: 'wire_transfer',
      instructions: bankAccounts,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('POST /api/reservations/[id]/payment-method error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
