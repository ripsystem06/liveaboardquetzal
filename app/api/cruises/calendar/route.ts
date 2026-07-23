import { prisma } from '@/lib/db'

export async function GET() {
  try {
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

    return Response.json({ expeditions, byDate })
  } catch (error) {
    console.error('GET /api/cruises/calendar error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
