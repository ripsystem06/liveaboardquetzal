import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// --- Prisma mocks ---------------------------------------------------------
const mockReservationFindUnique = vi.fn()
const mockCrewRegFindUnique = vi.fn()
const mockGuestFindUnique = vi.fn()
const mockDocFindUnique = vi.fn()
const mockDocCount = vi.fn()
const mockDocUpsert = vi.fn()
const mockDocDelete = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    reservation: { findUnique: mockReservationFindUnique },
    crewRegistration: { findUnique: mockCrewRegFindUnique },
    crewRegistrationGuest: { findUnique: mockGuestFindUnique },
    crewRegistrationDocument: {
      findUnique: mockDocFindUnique,
      count: mockDocCount,
      upsert: mockDocUpsert,
      delete: mockDocDelete,
    },
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

// --- Supabase Storage mocks ----------------------------------------------
const mockUpload = vi.fn()
const mockRemove = vi.fn()
const mockCreateSignedUrl = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/lib/supabase', () => ({
  CREW_DOCS_BUCKET: 'crew-docs',
  getSupabaseAdmin: vi.fn().mockReturnValue({
    storage: { from: mockFrom },
  }),
}))

// --- Rate limit mocks -----------------------------------------------------
const mockCheckRateLimit = vi.fn()
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mockCheckRateLimit,
  getClientIP: vi.fn().mockReturnValue('1.2.3.4'),
}))

const { POST } = await import('@/app/api/crew-registration/[reservationId]/documents/route')
const { GET, DELETE } = await import('@/app/api/crew-registration/[reservationId]/documents/[documentId]/route')

const docParams = { params: Promise.resolve({ reservationId: 'res_1' }) }
const docIdParams = { params: Promise.resolve({ reservationId: 'res_1', documentId: 'doc_1' }) }

const confirmedReservation = { id: 'res_1', userId: 'user_123', status: 'confirmed', guestCount: 2 }
const editableRegistration = { id: 'reg_1', reservationId: 'res_1', status: 'draft' }

function uploadRequest(file: File, guestId: string, kind: string): NextRequest {
  const request = new NextRequest('http://localhost/api/crew-registration/res_1/documents', {
    method: 'POST',
  })
  // jsdom's File/FormData do not round-trip through NextRequest's undici body
  // serializer (the Blob degrades to a "blob" entry), so stub formData() to
  // hand the jsdom File straight to the handler, preserving size/type.
  const formData = new FormData()
  formData.append('file', file)
  formData.append('guestId', guestId)
  formData.append('kind', kind)
  vi.spyOn(request, 'formData').mockResolvedValue(formData)
  return request
}

function pdfFile(name = 'doc.pdf', sizeBytes = 1024): File {
  return new File([new Uint8Array(sizeBytes)], name, { type: 'application/pdf' })
}

describe('POST /api/crew-registration/[reservationId]/documents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthFn.mockResolvedValue({ user: { id: 'user_123', email: 'test@test.com', isAdmin: false } })
    mockCheckRateLimit.mockReturnValue({ allowed: true })
    mockFrom.mockReturnValue({ upload: mockUpload, remove: mockRemove, createSignedUrl: mockCreateSignedUrl })
    mockReservationFindUnique.mockResolvedValue(confirmedReservation)
    mockCrewRegFindUnique.mockResolvedValue(editableRegistration)
    mockGuestFindUnique.mockResolvedValue({ id: 'guest_0', registrationId: 'reg_1' })
    mockDocCount.mockResolvedValue(0)
    mockDocFindUnique.mockResolvedValue(null)
    mockUpload.mockResolvedValue({ data: { path: 'res_1/guest_0/passport_ine-x.pdf' }, error: null })
    mockDocUpsert.mockResolvedValue({ id: 'doc_1', guestId: 'guest_0', kind: 'passport_ine', storagePath: 'res_1/guest_0/passport_ine-x.pdf' })
  })

  it('uploads a valid pdf and persists a document row with a server-generated key', async () => {
    const response = await POST(uploadRequest(pdfFile(), 'guest_0', 'passport_ine'), docParams)
    expect(response.status).toBe(201)

    expect(mockFrom).toHaveBeenCalledWith('crew-docs')
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^res_1\/guest_0\/passport_ine-[0-9a-f-]+\.pdf$/),
      expect.any(Buffer),
      { contentType: 'application/pdf' }
    )
    expect(mockDocUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { guestId_kind: { guestId: 'guest_0', kind: 'passport_ine' } } })
    )
  })

  it('returns 400 for a file larger than 4 MB', async () => {
    const big = new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'big.pdf', { type: 'application/pdf' })
    const response = await POST(uploadRequest(big, 'guest_0', 'passport_ine'), docParams)
    expect(response.status).toBe(400)
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('returns 400 for a disallowed MIME type', async () => {
    const svg = new File([new Uint8Array(64)], 'evil.svg', { type: 'image/svg+xml' })
    const response = await POST(uploadRequest(svg, 'guest_0', 'passport_ine'), docParams)
    expect(response.status).toBe(400)
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('returns 400 when a guest already has 5 documents', async () => {
    mockDocCount.mockResolvedValueOnce(5) // per-guest cap
    const response = await POST(uploadRequest(pdfFile(), 'guest_0', 'passport_ine'), docParams)
    expect(response.status).toBe(400)
  })

  it('returns 400 when the per-submission cap (5 × guestCount) is reached', async () => {
    mockDocCount
      .mockResolvedValueOnce(0) // per-guest: 0
      .mockResolvedValueOnce(10) // per-submission: 10 === 5 × 2 guests
    const response = await POST(uploadRequest(pdfFile(), 'guest_0', 'passport_ine'), docParams)
    expect(response.status).toBe(400)
  })

  it('replaces a same-kind document and removes the old storage object', async () => {
    mockDocFindUnique.mockResolvedValue({
      id: 'doc_old',
      guestId: 'guest_0',
      kind: 'passport_ine',
      storagePath: 'res_1/guest_0/passport_ine-old.pdf',
    })

    const response = await POST(uploadRequest(pdfFile(), 'guest_0', 'passport_ine'), docParams)
    expect(response.status).toBe(201)
    expect(mockRemove).toHaveBeenCalledWith(['res_1/guest_0/passport_ine-old.pdf'])
  })

  it('returns 403 when upload is attempted for an approved registration', async () => {
    mockCrewRegFindUnique.mockResolvedValue({ id: 'reg_1', reservationId: 'res_1', status: 'approved' })
    const response = await POST(uploadRequest(pdfFile(), 'guest_0', 'passport_ine'), docParams)
    expect(response.status).toBe(403)
    expect(mockUpload).not.toHaveBeenCalled()
  })

  it('returns 403 when the reservation is not confirmed', async () => {
    mockReservationFindUnique.mockResolvedValue({ ...confirmedReservation, status: 'pending_approval' })
    const response = await POST(uploadRequest(pdfFile(), 'guest_0', 'passport_ine'), docParams)
    expect(response.status).toBe(403)
  })

  it('returns 401 when unauthenticated', async () => {
    mockAuthFn.mockResolvedValue(null)
    const response = await POST(uploadRequest(pdfFile(), 'guest_0', 'passport_ine'), docParams)
    expect(response.status).toBe(401)
  })

  it('returns 403 for a non-owner upload', async () => {
    mockReservationFindUnique.mockResolvedValue({ ...confirmedReservation, userId: 'other_user' })
    const response = await POST(uploadRequest(pdfFile(), 'guest_0', 'passport_ine'), docParams)
    expect(response.status).toBe(403)
  })
})

describe('DELETE /api/crew-registration/[reservationId]/documents/[documentId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthFn.mockResolvedValue({ user: { id: 'user_123', email: 'test@test.com', isAdmin: false } })
    mockFrom.mockReturnValue({ upload: mockUpload, remove: mockRemove, createSignedUrl: mockCreateSignedUrl })
    mockReservationFindUnique.mockResolvedValue(confirmedReservation)
    mockCrewRegFindUnique.mockResolvedValue({ id: 'reg_1', reservationId: 'res_1', status: 'submitted' })
    mockDocFindUnique.mockResolvedValue({
      id: 'doc_1',
      guestId: 'guest_0',
      storagePath: 'res_1/guest_0/passport_ine-x.pdf',
      guest: { registrationId: 'reg_1' },
    })
    mockRemove.mockResolvedValue({ data: null, error: null })
  })

  it('deletes the row and removes the storage object for the owner', async () => {
    const request = new NextRequest('http://localhost/api/crew-registration/res_1/documents/doc_1', { method: 'DELETE' })
    const response = await DELETE(request, docIdParams)

    expect(response.status).toBe(200)
    expect(mockRemove).toHaveBeenCalledWith(['res_1/guest_0/passport_ine-x.pdf'])
    expect(mockDocDelete).toHaveBeenCalledWith({ where: { id: 'doc_1' } })
  })

  it('returns 403 when delete is attempted for an approved registration', async () => {
    mockCrewRegFindUnique.mockResolvedValue({ id: 'reg_1', reservationId: 'res_1', status: 'approved' })
    const request = new NextRequest('http://localhost/api/crew-registration/res_1/documents/doc_1', { method: 'DELETE' })
    const response = await DELETE(request, docIdParams)
    expect(response.status).toBe(403)
    expect(mockRemove).not.toHaveBeenCalled()
  })
})

describe('GET /api/crew-registration/[reservationId]/documents/[documentId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthFn.mockResolvedValue({ user: { id: 'user_123', email: 'test@test.com', isAdmin: false } })
    mockFrom.mockReturnValue({ upload: mockUpload, remove: mockRemove, createSignedUrl: mockCreateSignedUrl })
    mockReservationFindUnique.mockResolvedValue(confirmedReservation)
    mockCrewRegFindUnique.mockResolvedValue({ id: 'reg_1', reservationId: 'res_1', status: 'submitted' })
    mockDocFindUnique.mockResolvedValue({
      id: 'doc_1',
      guestId: 'guest_0',
      storagePath: 'res_1/guest_0/passport_ine-x.pdf',
      guest: { registrationId: 'reg_1' },
    })
    mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://signed.example/doc' }, error: null })
  })

  it('returns a 60s signed URL for the owner', async () => {
    const request = new NextRequest('http://localhost/api/crew-registration/res_1/documents/doc_1')
    const response = await GET(request, docIdParams)

    expect(response.status).toBe(200)
    expect(mockCreateSignedUrl).toHaveBeenCalledWith('res_1/guest_0/passport_ine-x.pdf', 60)
    const body = await response.json()
    expect(body.url).toBe('https://signed.example/doc')
  })

  it('returns a signed URL for an admin who does not own the reservation', async () => {
    mockAuthFn.mockResolvedValue({ user: { id: 'admin_1', email: 'admin@x.com', isAdmin: true } })
    mockReservationFindUnique.mockResolvedValue({ ...confirmedReservation, userId: 'other_user' })

    const request = new NextRequest('http://localhost/api/crew-registration/res_1/documents/doc_1')
    const response = await GET(request, docIdParams)
    expect(response.status).toBe(200)
  })

  it('returns 403 for a third-party user who is neither owner nor admin', async () => {
    mockAuthFn.mockResolvedValue({ user: { id: 'user_999', email: 'other@x.com', isAdmin: false } })
    mockReservationFindUnique.mockResolvedValue({ ...confirmedReservation, userId: 'user_123' })

    const request = new NextRequest('http://localhost/api/crew-registration/res_1/documents/doc_1')
    const response = await GET(request, docIdParams)
    expect(response.status).toBe(403)
  })

  it('returns 401 when unauthenticated', async () => {
    mockAuthFn.mockResolvedValue(null)
    const request = new NextRequest('http://localhost/api/crew-registration/res_1/documents/doc_1')
    const response = await GET(request, docIdParams)
    expect(response.status).toBe(401)
  })
})
