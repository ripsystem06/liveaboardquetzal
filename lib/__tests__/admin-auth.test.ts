import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock getSessionUser to control the auth behavior in requireAdmin
const mockGetSessionUser = vi.fn()

vi.mock('@/lib/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth')>()
  return {
    ...actual,
    // Override getSessionUser for test control
    getSessionUser: mockGetSessionUser,
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
    mockGetSessionUser.mockResolvedValue({
      id: 'user-1',
      name: 'Regular User',
      email: 'user@example.com',
      phone: '',
      isAdmin: false,
    })

    const { requireAdmin } = await import('@/lib/admin-auth')
    const { ForbiddenError, AuthError } = await import('@/lib/auth')
    
    try {
      await requireAdmin()
      // Should not reach here
      expect.unreachable('requireAdmin should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenError)
      expect(error).toBeInstanceOf(AuthError)
      expect((error as Error).message).toBe('Admin access required')
    }
  })

  it('re-throws AuthError when no session (getSessionUser throws)', async () => {
    const { AuthError } = await import('@/lib/auth')
    mockGetSessionUser.mockRejectedValue(new AuthError('Authentication required'))

    const { requireAdmin } = await import('@/lib/admin-auth')
    const { ForbiddenError } = await import('@/lib/auth')
    
    try {
      await requireAdmin()
      expect.unreachable('requireAdmin should have thrown')
    } catch (error) {
      // Must be AuthError but NOT ForbiddenError
      expect(error).toBeInstanceOf(AuthError)
      expect(error).not.toBeInstanceOf(ForbiddenError)
      expect((error as Error).message).toBe('Authentication required')
    }
  })

  it('returns email, userId, and name when user is admin', async () => {
    mockGetSessionUser.mockResolvedValue({
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@quetzal.com',
      phone: '555-1234',
      isAdmin: true,
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
