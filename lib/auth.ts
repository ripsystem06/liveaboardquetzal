import { cookies } from 'next/headers'

const SESSION_COOKIE = 'quetzal_session'

export async function getAuthUserId(): Promise<string> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionId) {
    throw new AuthError('Authentication required')
  }
  return sessionId
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}
