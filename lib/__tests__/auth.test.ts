import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, AuthError, ForbiddenError } from '../auth'

describe('AuthError classes', () => {
  it('AuthError has correct name and message', () => {
    const error = new AuthError('test error')
    expect(error.name).toBe('AuthError')
    expect(error.message).toBe('test error')
    expect(error).toBeInstanceOf(Error)
  })

  it('ForbiddenError extends AuthError', () => {
    const error = new ForbiddenError('forbidden')
    expect(error).toBeInstanceOf(AuthError)
    expect(error).toBeInstanceOf(ForbiddenError)
    expect(error.name).toBe('ForbiddenError')
  })
})

describe('hashPassword / verifyPassword', () => {
  it('verifyPassword returns true for matching password', async () => {
    const hashed = await hashPassword('my-secret-password')
    const result = await verifyPassword('my-secret-password', hashed)
    expect(result).toBe(true)
  })

  it('verifyPassword returns false for wrong password', async () => {
    const hashed = await hashPassword('my-secret-password')
    const result = await verifyPassword('wrong-password', hashed)
    expect(result).toBe(false)
  })

  it('hashPassword produces different hashes for same password (different salts)', async () => {
    const hash1 = await hashPassword('same-password')
    const hash2 = await hashPassword('same-password')
    expect(hash1).not.toBe(hash2)
    // Both should still verify correctly
    expect(await verifyPassword('same-password', hash1)).toBe(true)
    expect(await verifyPassword('same-password', hash2)).toBe(true)
  })

  it('verifyPassword handles empty password gracefully', async () => {
    const hashed = await hashPassword('some-password')
    const result = await verifyPassword('', hashed)
    expect(result).toBe(false)
  })
})
