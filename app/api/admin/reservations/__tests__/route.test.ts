import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Prisma mocks ---------------------------------------------------------
const mockCrewRegFindUnique = vi.fn()
const mockCrewRegDelete = vi.fn()
const mockReservationFindUnique = vi.fn()
const mockReservationUpdate = vi.fn()
const mockPaymentRecordFindUnique = vi.fn()
const mockPaymentRecordCreate = vi.fn()
const mockAuditLogCreate = vi.fn()
const mockUserFindUnique = vi.fn()
const mockTransaction = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    crewRegistration: { findUnique: mockCrewRegFindUnique, delete: mockCrewRegDelete },
    reservation: { findUnique: mockReservationFindUnique, update: mockReservationUpdate },
    paymentRecord: { findUnique: mockPaymentRecordFindUnique, create: mockPaymentRecordCreate },
    auditLog: { create: mockAuditLogCreate },
    user: { findUnique: mockUserFindUnique },
    $transaction: mockTransaction,
  },
}))

// --- Supabase mocks -------------------------------------------------------
const mockRemove = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/lib/supabase', () => ({
  CREW_DOCS_BUCKET: 'crew-docs',
  getSupabaseAdmin: vi.fn().mockReturnValue({ storage: { from: mockFrom } }),
}))

// --- Auth/email mocks (imported by the route module) ----------------------
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
const mockSendCrewInvite = vi.fn()
const mockSendConfirmationEmail = vi.fn()
vi.mock('@/lib/email', () => ({
  sendCrewRegistrationInviteEmail: mockSendCrewInvite,
  sendConfirmationEmail: mockSendConfirmationEmail,
}))

const mockRevalidateTag = vi.fn()
vi.mock('next/cache', () => ({ revalidateTag: mockRevalidateTag }))

const { cleanupCrewRegistration, PATCH } = await import('@/app/api/admin/reservations/[id]/route')

const admin = { email: 'admin@quetzal.com', userId: 'admin-1', name: 'Admin' }
const params = { params: Promise.resolve({ id: 'res-1' }) }

function patchRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/reservations/res-1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function baseReservation(overrides: Record<string, unknown> = {}) {
  return {
    id: 'res-1',
    userId: 'user-1',
    cruiseId: 'cruise-1',
    cruiseName: 'Socorro Expedition',
    departureDate: '2026-08-15',
    route: 'Cabo → Socorro',
    tier: 'standard',
    tierPrice: 3500,
    guestCount: 2,
    freeSpaces: 0,
    paidSpaces: 2,
    totalAmount: 7000,
    paymentMethod: 'wire_transfer',
    charterType: 'none',
    termsVersion: 3,
    termsAcceptedAt: new Date(),
    confirmationEmailSentAt: null,
    status: 'approved',
    holdExpiry: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('cleanupCrewRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ remove: mockRemove })
    mockRemove.mockResolvedValue({ data: null, error: null })
  })

  it('removes storage objects then deletes the registration row', async () => {
    mockCrewRegFindUnique.mockResolvedValue({
      id: 'reg_1',
      reservationId: 'res_1',
      guests: [
        {
          id: 'guest_0',
          documents: [
            { id: 'doc_1', storagePath: 'res_1/guest_0/passport_ine-abc.pdf' },
            { id: 'doc_2', storagePath: 'res_1/guest_0/dive_cert-def.pdf' },
          ],
        },
      ],
    })

    await cleanupCrewRegistration('res_1')

    expect(mockFrom).toHaveBeenCalledWith('crew-docs')
    expect(mockRemove).toHaveBeenCalledWith([
      'res_1/guest_0/passport_ine-abc.pdf',
      'res_1/guest_0/dive_cert-def.pdf',
    ])
    expect(mockCrewRegDelete).toHaveBeenCalledWith({ where: { id: 'reg_1' } })
  })

  it('does nothing when there is no registration', async () => {
    mockCrewRegFindUnique.mockResolvedValue(null)

    await cleanupCrewRegistration('res_1')

    expect(mockFrom).not.toHaveBeenCalled()
    expect(mockCrewRegDelete).not.toHaveBeenCalled()
  })
})

describe('PATCH /api/admin/reservations/[id] — status transitions', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockResolvedValue(admin)
  })

  it('allows pending_approval → approved', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'pending_approval' }))
    mockReservationUpdate.mockImplementation(async ({ data }) => ({
      ...baseReservation({ status: 'pending_approval' }),
      ...data,
    }))

    const response = await PATCH(patchRequest({ status: 'approved' }), params)

    expect(response.status).toBe(200)
    expect(mockReservationUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'approved' }) })
    )
  })

  it('rejects pending_approval → confirmed (approval must precede confirmation)', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'pending_approval' }))

    const response = await PATCH(patchRequest({ status: 'confirmed' }), params)

    expect(response.status).toBe(400)
    expect(mockReservationUpdate).not.toHaveBeenCalled()
  })

  it('allows approved → cancelled', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'approved' }))
    mockReservationUpdate.mockImplementation(async ({ data }) => ({
      ...baseReservation({ status: 'approved' }),
      ...data,
    }))

    const response = await PATCH(patchRequest({ status: 'cancelled' }), params)

    expect(response.status).toBe(200)
  })

  it('allows approved → pending_approval (re-open)', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'approved' }))
    mockReservationUpdate.mockImplementation(async ({ data }) => ({
      ...baseReservation({ status: 'approved' }),
      ...data,
    }))

    const response = await PATCH(patchRequest({ status: 'pending_approval' }), params)

    expect(response.status).toBe(200)
  })

  it('allows confirmed → cancelled and confirmed → pending_approval', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'confirmed' }))
    mockReservationUpdate.mockImplementation(async ({ data }) => ({
      ...baseReservation({ status: 'confirmed' }),
      ...data,
    }))

    const cancel = await PATCH(patchRequest({ status: 'cancelled' }), params)
    const reopen = await PATCH(patchRequest({ status: 'pending_approval' }), params)

    expect(cancel.status).toBe(200)
    expect(reopen.status).toBe(200)
  })

  it('rejects an unknown transition (approved → expired is system-only)', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'approved' }))

    const response = await PATCH(patchRequest({ status: 'expired' }), params)

    expect(response.status).toBe(400)
  })

  it('returns 403 when the caller is not admin', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    const { ForbiddenError } = await import('@/lib/auth')
    vi.mocked(requireAdmin).mockRejectedValue(new ForbiddenError('Admin access required'))

    const response = await PATCH(patchRequest({ status: 'approved' }), params)

    expect(response.status).toBe(403)
  })

  it('audits approval as reservation.approved with bounded metadata', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'pending_approval' }))
    mockReservationUpdate.mockImplementation(async ({ data }) => ({
      ...baseReservation({ status: 'pending_approval' }),
      ...data,
    }))

    const response = await PATCH(patchRequest({ status: 'approved', reason: 'manual review' }), params)

    expect(response.status).toBe(200)
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        action: 'reservation.approved',
        entityType: 'reservation',
        entityId: 'res-1',
        actorId: 'admin-1',
        actorEmail: 'admin@quetzal.com',
        details: JSON.stringify({ oldStatus: 'pending_approval', newStatus: 'approved', reason: 'manual review' }),
      },
    })
  })

  it('keeps reservation.status_changed for non-approval transitions', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'approved' }))
    mockReservationUpdate.mockImplementation(async ({ data }) => ({
      ...baseReservation({ status: 'approved' }),
      ...data,
    }))

    const response = await PATCH(patchRequest({ status: 'cancelled' }), params)

    expect(response.status).toBe(200)
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'reservation.status_changed' }),
    })
  })

  it('invalidates the calendar cache when a reservation is cancelled', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'approved' }))
    mockReservationUpdate.mockImplementation(async ({ data }) => ({
      ...baseReservation({ status: 'approved' }),
      ...data,
    }))

    const response = await PATCH(patchRequest({ status: 'cancelled' }), params)

    expect(response.status).toBe(200)
    expect(mockRevalidateTag).toHaveBeenCalledWith('cruises-calendar', 'default')
  })

  it('does not invalidate the calendar cache on an approval (occupancy unchanged)', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'pending_approval' }))
    mockReservationUpdate.mockImplementation(async ({ data }) => ({
      ...baseReservation({ status: 'pending_approval' }),
      ...data,
    }))

    const response = await PATCH(patchRequest({ status: 'approved' }), params)

    expect(response.status).toBe(200)
    expect(mockRevalidateTag).not.toHaveBeenCalled()
  })
})

describe('PATCH /api/admin/reservations/[id] — confirmWireReceipt', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockResolvedValue(admin)
    mockSendConfirmationEmail.mockResolvedValue(true)
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        paymentRecord: { create: mockPaymentRecordCreate },
        reservation: { update: mockReservationUpdate },
      }
      return cb(tx)
    })
  })

  it('records a completed wire receipt, marks confirmed, and emails once', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'approved' }))
    mockPaymentRecordFindUnique.mockResolvedValue(null)
    mockPaymentRecordCreate.mockResolvedValue({ id: 'pr-1', status: 'completed' })
    mockReservationUpdate.mockResolvedValue({ ...baseReservation({ status: 'confirmed' }) })
    mockUserFindUnique.mockResolvedValue({ id: 'user-1', email: 'guest@example.com' })

    const response = await PATCH(patchRequest({ confirmWireReceipt: true }), params)

    expect(response.status).toBe(200)
    expect(mockPaymentRecordCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reservationId: 'res-1',
        provider: 'wire_transfer',
        providerOrderId: 'wire_transfer:res-1',
        status: 'completed',
        amountUsd: 7000,
      }),
    })
    expect(mockReservationUpdate).toHaveBeenCalledWith({
      where: { id: 'res-1' },
      data: { status: 'confirmed' },
    })
    expect(mockSendConfirmationEmail).toHaveBeenCalledTimes(1)
    expect(mockSendConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'res-1', userEmail: 'guest@example.com' })
    )
  })

  it('is idempotent: an existing receipt returns the reservation with no duplicate side effects', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'confirmed' }))
    mockPaymentRecordFindUnique.mockResolvedValue({ id: 'pr-1', status: 'completed' })

    const response = await PATCH(patchRequest({ confirmWireReceipt: true }), params)

    expect(response.status).toBe(200)
    expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
    expect(mockReservationUpdate).not.toHaveBeenCalled()
    expect(mockSendConfirmationEmail).not.toHaveBeenCalled()
  })

  it('rejects wire confirmation on a pending_approval reservation', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'pending_approval' }))
    mockPaymentRecordFindUnique.mockResolvedValue(null)

    const response = await PATCH(patchRequest({ confirmWireReceipt: true }), params)

    expect(response.status).toBe(400)
    expect((await response.json()).error).toBe('INVALID_TRANSITION')
    expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
    expect(mockSendConfirmationEmail).not.toHaveBeenCalled()
  })

  it('rejects wire confirmation on an already-confirmed reservation with no receipt', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'confirmed' }))
    mockPaymentRecordFindUnique.mockResolvedValue(null)

    const response = await PATCH(patchRequest({ confirmWireReceipt: true }), params)

    expect(response.status).toBe(400)
    expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
  })

  it('audits wire receipt confirmation with bounded metadata', async () => {
    mockReservationFindUnique.mockResolvedValue(baseReservation({ status: 'approved' }))
    mockPaymentRecordFindUnique.mockResolvedValue(null)
    mockPaymentRecordCreate.mockResolvedValue({ id: 'pr-1', status: 'completed' })
    mockReservationUpdate.mockResolvedValue({ ...baseReservation({ status: 'confirmed' }) })
    mockUserFindUnique.mockResolvedValue({ id: 'user-1', email: 'guest@example.com' })

    const response = await PATCH(patchRequest({ confirmWireReceipt: true, reason: 'wire received' }), params)

    expect(response.status).toBe(200)
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: {
        action: 'wire.receipt_confirmed',
        entityType: 'reservation',
        entityId: 'res-1',
        actorId: 'admin-1',
        actorEmail: 'admin@quetzal.com',
        details: JSON.stringify({ providerOrderId: 'wire_transfer:res-1', reason: 'wire received' }),
      },
    })
  })

  it('returns 401 for unauthenticated wire confirmation', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    const { AuthError } = await import('@/lib/auth')
    vi.mocked(requireAdmin).mockRejectedValue(new AuthError('Authentication required'))

    const response = await PATCH(patchRequest({ confirmWireReceipt: true }), params)

    expect(response.status).toBe(401)
    expect(mockPaymentRecordCreate).not.toHaveBeenCalled()
    expect(mockSendConfirmationEmail).not.toHaveBeenCalled()
  })
})
