const MAX_ENTRIES = 10_000
const attempts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  ip: string,
  maxAttempts = 5,
  windowMs = 60_000,
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry || now > entry.resetTime) {
    // Prevent unbounded memory growth: evict oldest if at capacity
    if (attempts.size >= MAX_ENTRIES) {
      const firstKey = attempts.keys().next().value
      if (firstKey !== undefined) attempts.delete(firstKey)
    }
    attempts.set(ip, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) }
  }

  entry.count++
  return { allowed: true }
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of attempts) {
      if (now > entry.resetTime) attempts.delete(ip)
    }
  }, 5 * 60 * 1000)
}

export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}
