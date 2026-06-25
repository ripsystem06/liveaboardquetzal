import { PrismaClient } from '@prisma/client'
import { sendExpiryEmail } from './email'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

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
  paymentMethod: string
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
    await sendExpiryEmail({
      id: updated.id,
      userId: updated.userId,
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
    return updated
  }
  return reservation
}
