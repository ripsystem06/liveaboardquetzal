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

// In-memory mock user DB for tests
const mockUsers = new Map<string, { id: string; name: string; email: string; phone: string; isAdmin: boolean; passwordHash: string }>()

// Pre-seed the demo user so existing tests pass
mockUsers.set('demo@quetzal.com', {
  id: '1',
  name: 'Demo User',
  email: 'demo@quetzal.com',
  phone: '+1 555 0100',
  isAdmin: false,
  passwordHash: 'mock-hash', // the mock fetch doesn't actually verify the hash
})

// Mock fetch globally for registration and auth calls.
// Simulates the server's POST /api/auth/register behavior:
// - Admin login: verified against the mock credentials
// - Register: creates user in mock DB, returns 409 for duplicates
// - Rate limit is NOT simulated in tests (not needed for client-side tests)
vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
  if (url === '/api/auth/register' && init?.method === 'POST') {
    try {
      const body = JSON.parse(init.body as string)
      const { email, password, name } = body

      // Admin login
      if (email === 'admin@quetzal.com' && password === 'admin123') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ok: true,
            user: { id: 'admin', name: 'Admin', email: 'admin@quetzal.com', phone: '', isAdmin: true },
          }),
        })
      }

      // Register mode (name present)
      if (name) {
        // Admin email can't register
        if (email === 'admin@quetzal.com') {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Cannot register as admin' }),
          })
        }

        // Check if email already exists
        if (mockUsers.has(email)) {
          return Promise.resolve({
            ok: false,
            status: 409,
            json: () => Promise.resolve({ error: 'Email already registered' }),
          })
        }

        // Create new user in mock DB
        const id = `user-${Buffer.from(email).toString('base64').slice(0, 8)}`
        const newUser = { id, name, email, phone: '', isAdmin: false, passwordHash: 'mock-hash' }
        mockUsers.set(email, newUser)

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            ok: true,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, isAdmin: newUser.isAdmin },
          }),
        })
      }

      // Login mode (no name) — look up in mock DB
      const mockUser = mockUsers.get(email)
      if (!mockUser) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Invalid credentials' }),
        })
      }

      // In real server, verifyPassword would run here. For tests, accept any password
      // that isn't explicitly wrong (the test provides 'wrongpassword' to trigger false)
      if (password === 'wrongpassword') {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: 'Invalid credentials' }),
        })
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ok: true,
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            phone: mockUser.phone,
            isAdmin: mockUser.isAdmin,
          },
        }),
      })
    } catch {
      // Malformed body — return error
      return Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Body required' }),
      })
    }
  }

  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ ok: true }),
  })
}))
