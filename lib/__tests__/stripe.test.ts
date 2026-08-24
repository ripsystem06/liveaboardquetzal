import { describe, it, expect, vi, afterEach } from 'vitest'
import { createHmac } from 'crypto'
import {
  isSuccessEvent,
  isFailureEvent,
  paymentMatchesReservation,
  createPaymentIntent,
  getStripeClient,
  verifyWebhook,
} from '../stripe'

function signPayload(payload: string, secret: string, timestamp: number): string {
  const signedPayload = `${timestamp}.${payload}`
  const signature = createHmac('sha256', secret).update(signedPayload).digest('hex')
  return `t=${timestamp},v1=${signature}`
}

const baseIntent = {
  id: 'pi_test_123',
  status: 'succeeded',
  amount: 700000,
  currency: 'usd',
  metadata: { reservationId: 'res_1' },
}

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.STRIPE_SECRET_KEY
  delete process.env.STRIPE_WEBHOOK_SECRET
})

describe('Stripe event whitelist', () => {
  it('only payment_intent.succeeded is a success event', () => {
    expect(isSuccessEvent('payment_intent.succeeded')).toBe(true)
    expect(isSuccessEvent('payment_intent.payment_failed')).toBe(false)
    expect(isSuccessEvent('charge.succeeded')).toBe(false)
    expect(isSuccessEvent('payment_intent.created')).toBe(false)
  })

  it('only payment_intent.payment_failed is a failure event', () => {
    expect(isFailureEvent('payment_intent.payment_failed')).toBe(true)
    expect(isFailureEvent('payment_intent.succeeded')).toBe(false)
    expect(isFailureEvent('charge.failed')).toBe(false)
  })
})

describe('paymentMatchesReservation (amount/ownership/status matching boundary)', () => {
  it('matches when reservation id, amount (cents), and currency align', () => {
    expect(paymentMatchesReservation(baseIntent, { id: 'res_1', totalAmount: 7000 })).toBe(true)
  })

  it('rejects a mismatched reservation id', () => {
    const intent = { ...baseIntent, metadata: { reservationId: 'res_OTHER' } }
    expect(paymentMatchesReservation(intent, { id: 'res_1', totalAmount: 7000 })).toBe(false)
  })

  it('rejects a missing reservation reference', () => {
    const intent = { ...baseIntent, metadata: undefined }
    expect(paymentMatchesReservation(intent, { id: 'res_1', totalAmount: 7000 })).toBe(false)
  })

  it('rejects a mismatched amount', () => {
    const intent = { ...baseIntent, amount: 1000 }
    expect(paymentMatchesReservation(intent, { id: 'res_1', totalAmount: 7000 })).toBe(false)
  })

  it('rejects a non-usd currency', () => {
    const intent = { ...baseIntent, currency: 'mxn' }
    expect(paymentMatchesReservation(intent, { id: 'res_1', totalAmount: 7000 })).toBe(false)
  })
})

describe('verifyWebhook (signature-verified parsing)', () => {
  it('returns the parsed event for a valid signature', () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
    const payload = JSON.stringify({
      id: 'evt_1',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: { object: baseIntent },
    })
    const timestamp = Math.floor(Date.now() / 1000)
    const header = signPayload(payload, 'whsec_test_secret', timestamp)

    const event = verifyWebhook(payload, header)

    expect(event.type).toBe('payment_intent.succeeded')
    expect(event.data.object.id).toBe('pi_test_123')
  })

  it('throws for an invalid signature', () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
    expect(() => verifyWebhook('{}', 't=1,v1=deadbeef')).toThrow()
  })

  it('throws when the webhook secret is not configured', () => {
    delete process.env.STRIPE_WEBHOOK_SECRET
    expect(() => verifyWebhook('{}', 't=1,v1=deadbeef')).toThrow(/STRIPE_WEBHOOK_SECRET/)
  })
})

describe('createPaymentIntent', () => {
  it('creates an intent with amount in cents and reservation metadata', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    const client = getStripeClient()
    const createSpy = vi
      .spyOn(client.paymentIntents, 'create')
      .mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
      } as never)

    const result = await createPaymentIntent({ reservationId: 'res_1', amountUsd: 7000 })

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 700000,
        currency: 'usd',
        metadata: { reservationId: 'res_1' },
        automatic_payment_methods: { enabled: true },
      })
    )
    expect(result).toEqual({ id: 'pi_test_123', clientSecret: 'pi_test_123_secret_abc' })
  })

  it('throws when Stripe returns no client_secret', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    const client = getStripeClient()
    vi.spyOn(client.paymentIntents, 'create').mockResolvedValue({
      id: 'pi_test_123',
      client_secret: null,
    } as never)

    await expect(
      createPaymentIntent({ reservationId: 'res_1', amountUsd: 7000 })
    ).rejects.toThrow(/client_secret/)
  })
})
