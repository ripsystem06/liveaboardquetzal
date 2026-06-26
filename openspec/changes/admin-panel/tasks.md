# Tasks: admin-panel

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2,400 (600 new + 1,800 new files content) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 4 work units (Foundation → API Routes → Admin UI → Blog+Public) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation (config, auth, schema, UserContext) | PR 1 | Base: main; prisma migrate included |
| 2 | API Routes (all /api/admin/*) | PR 2 | Base: PR 1; standalone backend |
| 3 | Admin UI (layout, dashboard, reservations, cruises, blog) | PR 3 | Base: PR 2; full admin UI |
| 4 | Blog public pages + nav + i18n | PR 4 | Base: PR 3; final wiring |

## Phase 0: Foundation

- [x] 0.1 Create `lib/config.ts` with `ADMIN_EMAIL = 'admin@quetzal.com'` constant
- [x] 0.2 Create `lib/admin-auth.ts` with `requireAdmin()` helper — FIXED in PR 2 (was broken: compared userId to email)
- [x] 0.3 Modify `prisma/schema.prisma` — add `notes String?` to Reservation model
- [x] 0.4 Modify `prisma/schema.prisma` — add `Cruise` model (id, name, departureDate, route, boat, basicPrice, standardPrice, premiumPrice, createdAt, updatedAt)
- [x] 0.5 Modify `prisma/schema.prisma` — add `BlogPost` model (id, title, content, imageUrl, status, createdAt, updatedAt)
- [x] 0.6 Run `prisma migrate dev` to apply schema changes
- [x] 0.7 Modify `contexts/user-context.tsx` — add `isAdmin` boolean computed as `user?.email === ADMIN_EMAIL`

## Phase 1: API Routes (PR 2)

- [x] 1.1 Create `app/api/admin/dashboard/route.ts` — GET aggregates (confirmedRevenue, pendingCount, revenueByCruise)
- [x] 1.2 Create `app/api/admin/reservations/route.ts` — GET list with status/cruiseId/date filters
- [x] 1.3 Create `app/api/admin/reservations/[id]/route.ts` — GET single + PATCH status/notes transitions (approve→confirmed, cancel→cancelled, suspend→pending_approval)
- [x] 1.4 Create `app/api/admin/cruises/route.ts` — GET list + POST create
- [x] 1.5 Create `app/api/admin/cruises/[id]/route.ts` — GET + PATCH + DELETE (DELETE returns 409 if confirmed reservations exist)
- [x] 1.6 Create `app/api/admin/blog/route.ts` — GET list + POST create with FIFO delete (if count >= 5, delete oldest by createdAt before insert)
- [x] 1.7 Create `app/api/admin/blog/[id]/route.ts` — GET + PATCH + DELETE

## Phase 2: Admin UI — Layout & Dashboard

- [x] 2.1 Create `app/admin/page.tsx` — Admin shell page (client component)
- [x] 2.2 Create `components/admin/admin-layout.tsx` — Sidebar with Dashboard/Reservations/Cruises/Blog tabs (reuse account-page-client pattern)
- [x] 2.3 Create `components/admin/admin-dashboard.tsx` — Stat cards (confirmedRevenue, pendingCount, confirmedCount) + revenueByCruise table

## Phase 3: Admin UI — Reservations

- [x] 3.1 Create `components/admin/admin-reservations.tsx` — Table with status/cruiseId/date filters + approve/cancel/suspend action buttons
- [x] 3.2 Create `components/admin/reservation-detail-modal.tsx` — Full reservation detail + editable notes field

## Phase 4: Admin UI — Cruises

- [x] 4.1 Create `components/admin/admin-cruises.tsx` — CRUD table listing all cruises
- [x] 4.2 Create `components/admin/cruise-form-modal.tsx` — Add/edit cruise form (name, departureDate, route, boat, tier prices)

## Phase 5: Admin UI — Blog

- [x] 5.1 Create `components/admin/admin-blog.tsx` — CRUD table + FIFO indicator "X/5 posts used"
- [x] 5.2 Create `components/admin/blog-form-modal.tsx` — Add/edit blog form (title, content, imageUrl, status: draft/published)

## Phase 6: Blog — Public Pages + Wiring

- [x] 6.1 Modify `app/blog/page.tsx` — Server component fetching only `published` posts, reverse chronological order
- [x] 6.2 Create `app/blog/[id]/page.tsx` — Dynamic detail page, returns 404 for draft posts
- [x] 6.3 Modify `components/navigation.tsx` — Add admin link visible only when `isAdmin === true`
- [x] 6.4 Modify `contexts/language-context.tsx` — Add all admin section and blog i18n keys

## Phase 7: Tests

- [x] 7.1 Unit test `lib/admin-auth.ts` — admin vs non-admin userId returns, AuthError cases
- [x] 7.2 Unit test blog FIFO logic — verify oldest deleted when count >= 5
- [x] 7.3 Integration tests for each `/api/admin/*` route — admin session, non-admin 403, unauthenticated 401
- [x] 7.4 Integration test cruise DELETE — 409 when confirmed reservations exist
