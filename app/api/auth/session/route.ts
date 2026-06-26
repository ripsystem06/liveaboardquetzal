import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { sign } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await request.json()
  if (!user || !user.id) return Response.json({ error: 'user required' }, { status: 400 })

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

  return Response.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('quetzal_session')
  return Response.json({ ok: true })
}
