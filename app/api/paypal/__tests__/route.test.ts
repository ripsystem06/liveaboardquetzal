import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Mock PayPal REST client ---
const mockCreatePayPalOrder = vi.fn()
const mockCapturePayPalOrder = vi.fn()

vi.mock('@/lib/paypal', () => ({
  createPayPalOrder: mockCreatePayPalOrder,
  capturePayPalOrder: mockCapturePayPalOrder,
}))

// --- Mock prisma ---
const mockReservationFindUnique = vi.fn()
const mockPaymentRecordFindUnique = vi.fn()
const mockPaymentRecordCreate = vi.fn()
const mockUserFindUnique = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: { findUnique: mockReservationFindUnique },
    paymentRecord: {
      findUnique: mockPaymentRecordFindUnique,
      create: mockPaymentRecordCreate,
    },
    user: { findUnique: mockUserFindUnique },
  },
}))

// --- Mock email ---
const mockSendPaymentReceivedEmail = vi.fn()

vi.mock('@/lib/email', () => ({
  sendPaymentReceivedEmail: mockSendPaymentReceivedEmail,
}))

// --- Mock auth ---
const mockAuthFn = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: mockAuthFn,
  AuthError: class extends Error {
    constructor(m: string) {
      super(m)
      this.name = 'AuthError'
    }
  },
}))

const { POST: POST_CREATE } = await import('@/app/api/paypal/create-order/route')
const { POST: POST_CAPTURE } = await import('@/app/api/paypal/capture-order/route')

function pendingReservation(overrides: Record<string, unknown> = {}) {
  return {
    id: 'res_123',
    userId: 'user_123',
    cruiseId: 'socorro-1',
    cruiseName: 'Socorro Islands',
    departureDate: '2026-07-15',
    route: 'Cabo San Lucas',
    tier: 'premium',
    tierPrice: 4700,
    guestCount: 2,
    freeSpaces: 0,
    paidSpaces: 2,
    totalAmount: 9400,
    paymentMethod: 'paypal',
    status: 'pending_approval',
    holdExpiry: new Date('2026-07-20'),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createRequest(path: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('PayPal API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthFn.mockResolvedValue({ user: { id: 'user_123', email: 'test@test.com', isAdmin: false } })
    mockSendPaymentReceivedEmail.mockResolvedValue(undefined)
  })

  describe('POST /api/paypal/create-order', () => {
    it('returns a client-ready order id with the amount derived server-side', async () => {
      mockReservationFindUnique.mockResolvedValue(pendingReservation())
      mockCreatePayPalOrder.mockResolvedValue({ id: 'ORDER-1' })

      const response = await POST_CREATE(createRequest('/api/paypal/create-order', { reservationId: 'res_123' }))

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.orderId).toBe('ORDER-1')

      // Amount is derived from reservation.totalAmount (Int), never from the client body
      expect(mockCreatePayPalOrder).toHaveBeenCalledWith({
        amountUsd: 9400,
        referenceId: 'res_123',
      })
    })

    it('returns 401 when no session', async () => {
      mockAuthFn.mockResolvedValue(null)

      const response = await POST_CREATE(createRequest('/api/paypal/create-order', { reservationId: 'res_123' }))

      expect(response.status).toBe(401)
      expect(mockCreatePayPalOrder).not.toHaveBeenCalled()
    })

    it('returns 403 when the reservation belongs to another user', async () => {
      mockReservationFindUnique.mockResolvedValue(pendingReservation({ userId: 'other_user' }))

      const response = await POST_CREATE(createRequest('/api/paypal/create-order', { reservationId: 'res_123' }))

      expect(response.status).toBe(403)
      expect(mockCreatePayPalOrder).not.toHaveBeenCalled()
    })

    it('returns 404 when the reservation does not exist', async () => {
      mockReservationFindUnique.mockResolvedValue(null)

      const response = await POST_CREATE(createRequest('/api/paypal/create-order', { reservationId: 'missing' }))

      expect(response.status).toBe(404)
      expect(mockCreatePayPalOrder).not.toHaveBeenCalled()
    })

    it('returns 400 when the reservation is not pending_approval', async () => {
      mockReservationFindUnique.mockResolvedValue(pendingReservation({ status: 'confirmed' }))

      const response = await POST_CREATE(createRequest('/api/paypal/create-order', { reservationId: 'res_123' }))

      expect(response.status).toBe(400)
      expect(mockCreatePayPalOrder).not.toHaveBeenCalled()
    })

    it('returns 500 when PayPal order creation throws (e.g. missing credentials)', async () => {
      mockReservationFindUnique.mockResolvedValue(pendingReservation())
      mockCreatePayPalOrder.mockRejectedValue(new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set'))

      const response = await POST_CREATE(createRequest('/api/paypal/create-order', { reservationId: 'res_123' }))

      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/paypal/capture-order', () => {
    it('records a completed PaymentRecord, keeps pending_approval, and emails on COMPLETED capture', async () => {
      mockReservationFindUnique.mockResolvedValue(pendingReservation())
      mockPaymentRecordFindUnique.mockResolvedValue(null)
      mockCapturePayPalOrder.mockResolvedValue({ id: 'ORDER-1', status: 'COMPLETED' })
      mockPaymentRecordCreate.mockResolvedValue({ id: 'pay_1', status: 'completed' })
      mockUserFindUnique.mockResolvedValue({ id: 'user_123', email: 'test@example.com' })

      const response = await POST_CAPTURE(
        createRequest('/api/paypal/capture-order', { reservationId: 'res_123', orderId: 'ORDER-1' })
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.status).toBe('completed')
      expect(body.reservationStatus).toBe('pending_approval')

      // Receipt recorded with server-derived amount + raw capture payload
      expect(mockPaymentRecordCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          reservationId: 'res_123',
          providerOrderId: 'ORDER-1',
          status: 'completed',
          amountUsd: 9400,
        }),
      })
      expect(mockSendPaymentReceivedEmail).toHaveBeenCalledTimes(1)
      // Reservation status never changes to confirmed
      expect(mockReservationFindUnique).toHaveBeenCalled()
    })

    it('returns 502 and records nothing when capture status is not COMPLETED', async () => {
      mockReservationFindUnique.mockResolvedValue(pendingReservation())
      mockPaymentRecordFindUnique.mockResolvedValue(null)
      mockCapturePayPalOrder.mockResolvedValue({ id: 'ORDER-1', status: 'PENDING' })

      const response = await POST_CAPTURE(
        createRequest('/api/paypal/capture-order', { reservationId: 'res_123', orderId: 'ORDER-1' })
      )

      expect(response.status).toBe(502)
      expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
      expect(mockSendPaymentReceivedEmail).not.toHaveBeenCalled()
    })

    it('returns 502 and records nothing when capture throws', async () => {
      mockReservationFindUnique.mockResolvedValue(pendingReservation())
      mockPaymentRecordFindUnique.mockResolvedValue(null)
      mockCapturePayPalOrder.mockRejectedValue(new Error('PayPal capture failed with status 422'))

      const response = await POST_CAPTURE(
        createRequest('/api/paypal/capture-order', { reservationId: 'res_123', orderId: 'ORDER-1' })
      )

      expect(response.status).toBe(502)
      expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
      expect(mockSendPaymentReceivedEmail).not.toHaveBeenCalled()
    })

    it('is idempotent: a repeat capture returns prior success without duplicating receipt or email', async () => {
      mockReservationFindUnique.mockResolvedValue(pendingReservation())
      mockPaymentRecordFindUnique.mockResolvedValue({
        id: 'pay_1',
        status: 'completed',
        providerOrderId: 'ORDER-1',
      })

      const response = await POST_CAPTURE(
        createRequest('/api/paypal/capture-order', { reservationId: 'res_123', orderId: 'ORDER-1' })
      )

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.id).toBe('pay_1')
      expect(body.reservationStatus).toBe('pending_approval')

      expect(mockCapturePayPalOrder).not.toHaveBeenCalled()
      expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
      expect(mockSendPaymentReceivedEmail).not.toHaveBeenCalled()
    })

    it('returns 401 when no session', async () => {
      mockAuthFn.mockResolvedValue(null)

      const response = await POST_CAPTURE(
        createRequest('/api/paypal/capture-order', { reservationId: 'res_123', orderId: 'ORDER-1' })
      )

      expect(response.status).toBe(401)
      expect(mockCapturePayPalOrder).not.toHaveBeenCalled()
    })

    it('returns 403 when the reservation belongs to another user', async () => {
      mockReservationFindUnique.mockResolvedValue(pendingReservation({ userId: 'other_user' }))

      const response = await POST_CAPTURE(
        createRequest('/api/paypal/capture-order', { reservationId: 'res_123', orderId: 'ORDER-1' })
      )

      expect(response.status).toBe(403)
      expect(mockCapturePayPalOrder).not.toHaveBeenCalled()
    })

    it('returns 404 when the reservation does not exist', async () => {
      mockReservationFindUnique.mockResolvedValue(null)

      const response = await POST_CAPTURE(
        createRequest('/api/paypal/capture-order', { reservationId: 'missing', orderId: 'ORDER-1' })
      )

      expect(response.status).toBe(404)
      expect(mockCapturePayPalOrder).not.toHaveBeenCalled()
    })

    it('returns 400 when the reservation is not pending_approval', async () => {
      mockReservationFindUnique.mockResolvedValue(pendingReservation({ status: 'confirmed' }))

      const response = await POST_CAPTURE(
        createRequest('/api/paypal/capture-order', { reservationId: 'res_123', orderId: 'ORDER-1' })
      )

      expect(response.status).toBe(400)
      expect(mockCapturePayPalOrder).not.toHaveBeenCalled()
    })
  })
})
