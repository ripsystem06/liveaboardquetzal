import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

// Mock prisma (OtpCode + auditLog) before importing the route.
const mockDeleteMany = vi.fn()
const mockCreate = vi.fn()
const mockAuditCreate = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    otpCode: {
      deleteMany: mockDeleteMany,
      create: mockCreate,
    },
    auditLog: {
      create: mockAuditCreate,
    },
  },
}))

const mockSendOtpEmail = vi.fn()
vi.mock('@/lib/email', () => ({
  sendOtpEmail: mockSendOtpEmail,
}))

const mockCheckRateLimit = vi.fn()
const mockGetClientIP = vi.fn()
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mockCheckRateLimit,
  getClientIP: mockGetClientIP,
}))

// Import route handler after mocking (lib/otp runs real issueOtpCode against mocked prisma).
const { POST } = await import('@/app/api/auth/otp/request/route')

function makeRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
    json: async () => body,
  } as unknown as NextRequest
}

const sameOrigin = { origin: 'https://quetzal.com', host: 'quetzal.com' }

describe('POST /api/auth/otp/request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteMany.mockResolvedValue({ count: 0 })
    mockCreate.mockResolvedValue({})
    mockAuditCreate.mockResolvedValue({})
    mockSendOtpEmail.mockResolvedValue(undefined)
    mockCheckRateLimit.mockReturnValue({ allowed: true })
    mockGetClientIP.mockReturnValue('1.2.3.4')
  })

  it('returns 200 {ok:true} for a registered email (no enumeration)', async () => {
    const res = await POST(makeRequest({ email: 'demo@quetzal.com' }, sameOrigin))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('returns an identical 200 {ok:true} for an unknown email (no enumeration)', async () => {
    const res = await POST(makeRequest({ email: 'unknown@example.com' }, sameOrigin))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('persists the code as a hash, delivering only the plaintext via email', async () => {
    const res = await POST(makeRequest({ email: 'demo@quetzal.com' }, sameOrigin))
    expect(res.status).toBe(200)

    expect(mockCreate).toHaveBeenCalledTimes(1)
    const createData = mockCreate.mock.calls[0][0].data
    expect(createData.email).toBe('demo@quetzal.com')

    // The plaintext code is passed to sendOtpEmail; the stored value is a scrypt hash.
    const code = mockSendOtpEmail.mock.calls[0][1]
    expect(code).toMatch(/^\d{6}$/)
    expect(createData.codeHash).not.toBe(code)
    expect(createData.codeHash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/)
    expect(mockSendOtpEmail).toHaveBeenCalledWith('demo@quetzal.com', code)
  })

  it('returns 429 when the per-IP rate limit is exceeded', async () => {
    mockCheckRateLimit.mockReturnValueOnce({ allowed: false, retryAfter: 60 })
    const res = await POST(makeRequest({ email: 'demo@quetzal.com' }, sameOrigin))
    expect(res.status).toBe(429)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 429 when the per-email rate limit is exceeded', async () => {
    // First call (ip) allowed, second call (email) denied.
    mockCheckRateLimit
      .mockReturnValueOnce({ allowed: true })
      .mockReturnValueOnce({ allowed: false, retryAfter: 60 })
    const res = await POST(makeRequest({ email: 'demo@quetzal.com' }, sameOrigin))
    expect(res.status).toBe(429)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 400 for a malformed email', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }, sameOrigin))
    expect(res.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 403 when origin and host mismatch (CSRF)', async () => {
    const res = await POST(
      makeRequest({ email: 'demo@quetzal.com' }, { origin: 'https://evil.com', host: 'quetzal.com' }),
    )
    expect(res.status).toBe(403)
  })
})
