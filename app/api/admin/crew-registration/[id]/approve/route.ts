import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError, ForbiddenError } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/admin/crew-registration/[id]/approve
 * Approves a `submitted` registration → `approved` (terminal for the customer:
 * PUT/upload/delete become 403). Only valid from `submitted`; otherwise 400.
 * Writes an AuditLog entry in the same transaction.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    const { id } = await params

    const registration = await prisma.crewRegistration.findUnique({ where: { id } })
    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 })
    }
    if (registration.status !== 'submitted') {
      return Response.json(
        { error: 'Only a submitted registration can be approved' },
        { status: 400 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const reg = await tx.crewRegistration.update({
        where: { id },
        data: { status: 'approved' },
      })
      await tx.auditLog.create({
        data: {
          action: 'crew_registration.approve',
          entityType: 'CrewRegistration',
          entityId: id,
          actorId: admin.userId,
          actorEmail: admin.email,
          details: JSON.stringify({ reservationId: reg.reservationId }),
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
    console.error('POST /api/admin/crew-registration/[id]/approve error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
