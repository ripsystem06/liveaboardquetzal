import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { auth, AuthError } from '@/lib/auth'
import { PayPalCaptureOrderSchema, ReservationStatus } from '@/lib/validations'
import { capturePayPalOrder } from '@/lib/paypal'
import { sendPaymentReceivedEmail } from '@/lib/email'

/**
 * POST /api/paypal/capture-order
 * Captures an approved PayPal order and records a payment receipt ONLY when
 * PayPal reports COMPLETED. The reservation stays pending_approval (admin review
 * is still required). Idempotent on providerOrderId — repeat captures return the
 * prior success without a duplicate receipt or email.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const userId = session.user.id as string

    const rawBody = await request.json()
    const parsed = PayPalCaptureOrderSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed' }, { status: 400 })
    }
    const { reservationId, orderId } = parsed.data

    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } })
    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }
    if (reservation.userId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (reservation.status !== ReservationStatus.enum.pending_approval) {
      return Response.json(
        {
          error: 'INVALID_TRANSITION',
          message: `Cannot pay a reservation in status: ${reservation.status}`,
        },
        { status: 400 }
      )
    }

    // Idempotency: an already-recorded capture for this PayPal order returns prior success.
    const existing = await prisma.paymentRecord.findUnique({ where: { providerOrderId: orderId } })
    if (existing) {
      return Response.json({
        id: existing.id,
        status: existing.status,
        reservationStatus: ReservationStatus.enum.pending_approval,
      })
    }

    // Capture; any HTTP/network failure from PayPal is a 502 (bad gateway).
    let capture
    try {
      capture = await capturePayPalOrder(orderId)
    } catch (error) {
      console.error('POST /api/paypal/capture-order capture error:', error)
      return Response.json({ error: 'PayPal capture failed' }, { status: 502 })
    }

    // Defensive check (lib/paypal also throws on non-COMPLETED).
    if (capture.status !== 'COMPLETED') {
      return Response.json(
        { error: 'Payment not completed', status: capture.status },
        { status: 502 }
      )
    }

    try {
      const record = await prisma.paymentRecord.create({
        data: {
          reservationId,
          providerOrderId: orderId,
          status: 'completed',
          amountUsd: reservation.totalAmount,
          rawPayload: capture as unknown as Prisma.InputJsonValue,
        },
      })

      const user = await prisma.user.findUnique({ where: { id: reservation.userId } })
      if (user) {
        sendPaymentReceivedEmail({
          id: reservation.id,
          userId: reservation.userId,
          userEmail: user.email,
          cruiseId: reservation.cruiseId,
          cruiseName: reservation.cruiseName,
          departureDate: reservation.departureDate,
          route: reservation.route,
          tier: reservation.tier,
          tierPrice: reservation.tierPrice,
          guestCount: reservation.guestCount,
          freeSpaces: reservation.freeSpaces,
          paidSpaces: reservation.paidSpaces,
          totalAmount: reservation.totalAmount,
          paymentMethod: reservation.paymentMethod,
          status: ReservationStatus.enum.pending_approval,
          holdExpiry: reservation.holdExpiry,
          createdAt: reservation.createdAt,
          updatedAt: reservation.updatedAt,
        }).catch((err) => console.error('Failed to send payment received email:', err))
      }

      return Response.json({
        id: record.id,
        status: record.status,
        reservationStatus: ReservationStatus.enum.pending_approval,
      })
    } catch (error) {
      // P2002: unique constraint on providerOrderId → a concurrent capture already recorded.
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        const existing = await prisma.paymentRecord.findUnique({ where: { providerOrderId: orderId } })
        if (existing) {
          return Response.json({
            id: existing.id,
            status: existing.status,
            reservationStatus: ReservationStatus.enum.pending_approval,
          })
        }
      }
      throw error
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('POST /api/paypal/capture-order error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
