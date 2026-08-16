import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError, ForbiddenError } from '@/lib/auth'
import { ReservationStatusUpdateSchema } from '@/lib/validations'
import { sendCrewRegistrationInviteEmail } from '@/lib/email'
import { getSupabaseAdmin, CREW_DOCS_BUCKET } from '@/lib/supabase'

interface RouteParams { params: Promise<{ id: string }> }

/**
 * Sends the crew-registration invite email when a reservation is confirmed.
 * Fetches the owner's email, then dispatches a link to the crew form.
 */
async function sendCrewRegistrationInvite(reservation: {
  id: string
  userId: string
  cruiseName: string
  departureDate: string
}): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: reservation.userId },
    select: { email: true },
  })
  if (user?.email) {
    await sendCrewRegistrationInviteEmail({
      userEmail: user.email,
      reservationId: reservation.id,
      cruiseName: reservation.cruiseName,
      departureDate: reservation.departureDate,
    })
  }
}

/**
 * Deletes a reservation's crew registration and its stored documents.
 * Storage objects are removed first, then the registration row is deleted
 * (guests and document rows cascade at the database level).
 */
export async function cleanupCrewRegistration(reservationId: string): Promise<void> {
  const registration = await prisma.crewRegistration.findUnique({
    where: { reservationId },
    include: { guests: { include: { documents: true } } },
  })
  if (!registration) return

  const storagePaths = registration.guests.flatMap((guest) =>
    guest.documents.map((doc) => doc.storagePath)
  )
  if (storagePaths.length > 0) {
    const supabase = getSupabaseAdmin()
    await supabase.storage.from(CREW_DOCS_BUCKET).remove(storagePaths)
  }

  await prisma.crewRegistration.delete({ where: { id: registration.id } })
}

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
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('GET /api/admin/reservations/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const rawBody = await request.json()
    const reason = (rawBody as Record<string, unknown>).reason as string || ''

    const parsed = ReservationStatusUpdateSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json(
        {
          error: 'Validation failed',
          ...(process.env.NODE_ENV !== 'production' ? { details: parsed.error.flatten() } : {}),
        },
        { status: 400 }
      )
    }
    const { status, notes } = parsed.data

    const reservation = await prisma.reservation.findUnique({ where: { id } })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

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

    const oldStatus = reservation.status

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    })

    if (status !== undefined) {
      await prisma.auditLog.create({
        data: {
          action: 'reservation.status_changed',
          entityType: 'reservation',
          entityId: id,
          actorId: admin.userId,
          actorEmail: admin.email,
          details: JSON.stringify({ oldStatus, newStatus: status, reason }),
        },
      })
    }

    // Crew-registration side-effects (fire-and-forget; failures must not fail
    // the reservation update, which is already committed).
    if (status !== undefined) {
      if (status === 'confirmed' && oldStatus !== 'confirmed') {
        void sendCrewRegistrationInvite(updated).catch((err) =>
          console.error('Failed to send crew registration invite:', err)
        )
      }
      if (status === 'cancelled') {
        void cleanupCrewRegistration(id).catch((err) =>
          console.error('Failed to clean up crew registration on cancel:', err)
        )
      }
    }

    return Response.json(updated)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('PATCH /api/admin/reservations/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
