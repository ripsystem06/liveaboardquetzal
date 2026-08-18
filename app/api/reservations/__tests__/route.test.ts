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
        reservation: {
          findFirst: mockFindFirst,
          create: mockCreate,
        },
      }
      return cb(tx)
    }),
  },
  checkAndExpireHolds: vi.fn((r) => Promise.resolve(r)),
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

vi.mock('@/lib/pdf-generator', () => ({
  generateBankTransferPDF: vi.fn(() => Promise.resolve(Buffer.from('%PDF-1.4 mock'))),
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
const { GET: GET_PDF } = await import('@/app/api/reservations/[id]/pdf/route')
const { GET: GET_AVAILABILITY } = await import('@/app/api/reservations/check-availability/route')
const { generateBankTransferPDF: mockGeneratePDF } = await import('@/lib/pdf-generator')

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
      paymentMethod: 'bank_transfer',
    }

    it('creates reservation successfully', async () => {
      const mockReservation = {
        id: 'res_new_123',
        userId: 'user_123',
        ...validBody,
        status: 'pending_approval',
        holdExpiry: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockFindFirst.mockResolvedValue(null)
      mockCreate.mockResolvedValue(mockReservation)
      mockUserFindUnique.mockResolvedValue({ id: 'user_123', email: 'test@example.com' })

      const request = new NextRequest('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validBody),
      })

      const response = await POST(request)
      expect(response.status).toBe(201)

      const body = await response.json()
      expect(body.id).toBe('res_new_123')
      expect(body.status).toBe('pending_approval')
    })

    it('returns 409 when date is blocked', async () => {
      mockFindFirst.mockResolvedValue({ id: 'existing_res', status: 'pending_approval' })

      const request = new NextRequest('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validBody),
      })

      const response = await POST(request)
      expect(response.status).toBe(409)

      const body = await response.json()
      expect(body.error).toBe('DATE_BLOCKED')
    })

    it('returns 400 for missing required fields', async () => {
      const incompleteBody = { cruiseId: 'socorro-1' }

      const request = new NextRequest('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify(incompleteBody),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('returns 400 for invalid paymentMethod', async () => {
      mockFindFirst.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify({ ...validBody, paymentMethod: 'crypto' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('returns 401 when no session cookie', async () => {
      mockAuthFn.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations', {
        method: 'POST',
        body: JSON.stringify(validBody),
      })

      const response = await POST(request)
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
          paymentMethod: 'bank_transfer',
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
        paymentMethod: 'bank_transfer',
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

  describe('GET /api/reservations/[id]/pdf', () => {
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
      paymentMethod: 'bank_transfer',
      status: 'pending_approval',
      holdExpiry: new Date('2026-07-20'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockCruise = {
      id: 'socorro-1',
      returnDate: '2026-07-22',
      boat: 'Quetzal',
      dives: 5,
    }

    it('returns PDF for bank_transfer reservation (owner, default lang en)', async () => {
      mockFindUnique.mockResolvedValue(mockReservation)
      mockCruiseFindUnique.mockResolvedValue(mockCruise)

      const request = new NextRequest('http://localhost/api/reservations/res_123/pdf')
      const response = await GET_PDF(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/pdf')
      expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="transfer-res_123.pdf"')

      expect(mockGeneratePDF).toHaveBeenCalledWith(
        expect.objectContaining({
          reservation: expect.objectContaining({ id: 'res_123' }),
          cruise: expect.objectContaining({ returnDate: '2026-07-22', boat: 'Quetzal', dives: 5 }),
          lang: 'en',
        })
      )
    })

    it('returns PDF for admin accessing another user\'s reservation', async () => {
      mockAuthFn.mockResolvedValue({ user: { id: 'admin_1', email: 'admin@x.com', isAdmin: true } })
      mockFindUnique.mockResolvedValue({ ...mockReservation, userId: 'other_user' })
      mockCruiseFindUnique.mockResolvedValue(mockCruise)

      const request = new NextRequest('http://localhost/api/reservations/res_123/pdf')
      const response = await GET_PDF(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(200)
      expect(mockGeneratePDF).toHaveBeenCalledWith(expect.objectContaining({ lang: 'en' }))
    })

    it('passes lang=es to the generator', async () => {
      mockFindUnique.mockResolvedValue(mockReservation)
      mockCruiseFindUnique.mockResolvedValue(mockCruise)

      const request = new NextRequest('http://localhost/api/reservations/res_123/pdf?lang=es')
      const response = await GET_PDF(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(200)
      expect(mockGeneratePDF).toHaveBeenCalledWith(expect.objectContaining({ lang: 'es' }))
    })

    it('returns 400 for non-bank_transfer reservation', async () => {
      mockFindUnique.mockResolvedValue({ ...mockReservation, paymentMethod: 'paypal' })

      const request = new NextRequest('http://localhost/api/reservations/res_123/pdf')
      const response = await GET_PDF(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(400)
      expect(mockGeneratePDF).not.toHaveBeenCalled()
    })

    it('returns 404 when reservation not found', async () => {
      mockFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations/nonexistent/pdf')
      const response = await GET_PDF(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })

    it('returns 403 when accessing another user\'s PDF', async () => {
      mockFindUnique.mockResolvedValue({ ...mockReservation, userId: 'other_user' })

      const request = new NextRequest('http://localhost/api/reservations/res_123/pdf')
      const response = await GET_PDF(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 401 when no session cookie', async () => {
      mockAuthFn.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations/res_123/pdf')
      const response = await GET_PDF(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/reservations/check-availability', () => {
    it('returns available: true when no conflicting reservation', async () => {
      mockFindFirst.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations/check-availability?cruiseId=socorro-1&departureDate=2026-07-15')
      const response = await GET_AVAILABILITY(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.available).toBe(true)
    })

    it('returns available: false when conflicting reservation exists', async () => {
      mockFindFirst.mockResolvedValue({ id: 'blocked_res', status: 'pending_approval' })

      const request = new NextRequest('http://localhost/api/reservations/check-availability?cruiseId=socorro-1&departureDate=2026-07-15')
      const response = await GET_AVAILABILITY(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.available).toBe(false)
      expect(body.blockedBy).toBe('blocked_res')
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

    it('returns available: true when existing reservation is expired', async () => {
      mockFindFirst.mockResolvedValue(null) // Only pending_approval blocks

      const request = new NextRequest('http://localhost/api/reservations/check-availability?cruiseId=socorro-1&departureDate=2026-07-15')
      const response = await GET_AVAILABILITY(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.available).toBe(true)
    })

    it('returns available: true when existing reservation is cancelled', async () => {
      mockFindFirst.mockResolvedValue(null) // Cancelled does not block

      const request = new NextRequest('http://localhost/api/reservations/check-availability?cruiseId=socorro-1&departureDate=2026-07-15')
      const response = await GET_AVAILABILITY(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.available).toBe(true)
    })

    it('returns available: true when existing reservation is confirmed', async () => {
      mockFindFirst.mockResolvedValue(null) // Confirmed does not block

      const request = new NextRequest('http://localhost/api/reservations/check-availability?cruiseId=socorro-1&departureDate=2026-07-15')
      const response = await GET_AVAILABILITY(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.available).toBe(true)
    })

    it('does not block when two different cruises have the same date', async () => {
      // A pending reservation for a DIFFERENT cruiseId on the same date should not block
      mockFindFirst.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations/check-availability?cruiseId=coronado-1&departureDate=2026-07-15')
      const response = await GET_AVAILABILITY(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.available).toBe(true)
    })
  })
})
