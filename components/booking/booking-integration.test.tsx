import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { flushSync } from 'react-dom'
import { renderWithProviders, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { BookingPageClient } from './booking-page-client'

// Get the globally mocked next-auth/react hooks for configuration
const { useSession: mockUseSessionRaw, signIn: mockSignInRaw } = await import('next-auth/react')
const mockSignIn = mockSignInRaw as unknown as ReturnType<typeof vi.fn>
const mockUseSession = mockUseSessionRaw as unknown as ReturnType<typeof vi.fn>

// Reactive session state: changing it re-renders UserProvider, mirroring
// how next-auth/react's useSession subscribes to auth events in production.
let currentSession: { data: unknown; status: 'authenticated' | 'unauthenticated' } = {
  data: null,
  status: 'unauthenticated',
}
const sessionListeners = new Set<() => void>()

function emitSessionChange(next: typeof currentSession) {
  currentSession = next
  flushSync(() => {
    sessionListeners.forEach((listener) => listener())
  })
}

mockUseSession.mockImplementation(() => {
  const [, force] = React.useState(0)
  React.useEffect(() => {
    const listener = () => force((n) => n + 1)
    sessionListeners.add(listener)
    return () => {
      sessionListeners.delete(listener)
    }
  }, [])
  return { ...currentSession, update: vi.fn() }
})

const mockCruises = [
  {
    id: 'socorro-1',
    name: 'Socorro Islands — Giant Mantas',
    departureDate: '2026-08-15',
    returnDate: '2026-08-24',
    route: 'Socorro Islands',
    basicPrice: 3300,
    standardPrice: 3900,
    premiumPrice: 4600,
    dives: 18,
    boat: 'Quetzal',
  },
]

async function completeLogin(user: ReturnType<typeof userEvent.setup>, email = 'demo@quetzal.com', otp = '123456') {
  await user.type(screen.getByLabelText(/email/i), email)
  await user.click(screen.getByRole('button', { name: /send code/i }))
  await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument())

  await user.type(screen.getByLabelText(/code/i), otp)
  await user.click(screen.getByRole('button', { name: /verify/i }))

  // Authentication unlocks the existing terms step without resetting booking progress.
  await waitFor(() => expect(screen.queryByText(/sign in to submit your reservation/i)).not.toBeInTheDocument())
}

describe('BookingPageClient integration', () => {
  let reservationFetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    currentSession = { data: null, status: 'unauthenticated' }
    sessionListeners.clear()

    mockSignIn.mockImplementation(async (provider: string, options?: Record<string, unknown>) => {
      if (provider === 'credentials' && options?.otp === '123456') {
        emitSessionChange({
          data: {
            user: {
              id: 'demo-1',
              name: 'Demo User',
              email: options.email ?? 'demo@quetzal.com',
              image: null,
            },
            expires: '',
          },
          status: 'authenticated',
        })
        return { ok: true, error: null }
      }
      return { ok: false, error: 'CredentialsSignin' }
    })

    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    vi.stubGlobal('open', vi.fn())

    // Mock fetch: OTP request + cruise data + reservation endpoints
    reservationFetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      const isPost = init?.method === 'POST'

      if (url.includes('/api/auth/otp/request') && isPost) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
      }
      if (url.includes('/api/auth/otp/challenge') && isPost) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ twoFactorRequired: false }) })
      }
      if (url.includes('/api/cruises/calendar')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ expeditions: mockCruises }) })
      }
      if (url.includes('/api/reservations') && isPost) {
        return Promise.resolve({ ok: true, status: 201, json: () => Promise.resolve({ id: 'res-1', status: 'pending_approval' }) })
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
    })
    vi.stubGlobal('fetch', reservationFetchMock)
  })

  describe('Full guests-first flow', () => {
    it('walks guests → date → cabins → terms and submits without any booking-time payment', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      // Guests are first, before any authentication form.
      expect(screen.getByText(/shared half charter/i)).toBeInTheDocument()
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /pay/i })).not.toBeInTheDocument()

      // Advance guests → date
      await user.click(screen.getByRole('button', { name: /next/i }))
      await waitFor(() => expect(screen.getByText(/select your cruise/i)).toBeInTheDocument())

      // Date step: select cruise + tier, then advance
      await user.click(screen.getAllByRole('button', { name: /select/i })[0])
      await user.click(screen.getAllByRole('button', { name: /Explorer/i })[0])
      const nextFromDate = screen.getByRole('button', { name: /next/i })
      expect(nextFromDate).toBeEnabled()
      await user.click(nextFromDate)

      // Cabins step retains structured optional data.
      await waitFor(() => expect(screen.getByRole('spinbutton', { name: /cabin count/i })).toBeInTheDocument())
      await user.type(screen.getByRole('spinbutton', { name: /cabin count/i }), '2')
      await user.click(screen.getByRole('checkbox', { name: /double cabins/i }))
      await user.click(screen.getByRole('button', { name: /next/i }))

      // Authentication is gated at submission, not before the first booking input.
      await waitFor(() => expect(screen.getByText(/booking summary/i)).toBeInTheDocument())
      const submitButton = screen.getByRole('button', { name: /submit reservation/i })
      expect(submitButton).toBeDisabled()
      await completeLogin(user)

      await user.click(screen.getByRole('checkbox', { name: /terms/i }))
      expect(submitButton).toBeEnabled()

      await user.click(submitButton)

      // Confirmation without any payment at booking.
      await waitFor(() => expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument())

      const reservationCall = reservationFetchMock.mock.calls.find(([u]) =>
        typeof u === 'string' && u.includes('/api/reservations')
      )
      expect(reservationCall).toBeTruthy()
      expect(screen.queryByRole('button', { name: /pay/i })).not.toBeInTheDocument()
    })

    it('does not persist a session token while guests are collected first', async () => {
      renderWithProviders(<BookingPageClient />)

      expect(screen.getByText(/number of guests/i)).toBeInTheDocument()
      expect(sessionStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('Step gating', () => {
    it('cannot advance past the date step without selecting a cruise', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      await user.click(screen.getByRole('button', { name: /next/i }))
      await waitFor(() => expect(screen.getByText(/select your cruise/i)).toBeInTheDocument())

      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeDisabled()
    })
  })
})
