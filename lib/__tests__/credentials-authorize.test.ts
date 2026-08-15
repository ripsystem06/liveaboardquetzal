import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Test the REAL Credentials authorize (the OTP verifier) in auth.config.ts.
// The global vitest-setup mocks @/lib/auth.config, so unmock it here and mock
// next-auth + providers + adapter + prisma + otp + rate-limit instead.
// ---------------------------------------------------------------------------
vi.unmock('@/lib/auth.config')

const h = vi.hoisted(() => ({
  capture: { config: null as { credentials: Record<string, unknown>; authorize: Function } | null },
  mockVerifyOtpCode: vi.fn(),
  mockUserFindUnique: vi.fn(),
  mockUserCreate: vi.fn(),
  mockAuditCreate: vi.fn(),
  mockCheckRateLimit: vi.fn(),
  mockGetClientIP: vi.fn(),
}))

vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}))

vi.mock('next-auth/providers/google', () => ({
  default: { id: 'google', type: 'oidc', name: 'Google' },
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn((config: { credentials: Record<string, unknown>; authorize: Function }) => {
    h.capture.config = config
    return { id: 'credentials', ...config }
  }),
}))

vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({})),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: h.mockUserFindUnique,
      create: h.mockUserCreate,
    },
    auditLog: {
      create: h.mockAuditCreate,
    },
  },
}))

vi.mock('@/lib/otp', () => ({
  verifyOtpCode: h.mockVerifyOtpCode,
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: h.mockCheckRateLimit,
  getClientIP: h.mockGetClientIP,
}))

// Import the real auth.config (dependencies mocked above).
const { auth } = await import('@/lib/auth.config')

const authorize = () => {
  const config = h.capture.config
  if (!config) throw new Error('Credentials provider config was not captured')
  return config.authorize
}

const creds = (overrides: Record<string, string> = {}) => ({
  email: 'demo@quetzal.com',
  otp: '123456',
  ...overrides,
})

describe('Credentials provider OTP authorize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.mockCheckRateLimit.mockReturnValue({ allowed: true })
    h.mockGetClientIP.mockReturnValue('1.2.3.4')
    h.mockAuditCreate.mockResolvedValue({})
  })

  it('exposes { email, otp, name, twoFactorCode } credentials (no password)', () => {
    const config = h.capture.config!
    expect(Object.keys(config.credentials)).toEqual(['email', 'otp', 'name', 'twoFactorCode'])
    expect(config.credentials).not.toHaveProperty('password')
  })

  it('returns { id, name, email } for a valid OTP (existing user)', async () => {
    h.mockVerifyOtpCode.mockResolvedValue({ ok: true })
    h.mockUserFindUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@quetzal.com',
    })

    const result = await authorize()(creds(), {})

    expect(result).toEqual({ id: 'user-1', name: 'Demo User', email: 'demo@quetzal.com' })
    expect(h.mockVerifyOtpCode).toHaveBeenCalledWith('demo@quetzal.com', '123456')
  })

  it('returns null for a wrong code and logs auth.otp_failed', async () => {
    h.mockVerifyOtpCode.mockResolvedValue({ ok: false, reason: 'invalid' })

    const result = await authorize()(creds(), {})

    expect(result).toBeNull()
    expect(h.mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'auth.otp_failed', entityId: 'demo@quetzal.com' }),
    })
  })

  it('returns null for an expired code', async () => {
    h.mockVerifyOtpCode.mockResolvedValue({ ok: false, reason: 'expired' })
    expect(await authorize()(creds(), {})).toBeNull()
  })

  it('returns null for a reused code', async () => {
    h.mockVerifyOtpCode.mockResolvedValue({ ok: false, reason: 'reused' })
    expect(await authorize()(creds(), {})).toBeNull()
  })

  it('returns null for a locked code and logs auth.otp_locked_out', async () => {
    h.mockVerifyOtpCode.mockResolvedValue({ ok: false, reason: 'locked' })
    expect(await authorize()(creds(), {})).toBeNull()
    expect(h.mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'auth.otp_locked_out' }),
    })
  })

  it('returns null when rate-limited', async () => {
    h.mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfter: 60 })
    expect(await authorize()(creds(), {})).toBeNull()
    expect(h.mockVerifyOtpCode).not.toHaveBeenCalled()
  })

  it('creates a user on first login with a name fallback derived from email', async () => {
    h.mockVerifyOtpCode.mockResolvedValue({ ok: true })
    h.mockUserFindUnique.mockResolvedValue(null)
    h.mockUserCreate.mockResolvedValue({
      id: 'user-new',
      name: 'demo',
      email: 'demo@quetzal.com',
    })

    const result = await authorize()(creds({ name: '' }), {})

    expect(h.mockUserCreate).toHaveBeenCalledWith({
      data: { email: 'demo@quetzal.com', name: 'demo', phone: '' },
    })
    expect(result).toEqual({ id: 'user-new', name: 'demo', email: 'demo@quetzal.com' })
    expect(h.mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'user.registered', entityId: 'user-new' }),
    })
  })

  it('uses the supplied name when creating a new user', async () => {
    h.mockVerifyOtpCode.mockResolvedValue({ ok: true })
    h.mockUserFindUnique.mockResolvedValue(null)
    h.mockUserCreate.mockResolvedValue({
      id: 'user-new',
      name: 'Jane Doe',
      email: 'jane@example.com',
    })

    await authorize()(creds({ email: 'jane@example.com', name: 'Jane Doe' }), {})

    expect(h.mockUserCreate).toHaveBeenCalledWith({
      data: { email: 'jane@example.com', name: 'Jane Doe', phone: '' },
    })
  })

  it('links to an existing account without creating a duplicate', async () => {
    h.mockVerifyOtpCode.mockResolvedValue({ ok: true })
    h.mockUserFindUnique.mockResolvedValue({
      id: 'user-1',
      name: 'Existing',
      email: 'demo@quetzal.com',
    })

    await authorize()(creds(), {})

    expect(h.mockUserCreate).not.toHaveBeenCalled()
    expect(h.mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'auth.otp_consumed' }),
    })
  })

  it('returns null when email or otp is missing', async () => {
    expect(await authorize()({ email: '', otp: '' }, {})).toBeNull()
    expect(h.mockVerifyOtpCode).not.toHaveBeenCalled()
  })

  it('returns null and logs auth.otp_2fa_missing when an admin omits the second factor', async () => {
    h.mockVerifyOtpCode.mockResolvedValue({ ok: true })
    h.mockUserFindUnique.mockResolvedValue({
      id: 'admin-1',
      name: 'Admin',
      email: 'admin@quetzal.com',
      isAdmin: true,
      secondaryEmail: 'recovery@quetzal.com',
    })

    const result = await authorize()(creds({ email: 'admin@quetzal.com' }), {})

    expect(result).toBeNull()
    expect(h.mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'auth.otp_2fa_missing' }),
    })
  })

  it('returns the user when an admin provides a valid second factor', async () => {
    h.mockVerifyOtpCode
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true })
    h.mockUserFindUnique.mockResolvedValue({
      id: 'admin-1',
      name: 'Admin',
      email: 'admin@quetzal.com',
      isAdmin: true,
      secondaryEmail: 'recovery@quetzal.com',
    })

    const result = await authorize()(creds({ email: 'admin@quetzal.com', twoFactorCode: '654321' }), {})

    expect(result).toEqual({ id: 'admin-1', name: 'Admin', email: 'admin@quetzal.com' })
    expect(h.mockVerifyOtpCode).toHaveBeenNthCalledWith(1, 'admin@quetzal.com', '123456')
    expect(h.mockVerifyOtpCode).toHaveBeenNthCalledWith(2, 'recovery@quetzal.com', '654321')
  })

  it('returns null and logs auth.otp_2fa_failed for a wrong second factor', async () => {
    h.mockVerifyOtpCode
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: false, reason: 'invalid' })
    h.mockUserFindUnique.mockResolvedValue({
      id: 'admin-1',
      name: 'Admin',
      email: 'admin@quetzal.com',
      isAdmin: true,
      secondaryEmail: 'recovery@quetzal.com',
    })

    const result = await authorize()(creds({ email: 'admin@quetzal.com', twoFactorCode: '000000' }), {})

    expect(result).toBeNull()
    expect(h.mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'auth.otp_2fa_failed' }),
    })
  })
})

describe('auth.config.ts exports', () => {
  it('exports a function auth', () => {
    expect(typeof auth).toBe('function')
  })
})
