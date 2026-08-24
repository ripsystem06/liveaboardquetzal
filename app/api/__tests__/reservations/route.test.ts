import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Shared mocks
const mockFindMany = vi.fn()
const mockCreate = vi.fn()
const mockTransaction = vi.fn()
const mockCheckRateLimit = vi.fn()
const mockExecuteRaw = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: {
      findMany: mockFindMany,
      create: mockCreate,
    },
    $transaction: mockTransaction,
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
    },
  },
  checkAndExpireHolds: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-123', name: 'Test', email: 'test@test.com', isAdmin: false } }),
  AuthError: class AuthError extends Error {
    constructor(m: string) { super(m); this.name = 'AuthError' }
  },
}))

vi.mock('@/lib/email', () => ({
  sendReservationCreatedEmail: vi.fn().mockReturnValue({ catch: vi.fn() }),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mockCheckRateLimit,
  getClientIP: vi.fn().mockReturnValue('127.0.0.1'),
}))

const mockRevalidateTag = vi.fn()
vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
  unstable_cache: vi.fn((fn: () => unknown) => fn),
}))

const validBody = {
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
  termsVersion: 3,
}

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/reservations — capacity + booking (RS-REQ-001, RS-REQ-003)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Rate limit allowed by default
    mockCheckRateLimit.mockReturnValue({ allowed: true })
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        $executeRaw: mockExecuteRaw,
        reservation: {
          findMany: mockFindMany,
          create: mockCreate,
        },
      }
      return cb(tx)
    })
    mockFindMany.mockResolvedValue([])
    mockCreate.mockResolvedValue({
      id: 'res-1', userId: 'user-123', ...validBody,
      charterType: 'none', paymentMethod: null,
      status: 'pending_approval', holdExpiry: new Date(),
      createdAt: new Date(), updatedAt: new Date(),
    })
  })

  it('uses prisma.$transaction with a per-date lock to wrap the occupancy check + create', async () => {
    const { POST } = await import('@/app/api/reservations/route')

    const response = await POST(createRequest(validBody))
    expect(response.status).toBe(201)
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockExecuteRaw).toHaveBeenCalled()
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          departureDate: '2026-08-15',
          status: { notIn: ['expired', 'cancelled'] },
        }),
      })
    )
  })

  it('invalidates the calendar cache after a successful booking', async () => {
    const { POST } = await import('@/app/api/reservations/route')

    await POST(createRequest(validBody))
    expect(mockRevalidateTag).toHaveBeenCalledWith('cruises-calendar', 'default')
  })

  it('returns 400 INSUFFICIENT_SPOTS when occupancy leaves no room', async () => {
    const { POST } = await import('@/app/api/reservations/route')

    mockFindMany.mockResolvedValue([{ guestCount: 18, charterType: 'none' }])

    const response = await POST(createRequest({ ...validBody, guestCount: 10 }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('INSUFFICIENT_SPOTS')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 400 OVER_CAPACITY for guestCount > 18', async () => {
    const { POST } = await import('@/app/api/reservations/route')

    const response = await POST(createRequest({ ...validBody, guestCount: 19 }))
    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('OVER_CAPACITY')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 400 TERMS_VERSION_MISMATCH for a stale terms version', async () => {
    const { POST } = await import('@/app/api/reservations/route')

    const response = await POST(createRequest({ ...validBody, termsVersion: 2 }))
    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('TERMS_VERSION_MISMATCH')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 429 with Retry-After when rate limit exceeded', async () => {
    const { POST } = await import('@/app/api/reservations/route')

    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfter: 42 })
    mockTransaction.mockResolvedValue(undefined) // Should not be called

    const response = await POST(createRequest(validBody))
    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('42')
  })
})
