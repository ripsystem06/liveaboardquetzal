import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { generateBankTransferPDF } from '@/lib/pdf-generator'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/reservations/[id]/pdf
 * Returns a PDF with bank transfer instructions for bank_transfer reservations.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return Response.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (reservation.paymentMethod !== 'bank_transfer') {
      return Response.json(
        { error: 'PDF is only available for bank_transfer reservations' },
        { status: 400 }
      )
    }

    const pdfBuffer = await generateBankTransferPDF(reservation)

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="transfer-${id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('GET /api/reservations/[id]/pdf error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
