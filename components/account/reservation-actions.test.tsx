import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen } from '@/test-utils'
import { ReservationActions } from './reservation-actions'
import type { ReservationData } from '@/lib/db'

const mockReservationBase: ReservationData = {
  id: 'res_123',
  userId: 'user_1',
  cruiseId: 'socorro-1',
  cruiseName: 'Socorro Islands',
  departureDate: '2026-03-15',
  route: 'Revillagigedo Archipelago',
  tier: 'premium',
  tierPrice: 350000,
  guestCount: 4,
  freeSpaces: 0,
  paidSpaces: 4,
  totalAmount: 1400000,
  paymentMethod: 'bank_transfer',
  status: 'pending_approval',
  holdExpiry: new Date('2026-03-17'),
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('ReservationActions', () => {
  describe('pending_approval + bank_transfer', () => {
    it('renders download PDF button', () => {
      renderWithProviders(<ReservationActions reservation={mockReservationBase} />)
      expect(screen.getByText('Download PDF')).toBeInTheDocument()
    })

    it('renders email button', () => {
      renderWithProviders(<ReservationActions reservation={mockReservationBase} />)
      expect(screen.getByText('Send via Email')).toBeInTheDocument()
    })

    it('renders WhatsApp button', () => {
      renderWithProviders(<ReservationActions reservation={mockReservationBase} />)
      expect(screen.getByText('Send via WhatsApp')).toBeInTheDocument()
    })
  })

  describe('pending_approval + paypal', () => {
    const paypalReservation: ReservationData = {
      ...mockReservationBase,
      paymentMethod: 'paypal',
    }

    it('does not render download PDF button', () => {
      renderWithProviders(<ReservationActions reservation={paypalReservation} />)
      expect(screen.queryByText('Download PDF')).not.toBeInTheDocument()
    })

    it('renders email button', () => {
      renderWithProviders(<ReservationActions reservation={paypalReservation} />)
      expect(screen.getByText('Send via Email')).toBeInTheDocument()
    })

    it('renders WhatsApp button', () => {
      renderWithProviders(<ReservationActions reservation={paypalReservation} />)
      expect(screen.getByText('Send via WhatsApp')).toBeInTheDocument()
    })
  })

  describe('confirmed status', () => {
    const confirmedReservation: ReservationData = {
      ...mockReservationBase,
      status: 'confirmed',
    }

    it('renders no action buttons', () => {
      renderWithProviders(<ReservationActions reservation={confirmedReservation} />)
      expect(screen.queryByText('Download PDF')).not.toBeInTheDocument()
      expect(screen.queryByText('Send via Email')).not.toBeInTheDocument()
      expect(screen.queryByText('Send via WhatsApp')).not.toBeInTheDocument()
    })
  })

  describe('expired status', () => {
    const expiredReservation: ReservationData = {
      ...mockReservationBase,
      status: 'expired',
    }

    it('renders expiry message', () => {
      renderWithProviders(<ReservationActions reservation={expiredReservation} />)
      expect(screen.getByText('This reservation has expired and the date has been released.')).toBeInTheDocument()
    })

    it('renders no action buttons', () => {
      renderWithProviders(<ReservationActions reservation={expiredReservation} />)
      expect(screen.queryByText('Download PDF')).not.toBeInTheDocument()
      expect(screen.queryByText('Send via Email')).not.toBeInTheDocument()
      expect(screen.queryByText('Send via WhatsApp')).not.toBeInTheDocument()
    })
  })

  describe('crew registration CTA', () => {
    it('renders the CTA when the reservation is confirmed', () => {
      const confirmedReservation: ReservationData = {
        ...mockReservationBase,
        status: 'confirmed',
      }

      renderWithProviders(<ReservationActions reservation={confirmedReservation} />)
      expect(
        screen.getByRole('link', { name: 'Complete Crew Registration' })
      ).toBeInTheDocument()
    })

    it('does not render the CTA for pending_approval reservations', () => {
      renderWithProviders(<ReservationActions reservation={mockReservationBase} />)
      expect(
        screen.queryByRole('link', { name: 'Complete Crew Registration' })
      ).not.toBeInTheDocument()
    })
  })
})
