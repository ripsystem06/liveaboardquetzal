import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock auth() to control session behavior in requireAdmin
const mockAuth = vi.fn()

// Prevent cascade: mock auth.config first so lib/auth.ts doesn't load next-auth
vi.mock('@/lib/auth.config', () => ({
  auth: mockAuth,
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock lib/auth but preserve error classes
vi.mock('@/lib/auth', async (importOriginal) => {
  // importOriginal won't cascade to next-auth because auth.config is already mocked
  const actual = await importOriginal<typeof import('@/lib/auth')>()
  return {
    ...actual,
    auth: mockAuth,
  }
})

describe('ForbiddenError', () => {
  it('ForbiddenError extends AuthError (ADM-REQ-001)', async () => {
    const { ForbiddenError, AuthError } = await import('@/lib/auth')
    
    expect(ForbiddenError).toBeDefined()
    const error = new ForbiddenError('Admin access required')
    expect(error).toBeInstanceOf(AuthError)
    expect(error).toBeInstanceOf(ForbiddenError)
    expect(error).toBeInstanceOf(Error)
  })

  it('ForbiddenError instances have correct name and message', async () => {
    const { ForbiddenError } = await import('@/lib/auth')
    
    const error = new ForbiddenError('Admin access required')
    expect(error.name).toBe('ForbiddenError')
    expect(error.message).toBe('Admin access required')
  })
})

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws ForbiddenError when user is not admin (ADM-REQ-001)', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Regular User',
        email: 'user@example.com',
        phone: '',
        isAdmin: false,
      },
    })

    const { requireAdmin } = await import('@/lib/admin-auth')
    const { ForbiddenError, AuthError } = await import('@/lib/auth')
    
    try {
      await requireAdmin()
      expect.unreachable('requireAdmin should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenError)
      expect(error).toBeInstanceOf(AuthError)
      expect((error as Error).message).toBe('Admin access required')
    }
  })

  it('throws AuthError (401) when no session (auth returns null)', async () => {
    mockAuth.mockResolvedValue(null)

    const { requireAdmin } = await import('@/lib/admin-auth')
    const { AuthError, ForbiddenError } = await import('@/lib/auth')
    
    try {
      await requireAdmin()
      expect.unreachable('requireAdmin should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError)
      expect(error).not.toBeInstanceOf(ForbiddenError)
      expect((error as Error).message).toBe('Authentication required')
    }
  })

  it('returns email, userId, and name when user is admin', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@quetzal.com',
        phone: '555-1234',
        isAdmin: true,
      },
    })

    const { requireAdmin } = await import('@/lib/admin-auth')
    const result = await requireAdmin()
    
    expect(result).toEqual({
      email: 'admin@quetzal.com',
      userId: 'admin-1',
      name: 'Admin User',
    })
  })
})
