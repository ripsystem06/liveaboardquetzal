import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { sendExpiryEmail } from '@/lib/email'

/**
 * GET /api/cron/expire-holds
 * Vercel Cron endpoint — expires all reservations where
 * status = 'pending_approval' AND holdExpiry < now().
 * Runs every 15 minutes via vercel.json.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret if configured
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find expired holds
    const expired = await prisma.reservation.findMany({
      where: {
        status: 'pending_approval',
        holdExpiry: { lt: new Date() },
      },
      select: {
        id: true,
        userId: true,
        cruiseId: true,
        cruiseName: true,
        departureDate: true,
        route: true,
        tier: true,
        tierPrice: true,
        guestCount: true,
        freeSpaces: true,
        paidSpaces: true,
        totalAmount: true,
        paymentMethod: true,
        status: true,
        holdExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (expired.length > 0) {
      // Bulk update all expired holds
      const { count } = await prisma.reservation.updateMany({
        where: {
          id: { in: expired.map((r) => r.id) },
          status: 'pending_approval',
        },
        data: { status: 'expired' },
      })

      // Fire-and-forget expiry emails
      for (const reservation of expired) {
        const user = await prisma.user.findUnique({
          where: { id: reservation.userId },
          select: { email: true },
        })

        if (user?.email) {
          sendExpiryEmail({
            ...reservation,
            userId: reservation.userId,
            userEmail: user.email,
            status: 'expired',
          }).catch((err) => console.error('Failed to send expiry email:', err))
        }

        // Audit log for each expired reservation
        prisma.auditLog.create({
          data: {
            action: 'reservation.status_changed',
            entityType: 'reservation',
            entityId: reservation.id,
            actorEmail: 'system',
            details: JSON.stringify({
              oldStatus: 'pending_approval',
              newStatus: 'expired',
              reason: 'hold period expired (cron)',
            }),
          },
        }).catch((err) => console.error('Audit log failed:', err))
      }

      return Response.json({ expired: count })
    }

    return Response.json({ expired: 0 })
  } catch (error) {
    console.error('GET /api/cron/expire-holds error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
