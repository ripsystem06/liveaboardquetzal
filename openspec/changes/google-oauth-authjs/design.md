# Design: Google OAuth via Auth.js v5

## Technical Approach

Full migration to Auth.js v5 (Approach A). Auth.js manages all sessions via JWT (httpOnly cookies), the Prisma adapter auto-links Google accounts by email, and the Credentials provider wraps existing scrypt for admin/password users. The custom HMAC cookie (`quetzal_session`) is retired; `getAuthUserId()` and `requireAdmin()` become thin adapters over Auth.js's `auth()`.

## Architecture Decisions

| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| Session strategy | JWT vs Database | **JWT** | Database sessions add latency per request; JWT is stateless. Auth.js v5 defaults to JWT with Prisma adapter |
| Auth.js config location | `auth.ts` vs `auth.config.ts` | **`lib/auth.config.ts`** | Separation of concerns: config (providers, adapter, callbacks) in one file; `auth()` re-export helper in `lib/auth.ts` |
| Admin detection | JWT `isAdmin` field vs DB lookup per request | **JWT `isAdmin` field** | `jwt` callback injects `isAdmin` + `phone` from DB on first sign-in; subsequent requests read from JWT, zero DB cost |
| Credentials provider | Wrap scrypt in `authorize()` vs remove password auth | **Wrap scrypt** | Preserves admin login and existing password users; scrypt functions unchanged |
| Middleware protection | Auth.js `auth` middleware vs custom | **Auth.js `auth` middleware** | `export { auth as middleware }` from `lib/auth.config.ts` with matcher `["/api/admin/:path*"]` — one line, built-in |
| Client-side auth state | `useSession()` + `useUser()` hybrid vs `useSession()` only | **`useSession()` for session, `useUser()` for UI convenience** | `useUser()` delegates to `useSession()` internally; `login()` calls `signIn('credentials')`; `register()` retains its own fetch flow |
| Booking step preservation | `callbackUrl` searchParams vs `sessionStorage` | **`callbackUrl` searchParams** | Auth.js built-in: `signIn('google', { callbackUrl: '/booking?step=2&cruise=X' })` survives the Google→callback round-trip |
| Test mocking | `vi.mock('next-auth/react')` vs e2e-only | **Module-level mock** | `vi.mock('@/lib/auth')` provides `auth()` returning a typed session; `vi.mock('next-auth/react')` stubs `useSession()` and `signIn()` |

## Data Flow

```
LoginForm (Google btn)           Auth.js Route Handler        Prisma Adapter
  │  signIn('google',              │                            │
  │   { callbackUrl })             │  /api/auth/callback        │
  ├─────────────────────────────►  │  /google                    ├── links Account to User
  │                                │                            │   (by email match)
  │  ◄── redirect Google OAuth ───│                            │
  │                                │                            │
  │  Google consent → callback ──► │  jwt callback              │
  │                                │   adds isAdmin, phone      │
  │                                │  session callback          │
  │                                │   shapes session.user      │
  │  ◄── redirect booking?step=2── │                            │

API Route (protected)              auth() call
  │                                │
  ├── const session = await auth()─┤ reads JWT from cookie
  │   if (!session) 401            │
  │   if (!session.user.isAdmin    │  ← requireAdmin()
  │      && admin route) 403       │
  │                                │
  └── business logic               │
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `lib/auth.config.ts` | **Create** | Auth.js NextAuth() config: Google + Credentials providers, Prisma adapter, JWT strategy, callbacks injecting `isAdmin`/`phone` |
| `app/api/auth/[...nextauth]/route.ts` | **Create** | Re-exports `{ GET, POST }` = handlers from `lib/auth.config.ts` |
| `prisma/schema.prisma` | Modify | `passwordHash String` → `String?`; add Account, Session, VerificationToken models per Auth.js Prisma adapter |
| `lib/auth.ts` | Modify | Remove `sign`, `verify`, `getAuthUserId`, `getSessionUser`, `SESSION_COOKIE`; keep `hashPassword`, `verifyPassword`, `AuthError`, `ForbiddenError`, `SessionUser`; add `auth()` re-export from `lib/auth.config.ts` |
| `lib/admin-auth.ts` | Modify | `requireAdmin()` → calls `auth()` from `lib/auth.config.ts`, checks `session.user.isAdmin` |
| `middleware.ts` | Modify | Add `export { auth as middleware } from '@/lib/auth.config'` above existing security middleware, with merged matcher |
| `app/layout.tsx` | Modify | Import `SessionProvider` from `next-auth/react`, wrap after `UserProvider` |
| `contexts/user-context.tsx` | Modify | `login()` → `signIn('credentials', { redirect: false })`; read session from `useSession()`; `logout()` → `signOut()`; remove `sessionStorage` mirror |
| `components/booking/login-form.tsx` | Modify | Add "Sign in with Google" button calling `signIn('google', { callbackUrl })` |
| `components/booking/booking-flow.tsx` | Modify | On OAuth return, read `searchParams.get('step')` to restore step after redirect |
| `app/admin/page.tsx` | Modify | Use `useSession()` instead of `useUser()` for admin check |
| `app/api/reservations/route.ts` | Modify | `getAuthUserId()` → `auth()` → `session.user.id` |
| 11 API route files | Modify | Replace `getAuthUserId()`/`requireAdmin()` with `auth()` calls |
| `app/api/auth/session/route.ts` | **Delete** | Replaced by Auth.js `[...nextauth]` route handler |
| `package.json` | Modify | Add `next-auth@beta`, `@auth/prisma-adapter` |
| `vitest-setup.ts` | Modify | Add `vi.mock('@/lib/auth')` and `vi.mock('next-auth/react')` with typed session defaults |

## Interfaces / Contracts

```typescript
// lib/auth.config.ts — Auth.js config
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth' // scrypt from existing auth.ts

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google,
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const user = await prisma.user.findUnique({ where: { email: String(credentials.email) } })
        if (!user?.passwordHash) return null
        const valid = await verifyPassword(String(credentials.password), user.passwordHash)
        return valid ? { id: user.id, name: user.name, email: user.email } : null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger }) {
      if (user) { token.id = user.id; /* fetch isAdmin + phone from DB on first sign-in */ }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.isAdmin = token.isAdmin as boolean
      session.user.phone = token.phone as string
      return session
    },
  },
})
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `requireAdmin()` with Auth.js session mock | `vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))` — test 401/403/200 paths |
| Unit | Credentials provider `authorize()` | Direct function test with mocked prisma and scrypt |
| Integration | Google sign-in button renders and calls `signIn('google')` | `vi.mock('next-auth/react')` — verify `signIn` called with correct params |
| Integration | Booking flow OAuth callback restores step | Render BookingFlow with `searchParams` → verify step 2 active |
| Integration | Protected API routes return 401/403 | Mock `auth()` per test; call route handler directly |
| E2E | N/A — no E2E framework configured (`testing.e2e.available: false`) |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Middleware delegates to Auth.js built-in protections (CSRF, signed cookies, OAuth state parameter).

## Migration / Rollout

1. **Prisma migration**: `passwordHash` becomes optional via `ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL`; Auth.js adapter models (Account, Session, VerificationToken) created by `npx prisma migrate dev`
2. **Env vars**: `AUTH_SECRET` (generated via `npx auth secret`), `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` in `.env.local`
3. **Session invalidation**: All `quetzal_session` cookies ignored post-deploy — users must re-authenticate. Accepted one-time logout.
4. **Rollback**: `git revert` + `prisma migrate dev --name rollback_oauth` restoring `passwordHash` as required

## Open Questions

- [ ] Exact Auth.js v5 beta version to pin (must be compatible with Next.js 16)
- [ ] `jwt` callback DB query for `isAdmin`/`phone` on every token refresh vs. only on `trigger === 'signIn'` — performance trade-off to benchmark
- [ ] Whether to keep `sessionStorage` mirror alongside `useSession()` for SSR hydration speed
