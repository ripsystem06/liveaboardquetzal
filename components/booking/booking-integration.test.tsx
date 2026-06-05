import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, fireEvent, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { BookingPageClient } from './booking-page-client'

describe('BookingPageClient integration', () => {
  describe('Full 3-step flow', () => {
    it('completes entire booking flow: login → select cruise → payment → confirmation', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      // Step 1: Login
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'user123')
      await user.type(passwordInput, '123456')

      const form = emailInput.closest('form')!
      fireEvent.submit(form)

      // Should advance to step 2
      await waitFor(() => {
        expect(screen.getByText(/select your cruise/i)).toBeInTheDocument()
      })

      // Step 2: Select cruise (click "Select" on first cruise card)
      const selectButtons = screen.getAllByRole('button', { name: /select/i })
      await user.click(selectButtons[0])

      // Should show the next button enabled
      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeEnabled()
      await user.click(nextButton)

      // Should advance to step 3
      await waitFor(() => {
        expect(screen.getByText(/booking summary/i)).toBeInTheDocument()
      })

      // Step 3: Click payment button
      const payButton = screen.getByRole('button', { name: /pay with credit card/i })
      await user.click(payButton)

      // Wait for processing
      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeInTheDocument()
      })

      // Should show confirmation
      await waitFor(() => {
        expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Step 3 is inaccessible without completing steps 1-2', () => {
    it('step 3 cannot be reached without selecting a cruise first', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      // Step 1: Login successfully
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'user123')
      await user.type(passwordInput, '123456')

      const form = emailInput.closest('form')!
      fireEvent.submit(form)

      // Advance to step 2
      await waitFor(() => {
        expect(screen.getByText(/select your cruise/i)).toBeInTheDocument()
      })

      // Try to click Next without selecting a cruise — button should be disabled
      const nextButton = screen.getByRole('button', { name: /next/i })
      expect(nextButton).toBeDisabled()
    })

    it('step 3 cannot be reached without login', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      // Try to type email but NOT submit valid credentials
      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'user123')
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'wrongpassword')

      const form = emailInput.closest('form')!
      fireEvent.submit(form)

      // Should show error and NOT advance
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      expect(screen.queryByText(/select your cruise/i)).not.toBeInTheDocument()
    })
  })

  describe('Back navigation from step 2 to step 1', () => {
    it('navigates back from step 2 to step 1', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      // Step 1: Login
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'user123')
      await user.type(passwordInput, '123456')

      const form = emailInput.closest('form')!
      fireEvent.submit(form)

      // Advance to step 2
      await waitFor(() => {
        expect(screen.getByText(/select your cruise/i)).toBeInTheDocument()
      })

      // Go back to step 1
      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)

      // Should be back at login step
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })
    })

    it('shows email input when navigating back from step 2 to step 1', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      // Step 1: Login with email
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'user123')
      await user.type(passwordInput, '123456')

      const form = emailInput.closest('form')!
      fireEvent.submit(form)

      // Advance to step 2
      await waitFor(() => {
        expect(screen.getByText(/select your cruise/i)).toBeInTheDocument()
      })

      // Go back to step 1
      const backButton = screen.getByRole('button', { name: /back/i })
      await user.click(backButton)

      // Email input is present (form state resets on back navigation — LoginForm local state)
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      })
    })
  })

  describe('Guest count in flow', () => {
    it('advances to step 3 with default guest count of 1', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      // Login
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'user123')
      await user.type(passwordInput, '123456')

      const form = emailInput.closest('form')!
      fireEvent.submit(form)

      // Advance to step 2
      await waitFor(() => {
        expect(screen.getByText(/select your cruise/i)).toBeInTheDocument()
      })

      // Select cruise
      const selectButtons = screen.getAllByRole('button', { name: /select/i })
      await user.click(selectButtons[0])

      // Advance to step 3
      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      // Step 3 should show guest count of 1 in the payment summary
      await waitFor(() => {
        expect(screen.getByText(/guests/i)).toBeInTheDocument()
      })
      // Verify guest count shows as 1 in the large display
      const guestCountDisplays = screen.getAllByText('1')
      expect(guestCountDisplays.length).toBeGreaterThan(0)
    })

    it('can increment guest count before advancing', async () => {
      const user = userEvent.setup()
      renderWithProviders(<BookingPageClient />)

      // Login
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'user123')
      await user.type(passwordInput, '123456')

      const form = emailInput.closest('form')!
      fireEvent.submit(form)

      // Advance to step 2
      await waitFor(() => {
        expect(screen.getByText(/select your cruise/i)).toBeInTheDocument()
      })

      // Increment guest count
      const addGuestButton = screen.getByRole('button', { name: /add guest/i })
      await user.click(addGuestButton)
      await user.click(addGuestButton)

      // Select cruise and advance
      const selectButtons = screen.getAllByRole('button', { name: /select/i })
      await user.click(selectButtons[0])

      const nextButton = screen.getByRole('button', { name: /next/i })
      await user.click(nextButton)

      // Step 3 should show guest count of 3 in the payment summary
      await waitFor(() => {
        expect(screen.getByText(/guests/i)).toBeInTheDocument()
      })
      // Use getAllByText to find specific guest count display (large number in GuestSelector + summary)
      const guestCountDisplays = screen.getAllByText('3')
      expect(guestCountDisplays.length).toBeGreaterThan(0)
    })
  })
})
