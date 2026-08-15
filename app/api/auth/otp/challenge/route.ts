import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { OtpChallengeSchema } from '@/lib/validations'
import { sendOtpEmail } from '@/lib/email'
import { issueOtpCode, validateOtpCode } from '@/lib/otp'

function maskEmail(email: string): string {
  const at = email.indexOf('@')
  if (at <= 0) return email
  return `${email[0]}***${email.slice(at)}`
}

/**
 * POST /api/auth/otp/challenge — validate the primary OTP before sign-in.
 * If the account is an admin with a recovery email, a second factor is issued
 * and the response asks the client to collect it. Normal users get
 * { twoFactorRequired: false } and proceed straight to Credentials sign-in.
 */
export async function POST(request: NextRequest) {
  // CSRF: verify same-origin request (strict host comparison)
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (!origin || !host) {
    return Response.json({ error: 'Invalid request' }, { status: 403 })
  }
  try {
    if (new URL(origin).host !== host) {
      return Response.json({ error: 'Invalid origin' }, { status: 403 })
    }
  } catch {
    return Response.json({ error: 'Invalid origin' }, { status: 403 })
  }

  const ip = getClientIP(request)

  const rawBody = await request.json()
  const parsed = OtpChallengeSchema.safeParse(rawBody)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed' }, { status: 400 })
  }
  const { email, otp } = parsed.data

  // Rate limit: per-IP and per-email.
  const ipLimit = await checkRateLimit(`otp:challenge:${ip}`, 5, 60_000)
  const emailLimit = await checkRateLimit(`otp:challenge:${email}`, 5, 60_000)
  if (!ipLimit.allowed || !emailLimit.allowed) {
    const retryAfter = ipLimit.retryAfter ?? emailLimit.retryAfter
    return Response.json(
      { error: 'Too many requests. Please try again later.' },
      retryAfter
        ? { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        : { status: 429 },
    )
  }

  const result = await validateOtpCode(email, otp)
  if (!result.ok) {
    return Response.json({ twoFactorRequired: false }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (user?.isAdmin && user.secondaryEmail) {
    const code = await issueOtpCode(user.secondaryEmail)
    await sendOtpEmail(user.secondaryEmail, code)

    // Fire-and-forget audit
    prisma.auditLog.create({
      data: {
        action: 'auth.otp_2fa_requested',
        entityType: 'user',
        entityId: email,
        actorEmail: email,
      },
    }).catch(() => {})

    return Response.json({
      twoFactorRequired: true,
      maskedEmail: maskEmail(user.secondaryEmail),
    })
  }

  return Response.json({ twoFactorRequired: false })
}
