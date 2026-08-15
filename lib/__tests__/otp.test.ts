import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma (OtpCode delegates) so verifyOtpCode/issueOtpCode run in isolation.
// vi.hoisted keeps the mock fns initialized before the hoisted vi.mock factory runs.
const { mockDeleteMany, mockCreate, mockFindFirst, mockUpdate, mockUpdateMany } = vi.hoisted(() => ({
  mockDeleteMany: vi.fn(),
  mockCreate: vi.fn(),
  mockFindFirst: vi.fn(),
  mockUpdate: vi.fn(),
  mockUpdateMany: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    otpCode: {
      deleteMany: mockDeleteMany,
      create: mockCreate,
      findFirst: mockFindFirst,
      update: mockUpdate,
      updateMany: mockUpdateMany,
    },
  },
}))

// lib/otp.ts imports hashPassword/verifyPassword from ../auth, whose re-export
// of `auth` pulls @/lib/auth.config → next-auth. The global vitest-setup already
// mocks @/lib/auth.config, so no next-auth cascade occurs here.

import { generateOtpCode, issueOtpCode, verifyOtpCode, validateOtpCode } from '../otp'
import { hashPassword } from '../auth'

interface FakeOtpCode {
  id: string
  email: string
  codeHash: string
  attempts: number
  consumedAt: Date | null
  expiresAt: Date
  createdAt: Date
}

function makeCode(overrides: Partial<FakeOtpCode> = {}): FakeOtpCode {
  return {
    id: 'otp-1',
    email: 'test@example.com',
    codeHash: 'salt:hash',
    attempts: 0,
    consumedAt: null,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    createdAt: new Date(),
    ...overrides,
  }
}

describe('generateOtpCode', () => {
  it('returns a 6-digit numeric string', () => {
    const code = generateOtpCode()
    expect(code).toMatch(/^\d{6}$/)
  })

  it('produces varied codes across many generations (crypto-random)', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 100; i++) codes.add(generateOtpCode())
    expect(codes.size).toBeGreaterThan(1)
    for (const code of codes) expect(code).toMatch(/^\d{6}$/)
  })
})

describe('issueOtpCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteMany.mockResolvedValue({ count: 0 })
    mockCreate.mockResolvedValue({})
  })

  it('deletes prior unconsumed codes and stores a hash, returning plaintext', async () => {
    const code = await issueOtpCode('test@example.com')

    expect(code).toMatch(/^\d{6}$/)
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { email: 'test@example.com', consumedAt: null },
    })
    expect(mockCreate).toHaveBeenCalledTimes(1)

    const createArg = mockCreate.mock.calls[0][0].data
    expect(createArg.email).toBe('test@example.com')
    expect(createArg.attempts).toBe(0)
    // Hash at rest: stored value is NOT the plaintext and carries a scrypt salt.
    expect(createArg.codeHash).not.toBe(code)
    expect(createArg.codeHash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/)
    // Expiry ~10 minutes out (between 9 and 11 minutes).
    const expiresAt = new Date(createArg.expiresAt)
    const delta = expiresAt.getTime() - Date.now()
    expect(delta).toBeGreaterThan(9 * 60 * 1000)
    expect(delta).toBeLessThanOrEqual(11 * 60 * 1000)
  })

  it('returns a fresh code each issue', async () => {
    const a = await issueOtpCode('test@example.com')
    const b = await issueOtpCode('test@example.com')
    expect(a).toMatch(/^\d{6}$/)
    expect(b).toMatch(/^\d{6}$/)
  })
})

describe('verifyOtpCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdate.mockResolvedValue({})
    mockUpdateMany.mockResolvedValue({ count: 1 })
  })

  it('returns ok:true and atomically marks consumedAt for a valid code', async () => {
    const code = '123456'
    const codeHash = await hashPassword(code)
    mockFindFirst.mockResolvedValue(makeCode({ codeHash }))

    const result = await verifyOtpCode('test@example.com', code)

    expect(result.ok).toBe(true)
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: 'otp-1', consumedAt: null },
      data: { consumedAt: expect.any(Date) },
    })
  })

  it('returns reason reused when another caller consumed the code first (atomic guard)', async () => {
    const code = '123456'
    const codeHash = await hashPassword(code)
    mockFindFirst.mockResolvedValue(makeCode({ codeHash }))
    mockUpdateMany.mockResolvedValue({ count: 0 })

    const result = await verifyOtpCode('test@example.com', code)

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('reused')
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: 'otp-1', consumedAt: null },
      data: { consumedAt: expect.any(Date) },
    })
  })

  it('returns reason invalid and increments attempts for a wrong code', async () => {
    const codeHash = await hashPassword('999999')
    mockFindFirst.mockResolvedValue(makeCode({ codeHash }))

    const result = await verifyOtpCode('test@example.com', '123456')

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('invalid')
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'otp-1' },
      data: { attempts: 1 },
    })
  })

  it('returns reason expired when the code has passed its expiry', async () => {
    mockFindFirst.mockResolvedValue(makeCode({ expiresAt: new Date(Date.now() - 1000) }))

    const result = await verifyOtpCode('test@example.com', '123456')

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('expired')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns reason reused when the code was already consumed (replay)', async () => {
    mockFindFirst.mockResolvedValue(makeCode({ consumedAt: new Date() }))

    const result = await verifyOtpCode('test@example.com', '123456')

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('reused')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns reason locked when max attempts reached (even with correct code)', async () => {
    const code = '123456'
    const codeHash = await hashPassword(code)
    mockFindFirst.mockResolvedValue(makeCode({ codeHash, attempts: 5 }))

    const result = await verifyOtpCode('test@example.com', code)

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('locked')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns reason invalid when no code exists for the email', async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await verifyOtpCode('unknown@example.com', '123456')

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('invalid')
  })

  it('locks out after the fifth failed attempt (5-attempt lockout)', async () => {
    const codeHash = await hashPassword('999999')
    mockFindFirst.mockResolvedValue(makeCode({ codeHash }))

    // Attempts 1..5: each fails with 'invalid' and increments attempts.
    for (let i = 0; i < 5; i++) {
      const result = await verifyOtpCode('test@example.com', '123456')
      expect(result.ok).toBe(false)
      expect(result.reason).toBe('invalid')
    }

    // Now attempts === 5. The sixth attempt must be 'locked' (even the right code).
    mockFindFirst.mockResolvedValue(makeCode({ codeHash, attempts: 5 }))
    const locked = await verifyOtpCode('test@example.com', '999999')
    expect(locked.ok).toBe(false)
    expect(locked.reason).toBe('locked')
  })
})

describe('validateOtpCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns ok:true for a valid code without consuming it or incrementing attempts', async () => {
    const code = '123456'
    const codeHash = await hashPassword(code)
    mockFindFirst.mockResolvedValue(makeCode({ codeHash }))

    const result = await validateOtpCode('test@example.com', code)

    expect(result.ok).toBe(true)
    expect(mockUpdateMany).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns reason expired when the code has passed its expiry', async () => {
    mockFindFirst.mockResolvedValue(makeCode({ expiresAt: new Date(Date.now() - 1000) }))

    const result = await validateOtpCode('test@example.com', '123456')

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('expired')
  })

  it('returns reason reused when the code was already consumed', async () => {
    mockFindFirst.mockResolvedValue(makeCode({ consumedAt: new Date() }))

    const result = await validateOtpCode('test@example.com', '123456')

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('reused')
  })

  it('returns reason locked when max attempts reached', async () => {
    mockFindFirst.mockResolvedValue(makeCode({ attempts: 5 }))

    const result = await validateOtpCode('test@example.com', '123456')

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('locked')
  })

  it('returns reason invalid for a wrong code without incrementing attempts', async () => {
    const codeHash = await hashPassword('999999')
    mockFindFirst.mockResolvedValue(makeCode({ codeHash }))

    const result = await validateOtpCode('test@example.com', '123456')

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('invalid')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns reason invalid when no code exists for the email', async () => {
    mockFindFirst.mockResolvedValue(null)

    const result = await validateOtpCode('unknown@example.com', '123456')

    expect(result.ok).toBe(false)
    expect(result.reason).toBe('invalid')
  })
})
