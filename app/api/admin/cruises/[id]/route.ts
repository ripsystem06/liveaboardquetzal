import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError } from '@/lib/auth'

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
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('GET /api/admin/cruises/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    const cruise = await prisma.cruise.findUnique({ where: { id } })
    if (!cruise) {
      return Response.json({ error: 'Cruise not found' }, { status: 404 })
    }

    // Validate price fields are actual positive integers if provided
    if (body.basicPrice !== undefined) {
      const basicPriceNum = Number(body.basicPrice)
      if (!Number.isInteger(basicPriceNum) || basicPriceNum <= 0) {
        return Response.json({ error: 'basicPrice must be a positive integer' }, { status: 400 })
      }
    }
    if (body.standardPrice !== undefined) {
      const standardPriceNum = Number(body.standardPrice)
      if (!Number.isInteger(standardPriceNum) || standardPriceNum <= 0) {
        return Response.json({ error: 'standardPrice must be a positive integer' }, { status: 400 })
      }
    }
    if (body.premiumPrice !== undefined) {
      const premiumPriceNum = Number(body.premiumPrice)
      if (!Number.isInteger(premiumPriceNum) || premiumPriceNum <= 0) {
        return Response.json({ error: 'premiumPrice must be a positive integer' }, { status: 400 })
      }
    }
    if (body.dives !== undefined) {
      const divesNum = Number(body.dives)
      if (!Number.isInteger(divesNum) || divesNum < 0) {
        return Response.json({ error: 'dives must be a non-negative integer' }, { status: 400 })
      }
    }

    const updated = await prisma.cruise.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.departureDate !== undefined && { departureDate: body.departureDate }),
        ...(body.route !== undefined && { route: body.route }),
        ...(body.boat !== undefined && { boat: body.boat }),
        ...(body.basicPrice !== undefined && { basicPrice: Number(body.basicPrice) }),
        ...(body.standardPrice !== undefined && { standardPrice: Number(body.standardPrice) }),
        ...(body.premiumPrice !== undefined && { premiumPrice: Number(body.premiumPrice) }),
        ...(body.dives !== undefined && { dives: Number(body.dives) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return Response.json(updated)
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('PATCH /api/admin/cruises/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
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
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('DELETE /api/admin/cruises/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}