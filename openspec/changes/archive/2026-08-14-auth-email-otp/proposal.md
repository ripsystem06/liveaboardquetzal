# Proposal: Passwordless Email + OTP Login (`auth-email-otp`)

## Intent

Replace email/password (Credentials) login with passwordless email + 6-digit OTP as the PRIMARY method. Google OAuth stays as the social option. The existing Credentials provider is REPURPOSED as the OTP verifier (`signIn('credentials', { email, otp })`) — the only clean JWT-issuance path in Auth.js v5 — NOT framed as password auth. Registration folds into first OTP login; `name` capture is kept on the form. Admin uses the same flow (`isAdmin` still read from JWT).

## Scope

### In Scope
- `POST /api/auth/otp/request` → issue + email a single-use 6-digit code (hashed at rest, 10-min expiry, max 5 attempts, lockout, replay protection).
- Verify via repurposed Credentials `authorize({ email, otp, name? })` → validate code → upsert User (create on first login) → mint JWT session.
- New Prisma `OtpCode` model + migration (do NOT alter `VerificationToken`).
- `sendOtpEmail` in `lib/email.ts`; reuse scrypt `hashPassword`/`verifyPassword` (timing-safe), `lib/rate-limit.ts`, `AuditLog`.
- Remove password auth: delete `POST /api/auth/register`; drop `SessionBodySchema.password`; stop using `User.passwordHash`.

### Out of Scope
- Magic-link Email provider (does not meet numeric-code requirement).
- Changing session/JWT shape (`id`, `isAdmin`, `phone` callbacks unchanged).
- Renaming the `credentials` provider id internally.
- SMS/phone OTP, MFA, password recovery.

## Capabilities

- **New**: `authentication` — passwordless email OTP login + registration.
- **Modified**: `admin` (in `infrastructure`) — ADM-REQ-003 registration-audit scenario moves from password register to OTP-verified upsert.

## Approach

Option B1 (exploration): custom numeric OTP + repurposed Credentials verifier. Request route rate-limits per-IP/per-email; code stored as scrypt hash (`timingSafeEqual` compare); `authorize` checks expiry + attempts, marks `consumedAt`, returns `{ id, name, email }`. Google provider untouched. Client calls `signIn('credentials', { email, otp, name?, redirect:false })`.

## Affected Areas

| Area | Impact |
|------|--------|
| `lib/auth.config.ts` | Rewrite Credentials `authorize` (password→otp) |
| `app/api/auth/otp/request/route.ts` | New |
| `app/api/auth/register/route.ts` | Removed |
| `prisma/schema.prisma` | Add `OtpCode` |
| `lib/validations.ts`, `lib/email.ts` | Modify |
| `contexts/user-context.tsx`, login/register forms, i18n | Modify |
| ~10 test files + `vitest-setup.ts` | Update |

## Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| OTP brute force / email enumeration | High | Hash codes; rate-limit request+verify; max 5 attempts + lockout; audit log |
| Email delivery failure (Resend unconfigured) | Med | Mock fallback in dev; real key in prod; resend-code UX |
| Existing-user lockout | Med | Keep `User.passwordHash` nullable; Google OAuth remains as fallback |
| Test churn (~10 files) | Med | Enumerate in tasks; update mocks |
| Schema migration | Low | Additive new model; reversible |

## Rollback Plan

1. Revert code via git to restore the Credentials password `authorize`.
2. `User.passwordHash` stays nullable — existing rows retain hashes, so password login works immediately after revert.
3. `OtpCode` is additive and unused by other tables; drop via a second migration or leave dormant.
4. Google OAuth remains a working login path throughout, even if OTP delivery breaks.

## Dependencies

- Resend API key + verified `FROM_EMAIL` for production delivery.
- Prisma migration applied to the live database.

## Open Questions

- None blocking. (Expiry 10 min and max 5 attempts are proposal defaults; final values locked in spec.)

## Success Criteria

- [ ] Email + OTP login mints a JWT session; Google OAuth still works.
- [ ] Password login and `passwordHash` are fully removed from the auth path.
- [ ] Reused, expired, and over-attempt codes are rejected; audit events logged.
- [ ] `npx vitest run` and `npm run build` pass.
