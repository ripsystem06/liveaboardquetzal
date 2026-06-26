import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { AuthError } from '@/lib/auth'

// ===== Mock Prisma =====
const mockReservationFindMany = vi.fn()
const mockReservationFindUnique = vi.fn()
const mockReservationUpdate = vi.fn()
const mockCruiseFindMany = vi.fn()
const mockCruiseFindUnique = vi.fn()
const mockCruiseCreate = vi.fn()
const mockCruiseUpdate = vi.fn()
const mockCruiseDelete = vi.fn()
const mockBlogPostFindMany = vi.fn()
const mockBlogPostFindUnique = vi.fn()
const mockBlogPostCount = vi.fn()
const mockBlogPostFindFirst = vi.fn()
const mockBlogPostDelete = vi.fn()
const mockBlogPostCreate = vi.fn()
const mockReservationFindFirst = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: {
      findMany: mockReservationFindMany,
      findUnique: mockReservationFindUnique,
      update: mockReservationUpdate,
      findFirst: mockReservationFindFirst,
    },
    cruise: {
      findMany: mockCruiseFindMany,
      findUnique: mockCruiseFindUnique,
      create: mockCruiseCreate,
      update: mockCruiseUpdate,
      delete: mockCruiseDelete,
    },
    blogPost: {
      findMany: mockBlogPostFindMany,
      findUnique: mockBlogPostFindUnique,
      count: mockBlogPostCount,
      findFirst: mockBlogPostFindFirst,
      delete: mockBlogPostDelete,
      create: mockBlogPostCreate,
    },
    $transaction: vi.fn(async (callback) => {
      const tx = {
        reservation: {
          findMany: mockReservationFindMany,
          findUnique: mockReservationFindUnique,
          update: mockReservationUpdate,
          findFirst: mockReservationFindFirst,
        },
        cruise: {
          findMany: mockCruiseFindMany,
          findUnique: mockCruiseFindUnique,
          create: mockCruiseCreate,
          update: mockCruiseUpdate,
          delete: mockCruiseDelete,
        },
        blogPost: {
          findMany: mockBlogPostFindMany,
          findUnique: mockBlogPostFindUnique,
          count: mockBlogPostCount,
          findFirst: mockBlogPostFindFirst,
          delete: mockBlogPostDelete,
          create: mockBlogPostCreate,
        },
      }
      return callback(tx)
    }),
  },
  checkAndExpireHolds: vi.fn((r) => Promise.resolve(r)),
}))

vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: vi.fn(),
  AuthError,
}))

vi.mock('@/lib/auth', () => ({
  getAuthUserId: vi.fn(),
  AuthError: class extends Error {
    constructor(m: string) {
      super(m)
      this.name = 'AuthError'
    }
  },
}))

// ===== Import route handlers =====
const { GET: DASHBOARD_GET } = await import('@/app/api/admin/dashboard/route')
const { GET: RESERVATIONS_GET } = await import('@/app/api/admin/reservations/route')
const { GET: RESERVATION_GET, PATCH: RESERVATION_PATCH } = await import('@/app/api/admin/reservations/[id]/route')
const { GET: CRUISES_GET, POST: CRUISES_POST } = await import('@/app/api/admin/cruises/route')
const { GET: CRUISE_GET, PATCH: CRUISE_PATCH, DELETE: CRUISE_DELETE } = await import('@/app/api/admin/cruises/[id]/route')
const { GET: BLOG_GET, POST: BLOG_POST } = await import('@/app/api/admin/blog/route')

describe('Admin API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // GET /api/admin/dashboard
  // ============================================
  describe('GET /api/admin/dashboard', () => {
    it('returns 200 with valid admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockReservationFindMany.mockResolvedValue([
        { id: 'r1', status: 'confirmed', totalAmount: 1000, guestCount: 2, cruiseId: 'c1', cruiseName: 'Socorro', departureDate: '2026-07-15' },
      ])

      const request = new NextRequest('http://localhost/api/admin/dashboard')
      const response = await DASHBOARD_GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.confirmedRevenue).toBe(1000)
    })

    it('returns 403 for non-admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockRejectedValue(new AuthError('Admin access required'))

      const request = new NextRequest('http://localhost/api/admin/dashboard')
      const response = await DASHBOARD_GET(request)

      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body.error).toBe('Admin access required')
    })
  })

  // ============================================
  // GET /api/admin/reservations
  // ============================================
  describe('GET /api/admin/reservations', () => {
    it('returns 200 with valid admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockReservationFindMany.mockResolvedValue([
        { id: 'r1', status: 'confirmed', guestCount: 2 },
      ])

      const request = new NextRequest('http://localhost/api/admin/reservations')
      const response = await RESERVATIONS_GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.reservations).toHaveLength(1)
    })

    it('returns 403 for non-admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockRejectedValue(new AuthError('Admin access required'))

      const request = new NextRequest('http://localhost/api/admin/reservations')
      const response = await RESERVATIONS_GET(request)

      expect(response.status).toBe(403)
    })

    it('returns filtered reservations by status', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockReservationFindMany.mockResolvedValue([
        { id: 'r1', status: 'pending_approval', guestCount: 2 },
      ])

      const request = new NextRequest('http://localhost/api/admin/reservations?status=pending_approval')
      const response = await RESERVATIONS_GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.reservations).toHaveLength(1)
      expect(body.reservations[0].status).toBe('pending_approval')
    })
  })

  // ============================================
  // GET /api/admin/reservations/[id]
  // ============================================
  describe('GET /api/admin/reservations/[id]', () => {
    it('returns 200 with valid admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockReservationFindUnique.mockResolvedValue({
        id: 'r1',
        status: 'confirmed',
        guestCount: 2,
        cruiseId: 'c1',
        cruiseName: 'Socorro',
      })

      const request = new NextRequest('http://localhost/api/admin/reservations/r1')
      const response = await RESERVATION_GET(request, { params: Promise.resolve({ id: 'r1' }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.id).toBe('r1')
    })

    it('returns 404 when reservation not found', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockReservationFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/admin/reservations/nonexistent')
      const response = await RESERVATION_GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })

    it('returns 403 for non-admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockRejectedValue(new AuthError('Admin access required'))

      const request = new NextRequest('http://localhost/api/admin/reservations/r1')
      const response = await RESERVATION_GET(request, { params: Promise.resolve({ id: 'r1' }) })

      expect(response.status).toBe(403)
    })
  })

  // ============================================
  // PATCH /api/admin/reservations/[id] — status transitions
  // ============================================
  describe('PATCH /api/admin/reservations/[id]', () => {
    it('approves pending_approval reservation (200)', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockReservationFindUnique.mockResolvedValue({
        id: 'r1',
        status: 'pending_approval',
        guestCount: 2,
      })
      mockReservationUpdate.mockResolvedValue({
        id: 'r1',
        status: 'confirmed',
        guestCount: 2,
      })

      const request = new NextRequest('http://localhost/api/admin/reservations/r1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'confirmed' }),
      })
      const response = await RESERVATION_PATCH(request, { params: Promise.resolve({ id: 'r1' }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.status).toBe('confirmed')
    })

    it('returns 400 for invalid status transition', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockReservationFindUnique.mockResolvedValue({
        id: 'r1',
        status: 'confirmed',
        guestCount: 2,
      })

      const request = new NextRequest('http://localhost/api/admin/reservations/r1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'confirmed' }),
      })
      const response = await RESERVATION_PATCH(request, { params: Promise.resolve({ id: 'r1' }) })

      expect(response.status).toBe(400)
    })

    it('suspends confirmed reservation (200)', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockReservationFindUnique.mockResolvedValue({
        id: 'r1',
        status: 'confirmed',
        guestCount: 2,
      })
      mockReservationUpdate.mockResolvedValue({
        id: 'r1',
        status: 'pending_approval',
        guestCount: 2,
      })

      const request = new NextRequest('http://localhost/api/admin/reservations/r1', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'pending_approval' }),
      })
      const response = await RESERVATION_PATCH(request, { params: Promise.resolve({ id: 'r1' }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.status).toBe('pending_approval')
    })

    it('updates notes field (200)', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockReservationFindUnique.mockResolvedValue({
        id: 'r1',
        status: 'confirmed',
        guestCount: 2,
      })
      mockReservationUpdate.mockResolvedValue({
        id: 'r1',
        status: 'confirmed',
        guestCount: 2,
        notes: 'Crew: John Doe',
      })

      const request = new NextRequest('http://localhost/api/admin/reservations/r1', {
        method: 'PATCH',
        body: JSON.stringify({ notes: 'Crew: John Doe' }),
      })
      const response = await RESERVATION_PATCH(request, { params: Promise.resolve({ id: 'r1' }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.notes).toBe('Crew: John Doe')
    })
  })

  // ============================================
  // GET /api/admin/cruises
  // ============================================
  describe('GET /api/admin/cruises', () => {
    it('returns 200 with valid admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockCruiseFindMany.mockResolvedValue([
        { id: 'c1', name: 'Socorro', departureDate: '2026-07-15', basicPrice: 2000 },
      ])

      const request = new NextRequest('http://localhost/api/admin/cruises')
      const response = await CRUISES_GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.cruises).toHaveLength(1)
    })

    it('returns 403 for non-admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockRejectedValue(new AuthError('Admin access required'))

      const request = new NextRequest('http://localhost/api/admin/cruises')
      const response = await CRUISES_GET(request)

      expect(response.status).toBe(403)
    })
  })

  // ============================================
  // POST /api/admin/cruises
  // ============================================
  describe('POST /api/admin/cruises', () => {
    it('creates cruise with valid data (201)', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockCruiseCreate.mockResolvedValue({
        id: 'c_new',
        name: 'New Cruise',
        departureDate: '2026-08-01',
        route: 'Socorro',
        boat: 'Quetzal',
        basicPrice: 2000,
        standardPrice: 2500,
        premiumPrice: 3000,
        dives: 5,
        isActive: true,
      })

      const request = new NextRequest('http://localhost/api/admin/cruises', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Cruise',
          departureDate: '2026-08-01',
          route: 'Socorro',
          basicPrice: 2000,
          standardPrice: 2500,
          premiumPrice: 3000,
        }),
      })
      const response = await CRUISES_POST(request)

      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.name).toBe('New Cruise')
    })

    it('returns 400 for missing required fields', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      const request = new NextRequest('http://localhost/api/admin/cruises', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Cruise',
        }),
      })
      const response = await CRUISES_POST(request)

      expect(response.status).toBe(400)
    })

    it('returns 400 for invalid price fields', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      const request = new NextRequest('http://localhost/api/admin/cruises', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Cruise',
          departureDate: '2026-08-01',
          route: 'Socorro',
          basicPrice: -100,
          standardPrice: 2500,
          premiumPrice: 3000,
        }),
      })
      const response = await CRUISES_POST(request)

      expect(response.status).toBe(400)
    })
  })

  // ============================================
  // GET /api/admin/cruises/[id]
  // ============================================
  describe('GET /api/admin/cruises/[id]', () => {
    it('returns 200 with valid admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockCruiseFindUnique.mockResolvedValue({
        id: 'c1',
        name: 'Socorro',
        departureDate: '2026-07-15',
      })

      const request = new NextRequest('http://localhost/api/admin/cruises/c1')
      const response = await CRUISE_GET(request, { params: Promise.resolve({ id: 'c1' }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.id).toBe('c1')
    })

    it('returns 404 when cruise not found', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockCruiseFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/admin/cruises/nonexistent')
      const response = await CRUISE_GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })
  })

  // ============================================
  // PATCH /api/admin/cruises/[id]
  // ============================================
  describe('PATCH /api/admin/cruises/[id]', () => {
    it('updates cruise with valid data (200)', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockCruiseFindUnique.mockResolvedValue({
        id: 'c1',
        name: 'Old Name',
        departureDate: '2026-07-15',
      })
      mockCruiseUpdate.mockResolvedValue({
        id: 'c1',
        name: 'New Name',
        departureDate: '2026-07-15',
      })

      const request = new NextRequest('http://localhost/api/admin/cruises/c1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      })
      const response = await CRUISE_PATCH(request, { params: Promise.resolve({ id: 'c1' }) })

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.name).toBe('New Name')
    })

    it('returns 404 when cruise not found', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockCruiseFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/admin/cruises/nonexistent', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' }),
      })
      const response = await CRUISE_PATCH(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })
  })

  // ============================================
  // DELETE /api/admin/cruises/[id] — 409 on confirmed reservations
  // ============================================
  describe('DELETE /api/admin/cruises/[id] — 409 on confirmed reservations', () => {
    it('returns 200 when cruise has no reservations', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      // $transaction callback: findUnique returns cruise, findFirst returns null
      mockCruiseFindUnique.mockResolvedValue({
        id: 'c1',
        name: 'Socorro',
      })
      mockReservationFindFirst.mockResolvedValue(null)
      mockCruiseDelete.mockResolvedValue({ id: 'c1' })

      const request = new NextRequest('http://localhost/api/admin/cruises/c1', {
        method: 'DELETE',
      })
      const response = await CRUISE_DELETE(request, { params: Promise.resolve({ id: 'c1' }) })

      expect(response.status).toBe(200)
    })

    it('returns 409 when cruise has confirmed reservations', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      // $transaction: findUnique returns cruise, findFirst returns a confirmed reservation
      mockCruiseFindUnique.mockResolvedValue({
        id: 'c1',
        name: 'Socorro',
      })
      mockReservationFindFirst.mockResolvedValue({
        id: 'r1',
        status: 'confirmed',
      })

      const request = new NextRequest('http://localhost/api/admin/cruises/c1', {
        method: 'DELETE',
      })
      const response = await CRUISE_DELETE(request, { params: Promise.resolve({ id: 'c1' }) })

      expect(response.status).toBe(409)
      const body = await response.json()
      expect(body.error).toBe('Cannot delete cruise with existing reservations')
    })

    it('returns 404 when cruise not found', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockCruiseFindUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/admin/cruises/nonexistent', {
        method: 'DELETE',
      })
      const response = await CRUISE_DELETE(request, { params: Promise.resolve({ id: 'nonexistent' }) })

      expect(response.status).toBe(404)
    })
  })

  // ============================================
  // GET /api/admin/blog
  // ============================================
  describe('GET /api/admin/blog', () => {
    it('returns 200 with valid admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockBlogPostFindMany.mockResolvedValue([
        { id: 'p1', title: 'Post 1', content: 'Content', status: 'published' },
      ])

      const request = new NextRequest('http://localhost/api/admin/blog')
      const response = await BLOG_GET(request)

      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.posts).toHaveLength(1)
      expect(body.totalCount).toBe(1)
    })

    it('returns 403 for non-admin session', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockRejectedValue(new AuthError('Admin access required'))

      const request = new NextRequest('http://localhost/api/admin/blog')
      const response = await BLOG_GET(request)

      expect(response.status).toBe(403)
    })
  })

  // ============================================
  // POST /api/admin/blog — FIFO
  // ============================================
  describe('POST /api/admin/blog — FIFO behavior', () => {
    it('returns 201 when fewer than 5 posts exist', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockBlogPostCount.mockResolvedValue(3)
      mockBlogPostCreate.mockResolvedValue({
        id: 'p_new',
        title: 'New Post',
        content: 'Content',
        status: 'published',
      })

      const request = new NextRequest('http://localhost/api/admin/blog', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Post', content: 'Content', status: 'published' }),
      })
      const response = await BLOG_POST(request)

      expect(response.status).toBe(201)
    })

    it('deletes oldest when 5 posts already exist', async () => {
      const { requireAdmin } = await import('@/lib/admin-auth')
      vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

      mockBlogPostCount.mockResolvedValue(5)
      mockBlogPostFindFirst.mockResolvedValue({
        id: 'oldest',
        title: 'Oldest',
        content: 'Old',
        status: 'published',
        createdAt: new Date('2025-01-01'),
      })
      mockBlogPostDelete.mockResolvedValue({ id: 'oldest' })
      mockBlogPostCreate.mockResolvedValue({
        id: 'p_new',
        title: 'New Post',
        content: 'Content',
        status: 'published',
      })

      const request = new NextRequest('http://localhost/api/admin/blog', {
        method: 'POST',
        body: JSON.stringify({ title: 'New Post', content: 'Content', status: 'published' }),
      })
      const response = await BLOG_POST(request)

      expect(response.status).toBe(201)
      expect(mockBlogPostDelete).toHaveBeenCalledWith({ where: { id: 'oldest' } })
    })
  })
})
