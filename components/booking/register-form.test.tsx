import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from './register-form'
import { useUser } from '@/contexts/user-context'
import type { BookingAction } from './booking-page-client'

// Mock useUser
vi.mock('@/contexts/user-context', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('@/contexts/user-context')
  return {
    ...actual,
    useUser: vi.fn(),
  }
})

describe('RegisterForm', () => {
  const mockDispatch = vi.fn()

  const mockRegisterFn = vi.fn().mockResolvedValue({
    id: 'user-test',
    name: 'Test User',
    email: 'test@example.com',
    phone: '',
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountRegisterForm = () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      sessionReady: true,
      login: vi.fn(),
      register: mockRegisterFn,
      logout: vi.fn(),
      updateProfile: vi.fn(),
    })
    return renderWithProviders(<RegisterForm dispatch={mockDispatch} />)
  }

  it('renders name, email, password, and confirm password inputs', () => {
    mountRegisterForm()

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/password/i)).toHaveLength(2)
  })

  it('renders a submit button', () => {
    mountRegisterForm()

    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('calls register with valid data and dispatches LOGIN_COMPLETED', async () => {
    const user = userEvent.setup()
    mountRegisterForm()

    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    const passwordInputs = screen.getAllByLabelText(/password/i)
    await user.type(passwordInputs[0], 'password123')
    await user.type(passwordInputs[1], 'password123')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(mockRegisterFn).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123')
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN_COMPLETED' })
  })

  it('shows error when fields are empty', async () => {
    const user = userEvent.setup()
    mountRegisterForm()

    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/fill in all fields/i)).toBeInTheDocument()
    })
  })

  it('shows error when email is invalid', async () => {
    const user = userEvent.setup()
    mountRegisterForm()

    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    const passwordInputs = screen.getAllByLabelText(/password/i)
    await user.type(passwordInputs[0], 'password123')
    await user.type(passwordInputs[1], 'password123')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    // Validation must block invalid email — register and LOGIN_COMPLETED must not fire
    expect(mockRegisterFn).not.toHaveBeenCalled()
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'LOGIN_COMPLETED' })
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()
    mountRegisterForm()

    await user.type(screen.getByLabelText(/full name/i), 'Test User')
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    const passwordInputs = screen.getAllByLabelText(/password/i)
    await user.type(passwordInputs[0], 'password123')
    await user.type(passwordInputs[1], 'different')

    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeInTheDocument()
    })
  })
})
