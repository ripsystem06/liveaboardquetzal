import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { UserProvider, useUser } from '@/contexts/user-context'

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Mock fetch globally — now login/register call the server instead of using hardcoded credentials
const fetchMock = vi.fn()
global.fetch = fetchMock

// Helper to wrap hook with provider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>{children}</UserProvider>
)

describe('useUser', () => {
  beforeEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
    fetchMock.mockReset()
  })

  describe('login', () => {
    it('updates state when valid credentials are provided', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          user: { id: '1', name: 'Demo User', email: 'demo@quetzal.com', phone: '+1 555 0100', isAdmin: false },
        }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      let loginSuccess: boolean | undefined
      await act(async () => {
        loginSuccess = await result.current.login('demo@quetzal.com', '123456')
      })

      expect(loginSuccess).toBe(true)
      expect(result.current.user).toEqual({
        id: '1',
        name: 'Demo User',
        email: 'demo@quetzal.com',
        phone: '+1 555 0100',
        isAdmin: false,
      })
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('returns false when invalid credentials are provided', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      let loginSuccess: boolean | undefined
      await act(async () => {
        loginSuccess = await result.current.login('demo@quetzal.com', 'wrongpassword')
      })

      expect(loginSuccess).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('returns false when email is not found', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      let loginSuccess: boolean | undefined
      await act(async () => {
        loginSuccess = await result.current.login('other@example.com', '123456')
      })

      expect(loginSuccess).toBe(false)
      expect(result.current.user).toBeNull()
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

      const { result } = renderHook(() => useUser(), { wrapper })

      let newUser: { id: string; name: string; email: string; phone: string } | undefined
      await act(async () => {
        newUser = await result.current.register('Jane Doe', 'jane@example.com', 'password123')
      })

      expect(newUser).toBeDefined()
      expect(newUser!.name).toBe('Jane Doe')
      expect(newUser!.email).toBe('jane@example.com')
      expect(newUser!.phone).toBe('')
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(newUser)
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

    it('persists registered user to sessionStorage', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          user: { id: 'user-amFuZUBle', name: 'Jane Doe', email: 'jane@example.com', phone: '', isAdmin: false },
        }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      await act(async () => {
        await result.current.register('Jane Doe', 'jane@example.com', 'password123')
      })

      const stored = sessionStorageMock.getItem('quetzal_user')
      expect(stored).not.toBeNull()
      const parsed = JSON.parse(stored!)
      expect(parsed.name).toBe('Jane Doe')
      expect(parsed.email).toBe('jane@example.com')
    })
  })

  describe('logout', () => {
    it('clears user state when logout is called', async () => {
      // Mock fetch for login
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          user: { id: '1', name: 'Demo User', email: 'demo@quetzal.com', phone: '+1 555 0100', isAdmin: false },
        }),
      })
      // Mock fetch for logout (DELETE request — fire-and-forget)
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      // Login first
      await act(async () => {
        await result.current.login('demo@quetzal.com', '123456')
      })
      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      await act(async () => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('isAdmin', () => {
    it('sets isAdmin true when registering with admin@quetzal.com', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          user: { id: 'admin', name: 'Admin User', email: 'admin@quetzal.com', phone: '', isAdmin: true },
        }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      await act(async () => {
        await result.current.register('Admin User', 'admin@quetzal.com', 'password123')
      })

      expect(result.current.user?.email).toBe('admin@quetzal.com')
      expect(result.current.isAdmin).toBe(true)
    })

    it('sets isAdmin false when registering with non-admin email', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          user: { id: 'user-dXNlckBl', name: 'Regular User', email: 'user@example.com', phone: '', isAdmin: false },
        }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      await act(async () => {
        await result.current.register('Regular User', 'user@example.com', 'password123')
      })

      expect(result.current.user?.email).toBe('user@example.com')
      expect(result.current.isAdmin).toBe(false)
    })

    it('sets isAdmin true when logging in with admin@quetzal.com', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          user: { id: 'admin', name: 'Admin', email: 'admin@quetzal.com', phone: '', isAdmin: true },
        }),
      })

      const { result } = renderHook(() => useUser(), { wrapper })

      let loginSuccess: boolean | undefined
      await act(async () => {
        loginSuccess = await result.current.login('admin@quetzal.com', 'admin123')
      })

      expect(loginSuccess).toBe(true)
      expect(result.current.user?.email).toBe('admin@quetzal.com')
      expect(result.current.isAdmin).toBe(true)
    })
  })

  describe('session restore on mount', () => {
    it('restores session from sessionStorage when valid data exists', async () => {
      // Pre-populate sessionStorage with user data
      const userData = { id: '1', name: 'Demo User', email: 'demo@quetzal.com', phone: '+1 555 0100' }
      sessionStorageMock.setItem('quetzal_user', JSON.stringify(userData))

      const { result } = renderHook(() => useUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })
      expect(result.current.user).toEqual(userData)
    })

    it('does not restore session when sessionStorage has no data', async () => {
      const { result } = renderHook(() => useUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })
      expect(result.current.user).toBeNull()
    })
  })
})
