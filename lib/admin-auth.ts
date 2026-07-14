import { getAuthUserId, AuthError } from './auth'
import { ADMIN_EMAIL } from './config'

/**
 * Returns the admin user's email and id if authenticated as admin.
 * Throws AuthError(401) if not authenticated, AuthError(403) if not admin.
 */
export async function requireAdmin(): Promise<{ email: string; userId: string }> {
  const email = await getAuthUserId()
  if (email !== ADMIN_EMAIL) {
    throw new AuthError('Admin access required')
  }
  return { email, userId: 'admin' }
}
