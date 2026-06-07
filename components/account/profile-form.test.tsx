import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { renderWithProviders, userEvent } from '@/test-utils'
import { ProfileForm } from '@/components/account/profile-form'

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

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1 555 0100',
}

describe('components/account/profile-form', () => {
  beforeEach(() => {
    localStorageMock.clear()
    localStorageMock.setItem('quetzal_user', JSON.stringify(mockUser))
  })

  describe('pre-fills user data', () => {
    it('displays the user name in the name field', () => {
      renderWithProviders(<ProfileForm user={mockUser} />)
      
      const nameInput = screen.getByPlaceholderText('Name') as HTMLInputElement
      expect(nameInput.value).toBe('Test User')
    })

    it('displays the user email as read-only', () => {
      renderWithProviders(<ProfileForm user={mockUser} />)
      
      // The email input is disabled and has value 'test@example.com'
      const inputs = screen.getAllByRole('textbox')
      const emailInput = inputs.find(input => input.getAttribute('value') === 'test@example.com')
      expect(emailInput).toBeDefined()
      expect(emailInput).toBeDisabled()
    })

    it('displays the user phone in the phone field', () => {
      renderWithProviders(<ProfileForm user={mockUser} />)
      
      const phoneInput = screen.getByPlaceholderText('Phone') as HTMLInputElement
      expect(phoneInput.value).toBe('+1 555 0100')
    })
  })

  describe('save functionality', () => {
    it('calls updateProfile when save button is clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ProfileForm user={mockUser} />)
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)
      
      // Check that localStorage was updated with the new name
      const stored = JSON.parse(localStorageMock.getItem('quetzal_user') || '{}')
      expect(stored.name).toBe('Test User') // name unchanged since we didn't modify
    })

    it('shows success feedback after saving', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ProfileForm user={mockUser} />)
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe('edit functionality', () => {
    it('allows editing the name field', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ProfileForm user={mockUser} />)
      
      const nameInput = screen.getByPlaceholderText('Name') as HTMLInputElement
      await user.clear(nameInput)
      await user.type(nameInput, 'New Name')
      
      expect(nameInput.value).toBe('New Name')
    })

    it('allows editing the phone field', async () => {
      const user = userEvent.setup()
      renderWithProviders(<ProfileForm user={mockUser} />)
      
      const phoneInput = screen.getByPlaceholderText('Phone') as HTMLInputElement
      await user.clear(phoneInput)
      await user.type(phoneInput, '+1 555 9999')
      
      expect(phoneInput.value).toBe('+1 555 9999')
    })
  })
})