import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateBankTransferPDF, type ReservationPDFData } from './pdf-generator'
import { bankAccounts } from './payment-config'
import { contactInfo } from './contact'
import { termsContent } from './legal/terms'
import { cancellationContent } from './legal/cancellation'

const mockReservation: ReservationPDFData = {
  id: 'res_pdf_test_456',
  userId: 'user_789',
  cruiseId: 'cortez-1',
  cruiseName: 'Sea of Cortez',
  departureDate: '2026-07-09',
  route: 'Bahía de La Paz',
  tier: 'standard',
  tierPrice: 2350,
  guestCount: 4,
  freeSpaces: 6,
  paidSpaces: 4,
  totalAmount: 9400,
  paymentMethod: 'bank_transfer',
  status: 'pending_approval',
  holdExpiry: new Date('2026-07-11T12:00:00Z'),
  createdAt: new Date('2026-07-09T12:00:00Z'),
  updatedAt: new Date('2026-07-09T12:00:00Z'),
}

const mockCruise = {
  returnDate: '2026-07-16',
  boat: 'Quetzal',
  dives: 5,
}

// Legacy hardcoded fake bank values (removed in favor of config-sourced details).
const LEGACY_BANK_STRINGS = [
  'Banco Internacional de Mexico',
  'BIMEMXMMXXX',
  'MX1234567890123456789012',
  '00123456789',
]

function buildParams(lang: 'en' | 'es' = 'en') {
  return {
    reservation: mockReservation,
    cruise: mockCruise,
    bankAccounts,
    contactInfo,
    termsContent,
    cancellationContent,
    lang,
  }
}

function pdfText(buf: Buffer): string {
  // jsPDF standard fonts use WinAnsi (Latin-1) encoding in the content stream;
  // decode as latin1 so accented Spanish characters (é, í, ó, ñ…) survive.
  return buf.toString('latin1')
}

describe('pdf-generator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return a Buffer containing PDF data', async () => {
    const result = await generateBankTransferPDF(buildParams())

    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  it('should contain PDF magic bytes (%PDF)', async () => {
    const result = await generateBankTransferPDF(buildParams())

    const pdfHeader = result.subarray(0, 5).toString()
    expect(pdfHeader).toBe('%PDF-')
  })

  it('should include reservation ID in PDF content', async () => {
    const result = await generateBankTransferPDF(buildParams())

    expect(pdfText(result)).toContain(mockReservation.id)
  })

  it('should include cruise name and existing reservation details', async () => {
    const result = await generateBankTransferPDF(buildParams())

    const content = pdfText(result)
    expect(content).toContain('Sea of Cortez')
    expect(content).toContain('2026-07-09')
    expect(content).toContain('Standard')
    expect(content).toContain('$9,400')
  })

  it('should render bank details sourced from lib/payment-config', async () => {
    const result = await generateBankTransferPDF(buildParams())

    const content = pdfText(result)
    for (const account of bankAccounts) {
      expect(content).toContain(account.bankName)
      expect(content).toContain(account.beneficiary)
    }
    expect(content).toContain(bankAccounts[0].clabe as string)
    expect(content).toContain(bankAccounts[0].accountNumber as string)
    expect(content).toContain(bankAccounts[0].swift as string)
    expect(content).toContain(bankAccounts[1].routingNumber as string)
    expect(content).toContain(bankAccounts[1].accountNumber as string)
    expect(content).toContain(bankAccounts[1].zelle as string)
    expect(content).toContain(bankAccounts[1].swift as string)
  })

  it('should NOT contain the legacy hardcoded fake bank values', async () => {
    const result = await generateBankTransferPDF(buildParams())

    const content = pdfText(result)
    for (const legacy of LEGACY_BANK_STRINGS) {
      expect(content).not.toContain(legacy)
    }
  })

  it('should render the joined Cruise fields (returnDate, boat, dives)', async () => {
    const result = await generateBankTransferPDF(buildParams())

    const content = pdfText(result)
    expect(content).toContain(mockCruise.returnDate)
    expect(content).toContain(mockCruise.boat)
    expect(content).toContain(`${mockCruise.dives}`)
  })

  it('should render English terms and cancellation headings by default', async () => {
    const result = await generateBankTransferPDF(buildParams())

    const content = pdfText(result)
    expect(content).toContain(termsContent.en.title)
    expect(content).toContain('Acceptance of Terms')
    expect(content).toContain(cancellationContent.en.title)
    expect(content).toContain('Overview')
  })

  it('should render Spanish terms and cancellation headings when lang=es', async () => {
    const result = await generateBankTransferPDF(buildParams('es'))

    const content = pdfText(result)
    expect(content).toContain(termsContent.es.title)
    expect(content).toContain('Aceptación de los Términos')
    expect(content).toContain(cancellationContent.es.title)
    expect(content).toContain('Visión General')
  })

  it('should not mix languages — English PDF has no Spanish legal headings', async () => {
    const result = await generateBankTransferPDF(buildParams('en'))

    const content = pdfText(result)
    expect(content).not.toContain(termsContent.es.title)
    expect(content).not.toContain(cancellationContent.es.title)
  })

  it('should not mix languages — Spanish PDF has no English legal headings', async () => {
    const result = await generateBankTransferPDF(buildParams('es'))

    const content = pdfText(result)
    expect(content).not.toContain(termsContent.en.title)
    expect(content).not.toContain(cancellationContent.en.title)
  })

  it('should render contact email and phones from lib/contact', async () => {
    const result = await generateBankTransferPDF(buildParams())

    const content = pdfText(result)
    expect(content).toContain(contactInfo.email)
    for (const phone of contactInfo.phones) {
      expect(content).toContain(phone)
    }
  })
})
