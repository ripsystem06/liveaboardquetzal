import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test-utils'
import { AccountPageClient } from '@/components/account/account-page-client'

// Mock next/navigation - must be before imports
const replaceMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => {
    return { replace: replaceMock }
  },
  usePathname: () => '/account',
}))

// Mock fetch for account data
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ reservations: [] }),
}))

describe('app/account/page', () => {
  beforeEach(async () => {
    replaceMock.mockClear()
  })

  describe('authenticated access', () => {
    it('renders account page when user is authenticated', async () => {
      // Mock useSession to return authenticated state
      const { useSession } = await import('next-auth/react')
      const useSessionMock = useSession as ReturnType<typeof vi.fn>
      useSessionMock.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            image: null,
          },
          expires: '',
        },
        status: 'authenticated' as const,
        update: vi.fn(),
      })

      renderWithProviders(<AccountPageClient />)

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('Reservation History')).toBeInTheDocument()
      })
    })
  })
})
