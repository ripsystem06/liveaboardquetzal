import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth, AuthError, ForbiddenError } from '@/lib/auth'
import { CrewRegistrationPutSchema, CrewGuestSchema } from '@/lib/validations'
import {
  computeTargetStatus,
  enforceDocRequirements,
  assertEditable,
} from '@/lib/crew-registration'
import { getSupabaseAdmin, CREW_DOCS_BUCKET } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ reservationId: string }>
}

type GuestInput = z.infer<typeof CrewGuestSchema>

function guestData(guest: GuestInput, guestIndex: number) {
  return {
    guestIndex,
    fullName: guest.fullName,
    dateOfBirth: guest.dateOfBirth,
    nationality: guest.nationality,
    passportNumber: guest.passportNumber,
    contactPhone: guest.contactPhone,
    contactEmail: guest.contactEmail ?? null,
    certificationLevel: guest.certificationLevel,
    logbookDives: guest.logbookDives ?? null,
    diveInsurancePolicyNo: guest.diveInsurancePolicyNo,
    isNitroxCertified: guest.isNitroxCertified ?? false,
    weightKg: guest.weightKg ?? null,
    ballastKg: guest.ballastKg ?? null,
    photoEquipment: guest.photoEquipment ?? null,
    bcdSize: guest.bcdSize ?? null,
    wetsuitSize: guest.wetsuitSize ?? null,
    finsSize: guest.finsSize ?? null,
    maskSize: guest.maskSize ?? null,
    bootiesSize: guest.bootiesSize ?? null,
    medicalLimitations: guest.medicalLimitations ?? null,
    allergies: guest.allergies ?? null,
    bloodType: guest.bloodType ?? null,
    dietaryRestrictions: guest.dietaryRestrictions ?? null,
    ec1Name: guest.ec1Name,
    ec1Relation: guest.ec1Relation,
    ec1Phone: guest.ec1Phone,
    ec2Name: guest.ec2Name,
    ec2Relation: guest.ec2Relation,
    ec2Phone: guest.ec2Phone,
  }
}

/**
 * GET /api/crew-registration/[reservationId]
 * Returns the registration with guests and documents. Documents get a 60s
 * signed URL so the owner can view them without a public bucket.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
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

    const registration = await prisma.crewRegistration.findUnique({
      where: { reservationId },
      include: {
        guests: {
          orderBy: { guestIndex: 'asc' },
          include: { documents: true },
        },
      },
    })

    if (!registration) {
      return Response.json({ registration: null })
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
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('GET /api/crew-registration/[reservationId] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/crew-registration/[reservationId]
 * Idempotent upsert of the registration and its guest rows. Validates payload
 * with Zod, enforces the `confirmed` reservation gate and the `approved`
 * edit-lock, and (on submit) checks the mandatory document set before
 * transitioning to `submitted` inside a Prisma transaction.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
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
      return Response.json(
        { error: 'Reservation is not confirmed' },
        { status: 403 }
      )
    }

    const rawBody = await request.json()
    const parsed = CrewRegistrationPutSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json(
        {
          error: 'Validation failed',
          ...(process.env.NODE_ENV !== 'production'
            ? { details: parsed.error.flatten() }
            : {}),
        },
        { status: 400 }
      )
    }
    const { submit, flights, guests } = parsed.data

    if (guests.length !== reservation.guestCount) {
      return Response.json(
        { error: 'Guest count does not match reservation', guestCount: reservation.guestCount },
        { status: 400 }
      )
    }

    const existing = await prisma.crewRegistration.findUnique({
      where: { reservationId },
      include: {
        guests: {
          include: { documents: true },
        },
      },
    })

    // Edit-lock: an approved registration is terminal for the customer.
    assertEditable(existing?.status ?? 'draft')

    // Mandatory document set must be satisfied before submission.
    if (submit) {
      const guestByIdIndex = new Map(
        (existing?.guests ?? []).map((g) => [g.guestIndex, g])
      )
      const requirements = guests.map((guest, index) => ({
        id: guestByIdIndex.get(index)?.id ?? `guest-${index}`,
        isNitroxCertified: guest.isNitroxCertified ?? false,
      }))
      const documents = (existing?.guests ?? []).flatMap((g) =>
        g.documents.map((d) => ({ guestId: g.id, kind: d.kind }))
      )
      const missing = enforceDocRequirements(requirements, documents)
      if (missing.length > 0) {
        return Response.json(
          { error: 'Missing required documents', missing },
          { status: 400 }
        )
      }
    }

    const targetStatus = computeTargetStatus(existing?.status ?? 'draft', submit)

    const registration = await prisma.$transaction(async (tx) => {
      const reg = await tx.crewRegistration.upsert({
        where: { reservationId },
        create: {
          reservationId,
          status: targetStatus,
          submittedAt: submit ? new Date() : null,
          arrivalFlight: flights.arrivalFlight,
          arrivalDate: flights.arrivalDate,
          arrivalTime: flights.arrivalTime,
          departureFlight: flights.departureFlight,
          departureDate: flights.departureDate,
          departureTime: flights.departureTime,
          hotelName: flights.hotelName,
          hotelAddress: flights.hotelAddress,
        },
        update: {
          status: targetStatus,
          submittedAt: submit ? new Date() : (existing?.submittedAt ?? null),
          arrivalFlight: flights.arrivalFlight,
          arrivalDate: flights.arrivalDate,
          arrivalTime: flights.arrivalTime,
          departureFlight: flights.departureFlight,
          departureDate: flights.departureDate,
          departureTime: flights.departureTime,
          hotelName: flights.hotelName,
          hotelAddress: flights.hotelAddress,
        },
      })

      const upsertedGuests = []
      for (let i = 0; i < guests.length; i++) {
        const guest = await tx.crewRegistrationGuest.upsert({
          where: {
            registrationId_guestIndex: { registrationId: reg.id, guestIndex: i },
          },
          create: { registrationId: reg.id, ...guestData(guests[i], i) },
          update: guestData(guests[i], i),
        })
        upsertedGuests.push(guest)
      }

      if (submit) {
        await tx.auditLog.create({
          data: {
            action: 'crew_registration.submit',
            entityType: 'CrewRegistration',
            entityId: reg.id,
            actorId: userId,
            actorEmail: session.user.email ?? null,
            details: JSON.stringify({ reservationId }),
          },
        })
      }

      return { ...reg, guests: upsertedGuests }
    })

    return Response.json(registration)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('PUT /api/crew-registration/[reservationId] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
