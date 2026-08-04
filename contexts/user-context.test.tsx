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

// Mock fetch for register (which still uses direct fetch)
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

  describe('login', () => {
    it('updates state when valid credentials are provided', async () => {
      signInMock.mockResolvedValue({ ok: true, error: null })

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

      let loginSuccess: boolean | undefined
      await act(async () => {
        loginSuccess = await result.current.login('demo@quetzal.com', '123456')
      })

      expect(loginSuccess).toBe(true)
      expect(signInMock).toHaveBeenCalledWith('credentials', {
        email: 'demo@quetzal.com',
        password: '123456',
        redirect: false,
      })
    })

    it('returns false when invalid credentials are provided', async () => {
      signInMock.mockResolvedValue({ ok: false, error: 'CredentialsSignin' })

      const { result } = renderHook(() => useUser(), { wrapper })

      let loginSuccess: boolean | undefined
      await act(async () => {
        loginSuccess = await result.current.login('demo@quetzal.com', 'wrongpassword')
      })

      expect(loginSuccess).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('creates a new user and sets authenticated state', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          user: { id: 'user-amFuZUBle', name: 'Jane Doe', email: 'jane@example.com', phone: '', isAdmin: false },
        }),
      })
      signInMock.mockResolvedValue({ ok: true, error: null })

      const { result } = renderHook(() => useUser(), { wrapper })

      let newUser: Awaited<ReturnType<typeof result.current.register>> | undefined
      await act(async () => {
        newUser = await result.current.register('Jane Doe', 'jane@example.com', 'password123')
      })

      expect(newUser).toBeDefined()
      expect(newUser!.name).toBe('Jane Doe')
      expect(newUser!.email).toBe('jane@example.com')
      expect(signInMock).toHaveBeenCalledWith('credentials', {
        email: 'jane@example.com',
        password: 'password123',
        redirect: false,
      })
    })

    it('throws error when email is already registered', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Email already registered' }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      await act(async () => {
        await expect(result.current.register('Demo User', 'demo@quetzal.com', '123456')).rejects.toThrow(
          'Email already registered',
        )
      })

      expect(result.current.isAuthenticated).toBe(false)
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
