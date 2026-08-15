import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { OtpRequestSchema } from '@/lib/validations'
import { sendOtpEmail } from '@/lib/email'
import { issueOtpCode } from '@/lib/otp'

/**
 * POST /api/auth/otp/request — request a one-time login code.
 * Issues + emails a 6-digit code (scrypt-hashed, 10-min expiry). Rate-limited
 * per-IP and per-email. Response is identical for registered and unknown emails
 * (no account enumeration).
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
  const parsed = OtpRequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed' }, { status: 400 })
  }
  const { email } = parsed.data

  // Rate limit: two separate keys (per-IP and per-email), no new rate-limit helper.
  const ipLimit = await checkRateLimit(`otp:req:${ip}`, 5, 60_000)
  const emailLimit = await checkRateLimit(`otp:req:${email}`, 5, 60_000)
  if (!ipLimit.allowed || !emailLimit.allowed) {
    const retryAfter = ipLimit.retryAfter ?? emailLimit.retryAfter
    return Response.json(
      { error: 'Too many requests. Please try again later.' },
      retryAfter
        ? { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        : { status: 429 },
    )
  }

  const code = await issueOtpCode(email)
  await sendOtpEmail(email, code)

  // Fire-and-forget audit
  prisma.auditLog.create({
    data: {
      action: 'auth.otp_requested',
      entityType: 'user',
      entityId: email,
      actorEmail: email,
    },
  }).catch(() => {})

  // No-enumeration: identical response regardless of registration status.
  return Response.json({ ok: true })
}
