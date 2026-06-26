import { cookies } from 'next/headers'
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

const SESSION_COOKIE = 'quetzal_session'

// Generate a random 64-char hex string as default (dev fallback)
const SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex')

/**
 * Signs a payload with HMAC-SHA256.
 * Returns base64url(payload).base64url(hmac)
 */
export function sign(payload: string): string {
  const hmac = createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${Buffer.from(payload).toString('base64url')}.${hmac}`
}

/**
 * Verifies and decodes an HMAC-signed token.
 * Returns the payload string if valid, null if forged/tampered.
 */
export function verify(token: string): string | null {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return null
  const encoded = token.slice(0, lastDot)
  const sig = token.slice(lastDot + 1)
  if (!encoded || !sig) return null
  const expectedSig = createHmac('sha256', SECRET).update(Buffer.from(encoded, 'base64url').toString()).digest('base64url')
  let sigBuffer: Buffer, expectedBuffer: Buffer
  try {
    sigBuffer = Buffer.from(sig, 'base64url')
    expectedBuffer = Buffer.from(expectedSig, 'base64url')
  } catch {
    return null
  }
  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null
  }
  try {
    return Buffer.from(encoded, 'base64url').toString()
  } catch {
    return null
  }
}

export async function getAuthUserId(): Promise<string> {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionValue) {
    throw new AuthError('Authentication required')
  }
  // Session cookie stores HMAC-signed JSON: base64url(payload).base64url(hmac)
  try {
    const payload = verify(sessionValue)
    if (payload === null) {
      throw new AuthError('Authentication required')
    }
    const user = JSON.parse(payload)
    if (!user || !user.email) {
      throw new AuthError('Authentication required')
    }
    return user.email
  } catch (e) {
    if (e instanceof AuthError) throw e
    throw new AuthError('Authentication required')
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}
