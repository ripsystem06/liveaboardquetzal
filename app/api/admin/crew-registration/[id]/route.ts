import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError, ForbiddenError } from '@/lib/auth'
import { getSupabaseAdmin, CREW_DOCS_BUCKET } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/crew-registration/[id]
 * Full detail for admin review: reservation travel data (section 6) plus every
 * guest's complete field set and documents. Documents get a 60s signed URL so
 * the admin can open them without a public bucket.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params

    const registration = await prisma.crewRegistration.findUnique({
      where: { id },
      include: {
        reservation: {
          select: {
            id: true,
            cruiseName: true,
            departureDate: true,
            route: true,
            guestCount: true,
          },
        },
        guests: {
          orderBy: { guestIndex: 'asc' },
          include: { documents: true },
        },
      },
    })

    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 })
    }

    const supabase = getSupabaseAdmin()
    const guestsWithDocs = await Promise.all(
      registration.guests.map(async (guest) => {
        const documents = await Promise.all(
          guest.documents.map(async (doc) => {
            const { data } = await supabase.storage
              .from(CREW_DOCS_BUCKET)
              .createSignedUrl(doc.storagePath, 60)
            return { ...doc, signedUrl: data?.signedUrl ?? null }
          })
        )
        return { ...guest, documents }
      })
    )

    return Response.json({
      registration: { ...registration, guests: guestsWithDocs },
    })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('GET /api/admin/crew-registration/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
