# Exploration: Passwordless Email + OTP Login (auth-email-otp)

## Change: `auth-email-otp`

Goal: make email + 6-digit OTP the **primary** login method, **keep** Google OAuth as a social option, and **remove** the email/password (Credentials) login entirely. This document is read-only exploration; no source files were modified.

---

## Current State

The Quetzal app already migrated to **Auth.js v5** (`next-auth@^5.0.0-beta.32`, `@auth/prisma-adapter`) with **JWT session strategy**. Auth is embedded in the booking flow (Step 1), not standalone pages.

### Providers today (`lib/auth.config.ts`, lines 9–104)

```
NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [ Google, Credentials({ ... authorize }) ],
  callbacks: { jwt, session },
  pages: { signIn: '/booking' },
})
```

- **Google** (line 13) — OAuth, kept as-is.
- **Credentials** (lines 14–103) — `email` + `password` fields; `authorize` does:
  1. Rate limit `login:{ip}` 5/min (line 27) → logs `auth.login_rate_limited`.
  2. `prisma.user.findUnique({ where: { email } })` (line 42).
  3. Rejects if no `user.passwordHash` (line 43) → logs `auth.login_failed` reason `user_not_found`.
  4. Account lockout: counts `auth.login_failed` rows in last 15 min; ≥5 → logs `auth.login_locked_out` (lines 57–80).
  5. `verifyPassword(password, user.passwordHash)` (line 82) → logs `auth.login_failed` reason `wrong_password`.
  6. Returns `{ id, name, email }` on success.
- **`jwt` callback** (lines 106–127): on sign-in and on `trigger === 'update'`, loads `isAdmin` + `phone` from DB into `token`.
- **`session` callback** (lines 128–135): exposes `id`, `isAdmin`, `phone` on `session.user`.

### `lib/auth.ts` (post-Auth.js, 59 lines)

- Line 7: re-exports `auth` from `@/lib/auth.config`.
- `hashPassword`/`verifyPassword` (lines 21–45): scrypt with random 16-byte salt, `"salt_hex:hash_hex"` storage, **timing-safe** comparison (`timingSafeEqual`).
- `AuthError` (401) / `ForbiddenError` (403) classes (lines 47–58).

### Registration (`app/api/auth/register/route.ts`, 93 lines)

- CSRF same-origin check (lines 14–27), rate limit via `checkRateLimit(ip)` (lines 30–37).
- Validates `SessionBodySchema` (line 41).
- Creates `User` with `{ email, passwordHash, name, phone: '' }` (lines 67–70).
- Sends welcome email (line 72), logs `user.registered` (line 75).
- Login/register are not auto-signed-in here; the client calls `signIn('credentials')` afterwards.

### Validations (`lib/validations.ts`, lines 55–63)

`SessionBodySchema` requires `email` + `password` (min 12 chars, uppercase/lowercase/digit) + optional `name`. This is the only consumer of the password policy.

### Email (`lib/email.ts`, 155 lines)

- `Resend` client with **mock fallback** when `RESEND_API_KEY` absent (lines 30–46).
- `sendWelcomeEmail` (lines 137–155) exists; `FROM_EMAIL` env used, defaults to `reservations@quetzal.com`.
- No OTP-sending function yet.

### Client auth state (`contexts/user-context.tsx`, 111 lines)

- Uses `useSession` from `next-auth/react`.
- `register(name, email, password)` (lines 42–66): POSTs to `/api/auth/register`, then `nextAuthSignIn('credentials', { email, password })`.
- `login(email, password)` (lines 68–76): `nextAuthSignIn('credentials', { email, password, redirect:false })`.

### UI (booking flow, Step 1)

- `components/booking/booking-flow.tsx` lines 182–214: pill tabs `login`/`register` (`authTab` state, line 53) render `LoginForm` or `RegisterForm`.
- `components/booking/login-form.tsx` (144 lines): Google button (lines 72–87) + email/password form (lines 98–141). `handleSubmit` → `useUser().login(email, password)` (line 32).
- `components/booking/register-form.tsx` (141 lines): name + email + password + confirm form → `useUser().register(...)` (line 44).
- i18n keys for all login/register labels in `contexts/language-context.tsx` (English ~lines 479–494, Spanish ~lines 1182–1197).

### Reusable infra

- `lib/rate-limit.ts`: `checkRateLimit(ip, max, window)`, `getClientIP(request)` (lines 4–46). In-memory Map, 10k cap, 5-min cleanup.
- `AuditLog` model + existing auth actions: `auth.login_failed`, `auth.login_locked_out`, `auth.login_rate_limited`, `user.registered`.

### Prisma schema (`prisma/schema.prisma`)

- `User` (lines 63–77): `passwordHash String?`, `emailVerified DateTime?`, `image String?`, `isAdmin Boolean @default(false)`, relations `accounts`, `sessions`, `reservations`.
- `VerificationToken` (lines 106–112): `identifier` + `token` + `expires`, `@@unique([identifier, token])`. **No** attempts or consumed flag — designed for magic-link/single-use tokens.
- `AuditLog` (lines 114–127): `action`, `entityType`, `entityId`, `actorId?`, `actorEmail?`, `details?`, `createdAt`.

---

## Affected Areas

### Files to modify directly

| File | Why affected | Impact |
|------|-------------|--------|
| `lib/auth.config.ts` | Replace Credentials `authorize` (password) with OTP verification; keep Google. Rename `password` field → `otp` (lines 14–103). | **HIGH** |
| `app/api/auth/otp/request/route.ts` (new) | Issue + email a 6-digit code. | **HIGH** |
| `app/api/auth/register/route.ts` | No longer stores passwords; registration folds into first OTP login OR keeps name capture. Password fields removed. | **MED-HIGH** |
| `lib/validations.ts` | `SessionBodySchema` password rules removed/repurposed; add `email` + `otp` schema (lines 55–63). | **MED** |
| `lib/email.ts` | Add `sendOtpEmail(email, code)` reusing the Resend/mock client (mirror `sendWelcomeEmail`). | **LOW-MED** |
| `contexts/user-context.tsx` | `login`/`register` signatures change from `(email, password)` to an OTP flow (request code → verify code → `signIn`). | **MED** |
| `components/booking/login-form.tsx` | Remove password input; two-phase UI: enter email → "send code" → enter 6-digit OTP → submit. Keep Google. | **MED** |
| `components/booking/register-form.tsx` | Passwordless; becomes name+email capture that triggers an OTP, or is folded into login. | **MED** |
| `lib/rate-limit.ts` | Reused (no change needed, but OTP request/verify endpoints must call it). | **LOW** |
| `contexts/language-context.tsx` | Add/remove i18n keys for OTP labels (EN ~479–494, ES ~1182–1197). | **LOW** |

### Tests directly affected

| File | Why affected |
|------|-------------|
| `lib/__tests__/credentials-authorize.test.ts` | Asserts Credentials provider exports; authorize behavior changes. |
| `lib/__tests__/auth.test.ts` | Tests `hashPassword`/`verifyPassword` (lines 20–45) — decide whether scrypt helpers are kept/repurposed for OTP hashing. |
| `lib/__tests__/auth-schema.test.ts` | Asserts `User.passwordHash` optional + Account/Session/VerificationToken exist (lines 7–33). Schema change (new `OtpCode` model) needs coverage. |
| `lib/__tests__/auth-config.test.ts` | `auth()` re-export / session shape (lines 15–67). |
| `lib/__tests__/admin-auth.test.ts` | `requireAdmin` session shape (lines 44–108). Unaffected by provider swap but touched by any session-shape change. |
| `components/booking/login-form.test.tsx` | Asserts Google `signIn('google')` + password form submit (lines 190+). |
| `components/booking/register-form.test.tsx` | Asserts password-based register (lines 32–44). |
| `contexts/user-context.test.tsx` | Mocks `signIn` returning `'CredentialsSignin'` (line 93). |
| `components/booking/booking-integration.test.tsx` | Mocks `signIn`/`useSession` (line 7, line 42). |
| `vitest-setup.ts` | `mockUsers` map holds `passwordHash` (lines 49–127); register/login mocks accept any password (line 127). |

### Everything that references "password" today (removal blast radius)

- `lib/auth.config.ts` — Credentials `password` field + `verifyPassword` + `user.passwordHash` (lines 17, 43, 82).
- `lib/auth.ts` — `hashPassword`/`verifyPassword` (lines 21–45).
- `app/api/auth/register/route.ts` — `hashPassword`, `passwordHash` (lines 2, 67, 69).
- `lib/validations.ts` — `SessionBodySchema.password` (lines 57–61).
- `contexts/user-context.tsx` — `login(email, password)`, `register(name, email, password)` (lines 13–14, 42–76).
- `components/booking/login-form.tsx` — password input + `login(email, password)` (lines 19, 32, 114–127).
- `components/booking/register-form.tsx` — password + confirm inputs (lines 19–20, 96–124).
- Tests listed above + `vitest-setup.ts`.

---

## Approaches

### Option A — Auth.js built-in Email provider (magic link)

Use Auth.js's `Email` provider: user enters email → Auth.js generates a signed magic **link** → user clicks link to authenticate. Uses the existing `VerificationToken` table via the Prisma adapter.

- Pros: Zero custom code; Auth.js handles token generation, expiry, and callback; `VerificationToken` already exists; minimal attack surface.
- Cons: Sends a **link, not a 6-digit numeric code** — does NOT meet the explicit requirement. Click-through is a worse UX in the 3-step booking flow. No per-code attempt limiting. Callback redirect needs booking-state persistence.
- Effort: Low.

### Option B — Custom numeric 6-digit OTP (RECOMMENDED)

Two-phase custom flow, reusing the Credentials provider as the session-issuance vehicle:

1. `POST /api/auth/otp/request` `{ email }` → generate 6-digit code via `crypto` → store **hashed** code + expiry + attempts + consumed → email it via Resend.
2. Client calls `nextAuthSignIn('credentials', { email, otp })` → the repurposed Credentials `authorize` validates the code (hash match via `timingSafeEqual`, checks expiry + attempts, marks consumed) → returns `{ id, name, email }` → Auth.js mints the JWT session. Keep Google provider alongside.

Sub-variant **B1 (recommended)**: keep the `Credentials` provider, rename its `password` field to `otp`, and rewrite `authorize` to verify the stored code. This is the **only clean way to programmatically issue a JWT session in Auth.js v5** — there is no public route-level API to mint a session outside a provider.
Sub-variant **B2 (not recommended)**: delete `Credentials` entirely and issue sessions via a custom route. With `strategy: 'jwt'` there is no supported public hook to mint a JWT from an arbitrary route, so B2 is not feasible without the adapter's DB-session route.

- Pros: Meets the numeric-code requirement exactly; full control over expiry, attempts, lockout, rate limiting; no magic-link redirect breaking the booking flow; reuses the existing JWT session + `isAdmin`/`phone` callbacks; keeps Google.
- Cons: Custom code (request + verify + hashing + email); needs a new `OtpCode` model or schema change; must handle code delivery failure gracefully; low-entropy codes demand strict rate limiting.
- Effort: Medium.

### Data model options

- **Reuse `VerificationToken`**: has `identifier` + `token` + `expires` but **no attempts / consumed / timestamps beyond expiry**. Could encode `expires` and use token-uniqueness as single-use, but attempts tracking and a "consumed" flag are missing — you'd either abuse the table or lose lockout state.
- **New `OtpCode` model (recommended)**: dedicated, clean, maps to the audit/lockout needs. Fields: `id`, `email`, `codeHash`, `expiresAt`, `attempts Int @default(0)`, `consumedAt DateTime?`, `createdAt`, `updatedAt`. Index on `email`. Optionally store the plaintext only transiently in memory (never persisted); persist only the hash.

---

## Recommendation

**Option B1 — custom numeric 6-digit OTP, with the Credentials provider repurposed as the OTP verifier.** This is the only approach that delivers the required numeric code AND cleanly issues a JWT session in Auth.js v5 (`signIn('credentials', { email, otp })`). Google OAuth stays untouched as the social option. The Credentials provider is **not** "email/password login" anymore — its `authorize` validates a time-limited, single-use code, so removing password auth is satisfied even though the provider name is retained internally.

**Key design decisions to confirm in `sdd-propose`:**
1. New `OtpCode` Prisma model (preferred) vs. repurposing `VerificationToken`.
2. Registration: fold into first-time OTP login (email already has `name` capture path) vs. keep a separate register step.
3. Keep/repurpose `hashPassword`/`verifyPassword` for OTP hashing (scrypt + `timingSafeEqual` are ideal for codes) vs. new OTP hash helper.
4. Whether the Credentials provider is renamed (e.g. `otp`) or kept as `credentials` internally — affects test expectations and any client `signIn` calls.
5. `SessionBodySchema` removal/rewrite.

**Integration pattern (Auth.js v5, confirmed against docs):** the `Credentials` provider's `authorize` receives `{ email, otp }`, returns `{ id, name, email }` on success or `null` on failure; `signIn('credentials', { email, otp, redirect: false })` from the client triggers it and Auth.js issues the JWT. The existing `jwt`/`session` callbacks then attach `isAdmin`/`phone` exactly as today.

---

## Security / UX considerations

- **Code generation**: `crypto.randomInt(0, 1_000_000)` padded to 6 digits (or `randomBytes` → base10). Never a predictable sequence.
- **Store hashed only**: persist `scrypt`/`timingSafeEqual` hash of the code (reuse `hashPassword`/`verifyPassword`), never the plaintext. 6-digit codes are low-entropy, so hash + rate limit together.
- **Expiry**: e.g. 10 minutes (`expiresAt`).
- **Max attempts**: e.g. 5, then invalidate the code and log an audit event; require a fresh request.
- **Rate limiting**: `checkRateLimit` on BOTH `/api/auth/otp/request` (per-IP, and per-email) and the verify step (per-IP / per-email) to prevent enumeration and brute force.
- **Replay prevention**: mark code `consumedAt` after one successful use; reject reused codes.
- **Timing-safe compare**: reuse `verifyPassword`'s `timingSafeEqual` path.
- **Audit logging**: mirror existing actions (`auth.login_failed`, `auth.login_locked_out`, `auth.login_rate_limited`) plus new `auth.otp_requested`, `auth.otp_verified`, `user.registered`.
- **Admin implications**: admins currently authenticate with password via Credentials. After the change they log in by email OTP; `isAdmin` still flows from `User.isAdmin` through the `jwt` callback for ANY provider, so `requireAdmin()` keeps working unchanged. Ensure admin email addresses are deliverable.
- **Email delivery gap**: `RESEND_API_KEY` + `FROM_EMAIL` are set (with placeholders) only in `.env.hostinger` and `.env.example`; **`.env` and `.env.local` do not set them**, so local/dev uses the mock console client. OTP delivery in production requires a real Resend API key and a verified `FROM_EMAIL` sender domain.
- **Google fallback**: keep Google as a working path, so users without email access are not locked out (and it satisfies the "keep social option" requirement).

---

## Risks

- **OTP brute force / email enumeration** — low-entropy codes + `/request` not rate-limited. Mitigation: rate limit both endpoints, hash codes, cap attempts, lockout, audit logging. Severity: High.
- **Email delivery dependency** — OTP is unusable if Resend is down or unconfigured (env gap noted above). Mitigation: mock fallback for dev, real key for prod, clear error + "resend code" UX. Severity: Medium.
- **Session issuance coupling** — repurposing the Credentials provider keeps a provider named "credentials"; if reviewers expected it gone, document intent. Mitigation: clarify in proposal that this is the standard Auth.js JWT issuance path, not password auth. Severity: Low.
- **Registration UX ambiguity** — folding registration into first OTP login may drop the `name` capture or change the flow. Mitigation: confirm in proposal; keep `name` on the OTP form. Severity: Medium.
- **Test churn** — ~10 test files + `vitest-setup.ts` reference password fields. Mitigation: enumerate in tasks, update mocks (`passwordHash`, `signIn('credentials')`). Severity: Medium.
- **Schema migration** — adding `OtpCode` (or altering `VerificationToken`) needs a Prisma migration; low-risk additive if a new model. Severity: Low.

---

## Ready for Proposal

**Yes** — exploration is sufficient for `sdd-propose`. Present Option B1 (custom 6-digit OTP with the Credentials provider repurposed as the OTP verifier) as the recommendation, and confirm the five design decisions above (OtpCode model vs VerificationToken reuse, registration folding, hashing helper reuse, provider naming, schema rewrite) before writing the spec.

---

## Key Learnings

1. Auth.js v5 has no public route-level API to mint a JWT session — the Credentials provider's `authorize` (invoked via `signIn('credentials')`) is the only clean session-issuance path, so removing "password" means repurposing that provider to verify an OTP, not deleting it.
2. The existing scrypt `hashPassword`/`verifyPassword` helpers already use `timingSafeEqual` and are ideal for hashing 6-digit OTP codes, so they can be reused rather than replaced.
3. The `VerificationToken` model lacks attempts and consumed-flag columns, making a dedicated `OtpCode` model the cleaner choice for lockout and replay protection.
4. `RESEND_API_KEY` and `FROM_EMAIL` are only configured (with placeholder values) in `.env.hostinger`/`.env.example`; `.env` and `.env.local` rely on the mock email client, so production OTP delivery needs real Resend config.
5. `requireAdmin()` reads `isAdmin` from the JWT via the session callback, which works identically for OTP and Google sign-ins, so admin auth requires no change beyond the login method.