import { describe, it, expect } from 'vitest'
import { sign, verify } from '../auth'

// We need to set SESSION_SECRET for consistent test results
const TEST_SECRET = 'test-secret-64-characters-long-for-hmac-sha256-verification-tests!!'
process.env.SESSION_SECRET = TEST_SECRET

// Re-import with env set
const { sign: sign2, verify: verify2 } = await import('../auth')

describe('HMAC sign/verify', () => {
  describe('sign', () => {
    it('returns a string with two dot-separated base64url parts', () => {
      const payload = JSON.stringify({ id: 'user_123', email: 'test@example.com' })
      const token = sign2(payload)
      expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
      const parts = token.split('.')
      expect(parts).toHaveLength(2)
    })

    it('produces different signatures for different payloads', () => {
      const payload1 = JSON.stringify({ id: 'user_1' })
      const payload2 = JSON.stringify({ id: 'user_2' })
      expect(sign2(payload1)).not.toBe(sign2(payload2))
    })
  })

  describe('verify', () => {
    it('returns payload string for a valid signed token', () => {
      const payload = JSON.stringify({ id: 'user_123', email: 'admin@quetzal.com', isAdmin: true })
      const token = sign2(payload)
      const decoded = verify2(token)
      expect(decoded).toBe(payload)
    })

    it('returns null for a forged cookie (wrong HMAC)', () => {
      const payload = JSON.stringify({ id: 'user_123', email: 'admin@quetzal.com' })
      const token = sign2(payload)
      // Tamper with the signature
      const [encoded] = token.split('.')
      const forgedToken = `${encoded}.wrongsignature`
      expect(verify2(forgedToken)).toBeNull()
    })

    it('returns null for a tampered payload', () => {
      const payload = JSON.stringify({ id: 'user_123', email: 'admin@quetzal.com' })
      const token = sign2(payload)
      // Change user id in the payload
      const tamperedPayload = JSON.stringify({ id: 'user_999', email: 'admin@quetzal.com' })
      const tamperedEncoded = Buffer.from(tamperedPayload).toString('base64url')
      const [, sig] = token.split('.')
      const forgedToken = `${tamperedEncoded}.${sig}`
      expect(verify2(forgedToken)).toBeNull()
    })

    it('returns null for an invalid base64url encoded payload', () => {
      const token = 'not-valid-base64!!!.somesig'
      expect(verify2(token)).toBeNull()
    })

    it('returns null for a token without a dot separator', () => {
      const token = 'no-dot-here'
      expect(verify2(token)).toBeNull()
    })

    it('returns null for a token with only a signature (no payload)', () => {
      const token = '.somesig'
      expect(verify2(token)).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(verify2('')).toBeNull()
    })
  })
})
