import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { PaymentSection } from './payment-section'
import type { Cruise } from './booking-page-client'

const mockCruise: Cruise = {
  id: 'socorro-1',
  name: 'Socorro Islands',
  departureDate: '2026-03-15',
  route: 'Revillagigedo Archipelago',
  tiers: { basic: 2500, standard: 3000, premium: 3500 },
}

describe('PaymentSection', () => {
  it('renders cruise name in summary', () => {
    const onPay = vi.fn()
    renderWithProviders(<PaymentSection cruise={mockCruise} selectedTier="standard" guestCount={2} onPay={onPay} />)

    expect(screen.getByText('Socorro Islands')).toBeInTheDocument()
  })

  it('renders guest count in summary', () => {
    const onPay = vi.fn()
    renderWithProviders(<PaymentSection cruise={mockCruise} selectedTier="standard" guestCount={2} onPay={onPay} />)

    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders correct total price (price × guests)', () => {
    const onPay = vi.fn()
    renderWithProviders(<PaymentSection cruise={mockCruise} selectedTier="standard" guestCount={2} onPay={onPay} />)

    expect(screen.getByText('$6,000')).toBeInTheDocument()
  })

  it('renders 3 payment buttons', () => {
    const onPay = vi.fn()
    renderWithProviders(<PaymentSection cruise={mockCruise} selectedTier="standard" guestCount={2} onPay={onPay} />)

    expect(screen.getByRole('button', { name: /credit card/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /paypal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bank transfer/i })).toBeInTheDocument()
  })

  it('calls onPay with "card" when Credit Card is clicked', async () => {
    const user = userEvent.setup()
    const onPay = vi.fn()
    renderWithProviders(<PaymentSection cruise={mockCruise} selectedTier="standard" guestCount={2} onPay={onPay} />)

    const cardButton = screen.getByRole('button', { name: /credit card/i })

    // Use fireEvent.click to ensure it works
    fireEvent.click(cardButton)

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 600))

    expect(onPay).toHaveBeenCalledTimes(1)
    expect(onPay).toHaveBeenCalledWith('card')
  })

  it('calls onPay with "paypal" when PayPal is clicked', async () => {
    const user = userEvent.setup()
    const onPay = vi.fn()
    renderWithProviders(<PaymentSection cruise={mockCruise} selectedTier="standard" guestCount={2} onPay={onPay} />)

    const paypalButton = screen.getByRole('button', { name: /paypal/i })
    fireEvent.click(paypalButton)

    await new Promise(resolve => setTimeout(resolve, 600))

    expect(onPay).toHaveBeenCalledTimes(1)
    expect(onPay).toHaveBeenCalledWith('paypal')
  })

  it('calls onPay with "bank" when Bank Transfer is clicked', async () => {
    const user = userEvent.setup()
    const onPay = vi.fn()
    renderWithProviders(<PaymentSection cruise={mockCruise} selectedTier="standard" guestCount={2} onPay={onPay} />)

    const bankButton = screen.getByRole('button', { name: /bank transfer/i })
    fireEvent.click(bankButton)

    await new Promise(resolve => setTimeout(resolve, 600))

    expect(onPay).toHaveBeenCalledTimes(1)
    expect(onPay).toHaveBeenCalledWith('bank')
  })
})