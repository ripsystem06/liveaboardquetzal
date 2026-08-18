import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { generateBankTransferPDF } from '@/lib/pdf-generator'
import { auth, AuthError } from '@/lib/auth'
import { PaymentMethod } from '@/lib/validations'
import { bankAccounts } from '@/lib/payment-config'
import { contactInfo } from '@/lib/contact'
import { termsContent } from '@/lib/legal/terms'
import { cancellationContent } from '@/lib/legal/cancellation'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/reservations/[id]/pdf
 * Returns a PDF with bank transfer instructions for bank_transfer reservations.
 * Readable by the reservation owner or an admin. `?lang=en|es` selects the
 * legal-content language (default `en`).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    const authUserId = session.user.id as string
    const isAdmin = Boolean(session.user.isAdmin)
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Owner-or-admin gate
    if (reservation.userId !== authUserId && !isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (reservation.paymentMethod !== PaymentMethod.enum.bank_transfer) {
      return Response.json(
        { error: 'PDF is only available for bank_transfer reservations' },
        { status: 400 }
      )
    }

    const lang = request.nextUrl.searchParams.get('lang') === 'es' ? 'es' : 'en'

    const cruise = await prisma.cruise.findUnique({
      where: { id: reservation.cruiseId },
    })

    if (!cruise) {
      return Response.json({ error: 'Cruise not found' }, { status: 404 })
    }

    const pdfBuffer = await generateBankTransferPDF({
      reservation,
      cruise: {
        returnDate: cruise.returnDate,
        boat: cruise.boat,
        dives: cruise.dives,
      },
      bankAccounts,
      contactInfo,
      termsContent,
      cancellationContent,
      lang,
    })

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="transfer-${id}.pdf"`,
      },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: 'Authentication required' }, { status: 401 })
    }
    console.error('GET /api/reservations/[id]/pdf error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
