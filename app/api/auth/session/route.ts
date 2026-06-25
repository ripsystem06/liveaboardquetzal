import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { userId } = await request.json()
  if (!userId) return Response.json({ error: 'userId required' }, { status: 400 })

  const cookieStore = await cookies()
  cookieStore.set('quetzal_session', userId, {
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
