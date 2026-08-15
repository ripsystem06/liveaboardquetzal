import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { UserProvider, useUser } from '@/contexts/user-context'

// Mock auth.config to prevent cascade
vi.mock('@/lib/auth.config', () => ({
  auth: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock next-auth/react inline (no top-level vars due to hoisting)
vi.mock('next-auth/react', () => {
  const useSession = vi.fn(() => ({
    data: null,
    status: 'unauthenticated' as const,
    update: vi.fn(),
  }))

  return {
    useSession,
    signIn: vi.fn(),
    signOut: vi.fn(),
    SessionProvider: ({ children }: { children: React.ReactNode }) => children,
    getSession: vi.fn(),
  }
})

// Mock fetch for requestOtp (direct fetch to /api/auth/otp/request)
const fetchMock = vi.fn()
global.fetch = fetchMock

// Helper to wrap hook with provider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>{children}</UserProvider>
)

describe('useUser', () => {
  let signInMock: ReturnType<typeof vi.fn>
  let signOutMock: ReturnType<typeof vi.fn>
  let useSessionMock: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    fetchMock.mockReset()
    const naModule = await import('next-auth/react')
    signInMock = naModule.signIn as ReturnType<typeof vi.fn>
    signOutMock = naModule.signOut as ReturnType<typeof vi.fn>
    useSessionMock = naModule.useSession as ReturnType<typeof vi.fn>
    signInMock.mockReset()
    signOutMock.mockReset()
    useSessionMock.mockReturnValue({
      data: null,
      status: 'unauthenticated' as const,
      update: vi.fn(),
    })
  })

  describe('requestOtp', () => {
    it('POSTs the email to /api/auth/otp/request and resolves on success', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })

      const { result } = renderHook(() => useUser(), { wrapper })

      await act(async () => {
        await result.current.requestOtp('demo@quetzal.com')
      })

      expect(fetchMock).toHaveBeenCalledWith('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@quetzal.com' }),
      })
    })

    it('throws on a 429 rate-limit response', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many requests' }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      await act(async () => {
        await expect(result.current.requestOtp('demo@quetzal.com')).rejects.toThrow('Too many requests')
      })
    })
  })

  describe('verifyOtp', () => {
    it('returns success when the challenge requires no second factor and signIn succeeds', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ twoFactorRequired: false }),
      })
      signInMock.mockResolvedValue({ ok: true, error: null })

      const { result } = renderHook(() => useUser(), { wrapper })

      let outcome: Awaited<ReturnType<typeof result.current.verifyOtp>> | undefined
      await act(async () => {
        outcome = await result.current.verifyOtp('demo@quetzal.com', '123456')
      })

      expect(outcome).toEqual({ kind: 'success' })
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/otp/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@quetzal.com', otp: '123456' }),
      })
      expect(signInMock).toHaveBeenCalledWith('credentials', {
        email: 'demo@quetzal.com',
        otp: '123456',
        redirect: false,
      })
    })

    it('passes the optional name through to the challenge and signIn', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ twoFactorRequired: false }),
      })
      signInMock.mockResolvedValue({ ok: true, error: null })

      const { result } = renderHook(() => useUser(), { wrapper })

      await act(async () => {
        await result.current.verifyOtp('jane@example.com', '123456', 'Jane Doe')
      })

      expect(fetchMock).toHaveBeenCalledWith('/api/auth/otp/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'jane@example.com', otp: '123456' }),
      })
      expect(signInMock).toHaveBeenCalledWith('credentials', {
        email: 'jane@example.com',
        otp: '123456',
        name: 'Jane Doe',
        redirect: false,
      })
    })

    it('returns twoFactorRequired with the masked email and skips signIn', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ twoFactorRequired: true, maskedEmail: 'r***@quetzal.com' }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      let outcome: Awaited<ReturnType<typeof result.current.verifyOtp>> | undefined
      await act(async () => {
        outcome = await result.current.verifyOtp('admin@quetzal.com', '123456')
      })

      expect(outcome).toEqual({ kind: 'twoFactorRequired', maskedEmail: 'r***@quetzal.com' })
      expect(signInMock).not.toHaveBeenCalled()
    })

    it('returns error when the challenge rejects the code', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ twoFactorRequired: false }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      let outcome: Awaited<ReturnType<typeof result.current.verifyOtp>> | undefined
      await act(async () => {
        outcome = await result.current.verifyOtp('demo@quetzal.com', '000000')
      })

      expect(outcome).toEqual({ kind: 'error' })
      expect(signInMock).not.toHaveBeenCalled()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('verifyTwoFactor', () => {
    it('signs in with credentials including the twoFactorCode and returns true on success', async () => {
      signInMock.mockResolvedValue({ ok: true, error: null })

      const { result } = renderHook(() => useUser(), { wrapper })

      let ok: boolean | undefined
      await act(async () => {
        ok = await result.current.verifyTwoFactor('admin@quetzal.com', '123456', '654321')
      })

      expect(ok).toBe(true)
      expect(signInMock).toHaveBeenCalledWith('credentials', {
        email: 'admin@quetzal.com',
        otp: '123456',
        twoFactorCode: '654321',
        redirect: false,
      })
    })

    it('returns false when the second factor is rejected', async () => {
      signInMock.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

      const { result } = renderHook(() => useUser(), { wrapper })

      let ok: boolean | undefined
      await act(async () => {
        ok = await result.current.verifyTwoFactor('admin@quetzal.com', '123456', '000000')
      })

      expect(ok).toBe(false)
    })
  })

  describe('logout', () => {
    it('clears user state when logout is called', async () => {
      signOutMock.mockResolvedValue({ url: '/' })
      useSessionMock.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Demo User',
            email: 'demo@quetzal.com',
            image: null,
          },
          expires: '',
        },
        status: 'authenticated' as const,
        update: vi.fn(),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      await act(async () => {
        result.current.logout()
      })

      expect(signOutMock).toHaveBeenCalledWith({ redirect: false })
    })
  })

  describe('isAdmin', () => {
    it('detects admin from session user', async () => {
      useSessionMock.mockReturnValue({
        data: {
          user: {
            id: 'admin',
            name: 'Admin',
            email: 'admin@quetzal.com',
            image: null,
            isAdmin: true,
          } as Record<string, unknown>,
          expires: '',
        },
        status: 'authenticated' as const,
        update: vi.fn(),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })
      expect(result.current.isAdmin).toBe(true)
    })
  })

  describe('session restore on mount', () => {
    it('reads session from useSession on mount', async () => {
      useSessionMock.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: 'Demo User',
            email: 'demo@quetzal.com',
            image: null,
          },
          expires: '',
        },
        status: 'authenticated' as const,
        update: vi.fn(),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })
      expect(result.current.user?.email).toBe('demo@quetzal.com')
    })

    it('shows unauthenticated when session is null', async () => {
      useSessionMock.mockReturnValue({
        data: null,
        status: 'unauthenticated' as const,
        update: vi.fn(),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.sessionReady).toBe(true)
      })
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })
})
