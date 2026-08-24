import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { shouldSendConfirmationEmail } from '@/lib/reservation-config'
import { sendConfirmationEmail } from '@/lib/email'
import {
  verifyWebhook,
  isSuccessEvent,
  isFailureEvent,
  paymentMatchesReservation,
  StripePaymentIntentLike,
} from '@/lib/stripe'

/**
 * POST /api/stripe/webhook
 *
 * Signature-verified Stripe callback (actor Stripe). A success event on the
 * whitelist that matches the reservation (amount + reservation id) records a
 * completed PaymentRecord and, when the reservation is `approved`, sends the
 * confirmation email exactly once. A declined/failed event records a `failed`
 * PaymentRecord. This route NEVER transitions the reservation to `confirmed`
 * (admin-only); validation never auto-confirms.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: ReturnType<typeof verifyWebhook>
  try {
    event = verifyWebhook(rawBody, signature)
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Narrow whitelist: only the success signal validates a payment and only the
  // failure signal records a decline. Everything else is acknowledged + ignored.
  if (!isSuccessEvent(event.type) && !isFailureEvent(event.type)) {
    return Response.json({ received: true })
  }

  const intent = event.data.object as unknown as StripePaymentIntentLike
  const reservationId = intent.metadata?.reservationId

  // No reservation reference → nothing to validate; acknowledge without recording.
  if (!reservationId) {
    return Response.json({ received: true })
  }

  const providerOrderId = `stripe:${intent.id}`

  // Idempotency: a callback already recorded for this provider reference (any
  // status) returns the prior result without a second record/email.
  const existing = await prisma.paymentRecord.findUnique({ where: { providerOrderId } })
  if (existing) {
    return Response.json({ received: true })
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { paymentRecords: true },
  })
  if (!reservation) {
    console.error(
      `Stripe webhook: reservation ${reservationId} not found for intent ${intent.id}`
    )
    return Response.json({ received: true })
  }

  // Declined/failed → record a `failed` receipt; no email, no status change.
  if (isFailureEvent(event.type)) {
    await prisma.paymentRecord.create({
      data: {
        reservationId,
        provider: 'stripe',
        providerOrderId,
        status: 'failed',
        amountUsd: reservation.totalAmount,
        rawPayload: {
          paymentIntentId: intent.id,
          amount: intent.amount,
          currency: intent.currency,
          status: intent.status,
        },
      },
    })
    return Response.json({ received: true })
  }

  // Success event — enforce the amount/reservation match boundary before
  // validating (design open question: "sig-verified + success + match").
  if (!paymentMatchesReservation(intent, reservation)) {
    console.error(
      `Stripe webhook: intent ${intent.id} does not match reservation ${reservation.id} (amount/currency/metadata)`
    )
    return Response.json({ received: true })
  }

  // At-most-once per reservation: a completed receipt from any reference already
  // validates this reservation — never record/charge twice.
  const alreadyValidated = await prisma.paymentRecord.findFirst({
    where: { reservationId, status: 'completed' },
  })
  if (alreadyValidated) {
    return Response.json({ received: true })
  }

  await prisma.paymentRecord.create({
    data: {
      reservationId,
      provider: 'stripe',
      providerOrderId,
      status: 'completed',
      amountUsd: reservation.totalAmount,
      rawPayload: {
        paymentIntentId: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
      },
    },
  })

  // Confirmation email only when `approved` AND validated; no status transition.
  // The predicate runs against the newly-validated state (completed record).
  const validatedReservation = {
    ...reservation,
    paymentRecords: [
      ...(reservation.paymentRecords ?? []),
      { status: 'completed' as const },
    ],
  }
  if (shouldSendConfirmationEmail(validatedReservation)) {
    const user = await prisma.user.findUnique({ where: { id: reservation.userId } })
    await sendConfirmationEmail({
      id: reservation.id,
      userEmail: user?.email ?? '',
      cruiseName: reservation.cruiseName,
      departureDate: reservation.departureDate,
      route: reservation.route,
      tier: reservation.tier,
      guestCount: reservation.guestCount,
      totalAmount: reservation.totalAmount,
      confirmationEmailSentAt: reservation.confirmationEmailSentAt ?? null,
    })
  }

  return Response.json({ received: true })
}
