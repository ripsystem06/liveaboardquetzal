import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendExpiryEmail, type ReservationEmailData } from './email'

const mockReservation: ReservationEmailData = {
  id: 'res_test_123',
  userId: 'user_456',
  cruiseId: 'socorro-1',
  cruiseName: 'Socorro Islands',
  departureDate: '2026-03-15',
  route: 'Revillagigedo Archipelago',
  tier: 'premium',
  tierPrice: 3500,
  guestCount: 2,
  freeSpaces: 8,
  paidSpaces: 2,
  totalAmount: 7000,
  paymentMethod: 'bank_transfer',
  status: 'expired',
  holdExpiry: new Date('2026-03-10T12:00:00Z'),
  createdAt: new Date('2026-03-08T12:00:00Z'),
  updatedAt: new Date('2026-03-10T12:00:00Z'),
}

describe('email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should log expiry email to console with reservation details', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await sendExpiryEmail(mockReservation)

    // The function logs multiple lines to console
    expect(consoleSpy.mock.calls.length).toBeGreaterThanOrEqual(1)
    const allLoggedContent = consoleSpy.mock.calls.map(call => call[0]).join('\n')
    expect(allLoggedContent).toContain('--- EMAIL MOCK ---')
    expect(allLoggedContent).toContain(`Reservation ID: ${mockReservation.id}`)
    expect(allLoggedContent).toContain(`Cruise: ${mockReservation.cruiseName}`)
    expect(allLoggedContent).toContain(`Departure Date: ${mockReservation.departureDate}`)
    expect(allLoggedContent).toContain('has expired')
    expect(allLoggedContent).toContain('The date has been released')
  })

  it('should include correct subject line', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await sendExpiryEmail(mockReservation)

    const allLoggedContent = consoleSpy.mock.calls.map(call => call[0]).join('\n')
    expect(allLoggedContent).toContain('Subject: Your reservation has expired — Quetzal Liveaboard')
  })
})
