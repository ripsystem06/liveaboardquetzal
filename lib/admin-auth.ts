import { auth, AuthError, ForbiddenError } from '@/lib/auth'

/**
 * Returns the admin user's email, id, and name if authenticated as admin.
 * Throws AuthError(401) if not authenticated, ForbiddenError(403) if not admin.
 */
export async function requireAdmin(): Promise<{ email: string; userId: string; name: string }> {
  const session = await auth()
  if (!session?.user) {
    throw new AuthError('Authentication required')
  }
  if (!session.user.isAdmin) {
    throw new ForbiddenError('Admin access required')
  }
  return {
    email: session.user.email ?? '',
    userId: session.user.id ?? '',
    name: session.user.name ?? '',
  }
}
