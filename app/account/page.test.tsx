import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { renderWithProviders } from '@/test-utils'
import { AccountPageClient } from '@/components/account/account-page-client'

// Mock next/navigation - must be before imports
const replaceMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => {
    return { replace: replaceMock }
  },
  usePathname: () => '/account',
}))

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

describe('app/account/page', () => {
  beforeEach(() => {
    localStorageMock.clear()
    sessionStorageMock.clear()
    replaceMock.mockClear()
  })

  describe('authenticated access', () => {
    it('renders account page when user is authenticated', async () => {
      // Pre-populate sessionStorage with user data
      const userData = { id: '1', name: 'Test User', email: 'test@example.com', phone: '+1 555 0100' }
      sessionStorageMock.setItem('quetzal_user', JSON.stringify(userData))

      renderWithProviders(<AccountPageClient />)

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('Reservation History')).toBeInTheDocument()
      })
    })
  })
})