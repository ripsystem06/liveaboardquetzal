export const runtime = 'nodejs'

import { auth } from '@/lib/auth.config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * CSRF origin validation for state-changing API routes.
 * Rejects cross-origin POST/PUT/PATCH/DELETE requests.
 */
function validateCsrfOrigin(request: NextRequest): boolean {
  const method = request.method
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return true
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

// Auth.js v5 middleware wraps our custom middleware.
// The auth() call protects matched routes by checking the session.
// Unauthenticated requests to /api/admin/* return 401 automatically.
export default auth((request: NextRequest) => {
  const response = NextResponse.next()

  // ── CSRF protection for API mutations ────────────────────────────────────
  if (request.nextUrl.pathname.startsWith('/api/') && !validateCsrfOrigin(request)) {
    return Response.json({ error: 'Invalid origin' }, { status: 403 })
  }

  // ── Cache-Control: prevent caching of API responses ──────────────────────
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  }

  // ── Security headers ─────────────────────────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  )

  // HSTS: enforce HTTPS for 2 years (production only)
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  // CSP: hardened for production, relaxed for dev (Next.js requires unsafe-inline for hydration)
  if (isProduction) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' https://*.vercel-insights.com; frame-ancestors 'none';"
    )
  } else {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self' https://*.vercel-insights.com; frame-ancestors 'none';"
    )
  }

  return response
})

export const config = {
  // Auth.js protects /api/admin/* via the auth() wrapper.
  // CSRF + security headers apply to all API routes + all non-static pages.
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp|.*\\.mp4|.*\\.mov).*)',
  ],
}
