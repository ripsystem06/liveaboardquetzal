import { describe, it, expect, vi } from 'vitest'

// Mock the entire auth.config module at the source level
// next-auth's auth() internally calls headers() which needs request context.
// We mock at the lib/auth.config boundary so unit tests don't touch next-auth internals.
const mockAuth = vi.fn()

vi.mock('@/lib/auth.config', () => ({
  auth: mockAuth,
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

describe('auth() re-export (from lib/auth.ts ← lib/auth.config.ts)', () => {
  it('auth() is exported from lib/auth.ts and delegates to auth.config.ts', async () => {
    const { auth } = await import('@/lib/auth')
    expect(typeof auth).toBe('function')
  })

  it('returns session with id, email, isAdmin when cookie is valid', async () => {
    const session = {
      user: {
        id: 'user-1',
        email: 'test@quetzal.com',
        name: 'Test User',
        isAdmin: false,
        phone: '555-0000',
      },
    }
    mockAuth.mockResolvedValue(session)

    const { auth } = await import('@/lib/auth')
    const result = await auth()

    expect(result).toBeDefined()
    expect(result?.user.id).toBe('user-1')
    expect(result?.user.email).toBe('test@quetzal.com')
    expect(result?.user.isAdmin).toBe(false)
  })

  it('returns null when no session cookie exists', async () => {
    mockAuth.mockResolvedValue(null)

    const { auth } = await import('@/lib/auth')
    const result = await auth()

    expect(result).toBeNull()
  })

  it('returns session with isAdmin=true for admin user', async () => {
    const session = {
      user: {
        id: 'admin-1',
        email: 'admin@quetzal.com',
        name: 'Admin',
        isAdmin: true,
        phone: '',
      },
    }
    mockAuth.mockResolvedValue(session)

    const { auth } = await import('@/lib/auth')
    const result = await auth()

    expect(result?.user.isAdmin).toBe(true)
  })
})
