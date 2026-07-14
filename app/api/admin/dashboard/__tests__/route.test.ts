import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { AuthError } from '@/lib/auth'

const mockReservationAggregate = vi.fn()
const mockReservationCount = vi.fn()
const mockReservationFindMany = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: {
      aggregate: mockReservationAggregate,
      count: mockReservationCount,
      findMany: mockReservationFindMany,
    },
  },
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

const { GET } = await import('@/app/api/admin/dashboard/route')

describe('GET /api/admin/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns dashboard aggregates with confirmed revenue and pending count', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

    mockReservationAggregate.mockResolvedValue({ _sum: { totalAmount: 2400 } })
    mockReservationCount.mockResolvedValueOnce(1).mockResolvedValueOnce(2)
    mockReservationFindMany.mockResolvedValue([
      { cruiseId: 'c1', cruiseName: 'Socorro', departureDate: '2026-07-15', guestCount: 2, totalAmount: 1000 },
      { cruiseId: 'c1', cruiseName: 'Socorro', departureDate: '2026-07-15', guestCount: 2, totalAmount: 1400 },
    ])

    const request = new NextRequest('http://localhost/api/admin/dashboard')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.confirmedRevenue).toBe(2400)
    expect(body.pendingCount).toBe(1)
    expect(body.confirmedCount).toBe(2)
    expect(body.revenueByCruise).toHaveLength(1)
    expect(body.revenueByCruise[0].cruiseName).toBe('Socorro')
    expect(body.revenueByCruise[0].revenue).toBe(2400)
    expect(body.revenueByCruise[0].count).toBe(2)
    expect(body.revenueByCruise[0].totalGuests).toBe(4)
  })

  it('returns zero stats when no reservations exist', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

    mockReservationAggregate.mockResolvedValue({ _sum: { totalAmount: null } })
    mockReservationCount.mockResolvedValueOnce(0).mockResolvedValueOnce(0)
    mockReservationFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/admin/dashboard')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.confirmedRevenue).toBe(0)
    expect(body.pendingCount).toBe(0)
    expect(body.confirmedCount).toBe(0)
    expect(body.revenueByCruise).toHaveLength(0)
  })

  it('returns 403 when user is not admin', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockRejectedValue(new AuthError('Admin access required'))

    const request = new NextRequest('http://localhost/api/admin/dashboard')
    const response = await GET(request)

    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toBe('Admin access required')
  })

  it('groups revenue by cruise correctly with multiple cruises', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

    mockReservationAggregate.mockResolvedValue({ _sum: { totalAmount: 1800 } })
    mockReservationCount.mockResolvedValueOnce(0).mockResolvedValueOnce(2)
    mockReservationFindMany.mockResolvedValue([
      { cruiseId: 'c1', cruiseName: 'Socorro', departureDate: '2026-07-15', guestCount: 2, totalAmount: 1000 },
      { cruiseId: 'c2', cruiseName: 'Coronado', departureDate: '2026-08-01', guestCount: 2, totalAmount: 800 },
    ])

    const request = new NextRequest('http://localhost/api/admin/dashboard')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.confirmedRevenue).toBe(1800)
    expect(body.revenueByCruise).toHaveLength(2)
  })

  it('does not count cancelled or expired reservations in revenue', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockResolvedValue('admin@quetzal.com')

    mockReservationAggregate.mockResolvedValue({ _sum: { totalAmount: 1000 } })
    mockReservationCount.mockResolvedValueOnce(0).mockResolvedValueOnce(1)
    mockReservationFindMany.mockResolvedValue([
      { cruiseId: 'c1', cruiseName: 'Socorro', departureDate: '2026-07-15', guestCount: 2, totalAmount: 1000 },
    ])

    const request = new NextRequest('http://localhost/api/admin/dashboard')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.confirmedRevenue).toBe(1000)
  })
})
