import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCruiseFindMany = vi.fn()
const mockReservationFindMany = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    cruise: { findMany: mockCruiseFindMany },
    reservation: { findMany: mockReservationFindMany },
  },
  checkAndExpireHolds: vi.fn(),
}))

// Capture the cache key parts passed to unstable_cache at module load so the
// tag-registration assertion survives `vi.clearAllMocks()` in beforeEach.
let cacheKeyParts: unknown
const mockUnstableCache = vi.fn((fn: () => unknown, keyParts?: unknown) => {
  cacheKeyParts = keyParts
  return fn
})
const mockRevalidateTag = vi.fn()
vi.mock('next/cache', () => ({
  unstable_cache: mockUnstableCache,
  revalidateTag: mockRevalidateTag,
}))

const { GET } = await import('@/app/api/cruises/calendar/route')

function cruiseRow(departureDate: string, id = 'c1') {
  return {
    id,
    name: 'Socorro Islands',
    departureDate,
    returnDate: '2026-07-22',
    route: 'Cabo San Lucas',
    basicPrice: 3200,
    standardPrice: 3500,
    premiumPrice: 4000,
    dives: 5,
    boat: 'Quetzal',
  }
}

describe('GET /api/cruises/calendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCruiseFindMany.mockResolvedValue([cruiseRow('2026-07-15')])
    mockReservationFindMany.mockResolvedValue([])
  })

  it('returns remainingSpots = 18 per date when nothing occupies it', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.expeditions[0].remainingSpots).toBe(18)
    expect(body.byDate['2026-07-15'][0].remainingSpots).toBe(18)
  })

  it('closes 9 spots for a shared group under 10, not the guest count', async () => {
    mockReservationFindMany.mockResolvedValue([
      { departureDate: '2026-07-15', guestCount: 4, charterType: 'none' },
    ])

    const response = await GET()
    const body = await response.json()
    expect(body.expeditions[0].remainingSpots).toBe(9)
  })

  it('shows a full date with remainingSpots 0', async () => {
    mockReservationFindMany.mockResolvedValue([
      { departureDate: '2026-07-15', guestCount: 18, charterType: 'none' },
    ])

    const response = await GET()
    const body = await response.json()
    expect(body.expeditions[0].remainingSpots).toBe(0)
  })

  it('counts a full charter as 18 occupied spots regardless of group size', async () => {
    mockReservationFindMany.mockResolvedValue([
      { departureDate: '2026-07-15', guestCount: 6, charterType: 'full' },
    ])

    const response = await GET()
    const body = await response.json()
    expect(body.expeditions[0].remainingSpots).toBe(0)
  })

  it('excludes expired and cancelled reservations from occupancy', async () => {
    await GET()
    expect(mockReservationFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { notIn: ['expired', 'cancelled'] },
        }),
      })
    )
  })

  it('registers the cruises-calendar tag so occupancy changes can invalidate it', async () => {
    expect(cacheKeyParts).toEqual(['cruises-calendar'])
  })
})
