/**
 * Server-side Stripe integration (design decision #4).
 *
 * Exposes a lazily-created server-only client, payment-intent creation, and
 * signature-verified webhook parsing. Validation is narrow: only the success
 * whitelist below may validate a card payment, and the webhook route enforces an
 * amount/reservation match boundary before recording a receipt. No unsupported
 * event semantics are handled beyond the design's "sig-verified + success +
 * match" contract and its "declined → failed" interface.
 */
import Stripe from 'stripe'

/**
 * Narrow success whitelist — the ONLY event type that validates a card payment.
 * Anything outside this list (or the failure signal below) is acknowledged and
 * ignored by the webhook route.
 */
export const STRIPE_SUCCESS_EVENT_TYPES = ['payment_intent.succeeded'] as const

/**
 * Failure signal mapped to a `failed` PaymentRecord (design interface:
 * "declined → failed"). A `failed` record never validates a payment.
 */
export const STRIPE_FAILURE_EVENT_TYPES = ['payment_intent.payment_failed'] as const

let client: Stripe | null = null

/**
 * Server-only Stripe client. Created lazily so tests and the webhook path can
 * run without a secret key present until a client call is actually made.
 */
export function getStripeClient(): Stripe {
  if (client) return client
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  client = new Stripe(secretKey)
  return client
}

export interface CreatePaymentIntentInput {
  reservationId: string
  /** Whole USD dollars; converted to cents for Stripe. */
  amountUsd: number
}

export interface CreatePaymentIntentResult {
  id: string
  clientSecret: string
}

/**
 * Creates a PaymentIntent for an approved, unpaid reservation. `metadata.reservationId`
 * binds the intent to the reservation so the webhook can match amount + ownership.
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<CreatePaymentIntentResult> {
  const stripe = getStripeClient()
  const intent = await stripe.paymentIntents.create({
    amount: input.amountUsd * 100,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { reservationId: input.reservationId },
  })
  if (!intent.client_secret) {
    throw new Error('Stripe did not return a client_secret for the PaymentIntent')
  }
  return { id: intent.id, clientSecret: intent.client_secret }
}

/**
 * Signature-verifies a raw webhook body and returns the typed event.
 * Throws when the signature is invalid (`StripeSignatureVerificationError`) or
 * when `STRIPE_WEBHOOK_SECRET` is not configured.
 */
export function verifyWebhook(rawBody: string, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }
  // Static access: signature verification needs the webhook secret only, not an
  // API key, so it is decoupled from the server-side client.
  return Stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
}

export function isSuccessEvent(type: string): boolean {
  return (STRIPE_SUCCESS_EVENT_TYPES as readonly string[]).includes(type)
}

export function isFailureEvent(type: string): boolean {
  return (STRIPE_FAILURE_EVENT_TYPES as readonly string[]).includes(type)
}

export interface StripePaymentIntentLike {
  id: string
  status: string
  amount: number
  currency: string
  metadata?: { reservationId?: string } | null
}

/**
 * Amount/reservation matching boundary (design open question: "sig-verified +
 * success + match"). A Stripe payment only validates a reservation when the
 * intent references it by `metadata.reservationId`, the charged amount (cents)
 * equals the reservation's total in USD, and the currency is `usd`.
 */
export function paymentMatchesReservation(
  intent: StripePaymentIntentLike,
  reservation: { id: string; totalAmount: number }
): boolean {
  return (
    intent.metadata?.reservationId === reservation.id &&
    intent.amount === reservation.totalAmount * 100 &&
    intent.currency === 'usd'
  )
}
