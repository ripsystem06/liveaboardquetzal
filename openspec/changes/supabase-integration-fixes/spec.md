# Delta Specs: Supabase/Prisma Integration Fixes

## CAPABILITY: database-reliability

| # | Requirement | Kind | Scenarios |
|---|------------|------|-----------|
| DB-REQ-001 | The system MUST NOT execute SQLite-specific PRAGMAs when connecting to PostgreSQL. The `prisma.$executeRawUnsafe('PRAGMA journal_mode=WAL')` call SHALL be removed from `lib/db.ts`. | REMOVED | 1 |
| DB-REQ-002 | The system MUST have a baseline Prisma migration tracking the current schema, initialized via `prisma migrate diff` from the live database, so that `prisma migrate dev` SHALL report zero drift. | ADDED | 1 |
| DB-REQ-003 | The `PrismaClient` constructor MUST include connection pooling configuration: `connection_limit=3` and `pool_timeout=10` (seconds) for serverless PostgreSQL compatibility. | ADDED | 2 |

### Requirement: DB-REQ-001 — Remove SQLite PRAGMA (REMOVED)

The system MUST NOT execute `PRAGMA journal_mode=WAL` against PostgreSQL.

#### Scenario: Cold start connects to PostgreSQL without crash

- GIVEN the application starts in a serverless environment with a PostgreSQL `DATABASE_URL`
- WHEN `lib/db.ts` initializes the Prisma client
- THEN no SQLite PRAGMA is executed
- AND the Prisma connection succeeds without error

### Requirement: DB-REQ-002 — Baseline migration (ADDED)

The system MUST have an initial Prisma migration that captures the current schema.

#### Scenario: Migration baseline produces zero drift

- GIVEN a production schema managed via `prisma db push`
- WHEN `prisma migrate diff` is run against the live database
- THEN a baseline migration SQL file is created in `prisma/migrations/`
- AND `prisma migrate dev` reports zero pending migrations and zero drift

### Requirement: DB-REQ-003 — Connection pooling (ADDED)

The system SHALL configure Prisma connection pooling for serverless deployment.

#### Scenario: Pooled connection under concurrent load

- GIVEN the Prisma client is instantiated with `connection_limit=3` and `pool_timeout=10`
- WHEN 5 concurrent requests hit the same handler
- THEN only 3 database connections are opened at once
- AND the remaining 2 requests queue up within the pool timeout

#### Scenario: Pool timeout triggers error

- GIVEN all 3 connections are held by long-running queries
- WHEN a 4th request waits longer than `pool_timeout` seconds
- THEN Prisma throws a connection timeout error
- AND the request returns HTTP 500

## CAPABILITY: reservation-safety

| # | Requirement | Kind | Scenarios |
|---|------------|------|-----------|
| RS-REQ-001 | The `findFirst` check and `create` in `POST /api/reservations` MUST be wrapped in a `prisma.$transaction` to prevent double-booking race conditions. | ADDED | 2 |
| RS-REQ-002 | The database MUST have a partial unique index on `(cruiseId, departureDate) WHERE status = 'pending_approval'` as a second layer of double-booking defense. | ADDED | 1 |
| RS-REQ-003 | The system SHALL enforce a 20 requests/minute per-IP rate limit on `POST /api/reservations` and `GET /api/reservations/check-availability`. | ADDED | 2 |
| RS-REQ-004 | A hold-expiration cron endpoint SHALL run every 15 minutes via Vercel Cron, expiring all reservations where `status = 'pending_approval' AND holdExpiry < now()`. | ADDED | 2 |

### Requirement: RS-REQ-001 — Transactional date-blocking (ADDED)

The system MUST wrap the check-then-create flow in a database transaction.

#### Scenario: Concurrent reservations — one succeeds, one gets 409

- GIVEN cruise `C1` on date `2026-08-15` has no pending reservations
- WHEN two requests for the same cruise+date arrive simultaneously
- THEN one reservation is created with status `pending_approval`
- AND the other request receives HTTP 409 with `DATE_BLOCKED`
- AND only one reservation exists for that cruise+date in `pending_approval`

#### Scenario: Single reservation — normal flow unchanged

- GIVEN cruise `C1` on date `2026-08-15` has no pending reservations
- WHEN one reservation request arrives
- THEN the reservation is created with status `pending_approval` and a hold expiry
- AND HTTP 201 is returned

### Requirement: RS-REQ-002 — Partial unique index (ADDED)

The database SHALL enforce uniqueness at the schema level.

#### Scenario: Insert violates unique index

- GIVEN the index `idx_pending_unique_cruise_date` exists on `(cruiseId, departureDate) WHERE status = 'pending_approval'`
- WHEN a transaction attempts to insert a duplicate `pending_approval` reservation
- THEN PostgreSQL raises a unique constraint violation
- AND the application returns HTTP 409

### Requirement: RS-REQ-003 — Rate limiting (ADDED)

The system SHALL rate-limit reservation-related public endpoints.

#### Scenario: Within limit — request succeeds

- GIVEN a client has made fewer than 20 requests in the last minute
- WHEN the client calls `POST /api/reservations` or `GET /api/reservations/check-availability`
- THEN the request is processed normally
- AND the response includes no rate-limit headers (200/201/400/409)

#### Scenario: Over limit — request blocked

- GIVEN a client has made 20 requests in the last minute
- WHEN the client makes another request to either rate-limited endpoint
- THEN HTTP 429 is returned
- AND the response includes a `Retry-After` header with the remaining seconds

### Requirement: RS-REQ-004 — Hold expiration cron (ADDED)

The system SHALL expire stale holds on a scheduled interval.

#### Scenario: Cron expires stale holds

- GIVEN three `pending_approval` reservations where `holdExpiry < now()` and one where `holdExpiry > now()`
- WHEN the Vercel Cron job hits `/api/cron/expire-holds`
- THEN the three expired reservations are updated to `status = 'expired'`
- AND the non-expired reservation is untouched
- AND expiry emails are sent to the affected users (fire-and-forget)

#### Scenario: Cron runs with no stale holds

- GIVEN no `pending_approval` reservations have passed their `holdExpiry`
- WHEN the cron job executes
- THEN zero rows are updated
- AND HTTP 200 is returned with `{ expired: 0 }`

## CAPABILITY: data-integrity

| # | Requirement | Kind | Scenarios |
|---|------------|------|-----------|
| DI-REQ-001 | Price display MUST remove the `/100` division in `reservation-list.tsx` and `reservation-actions.tsx`. All monetary values are stored as whole dollars. | MODIFIED | 2 |
| DI-REQ-002 | `CreateCruiseSchema` MUST include a required `returnDate` field, and `POST /api/admin/cruises` MUST persist it. | MODIFIED | 2 |
| DI-REQ-003 | Public blog queries MUST filter by `status = 'published'` to prevent draft enumeration. | MODIFIED | 2 |

### Requirement: DI-REQ-001 — Whole-dollar price display (MODIFIED)

The system MUST display prices in whole dollars without `/100` division.

(Previously: `totalAmount` was divided by 100 before display, incorrectly showing $33.00 instead of $3,300.)

#### Scenario: Price displays correctly in reservation list

- GIVEN a reservation with `totalAmount = 3300`
- WHEN `ReservationCard` renders the price
- THEN the display shows `$3,300` (not `$33.00`)

#### Scenario: Price displays correctly in WhatsApp/email share

- GIVEN a reservation with `totalAmount = 3300`
- WHEN `ReservationActions` constructs the WhatsApp text or email body
- THEN the total reads `$3,300 USD` (not `$33.00 USD`)

### Requirement: DI-REQ-002 — returnDate validation (MODIFIED)

The `CreateCruiseSchema` MUST include `returnDate` as a required field.

(Previously: `returnDate` was accepted by the admin form UI but silently dropped by server-side validation and not persisted.)

#### Scenario: Valid cruise creation includes returnDate

- GIVEN a cruise creation request with `returnDate: "2026-08-24"`
- WHEN `POST /api/admin/cruises` processes the request
- THEN the cruise is created with `returnDate` persisted
- AND HTTP 201 is returned

#### Scenario: Missing returnDate is rejected

- GIVEN a cruise creation request without `returnDate`
- WHEN `POST /api/admin/cruises` receives the body
- THEN Zod validation fails
- AND HTTP 400 is returned with a validation error

### Requirement: DI-REQ-003 — Blog post enumeration hardening (MODIFIED)

Public blog endpoints MUST NOT expose draft/unpublished posts.

(Previously: the public blog list page already filters by `status: 'published'` and the detail page returns `notFound()` for drafts. This requirement formalizes the existing behavior as a MUST.)

#### Scenario: Draft post returns 404 from public detail page

- GIVEN a blog post with `status = 'draft'` exists with ID `post-123`
- WHEN a user requests `/blog/post-123`
- THEN the server returns a 404 page (via `notFound()`)
- AND no timing difference exists between "ID not found" and "post is draft"

#### Scenario: Blog list shows only published posts

- GIVEN 3 published and 2 draft blog posts exist
- WHEN the public blog page loads
- THEN only the 3 published posts are returned from the query
- AND draft posts are not included in the response

## CAPABILITY: admin

| # | Requirement | Kind | Scenarios |
|---|------------|------|-----------|
| ADM-REQ-001 | Admin catch blocks MUST distinguish `AuthError` from `getSessionUser` (no session → 401) vs. `ForbiddenError` from `requireAdmin` (not admin → 403). | MODIFIED | 3 |
| ADM-REQ-002 | Zod validation error responses in production MUST NOT leak schema internals. The `details` field SHALL be omitted when `NODE_ENV=production`. | MODIFIED | 2 |
| ADM-REQ-003 | Admin mutations SHALL create audit log entries for Blog CRUD, Cruise CRUD, and user registration events. | ADDED | 3 |

### Requirement: ADM-REQ-001 — 401/403 status distinction (MODIFIED)

Admin error handlers MUST return 401 for missing authentication and 403 for insufficient authorization.

(Previously: all `AuthError` instances were caught and returned as 403, regardless of whether the error came from `getSessionUser` [no session] or `requireAdmin` [not admin].)

#### Scenario: No session → 401

- GIVEN a request to `GET /api/admin/dashboard` without a session cookie
- WHEN `requireAdmin()` calls `getSessionUser()` and it throws `AuthError('Authentication required')`
- THEN the catch block returns HTTP 401 with `{ "error": "Authentication required" }`

#### Scenario: Non-admin user → 403

- GIVEN a request to `GET /api/admin/dashboard` with a valid session for a non-admin user
- WHEN `requireAdmin()` throws `ForbiddenError('Admin access required')`
- THEN the catch block returns HTTP 403 with `{ "error": "Admin access required" }`

#### Scenario: Admin user → success

- GIVEN a request to `GET /api/admin/dashboard` with a valid admin session
- WHEN `requireAdmin()` returns the admin user object
- THEN the handler proceeds normally and returns dashboard data with HTTP 200

### Requirement: ADM-REQ-002 — Zod error sanitization (MODIFIED)

Production error responses SHALL NOT expose Zod `.flatten()` schema details.

(Previously: all 400 validation errors included full `.flatten()` output regardless of environment.)

#### Scenario: Validation error in development

- GIVEN `NODE_ENV` is NOT `production`
- WHEN a Zod validation fails
- THEN the response includes `{ error: "Validation failed", details: <flattened errors> }`

#### Scenario: Validation error in production

- GIVEN `NODE_ENV` is `production`
- WHEN a Zod validation fails
- THEN the response is `{ error: "Validation failed" }` with NO `details` field

### Requirement: ADM-REQ-003 — Audit log coverage (ADDED)

The system SHALL log admin mutations to the `audit_log` table.

#### Scenario: Blog post created → audit log written

- GIVEN an admin creates a blog post via `POST /api/admin/blog`
- WHEN the post is persisted
- THEN an `audit_log` row is created with `action = 'blog.created'`, `entityType = 'blog_post'`, and the actor's email
- AND the log write does NOT block the HTTP response (fire-and-forget via `.catch()`)

#### Scenario: Cruise updated → audit log written

- GIVEN an admin updates a cruise via `PATCH /api/admin/cruises/[id]`
- WHEN the cruise is updated
- THEN an `audit_log` row is created with `action = 'cruise.updated'`, including changed fields in `details`

#### Scenario: User registered → audit log written

- GIVEN a user registers via `POST /api/auth/session` with a `name` field
- WHEN the user is created in the database
- THEN an `audit_log` row is created with `action = 'user.registered'`, `entityType = 'user'`
