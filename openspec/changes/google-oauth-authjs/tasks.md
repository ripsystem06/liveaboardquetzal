# Tasks: Google OAuth via Auth.js v5

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 380–520 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Deps, schema, env | PR 1 | `npx vitest run` | `npx prisma migrate deploy` | `git revert` + rollback migration |
| 2 | Auth core: config, route handler, auth/admin refactor | PR 2 | `npx vitest run -- src/lib` | `curl /api/auth/signin` | Restore old auth.ts + session route |
| 3 | Client auth + API routes + middleware | PR 3 | `npx vitest run` (262 tests) | Google OAuth → booking step 2 | Restore old user-context + route handlers |
| 4 | Cleanup + final verification | PR 4 | `npx vitest run && npx tsc --noEmit` | `npx prisma migrate dev` zero drift | Revert PR 4 (non-destructive) |

## Phase 1: Dependencies & Schema

- [ ] 1.1 RED: test optional passwordHash + Auth.js adapter tables exist in Prisma schema
- [ ] 1.2 Add `next-auth@beta` + `@auth/prisma-adapter` to dependencies; `npm install`
- [ ] 1.3 Make `passwordHash` optional; add Account, Session, VerificationToken models per adapter spec
- [ ] 1.4 `npx prisma migrate dev --name oauth_authjs`; verify zero drift
- [ ] 1.5 Document `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` in env template
- [ ] 1.6 GREEN: schema tests pass after migration

## Phase 2: Auth Core

- [ ] 2.1 RED: test `auth()` returns session(id,email,isAdmin); null without cookie
- [ ] 2.2 RED: test `requireAdmin()` 401/403/200 paths via mocked `auth()`
- [ ] 2.3 RED: test credentials `authorize()` verifies scrypt → user or null
- [ ] 2.4 Create `lib/auth.config.ts`: Google+Credentials providers, PrismaAdapter, JWT callbacks
- [ ] 2.5 Create `app/api/auth/[...nextauth]/route.ts` exporting GET/POST handlers
- [ ] 2.6 Refactor `lib/auth.ts`: remove sign/verify/getAuthUserId/getSessionUser/SESSION_COOKIE; keep scrypt+errors; re-export `auth()`
- [ ] 2.7 Refactor `lib/admin-auth.ts`: call `auth()`, check `session.user.isAdmin`
- [ ] 2.8 GREEN: all RED tests pass

## Phase 3: Client Auth & UI

- [ ] 3.1 RED: Google button renders + calls `signIn('google',{callbackUrl})`
- [ ] 3.2 RED: booking flow reads `searchParams.step` after OAuth callback
- [ ] 3.3 Add `SessionProvider` in `app/layout.tsx`, wrap inside `UserProvider`
- [ ] 3.4 Refactor `contexts/user-context.tsx`: login→signIn, logout→signOut, useSession(); drop sessionStorage
- [ ] 3.5 Add Google sign-in button in `components/booking/login-form.tsx`
- [ ] 3.6 Update `components/booking/booking-flow.tsx` to restore step from searchParams
- [ ] 3.7 Update `app/admin/page.tsx` to use `useSession()` for admin guard
- [ ] 3.8 GREEN: client auth tests pass

## Phase 4: API Routes & Middleware

- [ ] 4.1 RED: unauthenticated route returns 401 via mocked `auth()=null`
- [ ] 4.2 RED: non-admin on admin route returns 403 via mocked `auth()` (isAdmin=false)
- [ ] 4.3 Replace `getAuthUserId()`/`requireAdmin()` with `auth()` in all 15 API route files
- [ ] 4.4 Add `export { auth as middleware }` in `middleware.ts`; matcher includes `/api/admin/*`
- [ ] 4.5 GREEN: route guard tests pass
- [ ] 4.6 `npx vitest run` — full 262 tests green

## Phase 5: Cleanup

- [ ] 5.1 Delete `app/api/auth/session/route.ts`
- [ ] 5.2 Verify zero references to sign/verify/getAuthUserId/getSessionUser/SESSION_COOKIE
- [ ] 5.3 `npx prisma migrate dev` zero drift; `npx tsc --noEmit` clean
