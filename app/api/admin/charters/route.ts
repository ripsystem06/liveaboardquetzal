import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { AuthError, ForbiddenError } from '@/lib/auth'
import { CharterRegistrationSchema, ReservationStatus } from '@/lib/validations'
import { VESSEL_CAPACITY, closedSpots, sumClosedSpots } from '@/lib/reservation-config'

/**
 * POST /api/admin/charters
 * Registers a date-scoped charter (`medio` closes 9 spots, `full` closes 18)
 * as a Reservation row (design decision #7). The spot-closure check is atomic:
 * the same per-date advisory lock + occupied-spots recount used by bookings
 * serializes concurrent registrations so they cannot over-commit. Any
 * occupancy change invalidates the calendar cache (design decision #11).
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()

    const rawBody = await request.json()
    const parsed = CharterRegistrationSchema.safeParse(rawBody)
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

    const charter = await prisma.$transaction(async (tx) => {
      // Serialize spot-closure checks for this departure date (released on commit).
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${body.departureDate}, 0))`

      const active = await tx.reservation.findMany({
        where: {
          departureDate: body.departureDate,
          status: { notIn: [ReservationStatus.enum.expired, ReservationStatus.enum.cancelled] },
        },
        select: { guestCount: true, charterType: true },
      })

      const occupied = sumClosedSpots(active)
      const spotsToClose = closedSpots({
        charterType: body.charterType,
        guestCount: body.guestCount,
      })
      const remainingSpots = VESSEL_CAPACITY - occupied
      if (remainingSpots < spotsToClose) {
        throw { code: 'CHARTER_OVER_CAPACITY', remainingSpots }
      }

      return tx.reservation.create({
        data: {
          // Charters are admin-registered contracts; the admin is the owner.
          userId: admin.userId,
          cruiseId: body.cruiseId,
          cruiseName: body.cruiseName,
          departureDate: body.departureDate,
          route: body.route,
          tier: 'charter',
          tierPrice: 0,
          guestCount: body.guestCount,
          freeSpaces: 0,
          paidSpaces: 0,
          totalAmount: 0,
          charterType: body.charterType,
          status: ReservationStatus.enum.confirmed,
          holdExpiry: new Date(0),
        },
      })
    })

    // Any occupancy change invalidates the calendar cache (design decision #11).
    revalidateTag('cruises-calendar', 'default')

    prisma.auditLog
      .create({
        data: {
          action: 'charter.registered',
          entityType: 'reservation',
          entityId: charter.id,
          actorId: admin.userId,
          actorEmail: admin.email,
          details: JSON.stringify({
            charterType: body.charterType,
            departureDate: body.departureDate,
            guestCount: body.guestCount,
          }),
        },
      })
      .catch((err) => console.error('Audit log failed:', err))

    return Response.json(charter, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      const coded = error as Record<string, unknown>
      if (coded.code === 'CHARTER_OVER_CAPACITY') {
        return Response.json(
          {
            error: 'CHARTER_OVER_CAPACITY',
            message: 'This date cannot fit another charter',
            remainingSpots: coded.remainingSpots,
          },
          { status: 400 }
        )
      }
    }
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('POST /api/admin/charters error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
