import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { AuthError, ForbiddenError } from '@/lib/auth'

// ===== Mock Prisma =====
const mockCrewRegFindMany = vi.fn()
const mockCrewRegFindUnique = vi.fn()
const mockCrewRegUpdate = vi.fn()
const mockAuditLogCreate = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/db', () => ({
  prisma: {
    crewRegistration: {
      findMany: mockCrewRegFindMany,
      findUnique: mockCrewRegFindUnique,
    },
    auditLog: {
      create: mockAuditLogCreate,
    },
    $transaction: vi.fn(async (callback) => {
      const tx = {
        crewRegistration: { update: mockCrewRegUpdate },
        auditLog: { create: mockAuditLogCreate },
      }
      return callback(tx)
    }),
  },
}))

// ===== Mock admin-auth =====
vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: vi.fn(),
}))

// ===== Mock auth classes (used for error handling in routes) =====
vi.mock('@/lib/auth', () => {
  const AuthError = class extends Error {
    constructor(m: string) {
      super(m)
      this.name = 'AuthError'
    }
  }
  const ForbiddenError = class extends AuthError {
    constructor(m: string) {
      super(m)
      this.name = 'ForbiddenError'
    }
  }
  return { AuthError, ForbiddenError }
})

// ===== Mock Supabase (signed URLs for the detail view) =====
const mockCreateSignedUrl = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/lib/supabase', () => ({
  CREW_DOCS_BUCKET: 'crew-docs',
  getSupabaseAdmin: vi.fn().mockReturnValue({
    storage: { from: mockFrom },
  }),
}))

// ===== Import route handlers =====
const { GET: LIST_GET } = await import('@/app/api/admin/crew-registration/route')
const { GET: DETAIL_GET } = await import('@/app/api/admin/crew-registration/[id]/route')
const { POST: APPROVE_POST } = await import('@/app/api/admin/crew-registration/[id]/approve/route')
const { POST: REJECT_POST } = await import('@/app/api/admin/crew-registration/[id]/reject/route')

const idParams = { params: Promise.resolve({ id: 'reg_1' }) }

async function adminSession() {
  const { requireAdmin } = await import('@/lib/admin-auth')
  vi.mocked(requireAdmin).mockResolvedValue({
    email: 'admin@quetzal.com',
    userId: 'admin_1',
    name: 'Admin',
  })
}

function submittedRegistration(overrides: Record<string, unknown> = {}) {
  return {
    id: 'reg_1',
    reservationId: 'res_1',
    status: 'submitted',
    rejectReason: null,
    submittedAt: new Date('2026-07-01T12:00:00Z'),
    ...overrides,
  }
}

function postRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/admin/crew-registration (list)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ createSignedUrl: mockCreateSignedUrl })
    mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.example/doc' }, error: null })
  })

  it('returns 401 when unauthenticated', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockRejectedValue(new AuthError('Authentication required'))

    const request = new NextRequest('http://localhost/api/admin/crew-registration')
    const response = await LIST_GET(request)

    expect(response.status).toBe(401)
  })

  it('returns 403 when the session is not an admin', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockRejectedValue(new ForbiddenError('Admin access required'))

    const request = new NextRequest('http://localhost/api/admin/crew-registration')
    const response = await LIST_GET(request)

    expect(response.status).toBe(403)
  })

  it('filters by ?status= and returns the list', async () => {
    await adminSession()
    mockCrewRegFindMany.mockResolvedValue([
      {
        id: 'reg_1',
        reservationId: 'res_1',
        status: 'submitted',
        submittedAt: new Date('2026-07-01T12:00:00Z'),
        reservation: {
          id: 'res_1',
          cruiseName: 'Socorro Islands',
          departureDate: '2026-07-15',
          route: 'Revillagigedo',
          guestCount: 2,
          user: { name: 'Lead Diver', email: 'lead@example.com' },
        },
        guests: [],
      },
    ])

    const request = new NextRequest('http://localhost/api/admin/crew-registration?status=submitted')
    const response = await LIST_GET(request)

    expect(response.status).toBe(200)
    expect(mockCrewRegFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'submitted' } })
    )
    const body = await response.json()
    expect(body.registrations).toHaveLength(1)
    expect(body.registrations[0].reservation.cruiseName).toBe('Socorro Islands')
  })

  it('returns an empty list with no registrations (empty state)', async () => {
    await adminSession()
    mockCrewRegFindMany.mockResolvedValue([])

    const request = new NextRequest('http://localhost/api/admin/crew-registration')
    const response = await LIST_GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.registrations).toEqual([])
  })
})

describe('GET /api/admin/crew-registration/[id] (detail)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ createSignedUrl: mockCreateSignedUrl })
    mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.example/doc' }, error: null })
  })

  it('returns 401 when unauthenticated', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockRejectedValue(new AuthError('Authentication required'))

    const request = new NextRequest('http://localhost/api/admin/crew-registration/reg_1')
    const response = await DETAIL_GET(request, idParams)

    expect(response.status).toBe(401)
  })

  it('returns 403 when the session is not an admin', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockRejectedValue(new ForbiddenError('Admin access required'))

    const request = new NextRequest('http://localhost/api/admin/crew-registration/reg_1')
    const response = await DETAIL_GET(request, idParams)

    expect(response.status).toBe(403)
  })

  it('returns per-guest data with signed document URLs', async () => {
    await adminSession()
    mockCrewRegFindUnique.mockResolvedValue({
      id: 'reg_1',
      reservationId: 'res_1',
      status: 'submitted',
      rejectReason: null,
      submittedAt: new Date('2026-07-01T12:00:00Z'),
      arrivalFlight: 'AA123',
      arrivalDate: '2026-07-15',
      arrivalTime: '10:00',
      departureFlight: 'AA456',
      departureDate: '2026-07-22',
      departureTime: '12:00',
      hotelName: 'Hotel Quetzal',
      hotelAddress: 'Cabo',
      reservation: { id: 'res_1', cruiseName: 'Socorro Islands', departureDate: '2026-07-15', guestCount: 2 },
      guests: [
        {
          id: 'guest_0',
          guestIndex: 0,
          fullName: 'Guest One',
          certificationLevel: 'advanced',
          documents: [
            { id: 'doc_1', guestId: 'guest_0', kind: 'passport_ine', storagePath: 'res_1/guest_0/passport_ine-x.pdf' },
          ],
        },
        {
          id: 'guest_1',
          guestIndex: 1,
          fullName: 'Guest Two',
          certificationLevel: 'open_water',
          documents: [],
        },
      ],
    })

    const request = new NextRequest('http://localhost/api/admin/crew-registration/reg_1')
    const response = await DETAIL_GET(request, idParams)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.registration.id).toBe('reg_1')
    expect(body.registration.guests).toHaveLength(2)
    expect(body.registration.guests[0].documents[0].signedUrl).toBe('https://signed.example/doc')
    expect(mockCreateSignedUrl).toHaveBeenCalledWith('res_1/guest_0/passport_ine-x.pdf', 60)
  })

  it('returns 404 when the registration does not exist', async () => {
    await adminSession()
    mockCrewRegFindUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/admin/crew-registration/nope')
    const response = await DETAIL_GET(request, { params: Promise.resolve({ id: 'nope' }) })

    expect(response.status).toBe(404)
  })
})

describe('POST /api/admin/crew-registration/[id]/approve', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('approves a submitted registration and writes an AuditLog entry', async () => {
    await adminSession()
    mockCrewRegFindUnique.mockResolvedValue(submittedRegistration())
    mockCrewRegUpdate.mockResolvedValue({ ...submittedRegistration(), status: 'approved' })

    const request = postRequest('http://localhost/api/admin/crew-registration/reg_1/approve', {})
    const response = await APPROVE_POST(request, idParams)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('approved')
    expect(mockAuditLogCreate).toHaveBeenCalledTimes(1)
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'crew_registration.approve',
        entityType: 'CrewRegistration',
        entityId: 'reg_1',
        actorId: 'admin_1',
        actorEmail: 'admin@quetzal.com',
      }),
    })
  })

  it('returns 400 when the registration is already approved', async () => {
    await adminSession()
    mockCrewRegFindUnique.mockResolvedValue(submittedRegistration({ status: 'approved' }))

    const request = postRequest('http://localhost/api/admin/crew-registration/reg_1/approve', {})
    const response = await APPROVE_POST(request, idParams)

    expect(response.status).toBe(400)
    expect(mockAuditLogCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when the registration is rejected', async () => {
    await adminSession()
    mockCrewRegFindUnique.mockResolvedValue(submittedRegistration({ status: 'rejected' }))

    const request = postRequest('http://localhost/api/admin/crew-registration/reg_1/approve', {})
    const response = await APPROVE_POST(request, idParams)

    expect(response.status).toBe(400)
  })

  it('returns 403 when the session is not an admin', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockRejectedValue(new ForbiddenError('Admin access required'))

    const request = postRequest('http://localhost/api/admin/crew-registration/reg_1/approve', {})
    const response = await APPROVE_POST(request, idParams)

    expect(response.status).toBe(403)
  })
})

describe('POST /api/admin/crew-registration/[id]/reject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects a submitted registration with a mandatory reason and writes an AuditLog entry', async () => {
    await adminSession()
    mockCrewRegFindUnique.mockResolvedValue(submittedRegistration())
    mockCrewRegUpdate.mockResolvedValue({ ...submittedRegistration(), status: 'rejected', rejectReason: 'Missing dive cert' })

    const request = postRequest('http://localhost/api/admin/crew-registration/reg_1/reject', {
      reason: 'Missing dive cert',
    })
    const response = await REJECT_POST(request, idParams)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('rejected')
    expect(body.rejectReason).toBe('Missing dive cert')
    expect(mockAuditLogCreate).toHaveBeenCalledTimes(1)
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'crew_registration.reject',
        entityType: 'CrewRegistration',
        entityId: 'reg_1',
        actorId: 'admin_1',
        actorEmail: 'admin@quetzal.com',
      }),
    })
  })

  it('returns 400 when the reject reason is missing', async () => {
    await adminSession()
    mockCrewRegFindUnique.mockResolvedValue(submittedRegistration())

    const request = postRequest('http://localhost/api/admin/crew-registration/reg_1/reject', {})
    const response = await REJECT_POST(request, idParams)

    expect(response.status).toBe(400)
    expect(mockAuditLogCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when the reject reason is blank', async () => {
    await adminSession()
    mockCrewRegFindUnique.mockResolvedValue(submittedRegistration())

    const request = postRequest('http://localhost/api/admin/crew-registration/reg_1/reject', { reason: '   ' })
    const response = await REJECT_POST(request, idParams)

    expect(response.status).toBe(400)
    expect(mockAuditLogCreate).not.toHaveBeenCalled()
  })

  it('returns 400 when the registration is already approved', async () => {
    await adminSession()
    mockCrewRegFindUnique.mockResolvedValue(submittedRegistration({ status: 'approved' }))

    const request = postRequest('http://localhost/api/admin/crew-registration/reg_1/reject', {
      reason: 'Nope',
    })
    const response = await REJECT_POST(request, idParams)

    expect(response.status).toBe(400)
    expect(mockAuditLogCreate).not.toHaveBeenCalled()
  })

  it('returns 403 when the session is not an admin', async () => {
    const { requireAdmin } = await import('@/lib/admin-auth')
    vi.mocked(requireAdmin).mockRejectedValue(new ForbiddenError('Admin access required'))

    const request = postRequest('http://localhost/api/admin/crew-registration/reg_1/reject', { reason: 'x' })
    const response = await REJECT_POST(request, idParams)

    expect(response.status).toBe(403)
  })
})
