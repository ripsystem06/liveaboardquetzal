import { describe, it, expect, beforeEach } from 'vitest'
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

// Helper to wrap hook with provider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>{children}</UserProvider>
)

describe('useUser', () => {
  beforeEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
  })

  describe('login', () => {
    it('updates state when valid credentials are provided', async () => {
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
      })
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('returns false when invalid credentials are provided', async () => {
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

  describe('logout', () => {
    it('clears user state when logout is called', async () => {
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