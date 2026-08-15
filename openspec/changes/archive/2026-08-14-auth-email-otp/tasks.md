# Tasks: Passwordless Email + OTP Login

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~900–1200 authored |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 → PR2 → PR3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|----|----------------------|-----------------|-------------------|
| 1 | OTP domain + schema + email | PR1 | `npx vitest run lib/__tests__/otp.test.ts lib/__tests__/validations.test.ts lib/email.test.ts` | `npx vitest run` (unit) | Revert `lib/otp.ts`, `prisma/schema.prisma`, `lib/validations.ts`, `lib/email.ts` (additive) |
| 2 | Request route + OTP authorize | PR2 | `npx vitest run lib/__tests__/credentials-authorize.test.ts lib/__tests__/auth-config.test.ts lib/__tests__/admin-auth.test.ts app/api/__tests__/otp-request.test.ts` | `npm run build` | Revert `lib/auth.config.ts` + new route; restore register route via git |
| 3 | Client context + forms + i18n | PR3 | `npx vitest run contexts/user-context.test.tsx components/booking/` | `npx vitest run` (jsdom) | Revert `user-context`, forms, `language-context`, `vitest-setup` |

## Phase 1: Foundation (OTP domain)

- [x] 1.1 Add `OtpCode` model to `prisma/schema.prisma` (`email`, `codeHash`, `attempts`, `consumedAt`, `expiresAt`, indexes) + migration.
- [x] 1.2 Create `lib/otp.ts`: `generateOtpCode`, `issueOtpCode`, `verifyOtpCode` (scrypt via `hashPassword`/`verifyPassword`, 10-min expiry, 5 attempts, consumedAt).
- [x] 1.3 RED: `lib/__tests__/otp.test.ts` — hash at rest, replay, expiry, 5-attempt lockout.
- [x] 1.4 Replace `SessionBodySchema` with `OtpRequestSchema` + `OtpVerifySchema` in `lib/validations.ts`; update `lib/__tests__/validations.test.ts`.
- [x] 1.5 Add `sendOtpEmail(email, code)` to `lib/email.ts`; test mock fallback in `lib/email.test.ts`.

## Phase 2: Server auth

- [x] 2.1 RED: `app/api/__tests__/otp-request.test.ts` — no-enumeration 200, 429, hashed persist.
- [x] 2.2 Create `app/api/auth/otp/request/route.ts` (CSRF origin → rate-limit ip+email → issue → email → always `200 {ok:true}`).
- [x] 2.3 RED: rewrite `lib/__tests__/credentials-authorize.test.ts` for `{ email, otp, name? }` — valid/wrong/expired/reused/locked.
- [x] 2.4 Rewrite Credentials `authorize` in `lib/auth.config.ts` (thin wrapper over `lib/otp.ts` + User upsert + audit).
- [x] 2.5 Delete `app/api/auth/register/route.ts`; update `auth-config.test.ts` / `admin-auth.test.ts` (JWT shape unchanged).
- [x] 2.6 Upsert User on first verify — `user.registered` audit; default name when absent.

## Phase 3: Client + i18n

- [x] 3.1 RED: `contexts/user-context.test.tsx` — `requestOtp`/`verifyOtp` replace `login`/`register`.
- [x] 3.2 Rewrite `contexts/user-context.tsx` (`requestOtp(email)`, `verifyOtp(email, otp, name?)`).
- [x] 3.3 RED: `login-form.test.tsx` two-step flow; then rewrite `components/booking/login-form.tsx`.
- [x] 3.4 Delete `components/booking/register-form.tsx` + its test; remove register tab in `booking-flow.tsx`.
- [x] 3.5 Update `contexts/language-context.tsx` en+es: drop register/password keys, add code/request/resend/sent.
- [x] 3.6 Update `vitest-setup.ts` fetch mock → `/api/auth/otp/request`.

## Phase 4: Verification

- [x] 4.1 `npx vitest run` — all suites green (5 pre-existing unrelated failures remain; see report).
- [x] 4.2 `npm run build` and `npx tsc --noEmit` clean.
- [x] 4.3 Update `booking-integration.test.tsx` (single-tab login → step 2).
