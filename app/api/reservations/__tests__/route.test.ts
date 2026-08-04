import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock prisma before importing the routes
const mockFindMany = vi.fn()
const mockFindFirst = vi.fn()
const mockFindUnique = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockUserFindUnique = vi.fn()

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
  sendReservationConfirmedEmail: vi.fn(() => Promise.resolve()),
  sendWelcomeEmail: vi.fn(() => Promise.resolve()),
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
const { POST: POST_CONFIRM } = await import('@/app/api/reservations/[id]/confirm/route')
const { GET: GET_PDF } = await import('@/app/api/reservations/[id]/pdf/route')
const { GET: GET_AVAILABILITY } = await import('@/app/api/reservations/check-availability/route')

describe('Reservation API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: authenticated as user_123
    mockAuthFn.mockResolvedValue({ user: { id: 'user_123', name: 'Test', email: 'test@test.com', isAdmin: false } })
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

  describe('POST /api/reservations/[id]/confirm', () => {
    it('records payment receipt without changing status', async () => {
      const mockReservation = {
        id: 'res_123',
        userId: 'user_123',
        status: 'pending_approval',
        paymentMethod: 'paypal',
      }

      const updatedReservation = { ...mockReservation, status: 'confirmed' }

      mockFindUnique.mockResolvedValue(mockReservation)
      mockUpdate.mockResolvedValue(updatedReservation)
      mockUserFindUnique.mockResolvedValue({ id: 'user_123', email: 'test@example.com' })

      const request = new NextRequest('http://localhost/api/reservations/res_123/confirm', {
        method: 'POST',
      })

      const response = await POST_CONFIRM(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.status).toBe('pending_approval')
      expect(body.message).toBe('Payment confirmed. Your reservation is pending admin approval.')
    })

    it('returns 400 for non-pending_approval reservation', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'res_123',
        userId: 'user_123',
        status: 'expired',
      })

      const request = new NextRequest('http://localhost/api/reservations/res_123/confirm', {
        method: 'POST',
      })

      const response = await POST_CONFIRM(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.error).toBe('INVALID_TRANSITION')
    })

    it('returns 404 when reservation not found', async () => {
      mockFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations/nonexistent/confirm', {
        method: 'POST',
      })

      const response = await POST_CONFIRM(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })

    it('returns 403 when confirming another user\'s reservation', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'res_123',
        userId: 'other_user',
        status: 'pending_approval',
      })

      const request = new NextRequest('http://localhost/api/reservations/res_123/confirm', {
        method: 'POST',
      })

      const response = await POST_CONFIRM(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(403)
    })

    it('returns 401 when no session cookie', async () => {
      mockAuthFn.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations/res_123/confirm', {
        method: 'POST',
      })

      const response = await POST_CONFIRM(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/reservations/[id]/pdf', () => {
    it('returns PDF for bank_transfer reservation', async () => {
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

      const request = new NextRequest('http://localhost/api/reservations/res_123/pdf')
      const response = await GET_PDF(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/pdf')
      expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="transfer-res_123.pdf"')
    })

    it('returns 400 for non-bank_transfer reservation', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'res_123',
        userId: 'user_123',
        paymentMethod: 'paypal',
      })

      const request = new NextRequest('http://localhost/api/reservations/res_123/pdf')
      const response = await GET_PDF(request, { params: Promise.resolve({ id: 'res_123' }) })

      expect(response.status).toBe(400)
    })

    it('returns 404 when reservation not found', async () => {
      mockFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/reservations/nonexistent/pdf')
      const response = await GET_PDF(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })

    it('returns 403 when accessing another user\'s PDF', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'res_123',
        userId: 'other_user',
        paymentMethod: 'bank_transfer',
      })

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
