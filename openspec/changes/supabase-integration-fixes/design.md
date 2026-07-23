# Design: Supabase/Prisma Integration Fixes

## Architecture Decisions

### AD-1: Remove SQLite PRAGMA — keep singleton pattern
**Decision**: Delete lines 10-13 of `lib/db.ts` entirely. Keep the `globalForPrisma` singleton and `NODE_ENV !== 'production'` guard.
**Rationale**: `PRAGMA journal_mode=WAL` is SQLite-only; it crashes PostgreSQL on cold start. The singleton pattern is correct for serverless — no change needed.
**Alternatives considered**: Conditional PRAGMA based on provider detection. Rejected: unnecessary complexity for a dead code path.

### AD-2: Use `findFirst` instead of `findUnique` for blog post filtering
**Decision**: Change `prisma.blogPost.findUnique({ where: { id } })` to `prisma.blogPost.findFirst({ where: { id, status: 'published' } })` in `app/blog/[id]/page.tsx`. Remove the JS-level `status !== 'published'` check.
**Rationale**: `findUnique` requires a unique constraint on the full `where` clause. BlogPost has no `@@unique([id, status])`. `findFirst` returns `null` for both "id not found" and "id exists but is draft" — same as `findUnique` + JS check but without fetching the draft row.
**Alternatives considered**: Add `@@unique([id, status])` to schema. Rejected: unnecessary schema change for a read-path optimization.

### AD-3: Create `ForbiddenError` subclass for 401/403 distinction
**Decision**: Add `ForbiddenError extends AuthError` in `lib/auth.ts`. Update `requireAdmin()` in `lib/admin-auth.ts` to throw `ForbiddenError('Admin access required')` when user is not admin. Update all admin catch blocks to check `instanceof ForbiddenError` → 403 vs `instanceof AuthError` → 401.
**Rationale**: Today all auth failures return 403. `getSessionUser` throws `AuthError` for no-session (should be 401). `requireAdmin` throws `AuthError` for not-admin (should be 403). A subclass enables `instanceof` discrimination without changing `AuthError`'s existing contract.
**Alternatives considered**: Separate error class hierarchy. Rejected: over-engineering; `ForbiddenError extends AuthError` is minimal and `instanceof AuthError` still catches both.

### AD-4: Interactive transaction for reservation booking
**Decision**: Wrap the `findFirst` + `create` in `prisma.$transaction(async (tx) => { ... })`. Use `tx.reservation.findFirst` and `tx.reservation.create` inside the callback.
**Rationale**: Interactive transactions (callback-based) provide serializable isolation for the check-then-act window, preventing double-booking. The pattern already exists in `app/api/admin/cruises/[id]/route.ts` DELETE handler and `app/api/admin/blog/route.ts` POST handler.
**Alternatives considered**: `$transaction([...])` batch API. Rejected: batch API doesn't support conditional logic (check-result → decide → create).

### AD-5: Rate limiting uses existing `checkRateLimit` with permissive defaults
**Decision**: Import `checkRateLimit`/`getClientIP` from `lib/rate-limit.ts` in `POST /api/reservations` and `GET /api/reservations/check-availability`. Use `maxAttempts=20, windowMs=60_000`. Return 429 with `Retry-After` header on block.
**Rationale**: `lib/rate-limit.ts` already exists and is tested (`lib/__tests__/rate-limit.test.ts`). Auth endpoint already uses it. No reason to rewrite.
**Alternatives considered**: Upstash Redis-based rate limiting. Rejected: adds infra dependency for a hardening change.

### AD-6: Audit logs follow existing pattern — fire-and-forget
**Decision**: Add `prisma.auditLog.create({...}).catch(console.error)` calls after successful mutations in: admin/cruises (POST/PATCH/DELETE), admin/blog (POST), auth/session (register). Same pattern as `reservation.status_changed` audit in `admin/reservations/[id]/route.ts:76`.
**Rationale**: Fire-and-forget prevents audit log inserts from blocking responses. The `.catch()` prevents unhandled promise rejections.
**Alternatives considered**: Background queue. Rejected: over-engineering for a hardening PR.

## Component Changes

### `lib/db.ts`
- **Change**: Remove PRAGMA lines 10-13. Add connection pooling to PrismaClient constructor. Add `checkAndExpireAllHolds()`.
- **Before**: `new PrismaClient()` with `PRAGMA journal_mode=WAL` call.
- **After**: `new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })` with `connection_limit=3&pool_timeout=10` appended to DATABASE_URL via env config. New exported function `checkAndExpireAllHolds()` that bulk-updates expired holds and sends emails.

### `lib/auth.ts`
- **Change**: Add `ForbiddenError` class after `AuthError`. Export it.
- **Before**: Only `AuthError`.
- **After**: `export class ForbiddenError extends AuthError { constructor(m: string) { super(m); this.name = 'ForbiddenError' } }`

### `lib/admin-auth.ts`
- **Change**: Import `ForbiddenError`. Throw it instead of `AuthError` when `!user.isAdmin`.
- **Before**: `throw new AuthError('Admin access required')`
- **After**: `throw new ForbiddenError('Admin access required')`

### `lib/validations.ts`
- **Change**: Add `returnDate: z.string().min(1)` to `CreateCruiseSchema`.
- **Before**: No `returnDate` field.
- **After**: `returnDate: z.string().min(1)` after `departureDate`.

### `app/api/admin/cruises/route.ts`
- **Change**: Pass `returnDate: body.returnDate` in create data. Add audit log after creation. Gate Zod details.
- **Before**: No returnDate in create, no audit log, `.flatten()` always leaked.
- **After**: `returnDate: body.returnDate` added. Audit log: `action: 'cruise.created'`. Zod details: `process.env.NODE_ENV !== 'production' ? parsed.error.flatten() : undefined`.

### `app/api/admin/cruises/[id]/route.ts`
- **Change**: Add audit log after PATCH and DELETE (fire-and-forget). Fix catch: `ForbiddenError` → 403, `AuthError` → 401. Gate Zod details.
- **Before**: All AuthError → 403.
- **After**: `ForbiddenError` → 403, remaining `AuthError` → 401.

### `app/api/admin/blog/route.ts`
- **Change**: Add audit log after POST. Fix 401/403. Gate Zod details.
- **After**: Audit: `action: 'blog.created'`. Error discrimination as above.

### `app/api/admin/blog/[id]/route.ts`
- **Change**: Fix 401/403 in catch blocks.

### `app/api/admin/reservations/route.ts`
- **Change**: Fix 401/403. (GET handler — no audit needed, read-only.)

### `app/api/admin/reservations/[id]/route.ts`
- **Change**: Fix 401/403 in GET/PATCH. Gate Zod details.

### `app/api/admin/dashboard/route.ts`
- **Change**: Fix 401/403.

### `app/api/auth/session/route.ts`
- **Change**: Add audit log after user registration. Gate Zod details.
- **After**: `prisma.auditLog.create({ data: { action: 'user.registered', entityType: 'user', entityId: created.id, actorEmail: email } }).catch(console.error)`

### `app/api/reservations/route.ts`
- **Change**: Wrap findFirst+create in `$transaction`. Add rate limiting. Gate Zod details.
- **Before**: Non-transactional check-then-act.
- **After**: `prisma.$transaction(async (tx) => { const conflicting = await tx.reservation.findFirst(...); if (conflicting) throw { code: 'DATE_BLOCKED' }; ... })`. Rate-limit check at top of handler.

### `app/api/reservations/check-availability/route.ts`
- **Change**: Add rate limiting. Gate Zod details.
- **Before**: No rate limiting.

### `app/api/cron/expire-holds/route.ts`
- **Change**: NEW file. Vercel Cron endpoint that bulk-expires stale holds.
- **Implementation**: `prisma.reservation.updateMany({ where: { status: 'pending_approval', holdExpiry: { lt: new Date() } }, data: { status: 'expired' } })`. Fire-and-forget emails. Return `{ expired: count }`.

### `vercel.json`
- **Change**: NEW file. Configure Vercel Cron.
- **Content**: `{ "crons": [{ "path": "/api/cron/expire-holds", "schedule": "*/15 * * * *" }] }`

### `components/account/reservation-list.tsx`
- **Change**: Line 128: remove `/ 100`.
- **Before**: `${(reservation.totalAmount / 100).toLocaleString()} USD`
- **After**: `${reservation.totalAmount.toLocaleString()} USD`

### `components/account/reservation-actions.tsx`
- **Change**: Lines 30, 47: remove `/ 100`.
- **Before**: `$${(reservation.totalAmount / 100).toLocaleString()} USD`
- **After**: `$${reservation.totalAmount.toLocaleString()} USD`

### `app/blog/[id]/page.tsx`
- **Change**: Use `findFirst({ where: { id, status: 'published' } })`, remove JS status check.
- **Before**: `findUnique({ where: { id } })` + `if (!post || post.status !== 'published') notFound()`
- **After**: `findFirst({ where: { id, status: 'published' } })` + `if (!post) notFound()`

### `prisma/migrations/` (new)
- **Change**: Generate baseline migration via `prisma migrate diff` from live DB. Add partial unique index migration.
- **Partial unique index SQL** (manual in migration): `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "idx_pending_unique_cruise_date" ON "Reservation" ("cruiseId", "departureDate") WHERE "status" = 'pending_approval'`

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary changed. All changes are API-level (HTTP handlers), DB-level (Prisma queries), or UI-level (React components).

## Testing Strategy

Existing tests must pass (`npx vitest run`). RED tests for:
- `lib/auth`: `ForbiddenError instanceof AuthError` and `instanceof ForbiddenError`
- `lib/admin-auth`: `requireAdmin` throws `ForbiddenError` for non-admin user
- `app/api/reservations`: Transactional booking resolves race condition (concurrent requests → one 201, one 409)
- `components/account/reservation-list`: Price renders without `/100` ($3,300 not $33.00)

## Open Questions

None — all design decisions are resolved.
