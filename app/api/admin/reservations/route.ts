import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const cruiseId = searchParams.get('cruiseId')
    const date = searchParams.get('date')

    const where: Record<string, string> = {}
    if (status) where.status = status
    if (cruiseId) where.cruiseId = cruiseId
    if (date) where.departureDate = date

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ reservations })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('GET /api/admin/reservations error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}