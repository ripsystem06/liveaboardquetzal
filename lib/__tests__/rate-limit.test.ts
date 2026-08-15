import { describe, it, expect, beforeEach, vi } from 'vitest'

// checkRateLimit is now DB-backed: mock the prisma.rateLimit delegates so the
// window/reset semantics can be tested against deterministic rows.
const { mockFindUnique, mockUpsert, mockUpdate, mockDeleteMany } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockUpsert: vi.fn(),
  mockUpdate: vi.fn(),
  mockDeleteMany: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    rateLimit: {
      findUnique: mockFindUnique,
      upsert: mockUpsert,
      update: mockUpdate,
      deleteMany: mockDeleteMany,
    },
  },
}))

import { checkRateLimit, cleanupExpiredRateLimits } from '../rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpsert.mockResolvedValue({})
    mockUpdate.mockResolvedValue({})
  })

  it('allows the first hit and creates a row with count 1', async () => {
    mockFindUnique.mockResolvedValue(null)

    const result = await checkRateLimit('otp:req:1.1.1.1', 5, 60_000)

    expect(result.allowed).toBe(true)
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { key: 'otp:req:1.1.1.1' },
      create: { key: 'otp:req:1.1.1.1', count: 1, resetAt: expect.any(Date) },
      update: { count: 1, resetAt: expect.any(Date) },
    })
  })

  it('increments the count while under the limit', async () => {
    const resetAt = new Date(Date.now() + 60_000)
    mockFindUnique.mockResolvedValue({ key: 'k', count: 2, resetAt })

    const result = await checkRateLimit('k', 5, 60_000)

    expect(result.allowed).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { key: 'k' },
      data: { count: { increment: 1 } },
    })
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('blocks when count is at the limit and returns retryAfter in seconds', async () => {
    const resetAt = new Date(Date.now() + 30_000)
    mockFindUnique.mockResolvedValue({ key: 'k', count: 5, resetAt })

    const result = await checkRateLimit('k', 5, 60_000)

    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
    expect(result.retryAfter).toBeLessThanOrEqual(30)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('resets the window once it has elapsed', async () => {
    mockFindUnique.mockResolvedValue({ key: 'k', count: 5, resetAt: new Date(Date.now() - 1000) })

    const result = await checkRateLimit('k', 5, 60_000)

    expect(result.allowed).toBe(true)
    expect(mockUpsert).toHaveBeenCalled()
  })
})

describe('cleanupExpiredRateLimits', () => {
  it('deletes rows whose resetAt has passed', async () => {
    mockDeleteMany.mockResolvedValue({ count: 3 })

    await cleanupExpiredRateLimits()

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { resetAt: { lt: expect.any(Date) } },
    })
  })
})
