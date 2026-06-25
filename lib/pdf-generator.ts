export interface ReservationPDFData {
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

const BANK_DETAILS = {
  bankName: 'Banco Internacional de Mexico',
  swift: 'BIMEMXMMXXX',
  iban: 'MX1234567890123456789012',
  account: '00123456789',
  beneficiary: 'Quetzal Liveaboard S.A. de C.V.',
}

/**
 * Generates a bank transfer PDF for a reservation using jspdf.
 * Returns a Buffer containing the PDF data.
 */
export async function generateBankTransferPDF(reservation: ReservationPDFData): Promise<Buffer> {
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('QUETZAL LIVEABOARD', 105, 20, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Bank Transfer Instructions', 105, 30, { align: 'center' })

  // Divider line
  doc.setLineWidth(0.5)
  doc.line(20, 35, 190, 35)

  // Reservation details section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Reservation Details', 20, 50)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const details = [
    `Reservation ID: ${reservation.id}`,
    `Cruise: ${reservation.cruiseName}`,
    `Departure: ${reservation.departureDate}`,
    `Tier: ${reservation.tier.charAt(0).toUpperCase() + reservation.tier.slice(1)}`,
    `Guests: ${reservation.guestCount}`,
    `Total: $${reservation.totalAmount.toLocaleString()} USD`,
  ]

  let y = 60
  for (const line of details) {
    doc.text(line, 20, y)
    y += 8
  }

  // Banking details section
  doc.setLineWidth(0.5)
  doc.line(20, y + 5, 190, y + 5)

  y += 15
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Banking Details', 20, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const bankingDetails = [
    `Bank: ${BANK_DETAILS.bankName}`,
    `SWIFT: ${BANK_DETAILS.swift}`,
    `IBAN: ${BANK_DETAILS.iban}`,
    `Account: ${BANK_DETAILS.account}`,
    `Beneficiary: ${BANK_DETAILS.beneficiary}`,
    `Reference: ${reservation.id}`,
  ]

  y += 10
  for (const line of bankingDetails) {
    doc.text(line, 20, y)
    y += 8
  }

  // Warning box
  y += 10
  doc.setDrawColor(200, 150, 0)
  doc.setFillColor(255, 250, 230)
  doc.rect(20, y - 5, 170, 20, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.text('Please include your Reservation ID as the transfer reference', 105, y + 5, { align: 'center' })

  // Footer
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Quetzal Liveaboard — Your Adventure Awaits', 105, 285, { align: 'center' })

  // Get PDF as buffer
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}
