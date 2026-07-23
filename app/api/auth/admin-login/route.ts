import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { sign, verifyPassword } from '@/lib/auth'
import { ADMIN_EMAIL } from '@/lib/config'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin && host && !origin.endsWith(host)) {
    return Response.json({ error: 'Invalid origin' }, { status: 403 })
  }

  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password } = body

  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 })
  }

  if (email !== ADMIN_EMAIL) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const storedHash = process.env.ADMIN_PASSWORD_HASH
  if (!storedHash || !(await verifyPassword(password, storedHash))) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const user = { id: 'admin', name: 'Admin', email, phone: '', isAdmin: true }

  const cookieValue = sign(JSON.stringify(user))
  const cookieStore = await cookies()
  cookieStore.set('quetzal_session', cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return Response.json({ ok: true, user })
}
