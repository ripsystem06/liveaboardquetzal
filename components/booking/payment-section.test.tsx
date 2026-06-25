import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/language-context'
import { UserProvider } from '@/contexts/user-context'
import { PaymentSection } from './payment-section'
import type { Cruise } from './booking-page-client'

// Mock window.open
const windowOpenMock = vi.fn()
vi.stubGlobal('window', {
  open: windowOpenMock,
})

// Mock fetch
const fetchMock = vi.fn()
global.fetch = fetchMock

const mockCruise: Cruise = {
  id: 'socorro-1',
  name: 'Socorro Islands',
  departureDate: '2026-03-15',
  route: 'Revillagigedo Archipelago',
  tiers: { basic: 2500, standard: 3000, premium: 3500 },
}

const defaultProps = {
  cruise: mockCruise,
  selectedTier: 'standard' as const,
  guestCount: 2,
  cruiseId: 'socorro-1',
  departureDate: '2026-03-15',
  route: 'Revillagigedo Archipelago',
  tierPrice: 3000,
  freeSpaces: 0,
  paidSpaces: 2,
  totalAmount: 6000,
  userId: 'user_1',
  onPaymentComplete: vi.fn(),
}

// Simple wrapper for tests
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <UserProvider>{children}</UserProvider>
  </LanguageProvider>
)

describe('PaymentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockReset()
    windowOpenMock.mockReset()
  })

  it('renders cruise name in summary', () => {
    render(<PaymentSection {...defaultProps} />, { wrapper })
    expect(screen.getByText('Socorro Islands')).toBeInTheDocument()
  })

  it('renders correct total price', () => {
    render(<PaymentSection {...defaultProps} />, { wrapper })
    expect(screen.getByText(/\$6,000/)).toBeInTheDocument()
  })

  it('renders all three payment buttons', () => {
    render(<PaymentSection {...defaultProps} />, { wrapper })
    // Check that buttons are rendered
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('calls onPaymentComplete when PayPal button is clicked', async () => {
    const onPaymentComplete = vi.fn()

    // Mock successful API responses
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'res_123', status: 'pending_approval' }),
    } as Response)

    render(<PaymentSection {...defaultProps} onPaymentComplete={onPaymentComplete} />, { wrapper })

    const buttons = screen.getAllByRole('button')
    const paypalButton = buttons.find(btn => btn.textContent?.includes('PayPal') || btn.textContent?.includes('paypal'))

    if (paypalButton) {
      fireEvent.click(paypalButton)
    }

    // Wait a bit for async operations
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(onPaymentComplete).toHaveBeenCalled()
  })

  describe('error handling', () => {
    it('shows error message when API returns 409 (DATE_BLOCKED)', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 409,
          json: () => Promise.resolve({ error: 'DATE_BLOCKED' }),
        } as Response)
        // Prevent confirmation call from hitting a real endpoint
        .mockRejectedValueOnce(new Error('Network error'))

      render(<PaymentSection {...defaultProps} />, { wrapper })

      const buttons = screen.getAllByRole('button')
      const cardButton = buttons.find(btn => btn.textContent?.match(/card/i))

      if (cardButton) {
        fireEvent.click(cardButton)
      }

      // Wait for error text to appear (DATE_BLOCKED → 'This date is no longer available...')
      const errorText = await screen.findByText(/This date is no longer available/i)
      expect(errorText).toBeInTheDocument()
    })

    it('shows error message when API returns 401 (AUTH_REQUIRED)', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Authentication required' }),
        } as Response)
        .mockRejectedValueOnce(new Error('Network error'))

      render(<PaymentSection {...defaultProps} />, { wrapper })

      const buttons = screen.getAllByRole('button')
      const cardButton = buttons.find(btn => btn.textContent?.match(/card/i))

      if (cardButton) {
        fireEvent.click(cardButton)
      }

      // AUTH_REQUIRED → 'Please log in to complete your booking.'
      const errorText = await screen.findByText(/Please log in/i)
      expect(errorText).toBeInTheDocument()
    })

    it('shows generic error for other failures', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Internal server error' }),
        } as Response)
        .mockRejectedValueOnce(new Error('Network error'))

      render(<PaymentSection {...defaultProps} />, { wrapper })

      const buttons = screen.getAllByRole('button')
      const bankButton = buttons.find(btn => btn.textContent?.match(/bank/i))

      if (bankButton) {
        fireEvent.click(bankButton)
      }

      // Generic error → 'Payment failed. Please try again.'
      const errorText = await screen.findByText(/Payment failed/i)
      expect(errorText).toBeInTheDocument()
    })

    it('button is disabled while processing', async () => {
      // Use a slow promise so we can observe the disabled state during processing
      let resolveSlow: (value: unknown) => void
      fetchMock.mockImplementation(
        () =>
          new Promise(resolve => {
            resolveSlow = resolve
          })
      )

      render(<PaymentSection {...defaultProps} />, { wrapper })

      const buttons = screen.getAllByRole('button')
      const paypalButton = buttons.find(btn => btn.textContent?.match(/paypal/i))

      if (paypalButton) {
        fireEvent.click(paypalButton)
      }

      // Give React time to update state
      await new Promise(resolve => setTimeout(resolve, 10))

      // While processing, all buttons should be disabled
      const allButtons = screen.getAllByRole('button')
      allButtons.forEach(btn => {
        expect(btn).toBeDisabled()
      })

      // Resolve the pending fetch
      resolveSlow!({
        ok: true,
        json: () => Promise.resolve({ id: 'res_123', status: 'pending_approval' }),
      })
    })

    it('clears error on retry', async () => {
      // First call fails with 500, second call succeeds
      fetchMock
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server error' }),
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: 'res_123', status: 'pending_approval' }),
        } as Response)

      render(<PaymentSection {...defaultProps} />, { wrapper })

      const buttons = screen.getAllByRole('button')
      const cardButton = buttons.find(btn => btn.textContent?.match(/card/i))

      // First attempt — should show error
      if (cardButton) {
        fireEvent.click(cardButton)
      }

      // Wait for error to appear
      await screen.findByText(/Payment failed/i)

      // Second attempt — retry
      if (cardButton) {
        fireEvent.click(cardButton)
      }

      // Wait for error to disappear (setError(null) is called at start of handlePay)
      await new Promise(resolve => setTimeout(resolve, 50))

      // Error should be cleared after successful retry
      expect(screen.queryByText(/Payment failed/i)).not.toBeInTheDocument()
    })
  })
})
