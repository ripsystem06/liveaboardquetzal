import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test-utils'
import { ReservationList } from './reservation-list'
import React from 'react'

// Mock window.open without replacing the whole window object
const windowOpenMock = vi.fn()
window.open = windowOpenMock

// Mock global fetch
const fetchMock = vi.fn()
global.fetch = fetchMock

const mockReservations = [
  {
    id: 'res_1',
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
  },
  {
    id: 'res_2',
    userId: 'user_1',
    cruiseId: 'cortez-1',
    cruiseName: 'Sea of Cortez',
    departureDate: '2026-07-09',
    route: 'Sea of Cortez',
    tier: 'standard',
    tierPrice: 300000,
    guestCount: 2,
    freeSpaces: 0,
    paidSpaces: 2,
    totalAmount: 600000,
    paymentMethod: 'paypal',
    status: 'confirmed',
    holdExpiry: new Date('2026-07-10'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

describe('ReservationList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockReset()
    windowOpenMock.mockReset()
  })

  it('renders reservation cards when data exists', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reservations: mockReservations }),
    } as Response)

    renderWithProviders(<ReservationList userId="user_1" />)

    await waitFor(() => {
      const socorro = screen.getAllByText('Socorro Islands')
      const cortez = screen.getAllByText('Sea of Cortez')
      expect(socorro.length).toBeGreaterThan(0)
      expect(cortez.length).toBeGreaterThan(0)
    })
  })

  it('renders status badges for pending and confirmed reservations', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reservations: mockReservations }),
    } as Response)

    renderWithProviders(<ReservationList userId="user_1" />)

    await waitFor(() => {
      expect(screen.getByText('Pending Approval')).toBeInTheDocument()
      expect(screen.getByText('Confirmed')).toBeInTheDocument()
    })
  })

  it('renders action buttons for pending bank_transfer reservations', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ reservations: mockReservations }),
    } as Response)

    renderWithProviders(<ReservationList userId="user_1" />)

    await waitFor(() => {
      expect(screen.getByText('Download PDF')).toBeInTheDocument()
      expect(screen.getByText('Send via Email')).toBeInTheDocument()
      expect(screen.getByText('Send via WhatsApp')).toBeInTheDocument()
    })
  })
})
