import { prisma } from './db'

/**
 * DB-backed rate limiter. Each key maps to a RateLimit row with a reset
 * timestamp; the count is incremented per attempt and reset when the window
 * elapses. Shared across instances (unlike an in-memory Map), so limits hold
 * in multi-replica deployments.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60_000,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const now = new Date()

  const existing = await prisma.rateLimit.findUnique({ where: { key } })

  if (!existing || existing.resetAt < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
      update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
    })
    return { allowed: true }
  }

  if (existing.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfter: Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000),
    }
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  })
  return { allowed: true }
}

export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

/**
 * Removes rate-limit rows whose window has elapsed. Called on a schedule or
 * opportunistically to keep the table small.
 */
export async function cleanupExpiredRateLimits(): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } })
}
