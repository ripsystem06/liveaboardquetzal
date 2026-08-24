import { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError, ForbiddenError } from '@/lib/auth'
import { ReservationStatusUpdateSchema } from '@/lib/validations'
import { sendCrewRegistrationInviteEmail, sendConfirmationEmail } from '@/lib/email'
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
    const { status, notes, confirmWireReceipt } = parsed.data

    const reservation = await prisma.reservation.findUnique({ where: { id } })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // --- Admin wire-receipt confirmation (design decision #5) --------------
    // The admin is the validation source for a wire transfer. This branch is
    // idempotent: a completed receipt is recorded at most once per reservation
    // (`providerOrderId` is deterministic + unique), the reservation transitions
    // to `confirmed`, and the confirmation email fires exactly once.
    if (confirmWireReceipt) {
      const providerOrderId = `wire_transfer:${id}`

      // Idempotency: an already-recorded receipt returns the current state
      // without a duplicate record, transition, or email.
      const existing = await prisma.paymentRecord.findUnique({
        where: { providerOrderId },
      })
      if (existing) {
        return Response.json(reservation)
      }

      // Preserve the helper's approved-before-transition requirement: a wire
      // receipt can only validate an `approved` reservation.
      if (reservation.status !== 'approved') {
        return Response.json(
          {
            error: 'INVALID_TRANSITION',
            message: `Cannot confirm wire receipt for a reservation in status: ${reservation.status}`,
          },
          { status: 400 }
        )
      }

      // Record the completed receipt and mark paid/confirmed atomically.
      const updated = await prisma.$transaction(async (tx) => {
        await tx.paymentRecord.create({
          data: {
            reservationId: id,
            provider: 'wire_transfer',
            providerOrderId,
            status: 'completed',
            amountUsd: reservation.totalAmount,
          },
        })
        return tx.reservation.update({
          where: { id },
          data: { status: 'confirmed' },
        })
      })

      // Confirmation email at most once (sendConfirmationEmail no-ops when
      // confirmationEmailSentAt is already set).
      const user = await prisma.user.findUnique({ where: { id: updated.userId } })
      await sendConfirmationEmail({
        id: updated.id,
        userEmail: user?.email ?? '',
        cruiseName: updated.cruiseName,
        departureDate: updated.departureDate,
        route: updated.route,
        tier: updated.tier,
        guestCount: updated.guestCount,
        totalAmount: updated.totalAmount,
        confirmationEmailSentAt: updated.confirmationEmailSentAt ?? null,
      })

      await prisma.auditLog.create({
        data: {
          action: 'wire.receipt_confirmed',
          entityType: 'reservation',
          entityId: id,
          actorId: admin.userId,
          actorEmail: admin.email,
          details: JSON.stringify({ providerOrderId, reason }),
        },
      })

      // Crew-registration side-effect (fire-and-forget) on confirmed.
      void sendCrewRegistrationInvite(updated).catch((err) =>
        console.error('Failed to send crew registration invite:', err)
      )

      return Response.json(updated)
    }

    // --- Status transitions (approve / cancel / re-open) -------------------
    if (status !== undefined) {
      const validTransitions: Record<string, string[]> = {
        'pending_approval': ['approved', 'cancelled'],
        'approved': ['confirmed', 'cancelled', 'pending_approval'],
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

    // Cancellation frees previously-closed spots: invalidate the calendar cache
    // so stale availability is never served (design decision #11).
    if (status === 'cancelled') {
      revalidateTag('cruises-calendar', 'default')
    }

    if (status !== undefined) {
      // Approval is a first-class audited event (observability): emit
      // `reservation.approved` with the same bounded metadata a generic status
      // change carries. Other transitions (cancel / re-open) keep the generic
      // action. `details` is bounded to status + admin-authored reason only.
      const action = status === 'approved' ? 'reservation.approved' : 'reservation.status_changed'
      await prisma.auditLog.create({
        data: {
          action,
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
