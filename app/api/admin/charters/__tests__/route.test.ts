import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Prisma mocks ---------------------------------------------------------
const mockFindMany = vi.fn()
const mockCreate = vi.fn()
const mockTransaction = vi.fn()
const mockExecuteRaw = vi.fn()
const mockAuditLogCreate = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: { findMany: mockFindMany, create: mockCreate },
    auditLog: { create: mockAuditLogCreate },
    $transaction: mockTransaction,
  },
}))

vi.mock('@/lib/admin-auth', () => ({ requireAdmin: vi.fn() }))
vi.mock('@/lib/auth', () => ({
  AuthError: class AuthError extends Error {
    constructor(m: string) {
      super(m)
      this.name = 'AuthError'
    }
  },
  ForbiddenError: class ForbiddenError extends Error {
    constructor(m: string) {
      super(m)
      this.name = 'ForbiddenError'
    }
  },
}))

const mockRevalidateTag = vi.fn()
vi.mock('next/cache', () => ({ revalidateTag: mockRevalidateTag }))

const { POST } = await import('@/app/api/admin/charters/route')

const admin = { email: 'admin@quetzal.com', userId: 'admin-1', name: 'Admin' }

const validCharter = {
  cruiseId: 'cruise-1',
  cruiseName: 'Socorro Expedition',
  departureDate: '2026-08-15',
  route: 'Cabo → Socorro',
  charterType: 'medio',
  guestCount: 4,
}

function charterRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/charters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/admin/charters', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockResolvedValue(admin)
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        $executeRaw: mockExecuteRaw,
        reservation: { findMany: mockFindMany, create: mockCreate },
      }
      return cb(tx)
    })
    mockFindMany.mockResolvedValue([])
    mockCreate.mockResolvedValue({ id: 'charter-1', ...validCharter, charterType: 'medio' })
    mockAuditLogCreate.mockResolvedValue({ id: 'audit-1' })
  })

  it('registers a medio charter and invalidates the calendar cache', async () => {
    const response = await POST(charterRequest(validCharter))

    expect(response.status).toBe(201)
    expect(mockExecuteRaw).toHaveBeenCalled()
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          departureDate: '2026-08-15',
          status: { notIn: ['expired', 'cancelled'] },
        }),
      })
    )
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        charterType: 'medio',
        guestCount: 4,
        tierPrice: 0,
        totalAmount: 0,
        status: 'confirmed',
      }),
    })
    expect(mockRevalidateTag).toHaveBeenCalledWith('cruises-calendar', 'default')
  })

  it('registers a full charter (closes 18 spots)', async () => {
    mockCreate.mockResolvedValue({ id: 'charter-2', ...validCharter, charterType: 'full' })

    const response = await POST(charterRequest({ ...validCharter, charterType: 'full', guestCount: 18 }))

    expect(response.status).toBe(201)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ charterType: 'full', guestCount: 18 }),
    })
  })

  it('rejects a "none" charterType at validation', async () => {
    const response = await POST(charterRequest({ ...validCharter, charterType: 'none' }))

    expect(response.status).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects over-capacity registration (12 occupied + medio 9 > 18)', async () => {
    mockFindMany.mockResolvedValue([
      { guestCount: 6, charterType: 'none' },
      { guestCount: 6, charterType: 'none' },
    ])

    const response = await POST(charterRequest(validCharter))

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('CHARTER_OVER_CAPACITY')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects any charter after a full charter already closed the date (collision)', async () => {
    mockFindMany.mockResolvedValue([{ guestCount: 18, charterType: 'full' }])

    const response = await POST(charterRequest(validCharter))

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('CHARTER_OVER_CAPACITY')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('accepts a medio charter that exactly fills the vessel (9 occupied + medio 9 = 18)', async () => {
    mockFindMany.mockResolvedValue([{ guestCount: 9, charterType: 'none' }])

    const response = await POST(charterRequest(validCharter))

    expect(response.status).toBe(201)
  })

  it('rejects a full charter over a medio charter (9 + 18 > 18)', async () => {
    mockFindMany.mockResolvedValue([{ guestCount: 4, charterType: 'medio' }])

    const response = await POST(charterRequest({ ...validCharter, charterType: 'full' }))

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('CHARTER_OVER_CAPACITY')
  })

  it('returns 403 when the caller is not admin', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    const { ForbiddenError } = await import('@/lib/auth')
    vi.mocked(requireAdmin).mockRejectedValue(new ForbiddenError('Admin access required'))

    const response = await POST(charterRequest(validCharter))

    expect(response.status).toBe(403)
  })

  it('returns 401 for unauthenticated charter registration', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    const { AuthError } = await import('@/lib/auth')
    vi.mocked(requireAdmin).mockRejectedValue(new AuthError('Authentication required'))

    const response = await POST(charterRequest(validCharter))

    expect(response.status).toBe(401)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('audits charter registration with bounded metadata', async () => {
    const response = await POST(charterRequest(validCharter))

    expect(response.status).toBe(201)
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        action: 'charter.registered',
        entityType: 'reservation',
        entityId: 'charter-1',
        actorId: 'admin-1',
        actorEmail: 'admin@quetzal.com',
        details: JSON.stringify({
          charterType: 'medio',
          departureDate: '2026-08-15',
          guestCount: 4,
        }),
      },
    })
  })
})
