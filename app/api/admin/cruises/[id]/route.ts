import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError, ForbiddenError } from '@/lib/auth'
import { UpdateCruiseSchema } from '@/lib/validations'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params

    const cruise = await prisma.cruise.findUnique({ where: { id } })
    if (!cruise) {
      return Response.json({ error: 'Cruise not found' }, { status: 404 })
    }

    return Response.json(cruise)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('GET /api/admin/cruises/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const rawBody = await request.json()

    const parsed = UpdateCruiseSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json(
        {
          error: 'Validation failed',
          ...(process.env.NODE_ENV !== 'production' ? { details: parsed.error.flatten() } : {}),
        },
        { status: 400 }
      )
    }
    const body = parsed.data

    const cruise = await prisma.cruise.findUnique({ where: { id } })
    if (!cruise) {
      return Response.json({ error: 'Cruise not found' }, { status: 404 })
    }

    const updated = await prisma.cruise.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.departureDate !== undefined && { departureDate: body.departureDate }),
        ...(body.returnDate !== undefined && { returnDate: body.returnDate }),
        ...(body.route !== undefined && { route: body.route }),
        ...(body.boat !== undefined && { boat: body.boat }),
        ...(body.basicPrice !== undefined && { basicPrice: body.basicPrice }),
        ...(body.standardPrice !== undefined && { standardPrice: body.standardPrice }),
        ...(body.premiumPrice !== undefined && { premiumPrice: body.premiumPrice }),
        ...(body.dives !== undefined && { dives: body.dives }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    // Fire-and-forget audit log
    prisma.auditLog.create({
      data: {
        action: 'cruise.updated',
        entityType: 'cruise',
        entityId: id,
        actorEmail: admin.email,
        details: JSON.stringify({ changedFields: Object.keys(body) }),
      },
    }).catch(err => console.error('Audit log failed:', err))

    return Response.json(updated)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('PATCH /api/admin/cruises/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    // Use transaction to prevent race conditions when checking and deleting
    await prisma.$transaction(async (tx) => {
      const cruise = await tx.cruise.findUnique({ where: { id } })
      if (!cruise) {
        throw { notFound: true }
      }

      // Check for confirmed reservations
      const confirmedReservations = await tx.reservation.findFirst({
        where: { cruiseId: id, status: 'confirmed' },
      })

      if (confirmedReservations) {
        throw { conflict: true }
      }

      await tx.cruise.delete({ where: { id } })
    })

    // Fire-and-forget audit log
    prisma.auditLog.create({
      data: {
        action: 'cruise.deleted',
        entityType: 'cruise',
        entityId: id,
        actorEmail: admin.email,
      },
    }).catch(err => console.error('Audit log failed:', err))

    return Response.json({ ok: true })
  } catch (error) {
    if (error && typeof error === 'object' && 'notFound' in error) {
      return Response.json({ error: 'Cruise not found' }, { status: 404 })
    }
    if (error && typeof error === 'object' && 'conflict' in error) {
      return Response.json(
        { error: 'Cannot delete cruise with existing reservations' },
        { status: 409 }
      )
    }
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('DELETE /api/admin/cruises/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
