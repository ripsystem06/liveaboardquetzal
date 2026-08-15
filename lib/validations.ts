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

export const AvailabilityQuerySchema = z.object({
  cruiseId: z.string().min(1),
  departureDate: z.string().min(1),
})

export const ReservationStatusUpdateSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'pending_approval']).optional(),
  notes: z.string().optional(),
})
