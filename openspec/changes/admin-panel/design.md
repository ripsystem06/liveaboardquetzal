# Design: admin-panel

## Technical Approach

Build an admin dashboard at `/admin` with 4 sections (Dashboard, Reservations, Cruises, Blog). Admin access is granted via fixed email `admin@quetzal.com` through the existing mock auth flow — no JWT/OAuth. The design reuses the sidebar tab pattern from `account-page-client.tsx` and follows the API auth pattern from `app/api/reservations/route.ts`.

## Architecture Decisions

### Decision: Admin detection via email match

**Choice**: Hardcode `ADMIN_EMAIL = 'admin@quetzal.com'` in `lib/config.ts`. Modify `UserContext` to compute `isAdmin = user?.email === ADMIN_EMAIL`.
**Alternatives considered**: Separate admin login page, JWT roles, middleware-based role checking.
**Rationale**: Matches the existing mock auth pattern. Avoids building a separate login flow. Acceptable for this project's scope — proposal explicitly calls out JWT/real auth as out of scope.

### Decision: `requireAdmin()` auth helper

**Choice**: Create `lib/admin-auth.ts` with `requireAdmin(): Promise<{userId: string, isAdmin: boolean}>` that calls `getAuthUserId()` then checks email against `ADMIN_EMAIL`.
**Alternatives considered**: Decorator pattern, middleware wrapper.
**Rationale**: Mirrors the `getAuthUserId() + AuthError` pattern already in `lib/auth.ts`. Each route calls `requireAdmin()` at the top and catches `AuthError` for 401/403 responses.

### Decision: Cruise data stored in Prisma (not mock array)

**Choice**: Add `Cruise` model to Prisma schema for full CRUD.
**Alternatives considered**: Keep in mock array on the client/server.
**Rationale**: Admins need to create/edit/delete cruise departures. Persisting to DB enables the same data to power the public booking flow. SQLite handles this scale fine.

### Decision: Blog FIFO via application-level delete-before-insert

**Choice**: On `POST /api/admin/blog`, count published posts first. If count >= 5, delete the oldest by `createdAt` before inserting.
**Alternatives considered**: Database trigger, separate "archived" flag.
**Rationale**: Simple and explicit. No need for special migration logic. The UI shows "X/5 posts used" so the admin is aware.

## Data Flow

```
Browser                      Admin API Routes              Prisma
  │                                  │                          │
  │── GET /admin ──────────────────→ │                          │
  │←─ admin layout (sidebar) ─────── │                          │
  │                                  │                          │
  │── GET /api/admin/dashboard ────→ requireAdmin() ───────────→ │
  │←─ { confirmedRevenue, cruises[] } │←─────────────────────────│
  │                                  │                          │
  │── PATCH /api/admin/reservations/[id] ──→ requireAdmin() ───→│
  │←─ updated reservation ──────────── │←─────────────────────────│
  │                                  │                          │
  │── POST /api/admin/blog ────────→ requireAdmin() ───────────→│
  │                                  │  if count >= 5:          │
  │                                  │    delete oldest ───────→│
  │                                  │  create new ───────────→│
  │←─ created post ───────────────── │←─────────────────────────│
```

## Data Model Changes

### Prisma Schema (`prisma/schema.prisma`)

Add two models and one field:

```prisma
model Reservation {
  // ... existing fields ...
  notes     String?  // crew names, admin annotations
}

model Cruise {
  id            String   @id @default(cuid())
  name          String   // e.g. "Socorro Islands"
  departureDate String   // ISO date string
  route         String   // e.g. "Revillagigedo Archipelago"
  boat          String   // "Quetzal"
  basicPrice    Int      // USD
  standardPrice Int      // USD
  premiumPrice  Int      // USD
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model BlogPost {
  id        String   @id @default(cuid())
  title     String
  content   String
  imageUrl  String?
  status    String   // "draft" | "published"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

SQLite note: no enum support, use `String` with inline comments documenting valid values.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `lib/config.ts` | Create | `ADMIN_EMAIL = 'admin@quetzal.com'` constant |
| `lib/admin-auth.ts` | Create | `requireAdmin()` helper |
| `prisma/schema.prisma` | Modify | Add `notes` to Reservation, add Cruise and BlogPost models |
| `contexts/user-context.tsx` | Modify | Add `isAdmin` boolean, compute from email match |
| `app/admin/page.tsx` | Create | Admin shell page (client component with sidebar) |
| `components/admin/admin-layout.tsx` | Create | Sidebar + tab content layout (reuses account-page-client pattern) |
| `components/admin/admin-dashboard.tsx` | Create | Stat cards + revenue by cruise |
| `components/admin/admin-reservations.tsx` | Create | Table + filters + actions |
| `components/admin/admin-cruises.tsx` | Create | CRUD table + form modal |
| `components/admin/admin-blog.tsx` | Create | CRUD table + form modal with FIFO indicator |
| `components/admin/reservation-detail-modal.tsx` | Create | Full reservation detail + notes field |
| `components/admin/cruise-form-modal.tsx` | Create | Add/edit cruise form |
| `components/admin/blog-form-modal.tsx` | Create | Add/edit blog form |
| `app/api/admin/dashboard/route.ts` | Create | Dashboard aggregates |
| `app/api/admin/reservations/route.ts` | Create | List with filters |
| `app/api/admin/reservations/[id]/route.ts` | Create | Get single + PATCH status/notes |
| `app/api/admin/cruises/route.ts` | Create | List + create |
| `app/api/admin/cruises/[id]/route.ts` | Create | Get + patch + delete |
| `app/api/admin/blog/route.ts` | Create | List all + create with FIFO |
| `app/api/admin/blog/[id]/route.ts` | Create | Get + patch + delete |
| `app/blog/page.tsx` | Modify | Server component fetching published posts |
| `app/blog/[id]/page.tsx` | Create | Dynamic detail page |
| `components/navigation.tsx` | Modify | Add admin link for `isAdmin` users |
| `contexts/language-context.tsx` | Modify | Add all admin + blog i18n keys |

## Interfaces / Contracts

### API Response Shapes

```typescript
// GET /api/admin/dashboard
{ confirmedRevenue: number, pendingCount: number, confirmedCount: number,
  revenueByCruise: { cruiseId, cruiseName, departureDate, count, totalGuests, revenue }[] }

// GET /api/admin/reservations?status=&cruiseId=&date=
{ reservations: Reservation[] }

// GET /api/admin/reservations/[id]
{ reservation: Reservation }

// PATCH /api/admin/reservations/[id]
{ status?: string, notes?: string }

// GET /api/admin/cruises
{ cruises: Cruise[] }

// POST /api/admin/cruises
{ name, departureDate, route, boat, basicPrice, standardPrice, premiumPrice }

// PATCH /api/admin/cruises/[id]
{ name?, departureDate?, route?, basicPrice?, standardPrice?, premiumPrice? }

// DELETE /api/admin/cruises/[id] → 409 if confirmed reservations exist

// GET /api/admin/blog
{ posts: BlogPost[], totalCount: number }

// POST /api/admin/blog → auto-deletes oldest if count >= 5
{ title, content, imageUrl?, status: 'draft' | 'published' }

// PATCH /api/admin/blog/[id]
{ title?, content?, imageUrl?, status? }
```

### UserContext Extension

```typescript
interface UserContextType {
  // ... existing ...
  isAdmin: boolean  // computed: user?.email === ADMIN_EMAIL
}
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `requireAdmin()` logic, FIFO count logic | Vitest tests on helper functions |
| Integration | Each API route with admin/non-admin/missing session | Test with `supertest` or direct `fetch` in test env |
| E2E | Full admin flow: login as admin, navigate tabs, CRUD operations | Playwright: login → dashboard → reserve approve → cruise create → blog post |

## Migration / Rollback

**Migration**: Run `prisma migrate dev` to apply:
- Add `notes` column to Reservation (nullable)
- Create Cruise table
- Create BlogPost table

**Rollback**: `prisma migrate revert` removes the new tables/columns. Reservation data is untouched.

## Open Questions

- [ ] Should `demo@quetzal.com` also get admin access for testing, or strictly `admin@quetzal.com` only? Currently spec says only `admin@quetzal.com`.
- [ ] Blog post `imageUrl` is a string field — should we validate it as a URL, or accept any string for flexibility?
- [ ] Cruise delete protection checks for any `confirmed` reservation on that cruise+date — should it also check `pending_approval` holds?
