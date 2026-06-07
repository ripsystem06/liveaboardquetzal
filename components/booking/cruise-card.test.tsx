import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { CruiseCard } from './cruise-card'
import type { Cruise } from './booking-page-client'

const mockCruise: Cruise = {
  id: 'socorro-1',
  name: 'Socorro Islands',
  departureDate: '2026-03-15',
  route: 'Revillagigedo Archipelago',
  pricePerPerson: 3500,
  boat: 'Quetzal',
}

describe('CruiseCard', () => {
  it('renders cruise name, route, date parts, and price', () => {
    const onSelect = vi.fn()
    renderWithProviders(<CruiseCard cruise={mockCruise} onSelect={onSelect} />)

    expect(screen.getByText('Socorro Islands')).toBeInTheDocument()
    expect(screen.getByText('Revillagigedo Archipelago')).toBeInTheDocument()
    // Date rendered as separate elements: "Mar", "15", "2026"
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('Mar')).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText(/3,500/)).toBeInTheDocument()
  })

  it('renders a Select button', () => {
    const onSelect = vi.fn()
    renderWithProviders(<CruiseCard cruise={mockCruise} onSelect={onSelect} />)

    expect(screen.getByRole('button', { name: /select/i })).toBeInTheDocument()
  })

  it('calls onSelect with the cruise when Select button is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderWithProviders(<CruiseCard cruise={mockCruise} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: /select/i }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(mockCruise)
  })

  it('shows "Selected" state when isSelected is true', () => {
    const onSelect = vi.fn()
    renderWithProviders(<CruiseCard cruise={mockCruise} onSelect={onSelect} isSelected />)

    expect(screen.getByRole('button', { name: /selected/i })).toBeInTheDocument()
  })

  it('shows "Select" button when not selected', () => {
    const onSelect = vi.fn()
    renderWithProviders(<CruiseCard cruise={mockCruise} onSelect={onSelect} isSelected={false} />)

    expect(screen.getByRole('button', { name: /select/i })).toBeInTheDocument()
  })
})