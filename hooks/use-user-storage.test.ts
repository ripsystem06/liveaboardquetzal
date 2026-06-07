import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

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

// Import after mock is set up
import { useUserStorage } from './use-user-storage'

describe('useUserStorage', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('load on mount', () => {
    it('returns null when key does not exist', () => {
      const { result } = renderHook(() => useUserStorage('quetzal_user'))
      expect(result.current[0]).toBeNull()
    })

    it('returns null when localStorage has corrupted JSON', () => {
      localStorageMock.setItem('quetzal_user', '{ invalid json }')
      const { result } = renderHook(() => useUserStorage('quetzal_user'))
      expect(result.current[0]).toBeNull()
    })

    it('parses and returns valid JSON from localStorage', () => {
      const userData = { id: '1', name: 'Demo User', email: 'demo@quetzal.com', phone: '+1 555 0100' }
      localStorageMock.setItem('quetzal_user', JSON.stringify(userData))
      const { result } = renderHook(() => useUserStorage('quetzal_user'))
      expect(result.current[0]).toEqual(userData)
    })
  })

  describe('save on change', () => {
    it('saves user data to localStorage when setUser is called', async () => {
      const { result } = renderHook(() => useUserStorage('quetzal_user'))
      const userData = { id: '1', name: 'Demo User', email: 'demo@quetzal.com', phone: '+1 555 0100' }

      await act(async () => {
        result.current[1](userData)
      })

      const stored = localStorageMock.getItem('quetzal_user')
      expect(JSON.parse(stored!)).toEqual(userData)
    })

    it('removes key from localStorage when setUser is called with null', async () => {
      const userData = { id: '1', name: 'Demo User', email: 'demo@quetzal.com', phone: '+1 555 0100' }
      localStorageMock.setItem('quetzal_user', JSON.stringify(userData))

      const { result } = renderHook(() => useUserStorage('quetzal_user'))

      await act(async () => {
        result.current[1](null)
      })

      expect(localStorageMock.getItem('quetzal_user')).toBeNull()
    })
  })
})