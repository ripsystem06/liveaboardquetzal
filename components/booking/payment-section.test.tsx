import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { LanguageProvider } from '@/contexts/language-context'
import { UserProvider } from '@/contexts/user-context'
import { PaymentSection } from './payment-section'
import type { Cruise } from './booking-page-client'

// Mock the PayPal SDK: the provider renders its children, and PayPalButtons
// auto-completes a checkout (createOrder → onApprove) to simulate the popup flow.
vi.mock('@paypal/react-paypal-js', () => ({
  PayPalScriptProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PayPalButtons: ({
    createOrder,
    onApprove,
  }: {
    createOrder: () => Promise<string>
    onApprove: (data: { orderID: string }) => Promise<void>
  }) => {
    useEffect(() => {
      void (async () => {
        const orderId = await createOrder()
        await onApprove({ orderID: orderId })
      })()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return <div>PayPal Checkout</div>
  },
}))

// Mock window.open
const windowOpenMock = vi.fn()
window.open = windowOpenMock

// Mock fetch
const fetchMock = vi.fn()
global.fetch = fetchMock

const mockCruise: Cruise = {
  id: 'socorro-1',
  name: 'Socorro Islands',
  departureDate: '2026-03-15',
  returnDate: '2026-03-24',
  route: 'Revillagigedo Archipelago',
  tiers: { basic: 2500, standard: 3000, premium: 3500 },
  dives: 5,
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
  paypalClientId: 'test-paypal-client-id',
  onPaymentComplete: vi.fn(),
}

// Simple wrapper for tests
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    <UserProvider>{children}</UserProvider>
  </LanguageProvider>
)

function okResponse(body: unknown, status = 200): Response {
  return { ok: true, status, json: () => Promise.resolve(body) } as unknown as Response
}

function errorResponse(status: number): Response {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ error: 'error' }),
  } as unknown as Response
}

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
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('creates a reservation then drives create-order/capture-order when the card button is clicked', async () => {
    const onPaymentComplete = vi.fn()
    fetchMock
      .mockResolvedValueOnce(okResponse({ id: 'res_123', status: 'pending_approval' }, 201)) // reservation
      .mockResolvedValueOnce(okResponse({ orderId: 'ORDER-1' })) // create order
      .mockResolvedValueOnce(okResponse({ id: 'pay_1', status: 'completed', reservationStatus: 'pending_approval' })) // capture

    render(<PaymentSection {...defaultProps} onPaymentComplete={onPaymentComplete} />, { wrapper })

    const buttons = screen.getAllByRole('button')
    const cardButton = buttons.find((btn) => btn.textContent?.match(/card/i))
    if (cardButton) fireEvent.click(cardButton)

    await waitFor(() => expect(onPaymentComplete).toHaveBeenCalledWith('res_123', 'paypal'))

    // The reservation was created with paymentMethod 'paypal' (card routes to PayPal)
    const createCall = fetchMock.mock.calls[0]
    expect(createCall[0]).toBe('/api/reservations')
    expect(JSON.parse(createCall[1].body).paymentMethod).toBe('paypal')
    // create-order and capture-order were called with the reservation id
    expect(fetchMock.mock.calls[1][0]).toBe('/api/paypal/create-order')
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ reservationId: 'res_123' })
    expect(fetchMock.mock.calls[2][0]).toBe('/api/paypal/capture-order')
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({
      reservationId: 'res_123',
      orderId: 'ORDER-1',
    })
  })

  it('runs the bank-transfer flow (create reservation + open PDF) when bank is clicked', async () => {
    const onPaymentComplete = vi.fn()
    fetchMock.mockResolvedValueOnce(okResponse({ id: 'res_456', status: 'pending_approval' }, 201))

    render(<PaymentSection {...defaultProps} onPaymentComplete={onPaymentComplete} />, { wrapper })

    const buttons = screen.getAllByRole('button')
    const bankButton = buttons.find((btn) => btn.textContent?.match(/bank/i))
    if (bankButton) fireEvent.click(bankButton)

    await waitFor(() => expect(onPaymentComplete).toHaveBeenCalledWith('res_456', 'bank_transfer'))
    expect(windowOpenMock).toHaveBeenCalledWith('/api/reservations/res_456/pdf', '_blank')
  })

  describe('error handling', () => {
    it('shows error message when API returns 409 (DATE_BLOCKED)', async () => {
      fetchMock.mockResolvedValueOnce(errorResponse(409))

      render(<PaymentSection {...defaultProps} />, { wrapper })

      const buttons = screen.getAllByRole('button')
      const cardButton = buttons.find((btn) => btn.textContent?.match(/card/i))
      if (cardButton) fireEvent.click(cardButton)

      const errorText = await screen.findByText(/This date is no longer available/i)
      expect(errorText).toBeInTheDocument()
    })

    it('shows error message when API returns 401 (AUTH_REQUIRED)', async () => {
      fetchMock.mockResolvedValueOnce(errorResponse(401))

      render(<PaymentSection {...defaultProps} />, { wrapper })

      const buttons = screen.getAllByRole('button')
      const cardButton = buttons.find((btn) => btn.textContent?.match(/card/i))
      if (cardButton) fireEvent.click(cardButton)

      const errorText = await screen.findByText(/Please log in/i)
      expect(errorText).toBeInTheDocument()
    })

    it('shows generic error for other failures', async () => {
      fetchMock.mockResolvedValueOnce(errorResponse(500))

      render(<PaymentSection {...defaultProps} />, { wrapper })

      const buttons = screen.getAllByRole('button')
      const bankButton = buttons.find((btn) => btn.textContent?.match(/bank/i))
      if (bankButton) fireEvent.click(bankButton)

      const errorText = await screen.findByText(/Payment failed/i)
      expect(errorText).toBeInTheDocument()
    })

    it('button is disabled while processing', async () => {
      let resolveSlow: (value: unknown) => void
      fetchMock.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveSlow = resolve
          })
      )

      render(<PaymentSection {...defaultProps} />, { wrapper })

      const buttons = screen.getAllByRole('button')
      const paypalButton = buttons.find((btn) => btn.textContent?.match(/paypal/i))
      if (paypalButton) fireEvent.click(paypalButton)

      await waitFor(() => {
        const allButtons = screen.getAllByRole('button')
        allButtons.forEach((btn) => {
          expect(btn).toBeDisabled()
        })
      }, { timeout: 2000 })
      resolveSlow!(okResponse({ id: 'res_123', status: 'pending_approval' }, 201))
    })
  })
})
