import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { CrewRegistrationForm } from '@/components/crew-registration/crew-registration-form'
import type { CrewRegistrationData } from '@/components/crew-registration/schema'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Crew Registration — Quetzal Liveaboard',
  description:
    'Complete the crew registration form for your confirmed Quetzal Liveaboard expedition.',
}

interface PageProps {
  params: Promise<{ reservationId: string }>
}

export default async function CrewRegistrationPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/booking')
  }
  const userId = session.user.id as string
  const { reservationId } = await params

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  })
  if (!reservation || reservation.userId !== userId) {
    notFound()
  }
  if (reservation.status !== 'confirmed') {
    redirect('/account')
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

  const data: CrewRegistrationData | null = registration
    ? {
        id: registration.id,
        reservationId: registration.reservationId,
        status: registration.status,
        rejectReason: registration.rejectReason,
        submittedAt: registration.submittedAt ? registration.submittedAt.toISOString() : null,
        arrivalFlight: registration.arrivalFlight,
        arrivalDate: registration.arrivalDate,
        arrivalTime: registration.arrivalTime,
        departureFlight: registration.departureFlight,
        departureDate: registration.departureDate,
        departureTime: registration.departureTime,
        hotelName: registration.hotelName,
        hotelAddress: registration.hotelAddress,
        guests: registration.guests.map((guest) => ({
          id: guest.id,
          guestIndex: guest.guestIndex,
          fullName: guest.fullName,
          dateOfBirth: guest.dateOfBirth,
          nationality: guest.nationality,
          passportNumber: guest.passportNumber,
          contactPhone: guest.contactPhone,
          contactEmail: guest.contactEmail,
          certificationLevel: guest.certificationLevel,
          logbookDives: guest.logbookDives,
          diveInsurancePolicyNo: guest.diveInsurancePolicyNo,
          isNitroxCertified: guest.isNitroxCertified,
          weightKg: guest.weightKg,
          ballastKg: guest.ballastKg,
          photoEquipment: guest.photoEquipment,
          bcdSize: guest.bcdSize,
          wetsuitSize: guest.wetsuitSize,
          finsSize: guest.finsSize,
          maskSize: guest.maskSize,
          bootiesSize: guest.bootiesSize,
          medicalLimitations: guest.medicalLimitations,
          allergies: guest.allergies,
          bloodType: guest.bloodType,
          dietaryRestrictions: guest.dietaryRestrictions,
          ec1Name: guest.ec1Name,
          ec1Relation: guest.ec1Relation,
          ec1Phone: guest.ec1Phone,
          ec2Name: guest.ec2Name,
          ec2Relation: guest.ec2Relation,
          ec2Phone: guest.ec2Phone,
          documents: guest.documents.map((doc) => ({
            id: doc.id,
            guestId: doc.guestId,
            kind: doc.kind,
            storagePath: doc.storagePath,
            mimeType: doc.mimeType,
            sizeBytes: doc.sizeBytes,
          })),
        })),
      }
    : null

  return (
    <main className="min-h-screen">
      <Navigation />

      <section className="relative pt-32 pb-4 bg-muted/30 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0" />
      </section>

      <section className="container mx-auto py-8 px-4 lg:px-8">
        <div className="mb-10">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            {reservation.cruiseName}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-foreground text-balance">
            Crew Registration
          </h1>
        </div>

        <CrewRegistrationForm
          reservationId={reservation.id}
          guestCount={reservation.guestCount}
          registration={data}
        />
      </section>

      <Footer />
    </main>
  )
}
