import { auth } from '@/lib/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth.js v5 middleware wraps our custom middleware.
// The auth() call protects matched routes by checking the session.
// Unauthenticated requests to /api/admin/* return 401 automatically.
export default auth((request: NextRequest) => {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // CSP: allow self, inline styles (needed for Tailwind/Next.js), and Vercel analytics
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' https://*.vercel-insights.com; frame-ancestors 'none';"
  )

  return response
})

export const config = {
  // Auth.js protects /api/admin/* via the auth() wrapper.
  // Security headers apply to all routes except static assets.
  matcher: ['/api/admin/:path*', '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp|.*\\.mp4|.*\\.mov).*)'],
}
