import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError, ForbiddenError } from '@/lib/auth'
import { ReservationStatus } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const [revenueAgg, pendingCount, confirmedCount, confirmedReservations] = await Promise.all([
      prisma.reservation.aggregate({
        _sum: { totalAmount: true },
        where: { status: ReservationStatus.enum.confirmed },
      }),
      prisma.reservation.count({ where: { status: ReservationStatus.enum.pending_approval } }),
      prisma.reservation.count({ where: { status: ReservationStatus.enum.confirmed } }),
      prisma.reservation.findMany({
        where: { status: ReservationStatus.enum.confirmed },
        select: {
          cruiseId: true,
          cruiseName: true,
          departureDate: true,
          guestCount: true,
          totalAmount: true,
        },
      }),
    ])

    const confirmedRevenue = revenueAgg._sum.totalAmount || 0

    // Group confirmed reservations by cruise for revenue breakdown
    const cruiseMap = new Map<string, { cruiseId: string; cruiseName: string; departureDate: string; count: number; totalGuests: number; revenue: number }>()

    for (const r of confirmedReservations) {
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
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('GET /api/admin/dashboard error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
