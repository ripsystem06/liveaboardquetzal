import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock PrismaClient before any imports to intercept constructor calls
const mockExecuteRawUnsafe = vi.fn()
const mockPrismaClientConstructor = vi.fn()

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(function (this: Record<string, unknown>, opts?: Record<string, unknown>) {
    mockPrismaClientConstructor(opts)
    this.$executeRawUnsafe = mockExecuteRawUnsafe
    return this
  }),
}))

describe('DB initialization for PostgreSQL', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    // Reset globalForPrisma so each test gets fresh initialization
    delete (globalThis as Record<string, unknown>).prisma
    vi.unstubAllEnvs()
  })

  it('does NOT execute any SQLite PRAGMA during cold start (DB-REQ-001)', async () => {
    const originalDbUrl = process.env.DATABASE_URL
    vi.stubEnv('NODE_ENV', 'development')
    process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db'

    await import('@/lib/db')

    const pragmaCalls = mockExecuteRawUnsafe.mock.calls.filter(
      (call: unknown[]) => typeof call[0] === 'string' && call[0].includes('PRAGMA')
    )
    expect(pragmaCalls).toHaveLength(0)

    process.env.DATABASE_URL = originalDbUrl
  })

  it('configures PrismaClient datasource URL with connection_limit=3 and pool_timeout=10 (DB-REQ-003)', async () => {
    const originalDbUrl = process.env.DATABASE_URL
    process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db?pgbouncer=true'

    await import('@/lib/db')

    expect(mockPrismaClientConstructor).toHaveBeenCalled()
    const opts = mockPrismaClientConstructor.mock.calls[0]?.[0] as Record<string, unknown> | undefined

    // Must include datasource config with pooling params
    expect(opts).toBeDefined()
    const datasources = opts!.datasources as Record<string, { url: string }> | undefined
    expect(datasources).toBeDefined()
    const dbUrl = datasources!.db?.url
    expect(dbUrl).toBeDefined()
    expect(dbUrl).toContain('connection_limit=3')
    expect(dbUrl).toContain('pool_timeout=10')

    process.env.DATABASE_URL = originalDbUrl
  })

  it('preserves existing query params when appending pooling config to URL with ?pgbouncer=true', async () => {
    const originalDbUrl = process.env.DATABASE_URL
    process.env.DATABASE_URL = 'postgresql://user:pass@host:5432/db?pgbouncer=true&schema=public'

    await import('@/lib/db')

    expect(mockPrismaClientConstructor).toHaveBeenCalled()
    const opts = mockPrismaClientConstructor.mock.calls[0]?.[0] as Record<string, unknown> | undefined
    expect(opts).toBeDefined()
    const datasources = opts!.datasources as Record<string, { url: string }> | undefined
    const dbUrl = datasources!.db?.url
    expect(dbUrl).toContain('pgbouncer=true')
    expect(dbUrl).toContain('schema=public')
    expect(dbUrl).toContain('connection_limit=3')
    expect(dbUrl).toContain('pool_timeout=10')

    process.env.DATABASE_URL = originalDbUrl
  })
})
