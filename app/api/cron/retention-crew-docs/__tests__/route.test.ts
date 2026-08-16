import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockDocFindMany = vi.fn()
const mockDocDeleteMany = vi.fn()

vi.mock('@/lib/db', () => ({
  prisma: {
    crewRegistrationDocument: {
      findMany: mockDocFindMany,
      deleteMany: mockDocDeleteMany,
    },
  },
}))

const mockRemove = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/lib/supabase', () => ({
  CREW_DOCS_BUCKET: 'crew-docs',
  getSupabaseAdmin: vi.fn().mockReturnValue({
    storage: { from: mockFrom },
  }),
}))

const { GET } = await import('@/app/api/cron/retention-crew-docs/route')

function authRequest(secret?: string): NextRequest {
  return new NextRequest('http://localhost/api/cron/retention-crew-docs', {
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  })
}

describe('GET /api/cron/retention-crew-docs', () => {
  const originalSecret = process.env.CRON_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = 'test-secret'
    mockFrom.mockReturnValue({ remove: mockRemove })
    mockRemove.mockResolvedValue({ data: null, error: null })
  })

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret
  })

  it('returns 401 without a valid cron secret', async () => {
    const response = await GET(authRequest('wrong-secret'))
    expect(response.status).toBe(401)
    expect(mockDocFindMany).not.toHaveBeenCalled()
  })

  it('returns 0 when no documents are older than 5 years', async () => {
    mockDocFindMany.mockResolvedValue([])

    const response = await GET(authRequest('test-secret'))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.deleted).toBe(0)
    expect(mockRemove).not.toHaveBeenCalled()
    expect(mockDocDeleteMany).not.toHaveBeenCalled()
  })

  it('removes storage objects and deletes rows for documents older than 5 years', async () => {
    mockDocFindMany.mockResolvedValue([
      { id: 'doc_1', storagePath: 'res_1/guest_0/passport_ine-old.pdf' },
      { id: 'doc_2', storagePath: 'res_2/guest_0/dive_cert-old.pdf' },
    ])
    mockDocDeleteMany.mockResolvedValue({ count: 2 })

    const response = await GET(authRequest('test-secret'))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.deleted).toBe(2)

    expect(mockDocFindMany).toHaveBeenCalledWith({
      where: { uploadedAt: { lt: expect.any(Date) } },
      select: { id: true, storagePath: true },
    })
    expect(mockRemove).toHaveBeenCalledWith([
      'res_1/guest_0/passport_ine-old.pdf',
      'res_2/guest_0/dive_cert-old.pdf',
    ])
    expect(mockDocDeleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['doc_1', 'doc_2'] } },
    })
  })
})
