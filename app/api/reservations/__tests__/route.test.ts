import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock prisma before importing the routes
const mockFindMany = vi.fn()
const mockFindFirst = vi.fn()
const mockFindUnique = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockUserFindUnique = vi.fn()
const mockCruiseFindUnique = vi.fn()
const mockExecuteRaw = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: {
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      findUnique: mockFindUnique,
      create: mockCreate,
      update: mockUpdate,
    },
    user: {
      findUnique: mockUserFindUnique,
    },
    cruise: {
      findUnique: mockCruiseFindUnique,
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        $executeRaw: mockExecuteRaw,
        reservation: {
          findMany: mockFindMany,
          findFirst: mockFindFirst,
          create: mockCreate,
        },
      }
      return cb(tx)
    }),
  },
  checkAndExpireHolds: vi.fn((r) => Promise.resolve(r)),
}))

const mockRevalidateTag = vi.fn()
vi.mock('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
  unstable_cache: vi.fn((fn: () => unknown) => fn),
}))

vi.mock('@/lib/email', () => ({
  sendExpiryEmail: vi.fn(() => Promise.resolve()),
  sendReservationCreatedEmail: vi.fn(() => Promise.resolve()),
  sendWelcomeEmail: vi.fn(() => Promise.resolve()),
}))

const mockCheckRateLimit = vi.fn()
const mockGetClientIP = vi.fn()
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mockCheckRateLimit,
  getClientIP: mockGetClientIP,
}))

const mockAuthFn = vi.fn().mockResolvedValue({ user: { id: 'user_123', name: 'Test', email: 'test@test.com', isAdmin: false } })

vi.mock('@/lib/auth', () => ({
  auth: mockAuthFn,
  AuthError: class extends Error {
    constructor(m: string) {
      super(m)
      this.name = 'AuthError'
    }
  },
}))

// Import route handlers after mocking
const { POST, GET } = await import('@/app/api/reservations/route')
const { GET: GET_SINGLE } = await import('@/app/api/reservations/[id]/route')
const { GET: GET_AVAILABILITY } = await import('@/app/api/reservations/check-availability/route')

describe('Reservation API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: authenticated as user_123
    mockAuthFn.mockResolvedValue({ user: { id: 'user_123', name: 'Test', email: 'test@test.com', isAdmin: false } })
    mockCheckRateLimit.mockReturnValue({ allowed: true })
    mockGetClientIP.mockReturnValue('1.2.3.4')
  })

  describe('POST /api/reservations', () => {
    const validBody = {
      cruiseId: 'socorro-1',
      cruiseName: 'Socorro Islands',
      departureDate: '2026-07-15',
      route: 'Cabo San Lucas',
      tier: 'premium',
      tierPrice: 3200,
      guestCount: 2,
      freeSpaces: 4,
      paidSpaces: 2,
      totalAmount: 6400,
      termsVersion: 3,
    }

    function postRequest(body: Record<string, unknown>) {
      return new NextRequest('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    }

    it('creates reservation successfully and invalidates the calendar cache', async () => {
      const mockReservation = {
        id: 'res_new_123',
        userId: 'user_123',
        ...validBody,
        charterType: 'none',
        cabinDetails: null,
        termsAcceptedAt: new Date(),
        paymentMethod: null,
        status: 'pending_approval',
        holdExpiry: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockFindMany.mockResolvedValue([]) // no active occupancy
      mockCreate.mockResolvedValue(mockReservation)
      mockUserFindUnique.mockResolvedValue({ id: 'user_123', email: 'test@example.com' })

      const response = await POST(postRequest(validBody))
      expect(response.status).toBe(201)

      const body = await response.json()
      expect(body.id).toBe('res_new_123')
      expect(body.status).toBe('pending_approval')

      // Guest booking is always a non-charter; terms accepted + version recorded.
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          charterType: 'none',
          termsVersion: 3,
          termsAcceptedAt: expect.any(Date),
        }),
      })
      expect(mockRevalidateTag).toHaveBeenCalledWith('cruises-calendar', 'default')
    })

    it('returns 400 OVER_CAPACITY for guestCount > 18 and creates no row', async () => {
      const response = await POST(postRequest({ ...validBody, guestCount: 19 }))
      expect(response.status).toBe(400)
      expect((await response.json()).error).toBe('OVER_CAPACITY')
      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockExecuteRaw).not.toHaveBeenCalled()
    })

    it('accepts exactly 18 guests on an empty date', async () => {
      const mockReservation = {
        id: 'res_18',
        userId: 'user_123',
        ...validBody,
        guestCount: 18,
        charterType: 'none',
        status: 'pending_approval',
        holdExpiry: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockFindMany.mockResolvedValue([])
      mockCreate.mockResolvedValue(mockReservation)
      mockUserFindUnique.mockResolvedValue({ id: 'user_123', email: 'test@example.com' })

      const response = await POST(postRequest({ ...validBody, guestCount: 18 }))
      expect(response.status).toBe(201)
    })

    it('returns 400 TERMS_VERSION_MISMATCH for a stale terms version', async () => {
      const response = await POST(postRequest({ ...validBody, termsVersion: 2 }))
      expect(response.status).toBe(400)
      expect((await response.json()).error).toBe('TERMS_VERSION_MISMATCH')
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('returns 400 for a missing termsVersion', async () => {
      const { termsVersion: _omit, ...withoutTerms } = validBody
      const response = await POST(postRequest(withoutTerms))
      expect(response.status).toBe(400)
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('closes 9 spots for a shared group under 10, not the guest count', async () => {
      // 10 already occupied → 8 remaining, so a 2-guest shared booking (9 spots) is rejected.
      mockFindMany.mockResolvedValue([{ guestCount: 10, charterType: 'none' }])

      const response = await POST(postRequest(validBody)) // guestCount 2
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('INSUFFICIENT_SPOTS')
      expect(body.remainingSpots).toBe(8)
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('returns 400 INSUFFICIENT_SPOTS when spots are insufficient', async () => {
      // Full date (18 occupied) → 0 remaining, a 10-guest booking is rejected.
      mockFindMany.mockResolvedValue([{ guestCount: 18, charterType: 'none' }])

      const response = await POST(postRequest({ ...validBody, guestCount: 10 }))
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('INSUFFICIENT_SPOTS')
      expect(body.remainingSpots).toBe(0)
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('re-checks capacity atomically inside a transaction with a per-date lock', async () => {
      mockFindMany.mockResolvedValue([])
      mockCreate.mockResolvedValue({ id: 'res_ok', userId: 'user_123', ...validBody, status: 'pending_approval' })
      mockUserFindUnique.mockResolvedValue({ id: 'user_123', email: 'test@example.com' })

      await POST(postRequest(validBody))
      // The advisory-lock guard ran before occupancy was re-counted.
      expect(mockExecuteRaw).toHaveBeenCalled()
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departureDate: '2026-07-15',
            status: { notIn: ['expired', 'cancelled'] },
          }),
        })
      )
    })

    it('returns 400 for missing required fields', async () => {
      const incompleteBody = { cruiseId: 'socorro-1' }

      const response = await POST(postRequest(incompleteBody))
      expect(response.status).toBe(400)
    })

    it('returns 401 when no session cookie', async () => {
      mockAuthFn.mockResolvedValue(null)

      const response = await POST(postRequest(validBody))
      expect(response.status).toBe(401)

      const body = await response.json()
      expect(body.error).toBe('Authentication required')
    })
  })

  describe('GET /api/reservations', () => {
    it('returns user reservations', async () => {
      const mockReservations = [
        {
          id: 'res_1',
          userId: 'user_123',
          cruiseId: 'socorro-1',
          cruiseName: 'Socorro Islands',
          departureDate: '2026-07-15',
          route: 'Cabo San Lucas',
          tier: 'premium',
          tierPrice: 3200,
          guestCount: 2,
          freeSpaces: 4,
          paidSpaces: 2,
          totalAmount: 6400,
          paymentMethod: 'wire_transfer',
          status: 'pending_approval',
          holdExpiry: new Date('2026-07-20'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockFindMany.mockResolvedValue(mockReservations)

      const request = new NextRequest('http://localhost/api/reservations')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.reservations).toHaveLength(1)
      expect(body.reservations[0].id).toBe('res_1')
    })

    it('returns 401 when no session cookie', async () => {
      mockAuthFn.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/reservations/[id]', () => {
    it('returns single reservation', async () => {
      const mockReservation = {
        id: 'res_123',
        userId: 'user_123',
        cruiseId: 'socorro-1',
        cruiseName: 'Socorro Islands',
        departureDate: '2026-07-15',
        route: 'Cabo San Lucas',
        tier: 'premium',
        tierPrice: 3200,
        guestCount: 2,
        freeSpaces: 4,
        paidSpaces: 2,
        totalAmount: 6400,
        paymentMethod: 'wire_transfer',
        status: 'pending_approval',
        holdExpiry: new Date('2026-07-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockFindUnique.mockResolvedValue(mockReservation)

      const request = new NextRequest('http://localhost/api/reservations/res_123')
      const response = await GET_SINGLE(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.id).toBe('res_123')
    })

    it('returns 404 when reservation not found', async () => {
      mockFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations/nonexistent')
      const response = await GET_SINGLE(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })

    it('returns 403 when accessing another user\'s reservation', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'res_123',
        userId: 'other_user',
      })

      const request = new NextRequest('http://localhost/api/reservations/res_123')
      const response = await GET_SINGLE(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 401 when no session cookie', async () => {
      mockAuthFn.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations/res_123')
      const response = await GET_SINGLE(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/reservations/check-availability', () => {
    const url = 'http://localhost/api/reservations/check-availability?cruiseId=socorro-1&departureDate=2026-07-15'

    it('returns available: true and remainingSpots 18 on an empty date', async () => {
      mockFindMany.mockResolvedValue([])

      const response = await GET_AVAILABILITY(new NextRequest(url))
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.available).toBe(true)
      expect(body.remainingSpots).toBe(18)
    })

    it('closes 9 spots for a shared group under 10, not the guest count', async () => {
      mockFindMany.mockResolvedValue([{ guestCount: 4, charterType: 'none' }])

      const response = await GET_AVAILABILITY(new NextRequest(url))
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.available).toBe(true)
      expect(body.remainingSpots).toBe(9)
    })

    it('returns available: false and remainingSpots 0 when the date is full', async () => {
      mockFindMany.mockResolvedValue([{ guestCount: 18, charterType: 'none' }])

      const response = await GET_AVAILABILITY(new NextRequest(url))
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.available).toBe(false)
      expect(body.remainingSpots).toBe(0)
    })

    it('queries only active reservations (excludes expired and cancelled)', async () => {
      mockFindMany.mockResolvedValue([])

      await GET_AVAILABILITY(new NextRequest(url))
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departureDate: '2026-07-15',
            status: { notIn: ['expired', 'cancelled'] },
          }),
        })
      )
    })

    it('never reports negative remaining spots', async () => {
      // Over-booked date (defensive) still clamps to 0.
      mockFindMany.mockResolvedValue([
        { guestCount: 18, charterType: 'none' },
        { guestCount: 18, charterType: 'none' },
      ])

      const response = await GET_AVAILABILITY(new NextRequest(url))
      const body = await response.json()
      expect(body.remainingSpots).toBe(0)
      expect(body.available).toBe(false)
    })

    it('returns 400 for missing cruiseId', async () => {
      const request = new NextRequest('http://localhost/api/reservations/check-availability?departureDate=2026-07-15')
      const response = await GET_AVAILABILITY(request)
      expect(response.status).toBe(400)
    })

    it('returns 400 for missing departureDate', async () => {
      const request = new NextRequest('http://localhost/api/reservations/check-availability?cruiseId=socorro-1')
      const response = await GET_AVAILABILITY(request)
      expect(response.status).toBe(400)
    })
  })
})
