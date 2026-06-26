import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError } from '@/lib/auth'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({ where: { id } })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    return Response.json(reservation)
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('GET /api/admin/reservations/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    const reservation = await prisma.reservation.findUnique({ where: { id } })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    const { status, notes } = body

    // Validate status transitions
    if (status !== undefined) {
      const validTransitions: Record<string, string[]> = {
        'pending_approval': ['confirmed', 'cancelled'],
        'confirmed': ['cancelled', 'pending_approval'],
      }
      const allowed = validTransitions[reservation.status] || []
      if (!allowed.includes(status)) {
        return Response.json(
          { error: `Cannot transition from ${reservation.status} to ${status}` },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    })

    return Response.json(updated)
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('PATCH /api/admin/reservations/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}