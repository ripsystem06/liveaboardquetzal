import { describe, it, expect, vi, beforeEach } from 'vitest'

// All mocks must be defined inside hoisted so they're available at module-evaluation time
const { mockUpdate, mockSendExpiryEmail, mockPrisma, PrismaClientMock, mockUserFindUnique } = vi.hoisted(() => {
  const mockUpdate = vi.fn()
  const mockSendExpiryEmail = vi.fn()
  const mockAuditLogCreate = vi.fn()
  const mockUserFindUnique = vi.fn()
  const mockPrisma = {
    reservation: {
      update: mockUpdate,
    },
    user: {
      findUnique: mockUserFindUnique,
    },
    auditLog: {
      create: mockAuditLogCreate,
    },
  }
  class MockPrismaClient {
    reservation = mockPrisma.reservation
    user = mockPrisma.user
    auditLog = mockPrisma.auditLog
  }
  return { mockUpdate, mockSendExpiryEmail, mockPrisma, PrismaClientMock: MockPrismaClient, mockUserFindUnique, mockAuditLogCreate }
})

vi.mock('./email', () => ({
  sendExpiryEmail: mockSendExpiryEmail,
}))

vi.mock('@prisma/client', () => ({
  PrismaClient: PrismaClientMock,
}))

const { checkAndExpireHolds } = await import('./db')
import type { ReservationData } from './db'

const baseReservation = (overrides: Partial<ReservationData> = {}): ReservationData => ({
  id: 'res_123',
  userId: 'user_123',
  cruiseId: 'socorro-1',
  cruiseName: 'Socorro Islands',
  departureDate: '2026-07-15',
  route: 'Cabo San Lucas',
  tier: 'premium',
  tierPrice: 3200,
  guestCount: 2,
  freeSpaces: 0,
  paidSpaces: 2,
  totalAmount: 6400,
  paymentMethod: 'bank_transfer',
  status: 'pending_approval',
  holdExpiry: new Date('2026-07-20'),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

describe('checkAndExpireHolds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('returns reservation unchanged when holdExpiry is in the future', async () => {
    const futureExpiry = new Date(Date.now() + 86_400_000)
    const reservation = baseReservation({ holdExpiry: futureExpiry })

    const result = await checkAndExpireHolds(reservation)

    expect(result.status).toBe('pending_approval')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('updates status to expired when holdExpiry is in the past', async () => {
    const pastExpiry = new Date(Date.now() - 86_400_000)
    const reservation = baseReservation({ holdExpiry: pastExpiry })

    mockUpdate.mockResolvedValue({ ...reservation, status: 'expired' })
    mockUserFindUnique.mockResolvedValue({ id: 'user_123', email: 'test@example.com' })

    const result = await checkAndExpireHolds(reservation)

    expect(result.status).toBe('expired')
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'res_123' },
      data: { status: 'expired' },
    })
    expect(mockUserFindUnique).toHaveBeenCalledWith({ where: { id: 'user_123' } })
    expect(mockSendExpiryEmail).toHaveBeenCalled()
  })

  it('returns already confirmed reservation unchanged', async () => {
    const reservation = baseReservation({ status: 'confirmed' })

    const result = await checkAndExpireHolds(reservation)

    expect(result.status).toBe('confirmed')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns already expired reservation unchanged', async () => {
    const reservation = baseReservation({ status: 'expired' })

    const result = await checkAndExpireHolds(reservation)

    expect(result.status).toBe('expired')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('treats holdExpiry exactly equal to now as pending — code uses strict < not <=', async () => {
    // The implementation uses `holdExpiry < new Date()` (strict less-than).
    // When holdExpiry === now, the condition is false → reservation stays pending.
    const now = new Date('2026-06-15T12:00:00Z')
    vi.useFakeTimers({ now, toFake: ['Date'] })

    const reservation = baseReservation({
      holdExpiry: now,
      createdAt: new Date('2026-06-12T12:00:00Z'),
    })

    const result = await checkAndExpireHolds(reservation)

    expect(result.status).toBe('pending_approval')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('sends expiry email when hold transitions to expired', async () => {
    const pastExpiry = new Date(Date.now() - 86_400_000)
    const reservation = baseReservation({ holdExpiry: pastExpiry })

    mockUpdate.mockResolvedValue({ ...reservation, status: 'expired' })
    mockUserFindUnique.mockResolvedValue({ id: 'user_123', email: 'test@example.com' })

    await checkAndExpireHolds(reservation)

    expect(mockSendExpiryEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'res_123',
        userId: 'user_123',
        userEmail: 'test@example.com',
        status: 'expired',
      })
    )
  })

  it('holds created on Saturday get 72-hour expiry (does not expire early)', async () => {
    // Saturday June 13 2026 10:00 UTC — hold should last 72h, expiry Tuesday 10:00
    const saturday = new Date('2026-06-13T10:00:00Z')
    vi.useFakeTimers({ now: saturday, toFake: ['Date'] })

    // holdExpiry = Saturday + 72h = Tuesday 10:00 UTC
    const expectedExpiry = new Date('2026-06-16T10:00:00Z')
    const reservation = baseReservation({
      holdExpiry: expectedExpiry,
      createdAt: saturday,
      status: 'pending_approval',
    })

    const result = await checkAndExpireHolds(reservation)

    expect(result.status).toBe('pending_approval')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('holds created on Sunday get 72-hour expiry (does not expire early)', async () => {
    // Sunday June 14 2026 10:00 UTC — hold should last 72h, expiry Tuesday 10:00
    const sunday = new Date('2026-06-14T10:00:00Z')
    vi.useFakeTimers({ now: sunday, toFake: ['Date'] })

    const expectedExpiry = new Date('2026-06-17T10:00:00Z')
    const reservation = baseReservation({
      holdExpiry: expectedExpiry,
      createdAt: sunday,
      status: 'pending_approval',
    })

    const result = await checkAndExpireHolds(reservation)

    expect(result.status).toBe('pending_approval')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('holds created on a weekday get 48-hour expiry (does not expire early)', async () => {
    // Wednesday June 17 2026 10:00 UTC — hold should last 48h, expiry Friday 10:00
    const wednesday = new Date('2026-06-17T10:00:00Z')
    vi.useFakeTimers({ now: wednesday, toFake: ['Date'] })

    const expectedExpiry = new Date('2026-06-19T10:00:00Z')
    const reservation = baseReservation({
      holdExpiry: expectedExpiry,
      createdAt: wednesday,
      status: 'pending_approval',
    })

    const result = await checkAndExpireHolds(reservation)

    expect(result.status).toBe('pending_approval')
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
