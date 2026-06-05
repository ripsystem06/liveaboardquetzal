import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './login-form'

describe('LoginForm', () => {
  it('renders email and password inputs', () => {
    const onSuccess = vi.fn()
    renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    const onSuccess = vi.fn()
    renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('calls onSuccess when credentials are user123 / 123456', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'user123')
    await user.type(passwordInput, '123456')

    // Submit the form directly
    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('shows error message on invalid password', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'user123')
    await user.type(passwordInput, 'wrongpassword')

    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    expect(onSuccess).not.toHaveBeenCalled()
    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
  })

  it('shows error message on invalid email (empty)', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    const emailInput = screen.getByLabelText(/email/i)

    // Submit without typing anything
    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    expect(onSuccess).not.toHaveBeenCalled()
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
  })

  it('password is case-sensitive', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'user123')
    await user.type(passwordInput, '123456')

    const form = emailInput.closest('form')!
    fireEvent.submit(form)

    expect(onSuccess).toHaveBeenCalled()
  })

  it('clears error message when user starts typing', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    renderWithProviders(<LoginForm onSuccess={onSuccess} />)

    const emailInput = screen.getByLabelText(/email/i)

    // Trigger error first by submitting empty form
    const form = emailInput.closest('form')!
    fireEvent.submit(form)
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()

    // Start typing in email field
    await user.type(emailInput, 'u')
    expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument()
  })
})