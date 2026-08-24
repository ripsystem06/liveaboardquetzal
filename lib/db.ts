import { PrismaClient } from '@prisma/client'
import { sendExpiryEmail } from './email'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function getPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return new PrismaClient()
  }

  const url = new URL(dbUrl)
  url.searchParams.set('connection_limit', '3')
  url.searchParams.set('pool_timeout', '10')

  return new PrismaClient({
    datasources: {
      db: { url: url.toString() },
    },
  })
}

export const prisma = globalForPrisma.prisma || getPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export interface PaymentRecordData {
  id: string
  provider: string
  providerOrderId: string
  status: string
  amountUsd: number
  createdAt: Date
}

export interface ReservationData {
  id: string
  userId: string
  cruiseId: string
  cruiseName: string
  departureDate: string
  route: string
  tier: string
  tierPrice: number
  guestCount: number
  freeSpaces: number
  paidSpaces: number
  totalAmount: number
  paymentMethod: string | null
  charterType?: string
  cabinDetails?: unknown | null
  termsVersion?: number | null
  termsAcceptedAt?: Date | null
  confirmationEmailSentAt?: Date | null
  paymentRecords?: PaymentRecordData[]
  status: string
  holdExpiry: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Checks if a pending_approval reservation has expired and updates its status.
 * Called before any GET returns reservation data.
 */
export async function checkAndExpireHolds(reservation: ReservationData): Promise<ReservationData> {
  if (reservation.status !== 'pending_approval') return reservation
  if (reservation.holdExpiry < new Date()) {
    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status: 'expired' },
    })

    // Expiry frees previously-held spots: invalidate the calendar cache so
    // stale availability is never served (design decision #11). `next/cache`
    // is imported lazily to keep it out of the middleware/auth bundle.
    const { revalidateTag } = await import('next/cache')
    revalidateTag('cruises-calendar', 'default')

    const user = await prisma.user.findUnique({ where: { id: updated.userId } })
    await sendExpiryEmail({
      id: updated.id,
      userId: updated.userId,
      userEmail: user?.email || '',
      cruiseId: updated.cruiseId,
      cruiseName: updated.cruiseName,
      departureDate: updated.departureDate,
      route: updated.route,
      tier: updated.tier,
      tierPrice: updated.tierPrice,
      guestCount: updated.guestCount,
      freeSpaces: updated.freeSpaces,
      paidSpaces: updated.paidSpaces,
      totalAmount: updated.totalAmount,
      paymentMethod: updated.paymentMethod,
      status: updated.status,
      holdExpiry: updated.holdExpiry,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    })
    await prisma.auditLog.create({
      data: {
        action: 'reservation.status_changed',
        entityType: 'reservation',
        entityId: reservation.id,
        actorId: null,
        actorEmail: 'system',
        details: JSON.stringify({ oldStatus: 'pending_approval', newStatus: 'expired', reason: 'hold period expired' }),
      },
    })
    return updated
  }
  return reservation
}
