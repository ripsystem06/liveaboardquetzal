# Proposal: admin-panel

## Intent

Build an admin dashboard for managing reservations, cruise dates, and blog content. Admin access is granted via a fixed email (`admin@quetzal.com`) using the existing mock login flow. The panel reuses the sidebar layout pattern from the account page and adds 4 sections: Dashboard, Reservations, Cruises, and Blog.

## Scope

### In Scope
- **Admin Auth**: Hardcoded admin email check. No separate login. Admin link appears in navigation when admin is logged in.
- **Dashboard**: Revenue stats — total confirmed reservations, total pending, revenue by cruise, guest count summary.
- **Reservation Management**: Table view with status filters. Actions: approve, cancel, suspend. Detail view with crew names.
- **Cruise/Date Management**: CRUD for departure dates with tier pricing. Stored in DB (not mock array).
- **Blog System**: Max 5 posts, FIFO auto-delete. Fields: title, content, imageUrl, status (draft/published). Public blog page at `/blog`.
- **Admin API Routes**: Protected endpoints for all admin operations under `/api/admin/*`.

### Out of Scope
- Real authentication (JWT/OAuth)
- Image upload (blog uses imageUrl field)
- Email notifications from admin panel
- Multi-admin roles
- Supabase migration
- Stripe/PayPal real integration

## Capabilities

### New Capabilities
- `admin-auth`: Admin identification via email check, protected routes
- `admin-dashboard`: Revenue and booking statistics
- `admin-reservations`: CRUD management of reservations with status transitions
- `admin-cruises`: Departure date and pricing management
- `admin-blog`: Content management with FIFO cap of 5 posts
- `public-blog`: Public blog listing/detail pages

### Modified Capabilities
- `user-auth`: Extended to recognize admin email and expose `isAdmin` flag

## Approach

1. **Admin detection**: Modify `UserContext` to set `isAdmin: true` when email matches `ADMIN_EMAIL` env var or constant.
2. **Admin layout**: Create `/admin` page with sidebar navigation (Dashboard, Reservations, Cruises, Blog tabs).
3. **Prisma schema**: Add `BlogPost` model. Optionally add `notes` field to `Reservation` for crew names.
4. **API routes**: `/api/admin/*` with admin auth middleware.
5. **Dashboard**: Aggregate queries on Reservation model (count by status, sum revenue, group by cruise).
6. **Blog FIFO**: On create, if count >= 5, delete the oldest post before inserting.
7. **Public blog**: Server component at `/blog` fetching published posts. Dynamic route `/blog/[id]` for detail.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `contexts/user-context.tsx` | Modified | Add `isAdmin` flag |
| `prisma/schema.prisma` | Modified | Add `BlogPost` model, `notes` field on Reservation |
| `app/admin/page.tsx` | New | Admin client page with sidebar |
| `components/admin/` | New | Dashboard, reservation table, cruise form, blog editor |
| `app/api/admin/` | New | Admin API routes |
| `app/blog/` | New | Public blog pages |
| `components/navigation.tsx` | Modified | Admin link for admin users |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Admin email hardcoded — weak security | High (for prod) | Document as dev-only; production needs JWT + roles |
| Blog FIFO deletes content without warning | Low | Show count indicator "4/5 posts used" |
| Dashboard queries on SQLite may be slow with large data | Low | SQLite handles aggregates fine for expected scale |

## Rollback Plan

Remove admin routes, Prisma migration for BlogPost, and UserContext admin flag. No critical data loss — reservations remain intact.

## Dependencies

- Existing `lib/db.ts` (Prisma client)
- Existing `lib/auth.ts` (session cookie)
- Existing account page layout pattern
- Existing reservation data in DB

## Success Criteria

- [ ] Admin logs in with `admin@quetzal.com` and sees Admin Panel link
- [ ] Dashboard shows real reservation stats
- [ ] Admin can approve/cancel/suspend reservations
- [ ] Admin can create/modify cruise dates
- [ ] Blog FIFO correctly enforces 5-post limit
- [ ] Public `/blog` page displays published posts
- [ ] All admin API routes return 403 for non-admin users
