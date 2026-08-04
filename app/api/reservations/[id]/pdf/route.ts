import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { generateBankTransferPDF } from '@/lib/pdf-generator'
import { auth, AuthError } from '@/lib/auth'
import { PaymentMethod } from '@/lib/validations'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/reservations/[id]/pdf
 * Returns a PDF with bank transfer instructions for bank_transfer reservations.
 * Requires ownership check - user can only access their own reservation PDFs.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    if (reservation.paymentMethod !== PaymentMethod.enum.bank_transfer) {
      return Response.json(
        { error: 'PDF is only available for bank_transfer reservations' },
        { status: 400 }
      )
    }

    const pdfBuffer = await generateBankTransferPDF(reservation)

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
