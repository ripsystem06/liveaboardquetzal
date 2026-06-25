import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateBankTransferPDF, type ReservationPDFData } from './pdf-generator'

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

describe('pdf-generator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return a Buffer containing PDF data', async () => {
    const result = await generateBankTransferPDF(mockReservation)

    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  it('should contain PDF magic bytes (%PDF)', async () => {
    const result = await generateBankTransferPDF(mockReservation)

    const pdfHeader = result.subarray(0, 5).toString()
    expect(pdfHeader).toBe('%PDF-')
  })

  it('should include reservation ID in PDF content', async () => {
    const result = await generateBankTransferPDF(mockReservation)

    // PDF is binary but contains text, search for reservation ID in the buffer
    const content = result.toString('utf-8', 0, Math.min(result.length, 10000))
    expect(content).toContain(mockReservation.id)
  })

  it('should include cruise name and details in PDF', async () => {
    const result = await generateBankTransferPDF(mockReservation)

    const content = result.toString('utf-8', 0, Math.min(result.length, 10000))
    expect(content).toContain('Sea of Cortez')
    expect(content).toContain('2026-07-09')
    expect(content).toContain('Standard')
    expect(content).toContain('$9,400')
  })

  it('should include bank transfer details', async () => {
    const result = await generateBankTransferPDF(mockReservation)

    const content = result.toString('utf-8', 0, Math.min(result.length, 10000))
    expect(content).toContain('Banco Internacional de Mexico')
    expect(content).toContain('BIMEMXMMXXX')
    expect(content).toContain('MX1234567890123456789012')
    expect(content).toContain('Quetzal Liveaboard S.A. de C.V.')
  })
})
