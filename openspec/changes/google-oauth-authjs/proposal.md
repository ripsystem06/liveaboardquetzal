# Proposal: Google OAuth via Auth.js v5

## Intent

Replace the custom HMAC-SHA256 + scrypt auth system with Auth.js v5. Add Google OAuth as the primary login method while retaining credentials login as a fallback for admin and existing users.

## Scope

### In Scope
- Auth.js v5 setup with Google OAuth provider and Credentials provider
- Prisma adapter: Account, Session, VerificationToken tables
- `passwordHash` → optional in Prisma schema + migration
- `getAuthUserId()` → `auth()` from `next-auth`; `requireAdmin()` → JWT-based check
- SessionProvider wrapper in root layout; Auth.js middleware for `/api/admin/*`
- "Sign in with Google" button in LoginForm; booking flow OAuth redirect via `callbackUrl`
- Existing email-matching accounts auto-linked via Prisma adapter

### Out of Scope
- Multi-provider OAuth beyond Google (GitHub, Apple, etc.)
- Magic-link or passwordless email auth
- RBAC or role tables (isAdmin boolean stays)
- Replacing in-memory rate limiter with external service
- Standalone `/login` page (auth remains embedded in booking flow)
- Prisma adapter email verification (emailVerified left as optional)

## Capabilities

### New Capabilities
- `auth`: Authentication, session management, and authorization guards via Auth.js v5 (JWT sessions, Google OAuth provider, Credentials provider, Prisma adapter)

### Modified Capabilities
- None — existing admin behavior (401/403 distinction, audit logging, reservation safety) remains contractually unchanged

## Approach

**Approach A from exploration**: Full migration to Auth.js v5. Auth.js manages sessions via JWT and cookies. The Prisma adapter handles Account linking. `isAdmin` injected into the JWT via the `jwt` callback. Booking flow preserves step state through Auth.js `callbackUrl` searchParams. Credentials provider wraps existing scrypt verification so admin/password users continue working.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modified | User.passwordHash → optional; new Account/Session/VerificationToken models |
| `lib/auth.ts` | Modified | Retire HMAC sign/verify; keep scrypt for credentials provider; add `auth()` wrapper |
| `lib/admin-auth.ts` | Modified | Read isAdmin from Auth.js JWT instead of custom cookie |
| `app/api/auth/[...nextauth]/` | New | Auth.js route handler (replaces `app/api/auth/session/`) |
| `app/layout.tsx` | Modified | Wrap with SessionProvider |
| `middleware.ts` | Modified | Add Auth.js middleware for admin route protection |
| `contexts/user-context.tsx` | Modified | login() → signIn(); sessionReady → useSession() |
| `components/booking/login-form.tsx` | Modified | Add Google sign-in button |
| `components/booking/booking-flow.tsx` | Modified | Preserve booking step through OAuth redirect |
| 11 API route files | Modified | Replace getAuthUserId()/requireAdmin() with auth() |
| `package.json` | Modified | Add next-auth@beta, @auth/prisma-adapter |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| OAuth redirect loses booking step state | Medium | Persist step in callbackUrl searchParams; e2e test |
| Admin Google email mismatch → lockout | Low | Migration script matches admin by email; credentials fallback |
| Auth.js v5 beta API breaks on upgrade | Medium | Pin exact beta version; lockfile; CI pins version |
| All sessions invalidated on deploy | High | Accept one-time logout; communicate in changelog |
| 25+ test files break from auth mock change | High | Jest/Vitest mock for `next-auth`; update per-route test setup |

## Rollback Plan

1. Revert the Prisma migration (`prisma migrate dev --name rollback_oauth` restoring passwordHash as required)
2. Revert `package.json` to remove next-auth dependencies
3. `git revert` the merge commit — custom HMAC auth is fully self-contained in `lib/auth.ts` and `app/api/auth/session/route.ts`
4. Run full test suite to confirm custom auth works

## Dependencies

- `next-auth@5.0.0-beta.x` (pin specific beta version)
- `@auth/prisma-adapter` (latest)
- Google Cloud Console: OAuth 2.0 credentials (Client ID + Secret) in `.env.local`
- `AUTH_SECRET` env var (`npx auth secret` or `openssl rand -base64 32`)

## Success Criteria

- [ ] Google OAuth sign-in completes and redirects to booking step 2 with session active
- [ ] Credentials login (admin + existing users) still works
- [ ] `requireAdmin()` returns 401 for no session, 403 for non-admin
- [ ] All 19 protected route handlers pass auth checks via Auth.js
- [ ] Full test suite passes (262 tests) with Auth.js mocks
- [ ] `npx prisma migrate dev` produces zero drift after migration
- [ ] Booking flow survives OAuth redirect round-trip (step 1 → Google → step 2)
