import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError, ForbiddenError } from '@/lib/auth'

/**
 * GET /api/admin/crew-registration
 * Lists crew registrations with reservation (cruise, departure date, lead
 * name/email), status, and submission date. Filterable by `?status=` with one
 * of the CrewRegistrationStatus values (submitted | approved | rejected).
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, string> = {}
    if (status) where.status = status

    const registrations = await prisma.crewRegistration.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: {
        reservation: {
          select: {
            id: true,
            cruiseName: true,
            departureDate: true,
            route: true,
            guestCount: true,
            user: { select: { name: true, email: true } },
          },
        },
        guests: {
          orderBy: { guestIndex: 'asc' },
          include: { documents: true },
        },
      },
    })

    return Response.json({ registrations })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('GET /api/admin/crew-registration error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
