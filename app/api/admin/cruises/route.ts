import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError, ForbiddenError } from '@/lib/auth'
import { CreateCruiseSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const cruises = await prisma.cruise.findMany({
      orderBy: { departureDate: 'asc' },
    })

    return Response.json({ cruises })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('GET /api/admin/cruises error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()

    const rawBody = await request.json()

    const parsed = CreateCruiseSchema.safeParse(rawBody)
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

    const cruise = await prisma.cruise.create({
      data: {
        name: body.name,
        departureDate: body.departureDate,
        returnDate: body.returnDate,
        route: body.route,
        boat: body.boat,
        basicPrice: body.basicPrice,
        standardPrice: body.standardPrice,
        premiumPrice: body.premiumPrice,
        dives: body.dives,
        isActive: body.isActive,
      },
    })

    // Fire-and-forget audit log
    prisma.auditLog.create({
      data: {
        action: 'cruise.created',
        entityType: 'cruise',
        entityId: cruise.id,
        actorEmail: admin.email,
        details: JSON.stringify({ name: cruise.name, departureDate: cruise.departureDate, returnDate: cruise.returnDate }),
      },
    }).catch(err => console.error('Audit log failed:', err))

    return Response.json(cruise, { status: 201 })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('POST /api/admin/cruises error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}