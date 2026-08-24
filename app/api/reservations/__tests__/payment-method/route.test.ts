import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Prisma mocks ---------------------------------------------------------
const mockReservationFindUnique = vi.fn()
const mockReservationUpdate = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: {
      findUnique: mockReservationFindUnique,
      update: mockReservationUpdate,
    },
  },
}))

// --- Auth mock ------------------------------------------------------------
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  AuthError: class AuthError extends Error {
    constructor(m: string) {
      super(m)
      this.name = 'AuthError'
    }
  },
}))

// Real bankAccounts from the single source of wire instructions.
const { bankAccounts } = await import('@/lib/payment-config')
const { POST } = await import('@/app/api/reservations/[id]/payment-method/route')

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

function request(body: Record<string, unknown> = { paymentMethod: 'wire_transfer' }): NextRequest {
  return new NextRequest('http://localhost:3000/api/reservations/res-1/payment-method', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/reservations/[id]/payment-method', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } })
    mockReservationUpdate.mockResolvedValue({})
  })

  it('returns 401 when unauthenticated', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValue(null)

    const response = await POST(request(), { params: Promise.resolve({ id: 'res-1' }) })

    expect(response.status).toBe(401)
    expect(mockReservationUpdate).not.toHaveBeenCalled()
  })

  it('returns 403 when the reservation belongs to another user', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ userId: 'other-user' }))

    const response = await POST(request(), { params: Promise.resolve({ id: 'res-1' }) })

    expect(response.status).toBe(403)
    expect(mockReservationUpdate).not.toHaveBeenCalled()
  })

  it('returns 404 when the reservation does not exist', async () => {
    mockReservationFindUnique.mockResolvedValue(null)

    const response = await POST(request(), { params: Promise.resolve({ id: 'missing' }) })

    expect(response.status).toBe(404)
    expect(mockReservationUpdate).not.toHaveBeenCalled()
  })

  it('returns 400 for a non-approved reservation', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'pending_approval' }))

    const response = await POST(request(), { params: Promise.resolve({ id: 'res-1' }) })

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('INVALID_TRANSITION')
    expect(mockReservationUpdate).not.toHaveBeenCalled()
  })

  it('returns 400 for an already-paid reservation', async () => {
    mockReservationFindUnique.mockResolvedValue(
      baseReservation({ paymentRecords: [{ status: 'completed', provider: 'wire_transfer' }] })
    )

    const response = await POST(request(), { params: Promise.resolve({ id: 'res-1' }) })

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('ALREADY_PAID')
    expect(mockReservationUpdate).not.toHaveBeenCalled()
  })

  it('returns 400 when the selected method is not wire_transfer', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation())

    const response = await POST(
      request({ paymentMethod: 'stripe' }),
      { params: Promise.resolve({ id: 'res-1' }) }
    )

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('INVALID_PAYMENT_METHOD')
    expect(mockReservationUpdate).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid body', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation())

    const response = await POST(request({}), { params: Promise.resolve({ id: 'res-1' }) })

    expect(response.status).toBe(400)
    expect(mockReservationUpdate).not.toHaveBeenCalled()
  })

  it('sets wire_transfer and returns config-sourced instructions without mutating status', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation())

    const response = await POST(request(), { params: Promise.resolve({ id: 'res-1' }) })

    expect(response.status).toBe(200)
    const body = await response.json()

    // Method is set to wire_transfer and instructions come ONLY from payment-config.
    expect(body.paymentMethod).toBe('wire_transfer')
    expect(body.reservationId).toBe('res-1')
    expect(body.instructions).toEqual(bankAccounts)

    // Selecting wire is a method mutation, not payment: status/records untouched.
    expect(mockReservationUpdate).toHaveBeenCalledWith({
      where: { id: 'res-1' },
      data: { paymentMethod: 'wire_transfer' },
    })
  })
})
