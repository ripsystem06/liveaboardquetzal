import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'

// Public expedition calendar changes rarely (a few rows). Cache it in the Data
// Cache for 60s so repeat visits (and warm instances) avoid a Supabase round-trip
// on every request.
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

    const expeditions = cruises.map((c) => ({
      ...c,
      priceFrom: c.basicPrice,
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
  { revalidate: 60 },
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
