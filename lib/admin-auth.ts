import { getAuthUserId, AuthError } from './auth'
import { ADMIN_EMAIL } from './config'

export async function requireAdmin(): Promise<string> {
  const email = await getAuthUserId()
  if (email !== ADMIN_EMAIL) {
    throw new AuthError('Admin access required')
  }
  return email
}
