import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError } from '@/lib/auth'
import { CreateCruiseSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const cruises = await prisma.cruise.findMany({
      orderBy: { departureDate: 'asc' },
    })

    return Response.json({ cruises })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('GET /api/admin/cruises error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const rawBody = await request.json()

    const parsed = CreateCruiseSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const body = parsed.data

    const cruise = await prisma.cruise.create({
      data: {
        name: body.name,
        departureDate: body.departureDate,
        route: body.route,
        boat: body.boat,
        basicPrice: body.basicPrice,
        standardPrice: body.standardPrice,
        premiumPrice: body.premiumPrice,
        dives: body.dives,
        isActive: body.isActive,
      },
    })

    return Response.json(cruise, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('POST /api/admin/cruises error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}