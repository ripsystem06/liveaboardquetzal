# Proposal: Supabase/Prisma Integration Fixes

## Intent

Fix critical production bugs and missing safeguards in the PostgreSQL/Prisma integration. Four bugs are **crash/data-corruption level**; eight warnings are **stability/security gaps**. This is a hardening change, not a feature.

## Scope

### In Scope (12 items)

| # | Severity | Item |
|---|----------|------|
| 1 | CRITICAL | Remove SQLite `PRAGMA journal_mode=WAL` from `lib/db.ts:11-13` — crashes PostgreSQL on cold start |
| 2 | CRITICAL | Fix price display `/100` bug in `reservation-list.tsx:128`, `reservation-actions.tsx:30,47` — stores whole dollars (3300 = $3,300), displays as $33.00 |
| 3 | CRITICAL | Initialize `prisma/migrations/` with baseline migration from `db push` snapshot — zero versioned migrations today |
| 4 | CRITICAL | Wrap reservation `findFirst` + `create` in `$transaction` at `app/api/reservations/route.ts:26-64` — race condition enables double booking |
| 5 | WARNING | Add background hold-expiration job (cron/Vercel Cron) — expired holds only release on user page load today |
| 6 | WARNING | Add Prisma connection pooling (`connection_limit`, `pool_timeout`) for serverless PostgreSQL |
| 7 | WARNING | Add rate limiting (`POST /api/reservations`, availability endpoints) — only auth endpoint has it |
| 8 | WARNING | Add audit logs for Blog/Cruise/User admin mutations — only reservation status changes are audited |
| 9 | WARNING | Fix 401/403 confusion in admin error handlers — `AuthError` from `requireAdmin` should be 403, from `getSessionUser` should be 401 |
| 10 | WARNING | Sanitize Zod `parsed.error.flatten()` in production 400 responses — leaks schema internals |
| 11 | WARNING | Add `returnDate` to `CreateCruiseSchema` validation — accepted by form, silently dropped by server |
| 12 | WARNING | Return 404 for draft blog posts by ID in public endpoints — timing/enumeration leak today |

### Out of Scope
- UI redesigns, new admin features, auth system changes (already done)
- PayPal real integration, email template overhaul
- E2E test infrastructure (not yet available)

## Capabilities

### New Capabilities
- `database-reliability`: PRAGMA fix, Prisma migrations baseline, connection pooling config
- `reservation-safety`: Double-booking transaction, hold-expiration cron, rate limiting on reservation/availability
- `data-integrity`: Price display fix, returnDate validation, Zod error sanitization in production

### Modified Capabilities
- `admin`: Fix 401/403 status codes (ADM-002), add audit log coverage for Blog/Cruise/User mutations, fix blog post ID enumeration leak
- `user-account`: Fix price display divide-by-100 affecting `ReservationCard` and `ReservationActions`

## Approach

Group work by area, fix criticals first:

1. **Database layer** (items 1, 3, 6): Remove PRAGMA, create baseline migration via `prisma migrate diff`, add pooling config to `PrismaClient` constructor.
2. **Reservation integrity** (items 4, 5, 7): Wrap check-then-act in `$transaction`, add Vercel Cron endpoint for hold expiry, add rate-limit middleware to reservation/availability routes.
3. **Data fixes** (items 2, 10, 11): Remove `/100` from display components, add `returnDate` to Zod schema, strip `.flatten()` from production error responses.
4. **Admin hardening** (items 8, 9, 12): Distinguish 401 vs 403 in admin catch blocks, add audit log calls for Blog/Cruise/User mutations, return 404 for non-published blog posts by ID.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `lib/db.ts` | Modified | Remove PRAGMA, add pooling config |
| `prisma/migrations/` | New | Baseline migration directory |
| `app/api/reservations/route.ts` | Modified | Transaction wrapper for booking |
| `components/account/reservation-*.tsx` | Modified | Remove `/100` from display |
| `lib/validations.ts` | Modified | Add returnDate, rate-limit exports |
| `app/api/admin/*` (6 files) | Modified | Fix 401/403, add audit logs |
| `app/api/admin/blog/[id]/route.ts` | Modified | Hide draft existence |
| `app/api/reservations/availability/` | Modified | Add rate limiting |
| `lib/rate-limit.ts` | New/Modified | Expand coverage |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Baseline migration creates drift vs production | Low | Use `prisma migrate diff` from live schema; verify with `prisma migrate resolve` |
| Rate limiting breaks client-side retry loops | Low | Use permissive defaults (20 req/min); expose `Retry-After` header |
| Audit log inserts slow admin mutations | Low | Fire-and-forget (`.catch()`), separate from response path |

## Rollback Plan

All changes are additive or surgical. Rollback per area:
1. **PRAGMA**: revert one line in `lib/db.ts`
2. **Migrations**: `prisma migrate resolve --applied 0` to mark baseline as unapplied (non-destructive)
3. **Transaction**: revert to non-transactional `findFirst` + `create`
4. **Price display**: restore `/100` division
5. **Rate/audit/401-403**: revert individual route files; no DB changes

## Dependencies

- Vercel Cron (for hold expiration) — requires Pro plan or `vercel.json` `crons` config
- Existing `lib/rate-limit.ts` already used by auth endpoint — extend, don't rewrite

## Success Criteria

- [ ] `PRAGMA journal_mode=WAL` removed; Prisma connects to PostgreSQL without error
- [ ] `prisma migrate dev` produces no drift against current schema
- [ ] Two concurrent reservations for same cruise+date → one succeeds, one gets 409
- [ ] Price displays correct whole-dollar amount ($3,300 not $33.00)
- [ ] `GET /api/admin/*` returns 401 for unauthenticated, 403 for non-admin
- [ ] Blog draft IDs return 404 from public endpoints (no timing difference)
- [ ] All existing tests pass (`npx vitest run`)
