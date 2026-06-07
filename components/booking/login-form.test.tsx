import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './login-form'
import { useUser } from '@/contexts/user-context'
import type { BookingAction } from './booking-page-client'

// Mock useUser with proper UserProvider export
vi.mock('@/contexts/user-context', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('@/contexts/user-context')
  return {
    ...actual,
    useUser: vi.fn(),
  }
})

describe('LoginForm', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email and password inputs', () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    })
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    })
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('calls login with valid credentials and dispatches LOGIN_COMPLETED on success', async () => {
    const loginMock = vi.fn().mockResolvedValue(true)
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: loginMock,
      logout: vi.fn(),
      updateProfile: vi.fn(),
    })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'demo@quetzal.com')
    await user.type(passwordInput, '123456')

    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(loginMock).toHaveBeenCalledWith('demo@quetzal.com', '123456')
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN_COMPLETED' })
  })

  it('shows error message on invalid password', async () => {
    const loginMock = vi.fn().mockResolvedValue(false)
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: loginMock,
      logout: vi.fn(),
      updateProfile: vi.fn(),
    })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'demo@quetzal.com')
    await user.type(passwordInput, 'wrongpassword')

    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(loginMock).toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'LOGIN_COMPLETED' })
  })

  it('shows error message on invalid email (empty)', async () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('shows error message on invalid email (non-empty)', async () => {
    const loginMock = vi.fn().mockResolvedValue(false)
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: loginMock,
      logout: vi.fn(),
      updateProfile: vi.fn(),
    })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'wrong@test.com')
    await user.type(passwordInput, '123456')

    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('clears error message when user starts typing', async () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
    })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    const emailInput = screen.getByLabelText(/email/i)

    // Trigger error first by clicking login without typing
    await user.click(screen.getByRole('button', { name: /login/i }))
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })

    // Start typing in email field
    await user.type(emailInput, 'u')
    expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument()
  })
})