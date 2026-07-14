import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit } from '../rate-limit'

// The rate-limiter module uses a module-level Map and a setInterval.
// We need to work with its internal state carefully.
// checkRateLimit is a pure function wrt the Map, but we need to reset between tests.

describe('checkRateLimit', () => {
  // We access the module-level Map by using the same IP prefix to scope tests
  // and test the behavior functionally.

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function makeIP(prefix: string) {
    return `${prefix}.0.0.1`
  }

  it('allows first 5 attempts', () => {
    const ip = makeIP('10')
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(ip, 5, 60_000)
      expect(result.allowed).toBe(true)
    }
  })

  it('blocks 6th attempt within window', () => {
    const ip = makeIP('11')
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip, 5, 60_000)
    }
    const result = checkRateLimit(ip, 5, 60_000)
    expect(result.allowed).toBe(false)
  })

  it('returns retryAfter in seconds', () => {
    const ip = makeIP('12')
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip, 5, 60_000)
    }
    const result = checkRateLimit(ip, 5, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
    expect(result.retryAfter).toBeLessThanOrEqual(60)
  })

  it('resets after window expires', () => {
    const ip = makeIP('13')
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip, 5, 60_000)
    }
    // 6th should be blocked
    expect(checkRateLimit(ip, 5, 60_000).allowed).toBe(false)

    // Advance time past the window
    vi.advanceTimersByTime(61_000)

    // Now it should be allowed again
    const result = checkRateLimit(ip, 5, 60_000)
    expect(result.allowed).toBe(true)
  })

  it('different IPs are tracked separately', () => {
    const ip1 = makeIP('14')
    const ip2 = makeIP('15')

    // Exhaust ip1
    for (let i = 0; i < 5; i++) {
      checkRateLimit(ip1, 5, 60_000)
    }
    expect(checkRateLimit(ip1, 5, 60_000).allowed).toBe(false)

    // ip2 should still be allowed
    expect(checkRateLimit(ip2, 5, 60_000).allowed).toBe(true)
  })
})
