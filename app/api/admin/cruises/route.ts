import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError } from '@/lib/auth'

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

    const body = await request.json()
    const { name, departureDate, route, boat, basicPrice, standardPrice, premiumPrice, dives, isActive } = body

    if (!name || !departureDate || !route || basicPrice === undefined || standardPrice === undefined || premiumPrice === undefined) {
      return Response.json({ error: 'Missing required fields: name, departureDate, route, basicPrice, standardPrice, premiumPrice' }, { status: 400 })
    }

    // Validate price fields are actual positive integers
    const basicPriceNum = Number(basicPrice)
    const standardPriceNum = Number(standardPrice)
    const premiumPriceNum = Number(premiumPrice)
    const divesNum = Number(dives ?? 5)

    if (!Number.isInteger(basicPriceNum) || basicPriceNum <= 0 ||
        !Number.isInteger(standardPriceNum) || standardPriceNum <= 0 ||
        !Number.isInteger(premiumPriceNum) || premiumPriceNum <= 0 ||
        !Number.isInteger(divesNum) || divesNum < 0) {
      return Response.json({ error: 'Price fields must be positive integers' }, { status: 400 })
    }

    const cruise = await prisma.cruise.create({
      data: {
        name,
        departureDate,
        route,
        boat: boat || 'Quetzal',
        basicPrice: basicPriceNum,
        standardPrice: standardPriceNum,
        premiumPrice: premiumPriceNum,
        dives: divesNum,
        isActive: isActive ?? true,
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