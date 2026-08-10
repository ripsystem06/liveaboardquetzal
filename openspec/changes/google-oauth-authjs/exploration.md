# Exploration: Google OAuth via Auth.js v5 — Current Auth System Analysis

## Change: `google-oauth-authjs`

---

## Current State

### Auth Architecture

The Quetzal app uses a **custom HMAC-SHA256 cookie + scrypt password hashing** authentication system. There is no JWT, no third-party auth library, and no OAuth integration. Auth is checked per-route in API handlers, not at the middleware level.

### Authentication Flow

```
Client (browser)                         Server (Next.js API)
─────────────────                        ──────────────────────
LoginForm/RegisterForm                    POST /api/auth/session
  │                                        │
  ├─ useUser().login(email, pass) ────────► ├─ Validates credentials
  │  or useUser().register(name, ...)       │  ├─ Login: checks DB (email → scrypt verify)
  │                                         │  ├─ Register: creates User row
  │                                         │  ├─ Signs HMAC cookie: sign(JSON.stringify(user))
  │                                         │  └─ Sets quetzal_session cookie (httpOnly, 7-day expiry)
  │◄───────── { ok: true, user } ────────   │
  │                                         │
  ├─ Stores user in sessionStorage          │
  └─ Sets React state via UserProvider      │

Subsequent API calls:
  │                                         │
  ├─ GET /api/reservations ───────────────► │
  │  (browser sends quetzal_session cookie) │
  │                                         ├─ getAuthUserId()
  │                                         │  └─ cookies().get('quetzal_session')
  │                                         │     → verify(cookie) → parse JSON → return user.id
  │                                         └─ Proceed with reservation logic
  │◄────────── { reservations: [...] } ──── │
```

### Core Auth Files (Complete Inventory)

| File | Role | Lines | Callers / Dependents |
|------|------|-------|---------------------|
| `lib/auth.ts` | HMAC sign/verify, scrypt hash/verify, session extraction, error classes | 152 | 9 callers of `getAuthUserId`, 2 of `getSessionUser` |
| `lib/admin-auth.ts` | `requireAdmin()` guard for admin API routes | 12 | 7 admin route files (22 callers total) |
| `app/api/auth/session/route.ts` | Single POST (login+register) and DELETE (logout) endpoint | 115 | LoginForm, RegisterForm, UserProvider |
| `middleware.ts` | Security headers only (NO auth checks) | 24 | App-wide (via matcher config) |
| `contexts/user-context.tsx` | Client-side auth state: `useUser()` hook, `UserProvider` | 115 | 25 callers across the app |
| `hooks/use-user-storage.ts` | Generic localStorage hook (not auth-critical) | 36 | 1 caller |
| `lib/rate-limit.ts` | In-memory per-IP rate limiter | 38 | Auth session + reservation routes |
| `lib/__tests__/auth.test.ts` | Unit tests for sign/verify/hash/verifyPassword | 105 | N/A |
| `lib/__tests__/admin-auth.test.ts` | Unit tests for requireAdmin | 99 | N/A |
| `contexts/user-context.test.tsx` | Integration tests for UserContext | — | N/A |
| `components/booking/login-form.test.tsx` | Component tests for LoginForm | — | N/A |
| `components/booking/register-form.test.tsx` | Component tests for RegisterForm | — | N/A |

### User Model (Prisma)

```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  passwordHash String        // scrypt: "salt_hex:hash_hex"
  name         String
  phone        String        @default("")
  isAdmin      Boolean       @default(false)
  reservations Reservation[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

**Key observations for OAuth:**
- `passwordHash` is **required** in the schema — OAuth users will need a nullable password or a separate account model
- `isAdmin` is a boolean on the User model — no role table, no RBAC
- Email is the unique identifier — OAuth email matching with existing accounts will need explicit handling

### Session Mechanism

- **Cookie name**: `quetzal_session`
- **Format**: `base64url(JSON.stringify(user)).base64url(HMAC-SHA256(payload))`
- **Cookie settings**: `httpOnly: true`, `secure: production`, `sameSite: lax`, `path: /`, `maxAge: 7 days`
- **Client-side mirror**: `sessionStorage.getItem('quetzal_user')` stores the same user JSON (for UI reactivity)
- **Server-side read**: `cookies().get('quetzal_session')` → `verify()` → `JSON.parse()` → returns user object

### All Protected Routes

**User-own resource routes** (call `getAuthUserId()` + ownership check):
- `GET /api/reservations` — List user's reservations
- `POST /api/reservations` — Create reservation (with rate limiting)
- `GET /api/reservations/[id]` — Get single reservation (ownership gate)
- `GET /api/reservations/[id]/pdf` — Download PDF receipt (ownership gate)
- `POST /api/reservations/[id]/confirm` — Mock payment confirmation (ownership gate)

**Admin routes** (call `requireAdmin()` → `getSessionUser()` → checks `isAdmin`):
- `GET /api/admin/dashboard` — Revenue stats, pending count
- `GET /api/admin/reservations` — List all reservations (with filters)
- `GET /api/admin/reservations/[id]` — Reservation detail
- `PATCH /api/admin/reservations/[id]` — Update reservation status
- `GET /api/admin/cruises` — List all cruises
- `POST /api/admin/cruises` — Create cruise
- `GET /api/admin/cruises/[id]` — Get single cruise
- `PATCH /api/admin/cruises/[id]` — Update cruise
- `DELETE /api/admin/cruises/[id]` — Delete cruise
- `GET /api/admin/blog` — List all blog posts
- `POST /api/admin/blog` — Create blog post (FIFO cap of 5)
- `GET /api/admin/blog/[id]` — Get single post
- `PATCH /api/admin/blog/[id]` — Update post
- `DELETE /api/admin/blog/[id]` — Delete post

**Client-side protected page:**
- `app/admin/page.tsx` — Checks `useUser().isAuthenticated` + `useUser().isAdmin`, redirects accordingly

### Login/Register UI Pages

There are **no standalone login/register pages**. Auth is embedded in the booking flow:

1. **`app/booking/page.tsx`** — Server component, renders `BookingPageClient`
2. **`components/booking/booking-page-client.tsx`** — Client component, manages `BookingFlow`
3. **`components/booking/booking-flow.tsx`** — Step 1 = Login/Register tab (pill toggle), Step 2 = Cruise selection, Step 3 = Payment
4. **`components/booking/login-form.tsx`** — Email + password login form
5. **`components/booking/register-form.tsx`** — Name + email + password + confirm form

The booking is the **only entry point** for login and registration. Users cannot log in outside the booking flow.

### Admin Panel Auth

1. Admin logs in through the **same** `POST /api/auth/session` endpoint with `admin@quetzal.com` credentials
2. The `isAdmin` field in the User model determines admin status
3. `app/admin/page.tsx` client-side gate: `useUser().isAdmin`
4. Every `/api/admin/*` route calls `requireAdmin()` which reads the session cookie and checks `isAdmin: true`
5. Admin logout is via `AdminLayout` component's `logout()` button

### Error Handling Pattern

All API routes use a consistent try/catch pattern:
```typescript
try {
  await requireAdmin() // or getAuthUserId()
  // ... business logic
} catch (error) {
  if (error instanceof ForbiddenError) {
    return Response.json({ error: error.message }, { status: 403 })
  }
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: 401 })
  }
  console.error('...', error)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}
```

### Rate Limiting

- In-memory `Map<ip, {count, resetTime}>` — **not shared across instances**
- Default auth window: 5 attempts / 60 seconds
- Default reservation window: 20 requests / 60 seconds
- Cleans stale entries every 5 minutes

---

## Affected Areas

### Files to Modify (Directly)

| File | Why affected | Impact |
|------|-------------|--------|
| `lib/auth.ts` | Sessions will be managed by Auth.js, HMAC sign/verify becomes obsolete for OAuth users. `getAuthUserId()` and `getSessionUser()` need to read from Auth.js session instead. | **HIGH** — Core session logic changes |
| `app/api/auth/session/route.ts` | Auth.js takes over the `[...nextauth]` route. Current POST/DELETE endpoints replaced or co-exist. | **HIGH** — Route handler replaced |
| `prisma/schema.prisma` | User model needs OAuth fields (accounts relation, emailVerified, image). `passwordHash` must become optional. | **HIGH** — Schema migration required |
| `contexts/user-context.tsx` | `login()` and `register()` functions must support OAuth flow via `signIn('google')`. `sessionReady` logic changes. | **HIGH** — Client auth state adapter |
| `lib/admin-auth.ts` | `requireAdmin()` reads from Auth.js session instead of custom cookie. | **MEDIUM** — Session source changes |
| `middleware.ts` | Auth.js middleware or a custom one for route protection (currently none exists for auth). | **MEDIUM** — New auth middleware |
| `components/booking/login-form.tsx` | Add "Sign in with Google" button alongside email/password. | **MEDIUM** — UI addition |
| `components/booking/register-form.tsx` | May need adjustment for OAuth-only registration flow. | **LOW-MEDIUM** — UI adjustment |
| `components/booking/booking-flow.tsx` | Step 1 needs to handle OAuth callback redirect back to booking step 2. | **MEDIUM** — Flow state management |
| `app/admin/page.tsx` | Client-side admin check adapts to Auth.js session shape. | **LOW** — Session API adapter |
| `app/layout.tsx` | May need `SessionProvider` wrapper from Auth.js. | **MEDIUM** — Provider hierarchy |
| `package.json` | Add `next-auth@beta` and `@auth/prisma-adapter`. | **LOW** — Dependency addition |

### Files Affected by getAuthUserId/requireAdmin Replacement

Every API route calling these functions will need the import path and function call updated to use Auth.js's session:

- `app/api/reservations/route.ts` — 2 calls to `getAuthUserId`
- `app/api/reservations/[id]/route.ts` — 1 call
- `app/api/reservations/[id]/pdf/route.ts` — 1 call
- `app/api/reservations/[id]/confirm/route.ts` — 1 call
- `app/api/admin/dashboard/route.ts` — 1 call to `requireAdmin`
- `app/api/admin/reservations/route.ts` — 1 call
- `app/api/admin/reservations/[id]/route.ts` — 2 calls
- `app/api/admin/cruises/route.ts` — 2 calls
- `app/api/admin/cruises/[id]/route.ts` — 3 calls
- `app/api/admin/blog/route.ts` — 2 calls
- `app/api/admin/blog/[id]/route.ts` — 3 calls

### Files to Keep but Adapt

| File | Role after Auth.js |
|------|-------------------|
| `lib/auth.ts` | HMAC functions (`sign`, `verify`) may be retired if fully migrating. `hashPassword`/`verifyPassword` preserved for credential auth. |
| `lib/rate-limit.ts` | Unchanged — still used by reservation APIs |
| `lib/__tests__/auth.test.ts` | Tests for HMAC and scrypt functions — keep for credential auth, add Auth.js tests |
| `lib/__tests__/admin-auth.test.ts` | Update to mock Auth.js session |

---

## Approaches

### Approach A: Full Migration to Auth.js v5 (Recommended)

Replace the entire custom auth system with Auth.js v5. Use the Prisma adapter, Google OAuth provider, and optionally keep credentials as a secondary provider.

- **Pros**:
  - Industry-standard OAuth implementation (Google, GitHub, etc. out of the box)
  - Session management handled by Auth.js (JWT or database sessions)
  - CSRF protection, callback handling, and token refresh built-in
  - Prisma adapter auto-creates Account/Session/VerificationToken tables
  - Middleware-based route protection available
  - TypeScript types for session user out of the box
  - Callbacks for customizing session/jwt payload (`isAdmin`, `phone`)

- **Cons**:
  - Schema migration required (passwordHash → optional, new Account/Session tables)
  - All existing login tests need significant updates
  - Booking flow state management needs rework for OAuth redirect flow
  - Learning curve for Auth.js v5 (beta API, documentation evolving)
  - Rate limiting on auth endpoints must be handled separately (Auth.js doesn't include it)

- **Effort**: Medium-High (3-5 days)

### Approach B: Hybrid — Add OAuth Alongside Existing Auth

Keep the custom email/password auth intact. Add Google OAuth via Auth.js as a **parallel path**. The session mechanism would need unification.

- **Pros**:
  - Less risk — existing email/password login continues working
  - Gradual migration path
  - Can test OAuth in production without breaking existing users

- **Cons**:
  - Two session mechanisms to maintain (Auth.js JWT + custom HMAC cookie)
  - Complex session unification logic
  - Twice the auth code to test and maintain
  - User identity merging (same email from OAuth and password auth)
  - Architectural debt

- **Effort**: High (4-7 days) — more complex than full migration

### Approach C: Minimal — Google OAuth Only, Drop Password Auth

Strip out the entire custom password auth system. Only Google OAuth via Auth.js. Remove `LoginForm`, `RegisterForm`, password fields from DB.

- **Pros**:
  - Simplest codebase — single auth mechanism
  - No password management, no scrypt, no credential security concerns
  - Cleanest architecture

- **Cons**:
  - Locks out users without Google accounts
  - Admin login requires Google account
  - All existing test users become inaccessible
  - Business risk if Google OAuth is down
  - Migration path for existing DB users needed

- **Effort**: Medium (2-3 days)

---

## Recommendation

**Approach A: Full Migration to Auth.js v5**, keeping the credentials provider as a fallback. This is the most maintainable path long-term. The hybrid approach (B) creates more complexity than it solves, and the Google-only approach (C) introduces unacceptable business risk.

### Key Design Decisions Needed

1. **Password hash nullable**: `passwordHash` field must become optional in Prisma. OAuth users won't have one.
2. **Admin detection**: Use `isAdmin` field from User model, injected into the JWT via Auth.js `jwt` callback.
3. **Booking flow OAuth redirect**: After Google sign-in callback, redirect back to `/booking` with step 2 active. Use Auth.js `redirect` callback or a `callbackUrl` parameter.
4. **Session unification**: Auth.js JWT becomes the single session source. Replace `getAuthUserId()` with `auth()` from `next-auth`. The client `sessionStorage` mirror persists for UI reactivity.
5. **Existing user migration**: Users with passwordHash but no linked Google account can still log in with credentials. Users who sign in with Google and have a matching email get their account linked via the adapter.

---

## Risks

- **OAuth redirect breaks booking flow**: The booking flow is a multi-step state machine (step 1 → 2 → 3). OAuth redirect to Google and back could lose the step state. Must persist booking state in `searchParams` or `sessionStorage`.
- **Admin access after migration**: Admin users must be identifiable via Google email. If the admin's Google email doesn't match their DB email, they lose access. A migration script to link admin accounts is needed.
- **Rate limiting gap**: Auth.js v5 doesn't include rate limiting. The existing in-memory rate limiter won't work for OAuth endpoints. Must add middleware-level rate limiting or use an external service.
- **Schema migration in production**: Making `passwordHash` optional requires a migration. If the app has real users, this needs careful planning (non-null → optional with default, then remove default).
- **Session cookie name change**: Auth.js uses different cookie names. Existing sessions will be invalidated on deploy — all users will be logged out.
- **Test suite impact**: 25+ test files reference `useUser()` or auth functions directly. Auth.js session mocking in tests requires setting up `next-auth` mocks.
- **Auth.js v5 beta stability**: Auth.js v5 is still in beta (`next-auth@5.0.0-beta.x`). API may change, documentation is incomplete. Need to pin a specific version.

---

## Ready for Proposal

**Yes** — the exploration provides enough detail to proceed with `sdd-propose`. The orchestrator should present the three approaches to the user and confirm the recommendation (Approach A) before proceeding.

---

## Key Learnings

1. The Quetzal auth system is a fully custom HMAC-SHA256 cookie implementation without any third-party library — migrating to Auth.js requires touching every API route that calls `getAuthUserId()` or `requireAdmin()` (19 route handlers across 10 files).
2. The booking flow embeds auth as Step 1 in a multi-step state machine — OAuth's redirect-based flow will break this unless the booking state is persisted across the Google callback redirect.
3. The `passwordHash` field is required in the Prisma schema — making it optional requires a database migration and careful handling of the Admin user who currently uses password auth.
4. The middleware currently only sets security headers and does no auth checks — this simplifies the Auth.js middleware integration since there's no existing auth middleware to conflict with.
5. The in-memory rate limiter won't survive serverless deployments and doesn't cover Auth.js OAuth endpoints — a production-grade rate limiting solution needs to be part of the design.
