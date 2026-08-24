import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockConfirmationUpdate } = vi.hoisted(() => ({
  mockConfirmationUpdate: vi.fn(),
}))

// `sendConfirmationEmail` lazy-imports `./db` to persist the at-most-once guard.
vi.mock('./db', () => ({
  prisma: {
    reservation: {
      update: mockConfirmationUpdate,
    },
  },
}))

import {
  sendExpiryEmail,
  sendReservationCreatedEmail,
  sendPaymentReceivedEmail,
  sendCrewRegistrationInviteEmail,
  sendWelcomeEmail,
  sendOtpEmail,
  sendConfirmationEmail,
  type ReservationEmailData,
} from './email'

const mockReservation: ReservationEmailData = {
  id: 'res_test_123',
  userId: 'user_456',
  userEmail: 'test@example.com',
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
  paymentMethod: 'wire_transfer',
  status: 'expired',
  holdExpiry: new Date('2026-03-10T12:00:00Z'),
  createdAt: new Date('2026-03-08T12:00:00Z'),
  updatedAt: new Date('2026-03-10T12:00:00Z'),
}

function getAllLoggedContent(spy: ReturnType<typeof vi.spyOn>): string {
  return spy.mock.calls.map((call: unknown[]) => String(call[0])).join('\n')
}

describe('email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendExpiryEmail', () => {
    it('should log expiry email to console with reservation details', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await sendExpiryEmail(mockReservation)

      expect(consoleSpy.mock.calls.length).toBeGreaterThanOrEqual(1)
      const allLoggedContent = getAllLoggedContent(consoleSpy)
      expect(allLoggedContent).toContain('--- EMAIL MOCK ---')
      expect(allLoggedContent).toContain(mockReservation.id)
      expect(allLoggedContent).toContain(mockReservation.cruiseName)
      expect(allLoggedContent).toContain(mockReservation.departureDate)
      expect(allLoggedContent).toContain('expired')
      expect(allLoggedContent).toContain('The date has been released')
    })

    it('should include correct subject line', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await sendExpiryEmail(mockReservation)

      const allLoggedContent = getAllLoggedContent(consoleSpy)
      expect(allLoggedContent).toContain('Subject: Your reservation has expired — Quetzal Liveaboard')
    })

    it('should include user email in the mock output', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await sendExpiryEmail(mockReservation)

      const allLoggedContent = getAllLoggedContent(consoleSpy)
      expect(allLoggedContent).toContain('To: test@example.com')
    })
  })

  describe('sendReservationCreatedEmail', () => {
    it('should log created email with reservation details', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await sendReservationCreatedEmail({ ...mockReservation, status: 'pending_approval' })

      const allLoggedContent = getAllLoggedContent(consoleSpy)
      expect(allLoggedContent).toContain('--- EMAIL MOCK ---')
      expect(allLoggedContent).toContain('Subject: Reservation created — Quetzal Liveaboard')
      expect(allLoggedContent).toContain('Reservation Created')
      expect(allLoggedContent).toContain(mockReservation.cruiseName)
      expect(allLoggedContent).toContain('pending admin approval')
    })
  })

  describe('sendPaymentReceivedEmail', () => {
    it('should log payment-received email (not "confirmed") with reservation details', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await sendPaymentReceivedEmail({ ...mockReservation, status: 'pending_approval' })

      const allLoggedContent = getAllLoggedContent(consoleSpy)
      expect(allLoggedContent).toContain('--- EMAIL MOCK ---')
      expect(allLoggedContent).toContain('Subject: Payment received — Quetzal Liveaboard')
      expect(allLoggedContent).toContain('Payment Received')
      expect(allLoggedContent).toContain(mockReservation.cruiseName)
      expect(allLoggedContent).toContain('pending review')
      // It must NOT claim the reservation is confirmed
      expect(allLoggedContent).not.toContain('has been confirmed')
    })
  })

  describe('sendCrewRegistrationInviteEmail', () => {
    it('should log the invite email with a crew-registration link', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await sendCrewRegistrationInviteEmail({
        userEmail: 'test@example.com',
        reservationId: 'res_test_123',
        cruiseName: 'Socorro Islands',
        departureDate: '2026-03-15',
      })

      const allLoggedContent = getAllLoggedContent(consoleSpy)
      expect(allLoggedContent).toContain('--- EMAIL MOCK ---')
      expect(allLoggedContent).toContain('To: test@example.com')
      expect(allLoggedContent).toContain('Subject: Complete your crew registration — Quetzal Liveaboard')
      expect(allLoggedContent).toContain('Complete Your Crew Registration')
      expect(allLoggedContent).toContain('Socorro Islands')
      expect(allLoggedContent).toContain('/account/crew-registration/res_test_123')
    })
  })

  describe('sendWelcomeEmail', () => {
    it('should log welcome email with user name', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await sendWelcomeEmail('newuser@example.com', 'Alice')

      const allLoggedContent = getAllLoggedContent(consoleSpy)
      expect(allLoggedContent).toContain('--- EMAIL MOCK ---')
      expect(allLoggedContent).toContain('To: newuser@example.com')
      expect(allLoggedContent).toContain('Subject: Welcome to Quetzal Liveaboard')
      expect(allLoggedContent).toContain('Welcome aboard, Alice!')
    })
  })

  describe('sendOtpEmail', () => {
    it('should log the OTP email with the code and expiry notice (mock fallback)', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await sendOtpEmail('demo@quetzal.com', '123456')

      const allLoggedContent = getAllLoggedContent(consoleSpy)
      expect(allLoggedContent).toContain('--- EMAIL MOCK ---')
      expect(allLoggedContent).toContain('To: demo@quetzal.com')
      expect(allLoggedContent).toContain('Subject: Your Quetzal Liveaboard login code')
      expect(allLoggedContent).toContain('123456')
      expect(allLoggedContent).toContain('10 minutes')
    })
  })

  describe('sendConfirmationEmail', () => {
    const confirmationData = {
      id: 'res_test_123',
      userEmail: 'test@example.com',
      cruiseName: 'Socorro Islands',
      departureDate: '2026-03-15',
      route: 'Revillagigedo Archipelago',
      tier: 'premium',
      guestCount: 2,
      totalAmount: 7000,
    }

    it('sends once and persists the at-most-once guard when not yet sent', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      mockConfirmationUpdate.mockResolvedValue({})

      const result = await sendConfirmationEmail({
        ...confirmationData,
        confirmationEmailSentAt: null,
      })

      expect(result).toBe(true)
      const allLoggedContent = getAllLoggedContent(consoleSpy)
      expect(allLoggedContent).toContain('Subject: Your reservation is confirmed — Quetzal Liveaboard')
      expect(mockConfirmationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res_test_123' },
          data: expect.objectContaining({ confirmationEmailSentAt: expect.any(Date) }),
        })
      )
    })

    it('skips (no send, no persist) when confirmationEmailSentAt is already set', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = await sendConfirmationEmail({
        ...confirmationData,
        confirmationEmailSentAt: new Date('2026-03-16T12:00:00Z'),
      })

      expect(result).toBe(false)
      expect(getAllLoggedContent(consoleSpy)).not.toContain('Reservation Confirmed')
      expect(mockConfirmationUpdate).not.toHaveBeenCalled()
    })
  })
})
