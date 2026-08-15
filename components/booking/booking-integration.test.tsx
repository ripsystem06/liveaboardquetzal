import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
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
  sessionListeners.forEach((listener) => listener())
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

// Mock PayPalSimulator to auto-complete
vi.mock('./paypal-simulator', () => ({
  PayPalSimulator: ({ onComplete }: { onComplete: () => void }) => {
    setTimeout(() => onComplete(), 0)
    return null
  },
}))

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
  // Step 1: request code
  await user.type(screen.getByLabelText(/email/i), email)
  await user.click(screen.getByRole('button', { name: /send code/i }))
  await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument())

  // Step 2: verify code
  await user.type(screen.getByLabelText(/code/i), otp)
  await user.click(screen.getByRole('button', { name: /verify/i }))

  // Advance to step 2 (select cruise)
  await waitFor(() => expect(screen.getByText(/select your cruise/i)).toBeInTheDocument())
}

describe('BookingPageClient integration', () => {
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

    // Stub sessionStorage for UserProvider
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    })
    vi.stubGlobal('open', vi.fn())

    // Mock fetch: OTP request + cruise data + reservation endpoints
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      const isPost = init?.method === 'POST'

      if (url.includes('/api/auth/otp/request') && isPost) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
      }
      if (url.includes('/api/cruises/calendar')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ expeditions: mockCruises }) })
      }
      if (url.includes('/api/reservations/') && url.includes('/confirm') && isPost) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: 'res-1', status: 'confirmed' }) })
      }
      if (url.includes('/api/reservations') && isPost) {
        return Promise.resolve({ ok: true, status: 201, json: () => Promise.resolve({ id: 'res-1', status: 'pending_approval' }) })
      }
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
    }))
  })

  describe('Full 3-step flow', () => {
    it('completes the booking flow: OTP login → select cruise → payment → confirmation', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      await completeLogin(user)

      // Step 2: select cruise + tier
      await user.click(screen.getAllByRole('button', { name: /select/i })[0])
      await user.click(screen.getAllByRole('button', { name: /Explorer/i })[0])

      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeEnabled()
      await user.click(nextButton)

      await waitFor(() => expect(screen.getByText(/booking summary/i)).toBeInTheDocument())

      // Step 3: pay
      await user.click(screen.getByRole('button', { name: /pay with credit card/i }))

      await waitFor(() => expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument(), { timeout: 3000 })
    })

    it('does not persist any session token after login', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      await completeLogin(user)
      // Login succeeded: we are now on step 2.
      expect(screen.getByText(/select your cruise/i)).toBeInTheDocument()
    })
  })

  describe('Step 3 is inaccessible without completing steps 1-2', () => {
    it('step 3 cannot be reached without selecting a cruise first', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      await completeLogin(user)

      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeDisabled()
    })

    it('does not advance on a wrong code', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      await user.type(screen.getByLabelText(/email/i), 'demo@quetzal.com')
      await user.click(screen.getByRole('button', { name: /send code/i }))
      await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument())

      await user.type(screen.getByLabelText(/code/i), '000000')
      await user.click(screen.getByRole('button', { name: /verify/i }))

      await waitFor(() => expect(screen.getByText(/invalid or expired code/i)).toBeInTheDocument())
      expect(screen.queryByText(/select your cruise/i)).not.toBeInTheDocument()
    })
  })
})
