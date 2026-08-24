import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { ReservationStatus } from '@/lib/validations'
import { VESSEL_CAPACITY, closedSpots } from '@/lib/reservation-config'

// Public expedition calendar with per-date remaining spots. Cached in the Data
// Cache with tag `cruises-calendar`; occupancy changes invalidate the tag so
// stale availability is never served (no TTL — tag-only invalidation).
const getCalendarData = unstable_cache(
  async () => {
    const today = new Date().toISOString().split('T')[0]

    const cruises = await prisma.cruise.findMany({
      where: {
        isActive: true,
        departureDate: {
          gte: today,
        },
      },
      select: {
        id: true,
        name: true,
        departureDate: true,
        returnDate: true,
        route: true,
        basicPrice: true,
        standardPrice: true,
        premiumPrice: true,
        dives: true,
        boat: true,
      },
      orderBy: { departureDate: 'asc' },
    })

    // Occupancy per departure date from active (non-expired, non-cancelled)
    // reservations. Closed spots follow the charter/shared-group rules.
    const activeReservations = await prisma.reservation.findMany({
      where: {
        departureDate: { gte: today },
        status: { notIn: [ReservationStatus.enum.expired, ReservationStatus.enum.cancelled] },
      },
      select: { departureDate: true, guestCount: true, charterType: true },
    })

    const occupiedByDate: Record<string, number> = {}
    for (const r of activeReservations) {
      const spots = closedSpots({ charterType: r.charterType, guestCount: r.guestCount })
      occupiedByDate[r.departureDate] = (occupiedByDate[r.departureDate] ?? 0) + spots
    }

    const expeditions = cruises.map((c) => ({
      ...c,
      priceFrom: c.basicPrice,
      remainingSpots: Math.max(0, VESSEL_CAPACITY - (occupiedByDate[c.departureDate] ?? 0)),
    }))

    const byDate: Record<string, typeof expeditions> = {}
    for (const exp of expeditions) {
      if (!byDate[exp.departureDate]) {
        byDate[exp.departureDate] = []
      }
      byDate[exp.departureDate].push(exp)
    }

    return { expeditions, byDate }
  },
  ['cruises-calendar'],
)

export async function GET() {
  try {
    const data = await getCalendarData()
    return Response.json(data)
  } catch (error) {
    console.error('GET /api/cruises/calendar error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
