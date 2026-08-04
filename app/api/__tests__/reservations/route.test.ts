import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Shared mocks
const mockFindFirst = vi.fn()
const mockCreate = vi.fn()  
const mockTransaction = vi.fn()
const mockCheckRateLimit = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: {
      findFirst: mockFindFirst,
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
  paymentMethod: 'paypal' as const,
}

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/reservations — transactional booking (RS-REQ-001, RS-REQ-003)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Rate limit allowed by default
    mockCheckRateLimit.mockReturnValue({ allowed: true })
  })

  it('uses prisma.$transaction to wrap findFirst + create', async () => {
    const { POST } = await import('@/app/api/reservations/route')

    // Simulate the transaction callback pattern
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        reservation: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 'res-1', userId: 'user-123', ...validBody,
            status: 'pending_approval', holdExpiry: new Date(),
            createdAt: new Date(), updatedAt: new Date(),
          }),
        },
      }
      return cb(tx)
    })

    const response = await POST(createRequest(validBody))
    expect(response.status).toBe(201)
    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  it('returns 409 DATE_BLOCKED when conflicting reservation exists', async () => {
    const { POST } = await import('@/app/api/reservations/route')

    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        reservation: {
          findFirst: vi.fn().mockResolvedValue({ id: 'existing-res-1' }),
          create: vi.fn(),
        },
      }
      try {
        return await cb(tx)
      } catch (e: unknown) {
        if (typeof e === 'object' && e !== null && 'code' in e && (e as Record<string,unknown>).code === 'DATE_BLOCKED') {
          throw e
        }
        throw e
      }
    })

    const response = await POST(createRequest(validBody))
    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.error).toBe('DATE_BLOCKED')
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
