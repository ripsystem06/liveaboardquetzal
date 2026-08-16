import { NextRequest } from 'next/server'
import { randomUUID } from 'node:crypto'
import { prisma } from '@/lib/db'
import { auth, AuthError, ForbiddenError } from '@/lib/auth'
import { CrewDocumentKind } from '@/lib/validations'
import { assertEditable } from '@/lib/crew-registration'
import { getSupabaseAdmin, CREW_DOCS_BUCKET } from '@/lib/supabase'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024 // 4 MB (Vercel serverless body limit)
const MAX_DOCS_PER_GUEST = 5

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png'])

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
}

interface RouteParams {
  params: Promise<{ reservationId: string }>
}

/**
 * POST /api/crew-registration/[reservationId]/documents
 * Validates a multipart upload (MIME whitelist, 4 MB cap, per-guest and
 * per-submission caps) BEFORE storing it in the private `crew-docs` bucket.
 * The object key is server-generated from the validated `kind` — never from
 * user input. Replacing a same-kind document removes the previous object.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const ip = getClientIP(request)
    const rl = await checkRateLimit(`crew-docs:upload:${ip}`, 20, 60_000)
    if (!rl.allowed) {
      return Response.json(
        { error: 'Too many uploads. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter ?? 60) } }
      )
    }

    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const userId = session.user.id as string
    const { reservationId } = await params

    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }
    if (reservation.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (reservation.status !== 'confirmed') {
      return Response.json({ error: 'Reservation is not confirmed' }, { status: 403 })
    }

    const registration = await prisma.crewRegistration.findUnique({
      where: { reservationId },
    })
    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 })
    }
    assertEditable(registration.status)

    const formData = await request.formData()
    const file = formData.get('file')
    const guestId = formData.get('guestId')
    const rawKind = formData.get('kind')

    // NOTE: `file instanceof File` is unreliable here — NextRequest's formData()
    // yields an undici File whose constructor differs from the global File,
    // so instanceof fails across realms. Duck-type the check instead.
    if (!file || typeof file === 'string') {
      return Response.json({ error: 'File is required' }, { status: 400 })
    }
    if (typeof guestId !== 'string' || !guestId) {
      return Response.json({ error: 'guestId is required' }, { status: 400 })
    }
    if (typeof rawKind !== 'string') {
      return Response.json({ error: 'kind is required' }, { status: 400 })
    }

    const kindParsed = CrewDocumentKind.safeParse(rawKind)
    if (!kindParsed.success) {
      return Response.json({ error: 'Invalid document kind' }, { status: 400 })
    }
    const kind = kindParsed.data

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return Response.json(
        { error: 'Unsupported file type. Allowed: application/pdf, image/jpeg, image/png' },
        { status: 400 }
      )
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        { error: 'File exceeds the 4 MB size limit' },
        { status: 400 }
      )
    }

    const guest = await prisma.crewRegistrationGuest.findUnique({
      where: { id: guestId },
    })
    if (!guest || guest.registrationId !== registration.id) {
      return Response.json({ error: 'Guest not found' }, { status: 404 })
    }

    const guestDocCount = await prisma.crewRegistrationDocument.count({
      where: { guestId },
    })
    if (guestDocCount >= MAX_DOCS_PER_GUEST) {
      return Response.json(
        { error: `Guest already has ${MAX_DOCS_PER_GUEST} documents` },
        { status: 400 }
      )
    }

    const submissionDocCount = await prisma.crewRegistrationDocument.count({
      where: { guest: { registrationId: registration.id } },
    })
    const submissionCap = MAX_DOCS_PER_GUEST * reservation.guestCount
    if (submissionDocCount >= submissionCap) {
      return Response.json(
        { error: `Registration document cap reached (${submissionCap})` },
        { status: 400 }
      )
    }

    const ext = MIME_TO_EXT[file.type]
    const key = `${reservationId}/${guestId}/${kind}-${randomUUID()}.${ext}`

    const existing = await prisma.crewRegistrationDocument.findUnique({
      where: { guestId_kind: { guestId, kind } },
    })

    const buffer = Buffer.from(await file.arrayBuffer())
    const supabase = getSupabaseAdmin()
    const { error: uploadError } = await supabase.storage
      .from(CREW_DOCS_BUCKET)
      .upload(key, buffer, { contentType: file.type })
    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return Response.json({ error: 'Failed to store document' }, { status: 500 })
    }

    const document = await prisma.crewRegistrationDocument.upsert({
      where: { guestId_kind: { guestId, kind } },
      create: {
        guestId,
        kind,
        storagePath: key,
        mimeType: file.type,
        sizeBytes: file.size,
      },
      update: {
        storagePath: key,
        mimeType: file.type,
        sizeBytes: file.size,
        uploadedAt: new Date(),
      },
    })

    if (existing && existing.storagePath !== key) {
      await supabase.storage.from(CREW_DOCS_BUCKET).remove([existing.storagePath])
    }

    return Response.json(document, { status: 201 })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('POST /api/crew-registration/[reservationId]/documents error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
