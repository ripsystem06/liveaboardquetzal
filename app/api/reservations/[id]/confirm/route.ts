import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { auth, AuthError } from '@/lib/auth'
import { ReservationStatus } from '@/lib/validations'
import { sendReservationConfirmedEmail } from '@/lib/email'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * POST /api/reservations/[id]/confirm
 * Mock PayPal confirmation — records payment receipt but keeps reservation pending approval.
 * The reservation stays in pending_approval until admin manually approves it.
 * Requires ownership check - user can only confirm their own reservations.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const authUserId = session.user.id as string
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Ownership check
    if (reservation.userId !== authUserId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only pending_approval reservations can be confirmed
    if (reservation.status !== ReservationStatus.enum.pending_approval) {
      return Response.json(
        {
          error: 'INVALID_TRANSITION',
          message: `Cannot confirm reservation in status: ${reservation.status}`,
        },
        { status: 400 }
      )
    }

    // Mock confirmation: payment received, reservation stays pending_approval
    // In production, this would verify PayPal webhook and transition to confirmed

    const user = await prisma.user.findUnique({ where: { id: reservation.userId } })
    if (user) {
      sendReservationConfirmedEmail({
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
      }).catch(err => console.error('Failed to send reservation confirmed email:', err))
    }

    return Response.json({
      id: reservation.id,
      status: ReservationStatus.enum.pending_approval,
      message: 'Payment confirmed. Your reservation is pending admin approval.',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('POST /api/reservations/[id]/confirm error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
