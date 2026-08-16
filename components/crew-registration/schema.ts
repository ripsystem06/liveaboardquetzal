import { z } from 'zod'
import type {
  BloodType,
  CertificationLevel,
  CrewDocumentKind,
  CrewRegistrationStatus,
  EquipmentSize,
} from '@/lib/validations'

// ---------------------------------------------------------------------------
// Client data shapes — the serialized Prisma payload the page passes down.
// ---------------------------------------------------------------------------

export interface CrewDocumentData {
  id: string
  guestId: string
  kind: CrewDocumentKind
  storagePath: string
  mimeType: string
  sizeBytes: number
  signedUrl?: string | null
}

export interface CrewGuestData {
  id?: string
  guestIndex?: number
  fullName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
  contactPhone: string
  contactEmail: string | null
  certificationLevel: CertificationLevel
  logbookDives: number | null
  diveInsurancePolicyNo: string
  isNitroxCertified: boolean
  weightKg: number | null
  ballastKg: number | null
  photoEquipment: string | null
  bcdSize: EquipmentSize | null
  wetsuitSize: EquipmentSize | null
  finsSize: string | null
  maskSize: string | null
  bootiesSize: string | null
  medicalLimitations: string | null
  allergies: string | null
  bloodType: BloodType | null
  dietaryRestrictions: string | null
  ec1Name: string
  ec1Relation: string
  ec1Phone: string
  ec2Name: string
  ec2Relation: string
  ec2Phone: string
  documents?: CrewDocumentData[]
}

export interface CrewRegistrationData {
  id: string
  reservationId: string
  status: CrewRegistrationStatus
  rejectReason: string | null
  submittedAt: string | null
  arrivalFlight: string
  arrivalDate: string
  arrivalTime: string
  departureFlight: string
  departureDate: string
  departureTime: string
  hotelName: string
  hotelAddress: string
  guests: CrewGuestData[]
}

// ---------------------------------------------------------------------------
// Form schema. The form stores everything as strings (empty string = "not
// provided"); the server's Zod schema remains the authoritative validator.
// Numeric/enum/optional coercion happens once in `toServerPayload`.
// ---------------------------------------------------------------------------

export const guestFormSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1, 'Required'),
  dateOfBirth: z.string().min(1, 'Required'),
  nationality: z.string().min(1, 'Required'),
  passportNumber: z.string().min(1, 'Required'),
  contactPhone: z.string().min(1, 'Required'),
  contactEmail: z.string().optional(),
  certificationLevel: z.string().min(1, 'Required'),
  logbookDives: z.string().optional(),
  diveInsurancePolicyNo: z.string().min(1, 'Required'),
  isNitroxCertified: z.boolean(),
  weightKg: z.string().optional(),
  ballastKg: z.string().optional(),
  photoEquipment: z.string().optional(),
  bcdSize: z.string().optional(),
  wetsuitSize: z.string().optional(),
  finsSize: z.string().optional(),
  maskSize: z.string().optional(),
  bootiesSize: z.string().optional(),
  medicalLimitations: z.string().optional(),
  allergies: z.string().optional(),
  bloodType: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  ec1Name: z.string().min(1, 'Required'),
  ec1Relation: z.string().min(1, 'Required'),
  ec1Phone: z.string().min(1, 'Required'),
  ec2Name: z.string().min(1, 'Required'),
  ec2Relation: z.string().min(1, 'Required'),
  ec2Phone: z.string().min(1, 'Required'),
})

export const flightsFormSchema = z.object({
  arrivalFlight: z.string().min(1, 'Required'),
  arrivalDate: z.string().min(1, 'Required'),
  arrivalTime: z.string().min(1, 'Required'),
  departureFlight: z.string().min(1, 'Required'),
  departureDate: z.string().min(1, 'Required'),
  departureTime: z.string().min(1, 'Required'),
  hotelName: z.string().min(1, 'Required'),
  hotelAddress: z.string().min(1, 'Required'),
})

export const crewRegistrationFormSchema = z.object({
  flights: flightsFormSchema,
  guests: z.array(guestFormSchema).min(1),
})

export type CrewRegistrationFormValues = z.infer<typeof crewRegistrationFormSchema>
export type GuestFormValues = z.infer<typeof guestFormSchema>
export type FlightsFormValues = z.infer<typeof flightsFormSchema>

// ---------------------------------------------------------------------------
// Defaults + server payload mapping
// ---------------------------------------------------------------------------

function guestToDefault(existing?: CrewGuestData): GuestFormValues {
  return {
    id: existing?.id,
    fullName: existing?.fullName ?? '',
    dateOfBirth: existing?.dateOfBirth ?? '',
    nationality: existing?.nationality ?? '',
    passportNumber: existing?.passportNumber ?? '',
    contactPhone: existing?.contactPhone ?? '',
    contactEmail: existing?.contactEmail ?? '',
    certificationLevel: existing?.certificationLevel ?? '',
    logbookDives: existing?.logbookDives != null ? String(existing.logbookDives) : '',
    diveInsurancePolicyNo: existing?.diveInsurancePolicyNo ?? '',
    isNitroxCertified: existing?.isNitroxCertified ?? false,
    weightKg: existing?.weightKg != null ? String(existing.weightKg) : '',
    ballastKg: existing?.ballastKg != null ? String(existing.ballastKg) : '',
    photoEquipment: existing?.photoEquipment ?? '',
    bcdSize: existing?.bcdSize ?? '',
    wetsuitSize: existing?.wetsuitSize ?? '',
    finsSize: existing?.finsSize ?? '',
    maskSize: existing?.maskSize ?? '',
    bootiesSize: existing?.bootiesSize ?? '',
    medicalLimitations: existing?.medicalLimitations ?? '',
    allergies: existing?.allergies ?? '',
    bloodType: existing?.bloodType ?? '',
    dietaryRestrictions: existing?.dietaryRestrictions ?? '',
    ec1Name: existing?.ec1Name ?? '',
    ec1Relation: existing?.ec1Relation ?? '',
    ec1Phone: existing?.ec1Phone ?? '',
    ec2Name: existing?.ec2Name ?? '',
    ec2Relation: existing?.ec2Relation ?? '',
    ec2Phone: existing?.ec2Phone ?? '',
  }
}

export function buildDefaultValues(
  guestCount: number,
  registration?: CrewRegistrationData | null
): CrewRegistrationFormValues {
  const guests: GuestFormValues[] = []
  for (let i = 0; i < guestCount; i++) {
    const existing = registration?.guests?.find((g) => g.guestIndex === i)
    guests.push(guestToDefault(existing))
  }
  return {
    flights: {
      arrivalFlight: registration?.arrivalFlight ?? '',
      arrivalDate: registration?.arrivalDate ?? '',
      arrivalTime: registration?.arrivalTime ?? '',
      departureFlight: registration?.departureFlight ?? '',
      departureDate: registration?.departureDate ?? '',
      departureTime: registration?.departureTime ?? '',
      hotelName: registration?.hotelName ?? '',
      hotelAddress: registration?.hotelAddress ?? '',
    },
    guests,
  }
}

function toOptionalInt(value?: string): number | undefined {
  if (value === undefined || value === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function guestToServer(guest: GuestFormValues) {
  return {
    fullName: guest.fullName,
    dateOfBirth: guest.dateOfBirth,
    nationality: guest.nationality,
    passportNumber: guest.passportNumber,
    contactPhone: guest.contactPhone,
    contactEmail: guest.contactEmail || undefined,
    certificationLevel: guest.certificationLevel as CertificationLevel,
    logbookDives: toOptionalInt(guest.logbookDives),
    diveInsurancePolicyNo: guest.diveInsurancePolicyNo,
    isNitroxCertified: guest.isNitroxCertified,
    weightKg: toOptionalInt(guest.weightKg),
    ballastKg: toOptionalInt(guest.ballastKg),
    photoEquipment: guest.photoEquipment || undefined,
    bcdSize: (guest.bcdSize || undefined) as EquipmentSize | undefined,
    wetsuitSize: (guest.wetsuitSize || undefined) as EquipmentSize | undefined,
    finsSize: guest.finsSize || undefined,
    maskSize: guest.maskSize || undefined,
    bootiesSize: guest.bootiesSize || undefined,
    medicalLimitations: guest.medicalLimitations || undefined,
    allergies: guest.allergies || undefined,
    bloodType: (guest.bloodType || undefined) as BloodType | undefined,
    dietaryRestrictions: guest.dietaryRestrictions || undefined,
    ec1Name: guest.ec1Name,
    ec1Relation: guest.ec1Relation,
    ec1Phone: guest.ec1Phone,
    ec2Name: guest.ec2Name,
    ec2Relation: guest.ec2Relation,
    ec2Phone: guest.ec2Phone,
  }
}

export function toServerPayload(
  values: CrewRegistrationFormValues,
  submit: boolean
) {
  return {
    submit,
    flights: values.flights,
    guests: values.guests.map(guestToServer),
  }
}
