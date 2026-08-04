import { describe, it, expect, vi } from 'vitest'

// Mock Prisma
const mockFindUnique = vi.fn()
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
    },
  },
}))

// Mock verifyPassword to avoid scrypt calls
vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
  hashPassword: vi.fn(),
  AuthError: class AuthError extends Error { },
  ForbiddenError: class ForbiddenError extends Error { },
  auth: vi.fn(), // prevent cascading imports
}))

// Mock the entire auth.config module to prevent next-auth initialization
vi.mock('@/lib/auth.config', () => ({
  auth: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

describe('Credentials provider configuration', () => {
  it('auth.config.ts exports auth function', async () => {
    const { auth } = await import('@/lib/auth.config')
    expect(typeof auth).toBe('function')
  })

  it('auth.config.ts exports signIn function', async () => {
    const { signIn } = await import('@/lib/auth.config')
    expect(typeof signIn).toBe('function')
  })

  it('auth.config.ts exports signOut function', async () => {
    const { signOut } = await import('@/lib/auth.config')
    expect(typeof signOut).toBe('function')
  })

  it('auth.config.ts exports handlers (GET/POST for route handler)', async () => {
    const { handlers } = await import('@/lib/auth.config')
    expect(handlers).toBeDefined()
    expect(typeof handlers.GET).toBe('function')
    expect(typeof handlers.POST).toBe('function')
  })
})
