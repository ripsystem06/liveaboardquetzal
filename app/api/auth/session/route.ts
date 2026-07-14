import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { sign, hashPassword, verifyPassword } from '@/lib/auth'
import { ADMIN_EMAIL } from '@/lib/config'
import { prisma } from '@/lib/db'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { SessionBodySchema } from '@/lib/validations'

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
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const { email, password, name } = parsed.data

  let user: { id: string; name: string; email: string; phone: string; isAdmin: boolean }

  // Admin login — server-side verified against ADMIN_PASSWORD_HASH env var
  if (email === ADMIN_EMAIL) {
    const storedHash = process.env.ADMIN_PASSWORD_HASH
    if (!storedHash || !(await verifyPassword(password, storedHash))) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    user = { id: 'admin', name: 'Admin', email, phone: '', isAdmin: true }
  }
  // Register mode — name field present, create real DB user
  else if (name) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: 'Email already registered' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)
    const created = await prisma.user.create({
      data: { email, passwordHash, name, phone: '' },
    })

    user = {
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      isAdmin: created.isAdmin,
    }
  }
  // Login mode — no name field, authenticate against DB
  else {
    const dbUser = await prisma.user.findUnique({ where: { email } })
    if (!dbUser) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await verifyPassword(password, dbUser.passwordHash)
    if (!valid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      isAdmin: dbUser.isAdmin,
    }
  }

  // Store HMAC-signed user JSON in cookie so server-side auth can extract email
  const cookieValue = sign(JSON.stringify(user))
  const cookieStore = await cookies()
  cookieStore.set('quetzal_session', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return Response.json({ ok: true, user })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('quetzal_session')
  return Response.json({ ok: true })
}
