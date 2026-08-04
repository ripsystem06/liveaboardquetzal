import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

// Re-export auth() from Auth.js config for server-side session reads
export { auth } from '@/lib/auth.config'

export interface SessionUser {
  id: string
  name?: string | null
  email: string
  phone?: string
  isAdmin?: boolean
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

export class ForbiddenError extends AuthError {
  constructor(message: string) {
    super(message)
    this.name = 'ForbiddenError'
  }
}
