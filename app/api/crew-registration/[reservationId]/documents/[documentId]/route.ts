import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, AuthError, ForbiddenError } from '@/lib/auth'
import { assertEditable } from '@/lib/crew-registration'
import { getSupabaseAdmin, CREW_DOCS_BUCKET } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ reservationId: string; documentId: string }>
}

/**
 * GET /api/crew-registration/[reservationId]/documents/[documentId]
 * Returns a 60s signed URL for a PII document. Readable only by the
 * reservation owner or an admin.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const userId = session.user.id as string
    const isAdmin = Boolean(session.user.isAdmin)
    const { reservationId, documentId } = await params

    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }
    if (reservation.userId !== userId && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const registration = await prisma.crewRegistration.findUnique({
      where: { reservationId },
    })
    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 })
    }

    const document = await prisma.crewRegistrationDocument.findUnique({
      where: { id: documentId },
      include: { guest: true },
    })
    if (!document || document.guest.registrationId !== registration.id) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.storage
      .from(CREW_DOCS_BUCKET)
      .createSignedUrl(document.storagePath, 60)
    if (error || !data?.signedUrl) {
      return Response.json({ error: 'Failed to sign document URL' }, { status: 500 })
    }

    return Response.json({ url: data.signedUrl })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('GET /api/crew-registration/[reservationId]/documents/[documentId] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/crew-registration/[reservationId]/documents/[documentId]
 * Removes the document row and its storage object. Owner-only, blocked once
 * the registration is approved.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const userId = session.user.id as string
    const { reservationId, documentId } = await params

    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }
    if (reservation.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const registration = await prisma.crewRegistration.findUnique({
      where: { reservationId },
    })
    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 })
    }
    assertEditable(registration.status)

    const document = await prisma.crewRegistrationDocument.findUnique({
      where: { id: documentId },
      include: { guest: true },
    })
    if (!document || document.guest.registrationId !== registration.id) {
      return Response.json({ error: 'Document not found' }, { status: 404 })
    }

    const supabase = getSupabaseAdmin()
    await supabase.storage.from(CREW_DOCS_BUCKET).remove([document.storagePath])

    await prisma.crewRegistrationDocument.delete({ where: { id: documentId } })

    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('DELETE /api/crew-registration/[reservationId]/documents/[documentId] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
