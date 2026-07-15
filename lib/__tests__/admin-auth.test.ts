import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/config', () => ({
  ADMIN_EMAIL: 'admin@quetzal.com',
}))

vi.mock('@/lib/auth', () => ({
  getAuthUserId: vi.fn(),
  AuthError: class extends Error {
    constructor(m: string) {
      super(m)
      this.name = 'AuthError'
    }
  },
}))

const { getAuthUserId } = await import('@/lib/auth')

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns email and userId when user is admin', async () => {
    vi.mocked(getAuthUserId).mockResolvedValue('admin')

    const { requireAdmin } = await import('@/lib/admin-auth')
    const result = await requireAdmin()
    expect(result).toEqual({ email: 'admin@quetzal.com', userId: 'admin' })
  })

  it('throws AuthError with "Admin access required" when user is not admin', async () => {
    vi.mocked(getAuthUserId).mockResolvedValue('some-regular-user-id')

    const { requireAdmin } = await import('@/lib/admin-auth')
    await expect(requireAdmin()).rejects.toThrow('Admin access required')
  })

  it('throws AuthError with "Authentication required" when no session', async () => {
    vi.mocked(getAuthUserId).mockRejectedValue(new (await import('@/lib/auth')).AuthError('Authentication required'))

    const { requireAdmin } = await import('@/lib/admin-auth')
    await expect(requireAdmin()).rejects.toThrow('Authentication required')
  })
})