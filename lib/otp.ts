import { randomInt } from 'crypto'
import { hashPassword, verifyPassword } from './auth'
import { prisma } from './db'

export const OTP_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes
export const OTP_MAX_ATTEMPTS = 5

export type OtpVerifyReason = 'invalid' | 'expired' | 'reused' | 'locked'

export interface OtpVerifyResult {
  ok: boolean
  reason?: OtpVerifyReason
}

/**
 * Generates a cryptographically-random 6-digit OTP code (zero-padded).
 */
export function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0')
}

/**
 * Issues a new single-use OTP for an email: deletes any prior unconsumed codes,
 * stores only a scrypt hash of the code, and returns the plaintext for delivery.
 */
export async function issueOtpCode(email: string): Promise<string> {
  const code = generateOtpCode()
  const codeHash = await hashPassword(code)

  await prisma.otpCode.deleteMany({ where: { email, consumedAt: null } })
  await prisma.otpCode.create({
    data: {
      email,
      codeHash,
      attempts: 0,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  })

  return code
}

/**
 * Verifies a submitted OTP using a timing-safe hash comparison, enforcing
 * expiry, single-use (replay), and a maximum attempt count with lockout.
 * On a wrong code the attempt counter is incremented; on success the code is
 * marked consumed (single-use).
 */
export async function verifyOtpCode(email: string, code: string): Promise<OtpVerifyResult> {
  const otp = await prisma.otpCode.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) return { ok: false, reason: 'invalid' }
  if (otp.consumedAt) return { ok: false, reason: 'reused' }
  if (otp.expiresAt < new Date()) return { ok: false, reason: 'expired' }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) return { ok: false, reason: 'locked' }

  const valid = await verifyPassword(code, otp.codeHash)
  if (!valid) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: otp.attempts + 1 },
    })
    return { ok: false, reason: 'invalid' }
  }

  // Atomically mark consumed: the conditional `consumedAt: null` guard ensures
  // only one concurrent caller can transition the row, so a single-use code
  // cannot be double-redeemed. A zero count means another caller consumed it first.
  const consumed = await prisma.otpCode.updateMany({
    where: { id: otp.id, consumedAt: null },
    data: { consumedAt: new Date() },
  })
  if (consumed.count === 0) {
    return { ok: false, reason: 'reused' }
  }

  return { ok: true }
}
