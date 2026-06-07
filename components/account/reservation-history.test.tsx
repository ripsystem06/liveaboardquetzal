import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test-utils'
import { ReservationHistory } from '@/components/account/reservation-history'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const mockReservations = [
  {
    id: '1',
    cruiseName: 'Socorro Islands Expedition',
    date: '2026-03-15',
    guests: 2,
    totalPrice: 6998,
    status: 'confirmed' as const,
  },
  {
    id: '2',
    cruiseName: 'Sea of Cortez Adventure',
    date: '2026-07-09',
    guests: 4,
    totalPrice: 9400,
    status: 'pending' as const,
  },
  {
    id: '3',
    cruiseName: 'Mag Bay + Socorro',
    date: '2025-10-16',
    guests: 2,
    totalPrice: 10398,
    status: 'completed' as const,
  },
]

describe('components/account/reservation-history', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('renders reservations', () => {
    it('displays reservation list when data exists', async () => {
      localStorageMock.setItem('quetzal_reservations', JSON.stringify(mockReservations))

      renderWithProviders(<ReservationHistory />)

      await waitFor(() => {
        expect(screen.getByText('Socorro Islands Expedition')).toBeInTheDocument()
        expect(screen.getByText('Sea of Cortez Adventure')).toBeInTheDocument()
        expect(screen.getByText('Mag Bay + Socorro')).toBeInTheDocument()
      })
    })

    it('shows correct price formatting', async () => {
      localStorageMock.setItem('quetzal_reservations', JSON.stringify(mockReservations))

      renderWithProviders(<ReservationHistory />)

      await waitFor(() => {
        expect(screen.getByText('$6,998')).toBeInTheDocument()
        expect(screen.getByText('$9,400')).toBeInTheDocument()
        expect(screen.getByText('$10,398')).toBeInTheDocument()
      })
    })

    it('shows guest count for each reservation', async () => {
      localStorageMock.setItem('quetzal_reservations', JSON.stringify(mockReservations))

      renderWithProviders(<ReservationHistory />)

      await waitFor(() => {
        // Use getAllByText since multiple reservations have 2 guests
        const guestLabels = screen.getAllByText(/\d+ guests/)
        expect(guestLabels.length).toBe(3)
      })
    })
  })

  describe('status badges', () => {
    it('displays pending badge', async () => {
      localStorageMock.setItem('quetzal_reservations', JSON.stringify([mockReservations[1]]))

      renderWithProviders(<ReservationHistory />)

      await waitFor(() => {
        const badge = screen.getByText('Pending')
        expect(badge).toBeInTheDocument()
      })
    })

    it('displays confirmed badge', async () => {
      localStorageMock.setItem('quetzal_reservations', JSON.stringify([mockReservations[0]]))

      renderWithProviders(<ReservationHistory />)

      await waitFor(() => {
        const badge = screen.getByText('Confirmed')
        expect(badge).toBeInTheDocument()
      })
    })

    it('displays completed badge', async () => {
      localStorageMock.setItem('quetzal_reservations', JSON.stringify([mockReservations[2]]))

      renderWithProviders(<ReservationHistory />)

      await waitFor(() => {
        const badge = screen.getByText('Completed')
        expect(badge).toBeInTheDocument()
      })
    })
  })

  describe('empty state', () => {
    it('shows empty message when reservations list is empty array', async () => {
      // Set empty array explicitly
      localStorageMock.setItem('quetzal_reservations', JSON.stringify([]))

      renderWithProviders(<ReservationHistory />)

      await waitFor(() => {
        expect(screen.getByText('No reservations yet')).toBeInTheDocument()
      })
    })

    it('seeds mock data when localStorage is empty', async () => {
      // No localStorage key at all - component seeds mock data
      localStorageMock.removeItem('quetzal_reservations')

      renderWithProviders(<ReservationHistory />)

      await waitFor(() => {
        // Should show mock data (3 reservations)
        expect(screen.getByText('Socorro Islands Expedition')).toBeInTheDocument()
      })
    })
  })
})