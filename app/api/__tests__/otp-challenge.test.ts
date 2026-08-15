import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const mockValidateOtpCode = vi.fn()
const mockIssueOtpCode = vi.fn()
vi.mock('@/lib/otp', () => ({
  validateOtpCode: mockValidateOtpCode,
  issueOtpCode: mockIssueOtpCode,
}))

const mockSendOtpEmail = vi.fn()
vi.mock('@/lib/email', () => ({
  sendOtpEmail: mockSendOtpEmail,
}))

const mockUserFindUnique = vi.fn()
const mockAuditCreate = vi.fn()
vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
    auditLog: { create: mockAuditCreate },
  },
}))

const mockCheckRateLimit = vi.fn()
const mockGetClientIP = vi.fn()
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mockCheckRateLimit,
  getClientIP: mockGetClientIP,
}))

const { POST } = await import('@/app/api/auth/otp/challenge/route')

function makeRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
    json: async () => body,
  } as unknown as NextRequest
}

const sameOrigin = { origin: 'https://quetzal.com', host: 'quetzal.com' }

describe('POST /api/auth/otp/challenge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateOtpCode.mockResolvedValue({ ok: true })
    mockIssueOtpCode.mockResolvedValue('123456')
    mockSendOtpEmail.mockResolvedValue(undefined)
    mockAuditCreate.mockResolvedValue({})
    mockCheckRateLimit.mockReturnValue({ allowed: true })
    mockGetClientIP.mockReturnValue('1.2.3.4')
  })

  it('returns { twoFactorRequired: false } for a non-admin valid code', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'u1', email: 'demo@quetzal.com', isAdmin: false })

    const res = await POST(makeRequest({ email: 'demo@quetzal.com', otp: '123456' }, sameOrigin))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ twoFactorRequired: false })
    expect(mockIssueOtpCode).not.toHaveBeenCalled()
  })

  it('returns { twoFactorRequired: true, maskedEmail } and issues a second factor for an admin', async () => {
    mockUserFindUnique.mockResolvedValue({
      id: 'a1',
      email: 'admin@quetzal.com',
      isAdmin: true,
      secondaryEmail: 'recovery@quetzal.com',
    })

    const res = await POST(makeRequest({ email: 'admin@quetzal.com', otp: '123456' }, sameOrigin))

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ twoFactorRequired: true, maskedEmail: 'r***@quetzal.com' })
    expect(mockIssueOtpCode).toHaveBeenCalledWith('recovery@quetzal.com')
    expect(mockSendOtpEmail).toHaveBeenCalledWith('recovery@quetzal.com', '123456')
    expect(mockAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'auth.otp_2fa_requested' }),
    })
  })

  it('returns 401 with { twoFactorRequired: false } for an invalid code', async () => {
    mockValidateOtpCode.mockResolvedValue({ ok: false, reason: 'invalid' })

    const res = await POST(makeRequest({ email: 'demo@quetzal.com', otp: '000000' }, sameOrigin))

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ twoFactorRequired: false })
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })

  it('returns 400 for a malformed body', async () => {
    const res = await POST(makeRequest({ email: '' }, sameOrigin))

    expect(res.status).toBe(400)
    expect(mockCheckRateLimit).not.toHaveBeenCalled()
  })

  it('returns 429 when the rate limit is exceeded', async () => {
    mockCheckRateLimit.mockReturnValue({ allowed: false, retryAfter: 60 })

    const res = await POST(makeRequest({ email: 'demo@quetzal.com', otp: '123456' }, sameOrigin))

    expect(res.status).toBe(429)
    expect(mockValidateOtpCode).not.toHaveBeenCalled()
  })

  it('returns 403 when origin and host mismatch (CSRF)', async () => {
    const res = await POST(
      makeRequest({ email: 'demo@quetzal.com', otp: '123456' }, { origin: 'https://evil.com', host: 'quetzal.com' }),
    )

    expect(res.status).toBe(403)
  })
})
