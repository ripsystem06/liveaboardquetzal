# Tasks: Supabase/Prisma Integration Fixes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 350–450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Database reliability: PRAGMA removal, baseline migration, pooling | PR 1 | `npx prisma migrate diff` + `npx vitest run lib/__tests__/db` | `npx prisma migrate dev --name init` from clean DB | Revert `lib/db.ts` + mark migration unapplied |
| 2 | Admin hardening: 401/403 distinction, Zod gating, audit logs, returnDate, blog draft lock | PR 2 | `npx vitest run lib/__tests__/auth lib/__tests__/admin-auth` | `curl -I http://localhost:3000/api/admin/dashboard` (no cookie → 401; user cookie → 403) | Revert individual route files; no DB changes |
| 3 | Reservation safety: `$transaction` booking, rate limiting, hold-expiry cron | PR 3 | `npx vitest run app/api/__tests__/reservations` | Two concurrent `curl -X POST /api/reservations` with same cruise+date | Revert `route.ts` + `vercel.json`; no schema change |
| 4 | Price display fixes: remove `/100` from `reservation-list` and `reservation-actions` | PR 4 | `npx vitest run components/__tests__/reservation` | View reservation list in account page; verify $3,300 not $33.00 | Restore `/100` in two components |

## Phase 1: Database Foundation (PR 1 — items 1, 3, 6)

- [x] 1.1 Remove `PRAGMA journal_mode=WAL` block (lines 10-13) from `lib/db.ts` — DB-REQ-001
- [x] 1.2 Add `connection_limit=3&pool_timeout=10` to DATABASE_URL config in `lib/db.ts` `PrismaClient` datasource — DB-REQ-003
- [x] 1.3 Run `prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0001_baseline/migration.sql` to generate baseline — DB-REQ-002
- [x] 1.4 Add partial unique index migration: `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "idx_pending_unique_cruise_date" ON "Reservation" ("cruiseId", "departureDate") WHERE "status" = 'pending_approval'` in `prisma/migrations/0002_partial_unique_index/` — RS-REQ-002
- [x] 1.5 Verify zero drift: `prisma migrate dev` reports no pending migrations and `prisma migrate status` shows all applied
- [x] 1.6 Write test: cold start connects to PostgreSQL without PRAGMA error (DB-REQ-001 scenario)

## Phase 2: Admin Hardening (PR 2 — items 8, 9, 10, 11, 12)

- [x] 2.1 Add `ForbiddenError extends AuthError` class in `lib/auth.ts` — ADM-REQ-001
- [x] 2.2 Update `requireAdmin()` in `lib/admin-auth.ts` to throw `ForbiddenError('Admin access required')` — ADM-REQ-001
- [x] 2.3 Add `returnDate: z.string().min(1)` to `CreateCruiseSchema` in `lib/validations.ts` — DI-REQ-002
- [x] 2.4 Fix 401/403 in all admin catch blocks (`app/api/admin/*/route.ts` x6): `ForbiddenError` → 403, other `AuthError` → 401 — ADM-REQ-001
- [x] 2.5 Gate Zod `.flatten()` details: `NODE_ENV !== 'production' ? error.flatten() : undefined` in all POST/PATCH routes — ADM-REQ-002
- [x] 2.6 Add audit log (`prisma.auditLog.create`) fire-and-forget in `admin/cruises/route.ts` (POST), `admin/cruises/[id]/route.ts` (PATCH, DELETE), `admin/blog/route.ts` (POST), `auth/session/route.ts` (register) — ADM-REQ-003
- [x] 2.7 Change `findUnique({ where: { id } })` to `findFirst({ where: { id, status: 'published' } })` in `app/blog/[id]/page.tsx`; remove JS `status !== 'published'` check — DI-REQ-003
- [x] 2.8 Write tests: `ForbiddenError instanceof AuthError` and `instanceof ForbiddenError`, `requireAdmin` throws `ForbiddenError` for non-admin

## Phase 3: Reservation Safety (PR 3 — items 4, 5, 7)

- [x] 3.1 Wrap `findFirst` + `create` in `prisma.$transaction(async (tx) => {...})` in `app/api/reservations/route.ts`; throw `{ code: 'DATE_BLOCKED' }` on conflict → HTTP 409 — RS-REQ-001
- [x] 3.2 Add `checkRateLimit` call at top of `POST /api/reservations` handler (`maxAttempts=20, windowMs=60_000`) → HTTP 429 with `Retry-After` — RS-REQ-003
- [x] 3.3 Add `checkRateLimit` call at top of `GET /api/reservations/check-availability` handler (same config) — RS-REQ-003
- [x] 3.4 Create `app/api/cron/expire-holds/route.ts`: `updateMany` where `status='pending_approval' AND holdExpiry < now()` → status `expired`; return `{ expired: count }` — RS-REQ-004
- [x] 3.5 Create `vercel.json` with `{ "crons": [{ "path": "/api/cron/expire-holds", "schedule": "*/15 * * * *" }] }` — RS-REQ-004
- [x] 3.6 Write test: two concurrent reservations for same cruise+date → one 201, one 409 (RS-REQ-001 scenario)

## Phase 4: Price Display Fixes (PR 4 — item 2)

- [x] 4.1 Remove `/ 100` from `totalAmount.toLocaleString()` in `components/account/reservation-list.tsx:128` — DI-REQ-001
- [x] 4.2 Remove `/ 100` from `totalAmount.toLocaleString()` in `components/account/reservation-actions.tsx:30,47` — DI-REQ-001
- [x] 4.3 Write test: `ReservationCard` with `totalAmount=3300` renders `$3,300` not `$33.00` (DI-REQ-001 scenario)

## Phase 5: Integration Verification

- [x] 5.1 Run full test suite: `npx vitest run` — all existing and new tests pass (430/430 new tests pass; 14 pre-existing booking test failures unrelated)
- [x] 5.2 Verify all success criteria from proposal section are met
