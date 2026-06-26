import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const reservations = await prisma.reservation.findMany({})

    const confirmedRevenue = reservations
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + r.totalAmount, 0)

    const pendingCount = reservations.filter(r => r.status === 'pending_approval').length
    const confirmedCount = reservations.filter(r => r.status === 'confirmed').length

    // Group by cruise
    const cruiseMap = new Map<string, { cruiseId: string; cruiseName: string; departureDate: string; count: number; totalGuests: number; revenue: number }>()

    for (const r of reservations) {
      if (r.status !== 'confirmed') continue
      const key = `${r.cruiseId}-${r.departureDate}`
      if (!cruiseMap.has(key)) {
        cruiseMap.set(key, {
          cruiseId: r.cruiseId,
          cruiseName: r.cruiseName,
          departureDate: r.departureDate,
          count: 0,
          totalGuests: 0,
          revenue: 0,
        })
      }
      const entry = cruiseMap.get(key)!
      entry.count++
      entry.totalGuests += r.guestCount
      entry.revenue += r.totalAmount
    }

    const revenueByCruise = Array.from(cruiseMap.values())

    return Response.json({ confirmedRevenue, pendingCount, confirmedCount, revenueByCruise })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('GET /api/admin/dashboard error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}