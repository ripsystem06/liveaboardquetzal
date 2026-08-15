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

// next-auth/react is mocked globally via vitest-setup.ts.
const { signIn: mockSignIn } = await import('next-auth/react')

type UseUserMock = ReturnType<typeof useUser>

function mockUseUser(overrides: Partial<UseUserMock> = {}) {
  vi.mocked(useUser).mockReturnValue({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    sessionReady: true,
    requestOtp: vi.fn(),
    verifyOtp: vi.fn(),
    verifyTwoFactor: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    ...overrides,
  } as UseUserMock)
}

describe('LoginForm', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email input and a "Send Code" button on step 1', () => {
    mockUseUser()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument()
  })

  it('requests a code and advances to the code step', async () => {
    const requestOtp = vi.fn().mockResolvedValue(undefined)
    mockUseUser({ requestOtp })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    await user.type(screen.getByLabelText(/email/i), 'demo@quetzal.com')
    await user.click(screen.getByRole('button', { name: /send code/i }))

    await waitFor(() => {
      expect(requestOtp).toHaveBeenCalledWith('demo@quetzal.com')
    })
    expect(screen.getByLabelText(/code/i)).toBeInTheDocument()
  })

  it('verifies a code and dispatches LOGIN_COMPLETED on success', async () => {
    const requestOtp = vi.fn().mockResolvedValue(undefined)
    const verifyOtp = vi.fn().mockResolvedValue({ kind: 'success' })
    mockUseUser({ requestOtp, verifyOtp })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    await user.type(screen.getByLabelText(/email/i), 'demo@quetzal.com')
    await user.click(screen.getByRole('button', { name: /send code/i }))
    await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument())

    await user.type(screen.getByLabelText(/code/i), '123456')
    await user.click(screen.getByRole('button', { name: /verify/i }))

    expect(verifyOtp).toHaveBeenCalledWith('demo@quetzal.com', '123456', undefined)
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN_COMPLETED' })
  })

  it('passes the optional name to verifyOtp when provided', async () => {
    const requestOtp = vi.fn().mockResolvedValue(undefined)
    const verifyOtp = vi.fn().mockResolvedValue({ kind: 'success' })
    mockUseUser({ requestOtp, verifyOtp })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.click(screen.getByRole('button', { name: /send code/i }))
    await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument())

    await user.type(screen.getByLabelText(/code/i), '123456')
    await user.type(screen.getByLabelText(/full name/i), 'Jane Doe')
    await user.click(screen.getByRole('button', { name: /verify/i }))

    expect(verifyOtp).toHaveBeenCalledWith('jane@example.com', '123456', 'Jane Doe')
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN_COMPLETED' })
  })

  it('shows an error and does not dispatch on an invalid code', async () => {
    const requestOtp = vi.fn().mockResolvedValue(undefined)
    const verifyOtp = vi.fn().mockResolvedValue({ kind: 'error' })
    mockUseUser({ requestOtp, verifyOtp })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    await user.type(screen.getByLabelText(/email/i), 'demo@quetzal.com')
    await user.click(screen.getByRole('button', { name: /send code/i }))
    await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument())

    await user.type(screen.getByLabelText(/code/i), '000000')
    await user.click(screen.getByRole('button', { name: /verify/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired code/i)).toBeInTheDocument()
    })
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'LOGIN_COMPLETED' })
  })

  it('advances to the two-factor step and completes on a valid second code', async () => {
    const requestOtp = vi.fn().mockResolvedValue(undefined)
    const verifyOtp = vi.fn().mockResolvedValue({ kind: 'twoFactorRequired', maskedEmail: 'r***@quetzal.com' })
    const verifyTwoFactor = vi.fn().mockResolvedValue(true)
    mockUseUser({ requestOtp, verifyOtp, verifyTwoFactor })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    await user.type(screen.getByLabelText(/email/i), 'admin@quetzal.com')
    await user.click(screen.getByRole('button', { name: /send code/i }))
    await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument())

    await user.type(screen.getByLabelText(/code/i), '123456')
    await user.click(screen.getByRole('button', { name: /verify/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/second code/i)).toBeInTheDocument()
    })
    expect(screen.getByText('r***@quetzal.com')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/second code/i), '654321')
    await user.click(screen.getByRole('button', { name: /verify/i }))

    expect(verifyTwoFactor).toHaveBeenCalledWith('admin@quetzal.com', '123456', '654321', undefined)
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN_COMPLETED' })
  })

  it('shows an error when the email is empty', async () => {
    mockUseUser()
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    await user.click(screen.getByRole('button', { name: /send code/i }))

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('returns to the email step when "Change email" is clicked', async () => {
    const requestOtp = vi.fn().mockResolvedValue(undefined)
    mockUseUser({ requestOtp })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    await user.type(screen.getByLabelText(/email/i), 'demo@quetzal.com')
    await user.click(screen.getByRole('button', { name: /send code/i }))
    await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /change email/i }))

    expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument()
  })

  it('resends the code without losing the email', async () => {
    const requestOtp = vi.fn().mockResolvedValue(undefined)
    mockUseUser({ requestOtp })
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    await user.type(screen.getByLabelText(/email/i), 'demo@quetzal.com')
    await user.click(screen.getByRole('button', { name: /send code/i }))
    await waitFor(() => expect(screen.getByLabelText(/code/i)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /resend code/i }))

    expect(requestOtp).toHaveBeenCalledTimes(2)
    expect(requestOtp).toHaveBeenLastCalledWith('demo@quetzal.com')
  })
})

describe('Google OAuth button', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseUser()
  })

  it('renders a "Sign in with Google" button', () => {
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
  })

  it('calls signIn("google") with callbackUrl when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginForm dispatch={mockDispatch} />)

    const googleButton = screen.getByRole('button', { name: /google/i })
    await user.click(googleButton)

    expect(mockSignIn).toHaveBeenCalledWith('google', expect.objectContaining({
      callbackUrl: expect.stringContaining('/booking'),
    }))
  })
})
