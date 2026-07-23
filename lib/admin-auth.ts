import { getSessionUser, AuthError, ForbiddenError } from './auth'

/**
 * Returns the admin user's email, id, and name if authenticated as admin.
 * Throws AuthError(401) if not authenticated, ForbiddenError(403) if not admin.
 */
export async function requireAdmin(): Promise<{ email: string; userId: string; name: string }> {
  const user = await getSessionUser()
  if (!user.isAdmin) {
    throw new ForbiddenError('Admin access required')
  }
  return { email: user.email, userId: user.id, name: user.name }
}
