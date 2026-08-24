import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Prisma mocks ---------------------------------------------------------
const mockReservationFindUnique = vi.fn()
const mockPaymentRecordFindUnique = vi.fn()
const mockPaymentRecordFindFirst = vi.fn()
const mockPaymentRecordCreate = vi.fn()
const mockUserFindUnique = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: { findUnique: mockReservationFindUnique },
    paymentRecord: {
      findUnique: mockPaymentRecordFindUnique,
      findFirst: mockPaymentRecordFindFirst,
      create: mockPaymentRecordCreate,
    },
    user: { findUnique: mockUserFindUnique },
  },
}))

// --- Auth mocks (imported by the create-payment-intent route) -------------
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  AuthError: class AuthError extends Error {
    constructor(m: string) {
      super(m)
      this.name = 'AuthError'
    }
  },
}))

// --- Email mock (imported by the webhook route) ---------------------------
const mockSendConfirmationEmail = vi.fn()
vi.mock('@/lib/email', () => ({
  sendConfirmationEmail: mockSendConfirmationEmail,
}))

// --- Stripe mock: keep the pure whitelist/matching helpers real, mock the
// --- network/secret-dependent functions so no Stripe key is needed. -------
const mockCreatePaymentIntent = vi.fn()
const mockVerifyWebhook = vi.fn()
vi.mock('@/lib/stripe', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/stripe')>()
  return {
    ...actual,
    createPaymentIntent: mockCreatePaymentIntent,
    verifyWebhook: mockVerifyWebhook,
  }
})

const { POST: createPaymentIntentPOST } = await import(
  '@/app/api/stripe/create-payment-intent/route'
)
const { POST: webhookPOST } = await import('@/app/api/stripe/webhook/route')

function baseReservation(overrides: Record<string, unknown> = {}) {
  return {
    id: 'res-1',
    userId: 'user-1',
    cruiseId: 'cruise-1',
    cruiseName: 'Socorro Expedition',
    departureDate: '2026-08-15',
    route: 'Cabo → Socorro',
    tier: 'standard',
    tierPrice: 3500,
    guestCount: 2,
    freeSpaces: 0,
    paidSpaces: 2,
    totalAmount: 7000,
    paymentMethod: null,
    charterType: 'none',
    termsVersion: 3,
    termsAcceptedAt: new Date(),
    confirmationEmailSentAt: null,
    paymentRecords: [],
    status: 'approved',
    holdExpiry: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function succeededIntent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'pi_test_123',
    status: 'succeeded',
    amount: 700000,
    currency: 'usd',
    metadata: { reservationId: 'res-1' },
    ...overrides,
  }
}

function succeededEvent(intent: Record<string, unknown>) {
  return {
    type: 'payment_intent.succeeded',
    data: { object: intent },
  }
}

describe('POST /api/stripe/create-payment-intent', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } })
    mockCreatePaymentIntent.mockResolvedValue({
      id: 'pi_test_123',
      clientSecret: 'pi_test_123_secret_abc',
    })
  })

  function request(): NextRequest {
    return new NextRequest('http://localhost:3000/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId: 'res-1' }),
    })
  }

  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValue(null)

    const response = await createPaymentIntentPOST(request())

    expect(response.status).toBe(401)
  })

  it('returns 403 when the reservation belongs to another user', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ userId: 'other-user' }))

    const response = await createPaymentIntentPOST(request())

    expect(response.status).toBe(403)
    expect(mockCreatePaymentIntent).not.toHaveBeenCalled()
  })

  it('returns 404 when the reservation does not exist', async () => {
    mockReservationFindUnique.mockResolvedValue(null)

    const response = await createPaymentIntentPOST(request())

    expect(response.status).toBe(404)
  })

  it('returns 400 for a non-approved reservation', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'pending_approval' }))

    const response = await createPaymentIntentPOST(request())

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('INVALID_TRANSITION')
    expect(mockCreatePaymentIntent).not.toHaveBeenCalled()
  })

  it('returns 400 for an already-paid reservation', async () => {
    mockReservationFindUnique.mockResolvedValue(
      baseReservation({ paymentRecords: [{ status: 'completed', provider: 'stripe' }] })
    )

    const response = await createPaymentIntentPOST(request())

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('ALREADY_PAID')
    expect(mockCreatePaymentIntent).not.toHaveBeenCalled()
  })

  it('returns the clientSecret for an owned, approved, unpaid reservation', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation())

    const response = await createPaymentIntentPOST(request())

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ clientSecret: 'pi_test_123_secret_abc' })
    expect(mockCreatePaymentIntent).toHaveBeenCalledWith({
      reservationId: 'res-1',
      amountUsd: 7000,
    })
  })
})

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendConfirmationEmail.mockResolvedValue(true)
    mockUserFindUnique.mockResolvedValue({ id: 'user-1', email: 'guest@example.com' })
  })

  function webhookRequest(opts: { body?: string; signature?: string | null } = {}): NextRequest {
    return new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: opts.signature === null ? {} : { 'stripe-signature': opts.signature ?? 'sig' },
      body: opts.body ?? JSON.stringify({}),
    })
  }

  it('returns 400 when the stripe-signature header is missing', async () => {
    const response = await webhookPOST(webhookRequest({ signature: null }))

    expect(response.status).toBe(400)
    expect(mockVerifyWebhook).not.toHaveBeenCalled()
  })

  it('returns 400 when signature verification fails', async () => {
    mockVerifyWebhook.mockImplementation(() => {
      throw new Error('StripeSignatureVerificationError')
    })

    const response = await webhookPOST(webhookRequest())

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('Invalid signature')
    expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
  })

  it('acknowledges and ignores events outside the whitelist', async () => {
    mockVerifyWebhook.mockReturnValue({ type: 'charge.succeeded', data: { object: {} } })

    const response = await webhookPOST(webhookRequest())

    expect(response.status).toBe(200)
    expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
    expect(mockSendConfirmationEmail).not.toHaveBeenCalled()
  })

  it('records a completed receipt and emails once on a matching success event', async () => {
    mockVerifyWebhook.mockReturnValue(succeededEvent(succeededIntent()))
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'approved' }))
    mockPaymentRecordFindUnique.mockResolvedValue(null)
    mockPaymentRecordFindFirst.mockResolvedValue(null)

    const response = await webhookPOST(webhookRequest())

    expect(response.status).toBe(200)
    expect(mockPaymentRecordCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reservationId: 'res-1',
        provider: 'stripe',
        providerOrderId: 'stripe:pi_test_123',
        status: 'completed',
        amountUsd: 7000,
      }),
    })
    expect(mockSendConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(mockSendConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'res-1', userEmail: 'guest@example.com' })
    )
  })

  it('does not validate an amount-mismatched success event', async () => {
    mockVerifyWebhook.mockReturnValue(
      succeededEvent(succeededIntent({ amount: 100 }))
    )
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'approved' }))
    mockPaymentRecordFindUnique.mockResolvedValue(null)

    const response = await webhookPOST(webhookRequest())

    expect(response.status).toBe(200)
    expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
    expect(mockSendConfirmationEmail).not.toHaveBeenCalled()
  })

  it('records completed but sends no email when the reservation is not approved', async () => {
    mockVerifyWebhook.mockReturnValue(succeededEvent(succeededIntent()))
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'pending_approval' }))
    mockPaymentRecordFindUnique.mockResolvedValue(null)
    mockPaymentRecordFindFirst.mockResolvedValue(null)

    const response = await webhookPOST(webhookRequest())

    expect(response.status).toBe(200)
    expect(mockPaymentRecordCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'completed' }),
    })
    expect(mockSendConfirmationEmail).not.toHaveBeenCalled()
  })

  it('is idempotent: a duplicate callback creates no second record or email', async () => {
    mockVerifyWebhook.mockReturnValue(succeededEvent(succeededIntent()))
    mockPaymentRecordFindUnique.mockResolvedValue({ id: 'pr-1', status: 'completed' })

    const response = await webhookPOST(webhookRequest())

    expect(response.status).toBe(200)
    expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
    expect(mockSendConfirmationEmail).not.toHaveBeenCalled()
  })

  it('records a failed receipt and sends no email on a declined/failed event', async () => {
    mockVerifyWebhook.mockReturnValue({
      type: 'payment_intent.payment_failed',
      data: { object: succeededIntent({ id: 'pi_failed_1', status: 'requires_payment_method' }) },
    })
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'approved' }))
    mockPaymentRecordFindUnique.mockResolvedValue(null)

    const response = await webhookPOST(webhookRequest())

    expect(response.status).toBe(200)
    expect(mockPaymentRecordCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        provider: 'stripe',
        providerOrderId: 'stripe:pi_failed_1',
        status: 'failed',
      }),
    })
    expect(mockSendConfirmationEmail).not.toHaveBeenCalled()
  })

  it('does not re-send the confirmation email when it was already sent', async () => {
    mockVerifyWebhook.mockReturnValue(succeededEvent(succeededIntent()))
    mockReservationFindUnique.mockResolvedValue(
      baseReservation({ status: 'approved', confirmationEmailSentAt: new Date() })
    )
    mockPaymentRecordFindUnique.mockResolvedValue(null)
    mockPaymentRecordFindFirst.mockResolvedValue(null)

    const response = await webhookPOST(webhookRequest())

    expect(response.status).toBe(200)
    expect(mockPaymentRecordCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'completed' }),
    })
    expect(mockSendConfirmationEmail).not.toHaveBeenCalled()
  })
})
