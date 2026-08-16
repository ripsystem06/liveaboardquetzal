import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Prisma mocks ---------------------------------------------------------
const mockCrewRegFindUnique = vi.fn()
const mockCrewRegDelete = vi.fn()
vi.mock('@/lib/db', () => ({
  prisma: {
    crewRegistration: { findUnique: mockCrewRegFindUnique, delete: mockCrewRegDelete },
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
vi.mock('@/lib/email', () => ({ sendCrewRegistrationInviteEmail: vi.fn() }))

const { cleanupCrewRegistration } = await import('@/app/api/admin/reservations/[id]/route')

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
