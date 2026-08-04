import { NextRequest } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { SessionBodySchema } from '@/lib/validations'
import { sendWelcomeEmail } from '@/lib/email'

/**
 * POST /api/auth/register — User registration
 * Login is handled by Auth.js's signIn('credentials') via [...nextauth] route.
 * Logout is handled by Auth.js's signOut().
 */
export async function POST(request: NextRequest) {
  // CSRF: verify same-origin request
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin && host && !origin.endsWith(host)) {
    return Response.json({ error: 'Invalid origin' }, { status: 403 })
  }

  // Rate limit
  const ip = getClientIP(request)
  const rl = checkRateLimit(ip)
  if (!rl.allowed) {
    return Response.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter!) } },
    )
  }

  const rawBody = await request.json()

  const parsed = SessionBodySchema.safeParse(rawBody)
  if (!parsed.success) {
    return Response.json(
      {
        error: 'Validation failed',
        ...(process.env.NODE_ENV !== 'production' ? { details: parsed.error.flatten() } : {}),
      },
      { status: 400 }
    )
  }
  const { email, password, name } = parsed.data

  // Registration requires a name field
  if (!name) {
    return Response.json(
      { error: 'Name is required for registration.' },
      { status: 400 }
    )
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: 'Email already registered' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const created = await prisma.user.create({
    data: { email, passwordHash, name, phone: '' },
  })

  sendWelcomeEmail(email, name).catch(err => console.error('Failed to send welcome email:', err))

  // Fire-and-forget audit log
  prisma.auditLog.create({
    data: {
      action: 'user.registered',
      entityType: 'user',
      entityId: created.id,
      actorEmail: email,
    },
  }).catch(err => console.error('Audit log failed:', err))

  const user = {
    id: created.id,
    name: created.name,
    email: created.email,
    phone: created.phone,
    isAdmin: created.isAdmin,
  }

  return Response.json({ ok: true, user })
}
