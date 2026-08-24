import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockReservationFindMany = vi.fn()
const mockReservationUpdateMany = vi.fn()
const mockUserFindUnique = vi.fn()
const mockAuditLogCreate = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: { findMany: mockReservationFindMany, updateMany: mockReservationUpdateMany },
    user: { findUnique: mockUserFindUnique },
    auditLog: { create: mockAuditLogCreate },
  },
}))

const mockSendExpiryEmail = vi.fn(() => Promise.resolve())
vi.mock('@/lib/email', () => ({
  sendExpiryEmail: mockSendExpiryEmail,
}))

const mockRevalidateTag = vi.fn()
vi.mock('next/cache', () => ({ revalidateTag: mockRevalidateTag }))

const { GET } = await import('@/app/api/cron/expire-holds/route')

function authRequest(secret?: string): NextRequest {
  return new NextRequest('http://localhost/api/cron/expire-holds', {
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  })
}

describe('GET /api/cron/expire-holds', () => {
  const originalSecret = process.env.CRON_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = 'test-secret'
    mockAuditLogCreate.mockResolvedValue(undefined)
    mockSendExpiryEmail.mockResolvedValue(undefined)
  })

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret
  })

  it('returns 401 without a valid cron secret', async () => {
    const response = await GET(authRequest('wrong-secret'))

    expect(response.status).toBe(401)
    expect(mockReservationFindMany).not.toHaveBeenCalled()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('returns expired 0 and does not revalidate when there are no expired holds', async () => {
    mockReservationFindMany.mockResolvedValue([])

    const response = await GET(authRequest('test-secret'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ expired: 0 })
    expect(mockReservationUpdateMany).not.toHaveBeenCalled()
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })

  it('expires holds and invalidates the calendar cache', async () => {
    mockReservationFindMany.mockResolvedValue([
      { id: 'res-1', userId: 'user-1' },
      { id: 'res-2', userId: 'user-2' },
    ])
    mockReservationUpdateMany.mockResolvedValue({ count: 2 })
    mockUserFindUnique.mockResolvedValue({ email: 'guest@example.com' })

    const response = await GET(authRequest('test-secret'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ expired: 2 })
    expect(mockRevalidateTag).toHaveBeenCalledWith('cruises-calendar', 'default')
  })

  it('does not revalidate when no rows were actually updated', async () => {
    mockReservationFindMany.mockResolvedValue([{ id: 'res-1', userId: 'user-1' }])
    mockReservationUpdateMany.mockResolvedValue({ count: 0 })

    const response = await GET(authRequest('test-secret'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ expired: 0 })
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })
})
