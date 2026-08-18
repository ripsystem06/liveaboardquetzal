import { z } from 'zod'

export const ReservationStatus = z.enum([
  'pending_approval',
  'confirmed',
  'cancelled',
  'expired',
])
export type ReservationStatus = z.infer<typeof ReservationStatus>

export const PaymentMethod = z.enum(['paypal', 'bank_transfer'])
export type PaymentMethod = z.infer<typeof PaymentMethod>

export const BlogPostStatus = z.enum(['draft', 'published'])
export type BlogPostStatus = z.infer<typeof BlogPostStatus>

export const CreateReservationSchema = z.object({
  cruiseId: z.string().min(1),
  cruiseName: z.string().min(1),
  departureDate: z.string().min(1),
  route: z.string().min(1),
  tier: z.string().min(1),
  tierPrice: z.number().int().positive(),
  guestCount: z.number().int().positive(),
  freeSpaces: z.number().int().min(0),
  paidSpaces: z.number().int().min(0),
  totalAmount: z.number().int().positive(),
  paymentMethod: PaymentMethod,
})

export const CreateCruiseSchema = z.object({
  name: z.string().min(1),
  departureDate: z.string().min(1),
  returnDate: z.string().min(1),
  route: z.string().min(1),
  boat: z.string().optional().default('Quetzal'),
  basicPrice: z.number().int().positive(),
  standardPrice: z.number().int().positive(),
  premiumPrice: z.number().int().positive(),
  dives: z.number().int().min(0).optional().default(5),
  isActive: z.boolean().optional().default(true),
})

export const UpdateCruiseSchema = CreateCruiseSchema.partial()

export const CreateBlogPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().optional().default(''),
  status: BlogPostStatus.optional().default('draft'),
})

export const UpdateBlogPostSchema = CreateBlogPostSchema.partial()

export const OtpRequestSchema = z.object({
  email: z.string().email(),
})

export const OtpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
  name: z.string().optional(),
})

export const OtpChallengeSchema = z.object({
  email: z.string().min(1),
  otp: z.string().min(1),
})

export const AvailabilityQuerySchema = z.object({
  cruiseId: z.string().min(1),
  departureDate: z.string().min(1),
})

export const ReservationStatusUpdateSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'pending_approval']).optional(),
  notes: z.string().optional(),
})

// --- Payments ---

export const PayPalCreateOrderSchema = z.object({
  reservationId: z.string().min(1),
})

export const PayPalCaptureOrderSchema = z.object({
  reservationId: z.string().min(1),
  orderId: z.string().min(1),
})

// --- Crew Registration ---

export const CrewRegistrationStatus = z.enum([
  'draft',
  'submitted',
  'approved',
  'rejected',
])
export type CrewRegistrationStatus = z.infer<typeof CrewRegistrationStatus>

export const CrewDocumentKind = z.enum([
  'passport_ine',
  'dive_cert',
  'dive_insurance',
  'nitrox_cert',
])
export type CrewDocumentKind = z.infer<typeof CrewDocumentKind>

export const CertificationLevel = z.enum([
  'open_water',
  'advanced',
  'rescue',
  'divemaster',
  'instructor',
])
export type CertificationLevel = z.infer<typeof CertificationLevel>

export const EquipmentSize = z.enum(['xs', 's', 'm', 'l', 'xl', 'xxl'])
export type EquipmentSize = z.infer<typeof EquipmentSize>

export const BloodType = z.enum([
  'a_positive',
  'a_negative',
  'b_positive',
  'b_negative',
  'ab_positive',
  'ab_negative',
  'o_positive',
  'o_negative',
])
export type BloodType = z.infer<typeof BloodType>

export const CrewFlightsSchema = z.object({
  arrivalFlight: z.string().min(1),
  arrivalDate: z.string().min(1),
  arrivalTime: z.string().min(1),
  departureFlight: z.string().min(1),
  departureDate: z.string().min(1),
  departureTime: z.string().min(1),
  hotelName: z.string().min(1),
  hotelAddress: z.string().min(1),
})

export const CrewGuestSchema = z.object({
  id: z.string().optional(),
  // 1 personal
  fullName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  nationality: z.string().min(1),
  passportNumber: z.string().min(1),
  contactPhone: z.string().min(1),
  contactEmail: z.string().email().optional(),
  // 2 diving
  certificationLevel: CertificationLevel,
  logbookDives: z.number().int().nonnegative().optional(),
  diveInsurancePolicyNo: z.string().min(1),
  isNitroxCertified: z.boolean().optional().default(false),
  // 3 ballast/photo
  weightKg: z.number().int().positive().optional(),
  ballastKg: z.number().int().positive().optional(),
  photoEquipment: z.string().optional(),
  // 4 rental sizes
  bcdSize: EquipmentSize.optional(),
  wetsuitSize: EquipmentSize.optional(),
  finsSize: z.string().optional(),
  maskSize: z.string().optional(),
  bootiesSize: z.string().optional(),
  // 5 medical
  medicalLimitations: z.string().optional(),
  allergies: z.string().optional(),
  bloodType: BloodType.optional(),
  dietaryRestrictions: z.string().optional(),
  // 7 emergency (2 contacts, required)
  ec1Name: z.string().min(1),
  ec1Relation: z.string().min(1),
  ec1Phone: z.string().min(1),
  ec2Name: z.string().min(1),
  ec2Relation: z.string().min(1),
  ec2Phone: z.string().min(1),
})

export const CrewRegistrationPutSchema = z.object({
  submit: z.boolean().optional().default(false),
  flights: CrewFlightsSchema,
  guests: z.array(CrewGuestSchema).min(1),
})
