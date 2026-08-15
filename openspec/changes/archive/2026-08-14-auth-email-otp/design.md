# Design: Passwordless Email + OTP Login (`auth-email-otp`)

## Technical Approach

Replace the Credentials password `authorize` with a two-step OTP verifier. `POST /api/auth/otp/request` issues + emails a 6-digit code (scrypt-hashed, 10-min expiry, 5-attempt lockout); the repurposed `authorize({ email, otp, name? })` validates it, upserts the User (create-on-first-login), and returns `{ id, name, email }` — the unchanged JWT-callback shape. Google and JWT callbacks stay byte-identical; `POST /api/auth/register` is deleted.

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|---|---|---|---|
| JWT issuance path | Repurposed Credentials `authorize` | Custom session route minting JWT manually | Only clean Auth.js v5 issuance path; already wired to `id`/`isAdmin`/`phone` callbacks; Google untouched |
| OTP logic placement | Extract pure fns to `lib/otp.ts` (`generateOtpCode`, `issueOtpCode`, `verifyOtpCode`); `authorize` becomes a thin wrapper | Inline logic in `authorize` | `authorize` is not directly unit-testable; pure fns enable RED tests (mirrors `lib/auth.ts` `hashPassword`) |
| Code hashing | Reuse `hashPassword`/`verifyPassword` (scrypt + `timingSafeEqual`) | SHA-256/HMAC | Already timing-safe and tested; zero new crypto |
| Single active code | Delete prior unconsumed codes for email before issuing new | Allow multiple active codes | Reduces brute-force surface; unambiguous replay rejection |
| Registration UX | Unified email→code form, optional `name` on step 2; remove register tab/route | Separate register form | Spec folds registration into first login; `name` stays on form |
| Rate-limit keys | Request: `otp:req:{ip}` + `otp:req:{email}` (5/min); verify: `otp:verify:{ip}` in `authorize` | Single IP key | Per-email key blocks enumeration bursts; reuses in-memory `checkRateLimit` |

## Data Flow

```
CLIENT                        ROUTE / authorize                        STORE
  │  requestOtp(email)             │                                     │
  ├───────────────────────────────►│ rate-limit ip+email (429 if hit)    │
  │                                │ delete old codes                    │
  │                                │ code=generateOtpCode(); hash+save   │──► OtpCode
  │                                │ sendOtpEmail(code) ─────────────────┼──► Resend/mock
  │◄──── 200 {ok:true} (always) ───│                                     │
  │  verifyOtp(email,otp,name)     │                                     │
  ├───────────────────────────────►│ signIn('credentials') → authorize   │
  │                                │ rate-limit verify                   │
  │                                │ find code by email                  │◄── OtpCode
  │                                │ expired? reused? attempts≥5? → null │
  │                                │ verifyPassword(otp, codeHash)       │
  │                                │ fail→attempts++ (+lock+audit at 5)  │
  │                                │ ok→mark consumedAt; upsert User     │──► User
  │                                │ audit user.registered (new)         │──► AuditLog
  │◄──── JWT session ◄─────────────│ return {id,name,email}              │
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `prisma/schema.prisma` | Modify | Add `OtpCode` model (additive, below `VerificationToken`) |
| `lib/otp.ts` | Create | `generateOtpCode`, `issueOtpCode`, `verifyOtpCode` (scrypt, expiry, attempts, consumedAt) |
| `lib/auth.config.ts` | Modify | Rewrite Credentials `authorize`: `{ email, otp, name? }`, thin wrapper over `lib/otp.ts` + upsert |
| `lib/email.ts` | Modify | Add `sendOtpEmail(email, code)` using `getEmailClient()` + `FROM_EMAIL` |
| `lib/validations.ts` | Modify | Replace `SessionBodySchema` with `OtpRequestSchema` + `OtpVerifySchema` |
| `app/api/auth/otp/request/route.ts` | Create | CSRF origin check → rate-limit → issue → email → always `200 {ok:true}` |
| `app/api/auth/register/route.ts` | Delete | Password registration removed |
| `contexts/user-context.tsx` | Modify | Replace `login`/`register` with `requestOtp(email)` + `verifyOtp(email, otp, name?)` |
| `components/booking/login-form.tsx` | Modify | Two-step OTP form (email → code + optional name) |
| `components/booking/register-form.tsx` | Delete | Folded into login form |
| `components/booking/booking-flow.tsx` | Modify | Remove register tab |
| `contexts/language-context.tsx` | Modify | `en`+`es`: drop `booking.register.*`/`booking.login.password`, add code/request/resend/sent keys |
| `vitest-setup.ts` | Modify | Mock fetch: `/api/auth/otp/request` (drop register/login mock) |

## Interfaces / Contracts

```prisma
model OtpCode {
  id         String    @id @default(cuid())
  email      String
  codeHash   String
  attempts   Int       @default(0)
  consumedAt DateTime?
  expiresAt  DateTime
  createdAt  DateTime  @default(now())
  @@index([email]) @@index([expiresAt])
}
```

```ts
// lib/otp.ts
generateOtpCode(): string                                  // crypto-random 6 digits
issueOtpCode(email): Promise<string>                       // deletes old codes, stores hash, returns plaintext
verifyOtpCode(email, code): Promise<{ ok: boolean; reason?: 'invalid'|'expired'|'reused'|'locked' }>
// lib/validations.ts
OtpRequestSchema = z.object({ email: z.string().email() })
OtpVerifySchema  = z.object({ email: z.string().email(), otp: z.string().regex(/^\d{6}$/), name: z.string().optional() })
```

Auth.js `authorize` returns `{ id, name, email }` (unchanged). Audit actions: `auth.otp_requested`, `auth.otp_failed`, `auth.otp_locked_out`, `auth.otp_consumed`, `user.registered`.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `lib/otp.ts`: hash/reuse/expiry/attempts/lockout; `OtpRequestSchema`/`OtpVerifySchema`; `sendOtpEmail` mock fallback | Vitest + mocked `prisma` |
| Unit | `generateOtpCode` is 6-digit, deterministic-safe | Vitest |
| Integration | `POST /api/auth/otp/request`: no-enumeration (identical response), 429, code persisted hashed | Vitest route test + mocked `prisma` |
| Integration | `user-context` `requestOtp`/`verifyOtp`; OTP form two-step flow; `booking-flow` single tab | RTL + `renderWithProviders`, `userEvent` |
| Regression | `requireAdmin`/admin routes (JWT shape unchanged); Google button | Existing suites |

E2E: unavailable (jsdom).

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. OTP brute-force/enumeration/replay are spec security invariants (tracked as RED tests in tasks).

## Migration / Rollout

Additive `OtpCode` migration only; `User.passwordHash` retained nullable and unused. Rollback: git-revert restores password `authorize`; Google OAuth remains a working path throughout.

## Open Questions

- [ ] Resend `FROM_EMAIL` verified value for production (non-blocking dependency).
