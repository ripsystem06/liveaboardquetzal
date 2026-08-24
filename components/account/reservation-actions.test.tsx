import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { ReservationActions } from './reservation-actions'
import { confirmCardPayment } from '@/lib/stripe-client'
import type { ReservationData } from '@/lib/db'

vi.mock('@/lib/stripe-client', () => ({
  confirmCardPayment: vi.fn().mockResolvedValue(null),
}))

const mockConfirmCardPayment = confirmCardPayment as unknown as ReturnType<typeof vi.fn>

const mockReservationBase: ReservationData = {
  id: 'res_123',
  userId: 'user_1',
  cruiseId: 'socorro-1',
  cruiseName: 'Socorro Islands',
  departureDate: '2026-03-15',
  route: 'Revillagigedo Archipelago',
  tier: 'premium',
  tierPrice: 3500,
  guestCount: 4,
  freeSpaces: 0,
  paidSpaces: 4,
  totalAmount: 14000,
  paymentMethod: null,
  status: 'pending_approval',
  holdExpiry: new Date('2026-03-17'),
  createdAt: new Date(),
  updatedAt: new Date(),
}

const approvedReservation: ReservationData = { ...mockReservationBase, status: 'approved' }

const bankInstructions = [
  {
    label: { en: 'BBVA (Mexico)', es: 'BBVA (México)' },
    bankName: 'BBVA',
    beneficiary: 'Alejandro Vasquez Pila',
    swift: 'BCMRMXMMPYM',
    clabe: '012022012760605958',
    accountNumber: '1276060595',
  },
]

describe('ReservationActions', () => {
  beforeEach(() => {
    mockConfirmCardPayment.mockReset().mockResolvedValue(null)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('pending_approval', () => {
    it('renders email and WhatsApp share actions', () => {
      renderWithProviders(<ReservationActions reservation={mockReservationBase} />)
      expect(screen.getByText('Send via Email')).toBeInTheDocument()
      expect(screen.getByText('Send via WhatsApp')).toBeInTheDocument()
    })

    it('does not render a PDF button or payment actions', () => {
      renderWithProviders(<ReservationActions reservation={mockReservationBase} />)
      expect(screen.queryByText('Download PDF')).not.toBeInTheDocument()
      expect(screen.queryByText('Pay with Card')).not.toBeInTheDocument()
      expect(screen.queryByText('Pay by Wire Transfer')).not.toBeInTheDocument()
    })
  })

  describe('approved + unpaid', () => {
    it('renders Stripe card and wire transfer payment actions', () => {
      renderWithProviders(<ReservationActions reservation={approvedReservation} />)
      expect(screen.getByText('Pay with Card')).toBeInTheDocument()
      expect(screen.getByText('Pay by Wire Transfer')).toBeInTheDocument()
    })
  })

  describe('approved + paid', () => {
    const paidReservation: ReservationData = {
      ...approvedReservation,
      paymentRecords: [
        {
          id: 'pr_1',
          provider: 'stripe',
          providerOrderId: 'pi_1',
          status: 'completed',
          amountUsd: 14000,
          createdAt: new Date(),
        },
      ],
    }

    it('renders no payment actions', () => {
      renderWithProviders(<ReservationActions reservation={paidReservation} />)
      expect(screen.queryByText('Pay with Card')).not.toBeInTheDocument()
      expect(screen.queryByText('Pay by Wire Transfer')).not.toBeInTheDocument()
    })
  })

  describe('confirmed status', () => {
    it('renders the crew registration CTA', () => {
      renderWithProviders(<ReservationActions reservation={{ ...mockReservationBase, status: 'confirmed' }} />)
      expect(screen.getByRole('link', { name: 'Complete Crew Registration' })).toBeInTheDocument()
    })
  })

  describe('expired status', () => {
    it('renders the expiry message', () => {
      renderWithProviders(<ReservationActions reservation={{ ...mockReservationBase, status: 'expired' }} />)
      expect(
        screen.getByText('This reservation has expired and the date has been released.')
      ).toBeInTheDocument()
    })
  })

  describe('wire transfer selection', () => {
    it('posts to the payment-method endpoint and shows instructions', async () => {
      const user = userEvent.setup()
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ paymentMethod: 'wire_transfer', instructions: bankInstructions }),
      })
      vi.stubGlobal('fetch', fetchMock)

      renderWithProviders(<ReservationActions reservation={approvedReservation} />)

      await user.click(screen.getByRole('button', { name: /pay by wire transfer/i }))

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/reservations/res_123/payment-method',
          expect.objectContaining({ method: 'POST' })
        )
      )
      await waitFor(() =>
        expect(screen.getByText(/wire transfer instructions/i)).toBeInTheDocument()
      )
      expect(screen.getByText('Alejandro Vasquez Pila')).toBeInTheDocument()
    })
  })

  describe('Stripe card selection', () => {
    it('creates a payment intent then confirms with Stripe', async () => {
      const user = userEvent.setup()
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ clientSecret: 'cs_test_123' }),
      })
      vi.stubGlobal('fetch', fetchMock)

      renderWithProviders(<ReservationActions reservation={approvedReservation} />)

      await user.click(screen.getByRole('button', { name: /pay with card/i }))

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/stripe/create-payment-intent',
          expect.objectContaining({ method: 'POST' })
        )
      )
      await waitFor(() =>
        expect(mockConfirmCardPayment).toHaveBeenCalledWith('cs_test_123', expect.any(String))
      )
    })
  })
})
