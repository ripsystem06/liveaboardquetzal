import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '@/test-utils'
import { ReservationStatusBadge } from './reservation-status-badge'

describe('ReservationStatusBadge', () => {
  describe('pending_approval status', () => {
    it('renders pending label', () => {
      renderWithProviders(<ReservationStatusBadge status="pending_approval" />)
      expect(screen.getByText('Pending Approval')).toBeInTheDocument()
    })

    it('has amber background color', () => {
      const { container } = renderWithProviders(<ReservationStatusBadge status="pending_approval" />)
      const span = container.querySelector('span')
      expect(span?.className).toContain('bg-amber-100')
      expect(span?.className).toContain('text-amber-800')
    })
  })

  describe('approved status', () => {
    it('renders approved label', () => {
      renderWithProviders(<ReservationStatusBadge status="approved" />)
      expect(screen.getByText('Approved')).toBeInTheDocument()
    })

    it('has blue background color', () => {
      const { container } = renderWithProviders(<ReservationStatusBadge status="approved" />)
      const span = container.querySelector('span')
      expect(span?.className).toContain('bg-blue-100')
      expect(span?.className).toContain('text-blue-800')
    })
  })

  describe('confirmed status', () => {
    it('renders confirmed label', () => {
      renderWithProviders(<ReservationStatusBadge status="confirmed" />)
      expect(screen.getByText('Confirmed')).toBeInTheDocument()
    })

    it('has green background color', () => {
      const { container } = renderWithProviders(<ReservationStatusBadge status="confirmed" />)
      const span = container.querySelector('span')
      expect(span?.className).toContain('bg-green-100')
      expect(span?.className).toContain('text-green-800')
    })
  })

  describe('expired status', () => {
    it('renders expired label', () => {
      renderWithProviders(<ReservationStatusBadge status="expired" />)
      expect(screen.getByText('Expired')).toBeInTheDocument()
    })

    it('has red background color', () => {
      const { container } = renderWithProviders(<ReservationStatusBadge status="expired" />)
      const span = container.querySelector('span')
      expect(span?.className).toContain('bg-red-100')
      expect(span?.className).toContain('text-red-800')
    })
  })

  describe('cancelled status', () => {
    it('renders cancelled label', () => {
      renderWithProviders(<ReservationStatusBadge status="cancelled" />)
      expect(screen.getByText('Cancelled')).toBeInTheDocument()
    })

    it('has gray background color', () => {
      const { container } = renderWithProviders(<ReservationStatusBadge status="cancelled" />)
      const span = container.querySelector('span')
      expect(span?.className).toContain('bg-gray-100')
      expect(span?.className).toContain('text-gray-600')
    })
  })
})
