import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError, ForbiddenError } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/crew-registration/[id]/reject
 * Rejects a `submitted` registration → `rejected` with a MANDATORY reason
 * (400 if missing/blank). Rejection reopens editing for the customer (their
 * next submission returns to `submitted`). Only valid from `submitted`.
 * Writes an AuditLog entry in the same transaction.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    const rawBody = await request.json()
    const reason = (rawBody as Record<string, unknown>).reason
    if (typeof reason !== 'string' || !reason.trim()) {
      return Response.json({ error: 'A reject reason is required' }, { status: 400 })
    }
    const trimmedReason = reason.trim()

    const registration = await prisma.crewRegistration.findUnique({ where: { id } })
    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 })
    }
    if (registration.status !== 'submitted') {
      return Response.json(
        { error: 'Only a submitted registration can be rejected' },
        { status: 400 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const reg = await tx.crewRegistration.update({
        where: { id },
        data: { status: 'rejected', rejectReason: trimmedReason },
      })
      await tx.auditLog.create({
        data: {
          action: 'crew_registration.reject',
          entityType: 'CrewRegistration',
          entityId: id,
          actorId: admin.userId,
          actorEmail: admin.email,
          details: JSON.stringify({ reservationId: reg.reservationId, reason: trimmedReason }),
        },
      })
      return reg
    })

    return Response.json(updated)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('POST /api/admin/crew-registration/[id]/reject error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
