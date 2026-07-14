import { cookies } from 'next/headers'
import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

const SESSION_COOKIE = 'quetzal_session'

// SESSION_SECRET is required in production; dev gets a random ephemeral fallback
const SECRET = process.env.SESSION_SECRET
if (!SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable is required in production')
  }
  // Dev fallback: warn but continue with random secret
  console.warn('[auth] SESSION_SECRET not set — using random ephemeral secret (sessions will expire on restart)')
}
const effectiveSecret = SECRET || randomBytes(32).toString('hex')

/**
 * Signs a payload with HMAC-SHA256.
 * Returns base64url(payload).base64url(hmac)
 */
export function sign(payload: string): string {
  const hmac = createHmac('sha256', effectiveSecret).update(payload).digest('base64url')
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
  const expectedSig = createHmac('sha256', effectiveSecret).update(Buffer.from(encoded, 'base64url').toString()).digest('base64url')
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

/**
 * Hashes a password using scrypt with a random 16-byte salt.
 * Returns "salt_hex:hash_hex" string suitable for storage.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${hash.toString('hex')}`
}

/**
 * Verifies a password against a stored "salt_hex:hash_hex" string.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const colonIndex = storedHash.indexOf(':')
  if (colonIndex === -1) return false
  const salt = storedHash.slice(0, colonIndex)
  const originalHash = storedHash.slice(colonIndex + 1)
  if (!salt || !originalHash) return false
  try {
    const hash = (await scryptAsync(password, salt, 64)) as Buffer
    const originalBuffer = Buffer.from(originalHash, 'hex')
    if (hash.length !== originalBuffer.length) return false
    return timingSafeEqual(hash, originalBuffer)
  } catch {
    return false
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}
