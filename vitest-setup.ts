import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Global Auth.js v5 mock — prevents cascading next-auth imports in tests
// that mock @/lib/auth with importOriginal. Without this, any module loading
// @/lib/auth triggers @/lib/auth.config → next-auth → headers() → crash.
// Test files that need real auth() behavior must unmock via vi.unmock().
// ---------------------------------------------------------------------------
vi.mock('@/lib/auth.config', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: 'mock-user', name: 'Mock', email: 'mock@test.com', isAdmin: false, phone: '' },
  }),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Global next-auth/react mock — provides useSession, signIn, signOut
// for all client-side component tests. Tests needing specific behavior
// should import and configure the mock per-test via vi.mocked().
// ---------------------------------------------------------------------------
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated' as const,
    update: vi.fn(),
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock IntersectionObserver (not available in jsdom)
class MockIntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  constructor(private callback: IntersectionObserverCallback) {}
  observe() { this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver) }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// Mock fetch globally for the OTP request endpoint.
// POST /api/auth/otp/request always returns 200 { ok: true } (no-enumeration).
// Client tests that need richer behavior stub their own fetch.
vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
  if (url === '/api/auth/otp/request' && init?.method === 'POST') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    })
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ ok: true }),
  })
}))
