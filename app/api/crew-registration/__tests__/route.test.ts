import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Prisma mocks ---------------------------------------------------------
const mockReservationFindUnique = vi.fn()
const mockCrewRegFindUnique = vi.fn()
const mockTransaction = vi.fn()
const mockRegUpsert = vi.fn()
const mockGuestUpsert = vi.fn()
const mockAuditLogCreate = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: { findUnique: mockReservationFindUnique },
    crewRegistration: { findUnique: mockCrewRegFindUnique },
    $transaction: mockTransaction,
  },
}))

// --- Auth mocks -----------------------------------------------------------
const mockAuthFn = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: mockAuthFn,
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

// --- Supabase mocks -------------------------------------------------------
const mockCreateSignedUrl = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/lib/supabase', () => ({
  CREW_DOCS_BUCKET: 'crew-docs',
  getSupabaseAdmin: vi.fn().mockReturnValue({
    storage: { from: mockFrom },
  }),
}))

const { GET, PUT } = await import('@/app/api/crew-registration/[reservationId]/route')

function installTransaction() {
  mockTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
    const tx = {
      crewRegistration: { upsert: mockRegUpsert },
      crewRegistrationGuest: { upsert: mockGuestUpsert },
      auditLog: { create: mockAuditLogCreate },
    }
    return cb(tx)
  })
}

function validFlights() {
  return {
    arrivalFlight: 'AA123',
    arrivalDate: '2026-07-15',
    arrivalTime: '10:00',
    departureFlight: 'AA456',
    departureDate: '2026-07-22',
    departureTime: '12:00',
    hotelName: 'Hotel Quetzal',
    hotelAddress: 'San José del Cabo',
  }
}

function validGuest(overrides: Record<string, unknown> = {}) {
  return {
    fullName: 'Test Diver',
    dateOfBirth: '1990-01-01',
    nationality: 'Mexican',
    passportNumber: 'ABC123456',
    contactPhone: '+521234567890',
    certificationLevel: 'advanced',
    diveInsurancePolicyNo: 'DAN-123',
    isNitroxCertified: false,
    ec1Name: 'Emergency One',
    ec1Relation: 'Spouse',
    ec1Phone: '+521111111111',
    ec2Name: 'Emergency Two',
    ec2Relation: 'Friend',
    ec2Phone: '+522222222222',
    ...overrides,
  }
}

function payload(guestCount: number, overrides: Record<string, unknown> = {}) {
  return {
    submit: false,
    flights: validFlights(),
    guests: Array.from({ length: guestCount }, () => validGuest()),
    ...overrides,
  }
}

const confirmedReservation = {
  id: 'res_1',
  userId: 'user_123',
  status: 'confirmed',
  guestCount: 2,
}

function newRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/crew-registration/res_1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const params = { params: Promise.resolve({ reservationId: 'res_1' }) }

describe('PUT /api/crew-registration/[reservationId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthFn.mockResolvedValue({ user: { id: 'user_123', email: 'test@test.com', isAdmin: false } })
    installTransaction()
    mockRegUpsert.mockResolvedValue({ id: 'reg_1', reservationId: 'res_1', status: 'draft', guests: [] })
    mockGuestUpsert.mockImplementation(async (args: { where: { registrationId_guestIndex: { guestIndex: number } }; create: Record<string, unknown> }) => ({
      id: `guest_${args.where.registrationId_guestIndex.guestIndex}`,
      ...args.create,
    }))
    mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.example/doc' }, error: null })
    mockFrom.mockReturnValue({ createSignedUrl: mockCreateSignedUrl })
  })

  it('upserts the registration with one guest row per guestCount', async () => {
    mockReservationFindUnique.mockResolvedValue(confirmedReservation)
    mockCrewRegFindUnique.mockResolvedValue(null)

    const response = await PUT(newRequest(payload(2)), params)
    expect(response.status).toBe(200)

    expect(mockRegUpsert).toHaveBeenCalledTimes(1)
    expect(mockRegUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { reservationId: 'res_1' } })
    )
    expect(mockGuestUpsert).toHaveBeenCalledTimes(2)
    const indices = mockGuestUpsert.mock.calls.map((c) => c[0].where.registrationId_guestIndex.guestIndex).sort()
    expect(indices).toEqual([0, 1])
  })

  it('returns 401 when unauthenticated', async () => {
    mockAuthFn.mockResolvedValue(null)

    const response = await PUT(newRequest(payload(2)), params)
    expect(response.status).toBe(401)
  })

  it('returns 403 when the caller is not the reservation owner', async () => {
    mockReservationFindUnique.mockResolvedValue({ ...confirmedReservation, userId: 'other_user' })

    const response = await PUT(newRequest(payload(2)), params)
    expect(response.status).toBe(403)
  })

  it('returns 403 when the reservation is not confirmed', async () => {
    mockReservationFindUnique.mockResolvedValue({ ...confirmedReservation, status: 'pending_approval' })

    const response = await PUT(newRequest(payload(2)), params)
    expect(response.status).toBe(403)
  })

  it('returns 403 when the registration is already approved (edit-lock)', async () => {
    mockReservationFindUnique.mockResolvedValue(confirmedReservation)
    mockCrewRegFindUnique.mockResolvedValue({
      id: 'reg_1',
      reservationId: 'res_1',
      status: 'approved',
      guests: [],
    })

    const response = await PUT(newRequest(payload(2)), params)
    expect(response.status).toBe(403)
  })

  it('returns 400 when guest rows do not match guestCount', async () => {
    mockReservationFindUnique.mockResolvedValue({ ...confirmedReservation, guestCount: 3 })
    mockCrewRegFindUnique.mockResolvedValue(null)

    const response = await PUT(newRequest(payload(2)), params)
    expect(response.status).toBe(400)
  })

  it('returns 400 with missing docs when submitting without mandatory documents', async () => {
    mockReservationFindUnique.mockResolvedValue({ ...confirmedReservation, guestCount: 1 })
    mockCrewRegFindUnique.mockResolvedValue({
      id: 'reg_1',
      reservationId: 'res_1',
      status: 'draft',
      guests: [{ id: 'guest_0', guestIndex: 0, documents: [] }],
    })

    const response = await PUT(newRequest(payload(1, { submit: true })), params)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(Array.isArray(body.missing)).toBe(true)
    const kinds = body.missing.map((m: { kind: string }) => m.kind).sort()
    expect(kinds).toEqual(['dive_cert', 'dive_insurance', 'passport_ine'])
  })

  it('sets status to submitted and writes an AuditLog entry on submit', async () => {
    mockReservationFindUnique.mockResolvedValue({ ...confirmedReservation, guestCount: 1 })
    mockCrewRegFindUnique.mockResolvedValue({
      id: 'reg_1',
      reservationId: 'res_1',
      status: 'draft',
      submittedAt: null,
      guests: [
        {
          id: 'guest_0',
          guestIndex: 0,
          documents: [
            { guestId: 'guest_0', kind: 'passport_ine' },
            { guestId: 'guest_0', kind: 'dive_cert' },
            { guestId: 'guest_0', kind: 'dive_insurance' },
          ],
        },
      ],
    })
    mockRegUpsert.mockResolvedValue({ id: 'reg_1', reservationId: 'res_1', status: 'submitted', guests: [] })

    const response = await PUT(newRequest(payload(1, { submit: true })), params)
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(body.status).toBe('submitted')
    expect(mockAuditLogCreate).toHaveBeenCalledTimes(1)
    expect(mockAuditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'crew_registration.submit' }),
    })
  })
})

describe('GET /api/crew-registration/[reservationId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthFn.mockResolvedValue({ user: { id: 'user_123', email: 'test@test.com', isAdmin: false } })
    mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.example/doc' }, error: null })
    mockFrom.mockReturnValue({ createSignedUrl: mockCreateSignedUrl })
  })

  it('returns the registration with guests and signed document URLs for the owner', async () => {
    mockReservationFindUnique.mockResolvedValue(confirmedReservation)
    mockCrewRegFindUnique.mockResolvedValue({
      id: 'reg_1',
      reservationId: 'res_1',
      status: 'submitted',
      guests: [
        {
          id: 'guest_0',
          guestIndex: 0,
          documents: [{ id: 'doc_1', guestId: 'guest_0', storagePath: 'res_1/guest_0/passport_ine-x.pdf', kind: 'passport_ine' }],
        },
      ],
    })

    const request = new NextRequest('http://localhost/api/crew-registration/res_1')
    const response = await GET(request, params)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.registration.id).toBe('reg_1')
    const doc = body.registration.guests[0].documents[0]
    expect(doc.signedUrl).toBe('https://signed.example/doc')
  })

  it('returns 401 when unauthenticated', async () => {
    mockAuthFn.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/crew-registration/res_1')
    const response = await GET(request, params)
    expect(response.status).toBe(401)
  })

  it('returns 403 when the caller is not the owner', async () => {
    mockReservationFindUnique.mockResolvedValue({ ...confirmedReservation, userId: 'other_user' })

    const request = new NextRequest('http://localhost/api/crew-registration/res_1')
    const response = await GET(request, params)
    expect(response.status).toBe(403)
  })
})
