import type { jsPDF } from 'jspdf'
import type { LegalDocument } from './legal/privacy'
import type { BankAccount } from './payment-config'

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

export interface BankTransferPDFParams {
  reservation: ReservationPDFData
  cruise: { returnDate: string; boat: string; dives: number }
  bankAccounts: BankAccount[]
  contactInfo: { email: string; phones: readonly string[]; address: string }
  termsContent: Record<'en' | 'es', LegalDocument>
  cancellationContent: Record<'en' | 'es', LegalDocument>
  lang?: 'en' | 'es'
}

type Labels = {
  title: string
  reservationDetails: string
  reservationId: string
  cruise: string
  departure: string
  return: string
  route: string
  boat: string
  tier: string
  guests: string
  dives: string
  total: string
  bankingDetails: string
  bank: string
  clabe: string
  accountNumber: string
  routingNumber: string
  zelle: string
  beneficiary: string
  reference: string
  contact: string
  email: string
  phone: string
  warning: string
  footer: string
}

const EN_LABELS: Labels = {
  title: 'Bank Transfer Instructions',
  reservationDetails: 'Reservation Details',
  reservationId: 'Reservation ID',
  cruise: 'Cruise',
  departure: 'Departure',
  return: 'Return',
  route: 'Route',
  boat: 'Boat',
  tier: 'Tier',
  guests: 'Guests',
  dives: 'Dives',
  total: 'Total',
  bankingDetails: 'Banking Details',
  bank: 'Bank',
  clabe: 'CLABE',
  accountNumber: 'Account Number',
  routingNumber: 'Routing Number',
  zelle: 'Zelle',
  beneficiary: 'Beneficiary',
  reference: 'Reference',
  contact: 'Contact',
  email: 'Email',
  phone: 'Phone',
  warning: 'Please include your Reservation ID as the transfer reference',
  footer: 'Quetzal Liveaboard — Your Adventure Awaits',
}

const ES_LABELS: Labels = {
  title: 'Instrucciones de Transferencia Bancaria',
  reservationDetails: 'Detalles de la Reserva',
  reservationId: 'ID de Reserva',
  cruise: 'Crucero',
  departure: 'Salida',
  return: 'Regreso',
  route: 'Ruta',
  boat: 'Embarcación',
  tier: 'Categoría',
  guests: 'Huéspedes',
  dives: 'Inmersiones',
  total: 'Total',
  bankingDetails: 'Detalles Bancarios',
  bank: 'Banco',
  clabe: 'CLABE',
  accountNumber: 'Número de cuenta',
  routingNumber: 'Número de ruta',
  zelle: 'Zelle',
  beneficiary: 'Beneficiario',
  reference: 'Referencia',
  contact: 'Contacto',
  email: 'Correo',
  phone: 'Teléfono',
  warning: 'Por favor incluye tu ID de Reserva como referencia de la transferencia',
  footer: 'Quetzal Liveaboard — Tu Aventura te Espera',
}

const PAGE_BREAK_Y = 272
const PAGE_WIDTH = 210

/**
 * Draws pre-wrapped lines at a fixed x, advancing y and adding pages as needed.
 * Returns the next y position after the final line.
 */
function renderLines(doc: jsPDF, lines: string[], x: number, y: number, lineHeight: number): number {
  for (const line of lines) {
    if (y > PAGE_BREAK_Y) {
      doc.addPage()
      y = 20
    }
    doc.text(line, x, y)
    y += lineHeight
  }
  return y
}

/**
 * Renders a full legal document (title + sections: headings, paragraphs, lists)
 * with wrapping and automatic page breaks.
 */
function renderLegalDocument(doc: jsPDF, document: LegalDocument, startY: number): number {
  let y = startY

  if (y > PAGE_BREAK_Y - 20) {
    doc.addPage()
    y = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  y = renderLines(doc, doc.splitTextToSize(document.title, PAGE_WIDTH - 40), 20, y, 8)
  y += 4

  for (const section of document.sections) {
    if (y > PAGE_BREAK_Y - 20) {
      doc.addPage()
      y = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    y = renderLines(doc, doc.splitTextToSize(section.heading, PAGE_WIDTH - 40), 20, y, 7)
    y += 2

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    for (const paragraph of section.content) {
      y = renderLines(doc, doc.splitTextToSize(paragraph, PAGE_WIDTH - 40), 20, y, 5)
      y += 2
    }

    if (section.list) {
      for (const item of section.list) {
        y = renderLines(doc, doc.splitTextToSize(`• ${item}`, PAGE_WIDTH - 48), 22, y, 5)
      }
      y += 2
    }

    y += 3
  }

  return y
}

/**
 * Generates a bank transfer PDF for a reservation using jspdf.
 * Bank details, contact info, and legal content are injected by the caller
 * (config/legal sources), rendered in the requested language (default `en`).
 * Returns a Buffer containing the PDF data.
 */
export async function generateBankTransferPDF(params: BankTransferPDFParams): Promise<Buffer> {
  const { reservation, cruise, bankAccounts, contactInfo, termsContent, cancellationContent } = params
  const lang: 'en' | 'es' = params.lang === 'es' ? 'es' : 'en'
  const labels = lang === 'es' ? ES_LABELS : EN_LABELS

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('QUETZAL LIVEABOARD', 105, 20, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(labels.title, 105, 30, { align: 'center' })

  // Divider line
  doc.setLineWidth(0.5)
  doc.line(20, 35, 190, 35)

  // Reservation details section
  let y = 50
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(labels.reservationDetails, 20, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const tierLabel = reservation.tier.charAt(0).toUpperCase() + reservation.tier.slice(1)
  const details = [
    `${labels.reservationId}: ${reservation.id}`,
    `${labels.cruise}: ${reservation.cruiseName}`,
    `${labels.departure}: ${reservation.departureDate}`,
    `${labels.return}: ${cruise.returnDate}`,
    `${labels.route}: ${reservation.route}`,
    `${labels.boat}: ${cruise.boat}`,
    `${labels.tier}: ${tierLabel}`,
    `${labels.guests}: ${reservation.guestCount}`,
    `${labels.dives}: ${cruise.dives}`,
    `${labels.total}: $${reservation.totalAmount.toLocaleString('en-US')} USD`,
  ]
  y = renderLines(doc, details, 20, y, 8)

  // Banking details section
  y += 8
  doc.setLineWidth(0.5)
  doc.line(20, y, 190, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(labels.bankingDetails, 20, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  for (const account of bankAccounts) {
    // Account heading (localized label), bold
    doc.setFont('helvetica', 'bold')
    y = renderLines(doc, [account.label[lang]], 20, y, 8)
    doc.setFont('helvetica', 'normal')

    const rows: string[] = [
      `${labels.bank}: ${account.bankName}`,
      `${labels.beneficiary}: ${account.beneficiary}`,
    ]
    if (account.clabe) rows.push(`${labels.clabe}: ${account.clabe}`)
    if (account.accountNumber) rows.push(`${labels.accountNumber}: ${account.accountNumber}`)
    if (account.routingNumber) rows.push(`${labels.routingNumber}: ${account.routingNumber}`)
    if (account.zelle) rows.push(`${labels.zelle}: ${account.zelle}`)
    y = renderLines(doc, rows, 20, y, 8)
    y += 4
  }

  y = renderLines(doc, [`${labels.reference}: ${reservation.id}`], 20, y, 8)

  // Contact section
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(labels.contact, 20, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  y = renderLines(
    doc,
    [`${labels.email}: ${contactInfo.email}`, `${labels.phone}: ${contactInfo.phones.join(' / ')}`],
    20,
    y,
    8
  )

  // Warning box
  y += 8
  doc.setDrawColor(200, 150, 0)
  doc.setFillColor(255, 250, 230)
  doc.rect(20, y - 4, 170, 16, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(labels.warning, 105, y + 4, { align: 'center' })
  y += 20

  // Legal sections (terms + cancellation) in the requested language
  y = renderLegalDocument(doc, termsContent[lang], y)
  y = renderLegalDocument(doc, cancellationContent[lang], y)

  // Footer (on the final page)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text(labels.footer, 105, 285, { align: 'center' })

  // Get PDF as buffer
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}
