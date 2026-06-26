import { getAuthUserId, AuthError } from './auth'
import { ADMIN_EMAIL } from './config'

/**
 * Returns the admin user's email if authenticated as admin.
 * Throws AuthError(401) if not authenticated, AuthError(403) if not admin.
 */
export async function requireAdmin(): Promise<string> {
  const email = await getAuthUserId()
  if (email !== ADMIN_EMAIL) {
    throw new AuthError('Admin access required')
  }
  return email
}
