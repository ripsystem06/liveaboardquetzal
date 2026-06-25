# Admin Panel Specification

## Purpose

Admin dashboard for managing reservations, cruise departures, and blog content. Admin access granted via fixed email (`admin@quetzal.com`) through existing mock login. All admin operations gated behind admin authentication middleware.

---

## Requirements

### Admin Authentication

### ADM-001: Admin Identification

The system SHALL identify an admin user when the authenticated user's email matches the configured admin email constant.

The `UserContext` SHALL expose `isAdmin: true` when `user.email === ADMIN_EMAIL`. The admin email constant SHALL be `admin@quetzal.com` unless overridden by `ADMIN_EMAIL` environment variable.

#### Scenario: Admin user recognized

- GIVEN a user is logged in with email `admin@quetzal.com`
- WHEN the user context is accessed
- THEN `isAdmin` SHALL be `true`
- AND the admin navigation link SHALL be visible

#### Scenario: Regular user not admin

- GIVEN a user is logged in with email `demo@quetzal.com`
- WHEN the user context is accessed
- THEN `isAdmin` SHALL be `false`
- AND the admin navigation link SHALL NOT be visible

#### Scenario: Unauthenticated user

- GIVEN no user is logged in
- WHEN any protected route is accessed
- THEN the system SHALL redirect to the login page

---

### ADM-002: Admin Route Protection

All routes under `/admin` and `/api/admin/*` SHALL enforce admin authentication. Non-admin users SHALL receive HTTP 403 on API routes and a client-side redirect to `/` on page routes.

#### Scenario: Non-admin accessing admin API

- GIVEN a non-admin user calls `GET /api/admin/dashboard`
- THEN the response SHALL be HTTP 403 with `{ error: "Admin access required" }`

#### Scenario: Non-admin accessing admin page

- GIVEN a non-admin user navigates to `/admin`
- THEN the client SHALL redirect to `/`

#### Scenario: Unauthenticated accessing admin API

- GIVEN an unauthenticated request to `POST /api/admin/reservations/approve`
- THEN the response SHALL be HTTP 401 with `{ error: "Authentication required" }`

---

### Dashboard

### ADM-003: Revenue Statistics

The dashboard SHALL display total confirmed revenue, count of pending reservations, and a breakdown of revenue grouped by cruise.

Revenue SHALL only include reservations with status `confirmed`. Each cruise row SHALL show: cruise name, departure date, number of confirmed reservations, total guest count, and total revenue.

#### Scenario: Dashboard with data

- GIVEN 3 confirmed reservations totaling $2,400 and 2 pending reservations exist
- WHEN the admin views the dashboard
- THEN the total confirmed revenue SHALL display `$2,400`
- AND pending count SHALL display `2`
- AND cruise breakdown SHALL list each cruise with its revenue

#### Scenario: Empty dashboard

- GIVEN no reservations exist
- WHEN the admin views the dashboard
- THEN all stat cards SHALL display `0` or `$0`
- AND the cruise table SHALL be empty

---

### ADM-004: Dashboard Data Loading

Dashboard data SHALL be loaded via `GET /api/admin/dashboard` which SHALL aggregate real reservation data from the database.

#### Scenario: Dashboard fetches real data

- GIVEN reservations exist in the database with various statuses
- WHEN `GET /api/admin/dashboard` is called with a valid admin session
- THEN the response SHALL include `{ confirmedRevenue, pendingCount, cruises[] }`
- AND all figures SHALL match database aggregates

---

### Reservation Management

### ADM-005: List Reservations with Filters

The admin reservation list SHALL support filtering by `status`, `cruiseId`, and `departureDate`. Default view SHALL show all reservations. Each row SHALL display: reservation ID, guest name (from user), cruise name, departure date, tier, guest count, total amount, status, and created date.

#### Scenario: Filter by status

- GIVEN reservations with statuses `confirmed`, `pending_approval`, and `cancelled` exist
- WHEN admin sets status filter to `pending_approval`
- THEN only reservations with `pending_approval` status SHALL be returned

#### Scenario: Filter by cruise and date

- GIVEN reservations exist for multiple cruises on multiple dates
- WHEN admin filters by a specific `cruiseId` and `departureDate`
- THEN only matching reservations SHALL be listed

---

### ADM-006: Approve Reservation

The admin SHALL be able to approve a `pending_approval` reservation, changing its status to `confirmed`.

#### Scenario: Approve pending reservation

- GIVEN a reservation with status `pending_approval` exists
- WHEN admin calls `POST /api/admin/reservations/approve` with `{ reservationId }`
- THEN the reservation status SHALL become `confirmed`
- AND the response SHALL be HTTP 200 with the updated reservation

#### Scenario: Cannot approve non-pending reservation

- GIVEN a reservation with status `confirmed` exists
- WHEN admin attempts to approve it
- THEN the response SHALL be HTTP 400 with `{ error: "Reservation is not pending approval" }`

---

### ADM-007: Cancel Reservation

The admin SHALL be able to cancel any reservation, changing its status to `cancelled`.

#### Scenario: Cancel reservation

- GIVEN a reservation with status `confirmed` exists
- WHEN admin calls `POST /api/admin/reservations/cancel` with `{ reservationId }`
- THEN the reservation status SHALL become `cancelled`
- AND the response SHALL be HTTP 200

---

### ADM-008: Suspend Reservation

The admin SHALL be able to suspend a reservation, changing its status back to `pending_approval`.

#### Scenario: Suspend reservation

- GIVEN a reservation with status `confirmed` exists
- WHEN admin calls `POST /api/admin/reservations/suspend` with `{ reservationId }`
- THEN the reservation status SHALL become `pending_approval`
- AND the response SHALL be HTTP 200

---

### ADM-009: View Reservation Detail

The admin SHALL be able to view full reservation details including: user name and email, cruise details (name, departure date, route, tier, price per tier), guest count, payment method, status history (if tracked), and the reservation `notes` field containing crew names and admin notes.

#### Scenario: View full reservation detail

- GIVEN a reservation with notes containing crew names exists
- WHEN admin fetches `GET /api/admin/reservations/[id]`
- THEN the response SHALL include all reservation fields
- AND the `notes` field SHALL contain crew name information

---

### Cruise Management

### ADM-010: Create Cruise Departure Date

The admin SHALL be able to create a new cruise departure with tier pricing. A cruise departure record SHALL include: cruise ID (unique identifier), departure date, route description, and pricing for each tier (basic, standard, premium).

#### Scenario: Create new cruise departure

- GIVEN admin provides cruise ID, departure date, route, and tier prices
- WHEN admin calls `POST /api/admin/cruises` with complete data
- THEN a new cruise departure record SHALL be created in the database
- AND the response SHALL be HTTP 201 with the created record

#### Scenario: Create cruise with missing fields

- GIVEN admin provides incomplete cruise data (missing premium price)
- WHEN admin calls `POST /api/admin/cruises`
- THEN the response SHALL be HTTP 400 with validation error

---

### ADM-011: Edit Cruise

The admin SHALL be able to edit an existing cruise departure's date, route, and tier pricing.

#### Scenario: Edit cruise dates and prices

- GIVEN an existing cruise departure record exists
- WHEN admin calls `PATCH /api/admin/cruises/[id]` with updated pricing
- THEN the cruise record SHALL be updated
- AND the response SHALL be HTTP 200 with the updated record

---

### ADM-012: Delete Cruise Date

The admin SHALL be able to delete a cruise departure date, but only if no confirmed reservations exist for that cruise and date.

#### Scenario: Delete cruise with no reservations

- GIVEN a cruise departure has no associated reservations
- WHEN admin calls `DELETE /api/admin/cruises/[id]`
- THEN the cruise record SHALL be deleted
- AND the response SHALL be HTTP 200

#### Scenario: Cannot delete cruise with confirmed reservations

- GIVEN a cruise departure has at least one `confirmed` reservation
- WHEN admin calls `DELETE /api/admin/cruises/[id]`
- THEN the response SHALL be HTTP 409 with `{ error: "Cannot delete cruise with existing reservations" }`

---

### ADM-013: List All Cruises

The admin SHALL be able to list all cruise departure records with their current pricing.

#### Scenario: List all cruises

- GIVEN multiple cruise departures exist in the database
- WHEN admin calls `GET /api/admin/cruises`
- THEN all cruise records SHALL be returned with tier pricing
- AND the response SHALL be HTTP 200

---

### Blog Management

### ADM-014: Create Blog Post with FIFO Cap

The system SHALL enforce a maximum of 5 published blog posts. When a new post is created and the total count is already 5, the oldest post by `createdAt` SHALL be automatically deleted before the new one is inserted.

#### Scenario: Create post under limit

- GIVEN 3 published posts exist
- WHEN admin creates a new post via `POST /api/admin/blog`
- THEN a new post SHALL be created
- AND total published posts SHALL be 4

#### Scenario: Create post at FIFO limit

- GIVEN 5 published posts exist
- WHEN admin creates a new post via `POST /api/admin/blog`
- THEN the oldest post SHALL be automatically deleted
- AND the new post SHALL be created
- AND total published posts SHALL remain 5

---

### ADM-015: Edit Blog Post

The admin SHALL be able to edit any blog post's title, content, imageUrl, and status (draft/published).

#### Scenario: Edit blog post

- GIVEN a blog post exists with title "Old Title"
- WHEN admin calls `PATCH /api/admin/blog/[id]` with `{ title: "New Title" }`
- THEN the post title SHALL be updated
- AND the response SHALL be HTTP 200

---

### ADM-016: Delete Blog Post

The admin SHALL be able to delete any blog post.

#### Scenario: Delete blog post

- GIVEN a blog post exists
- WHEN admin calls `DELETE /api/admin/blog/[id]`
- THEN the post SHALL be removed from the database
- AND the response SHALL be HTTP 200

---

### ADM-017: Public Blog Listing Page

The public blog listing page at `/blog` SHALL display all `published` blog posts in reverse chronological order. It SHALL be a Server Component fetching directly from the database.

#### Scenario: Public blog shows published posts

- GIVEN 3 published posts and 1 draft post exist
- WHEN a visitor navigates to `/blog`
- THEN only the 3 published posts SHALL be displayed
- AND draft posts SHALL NOT be visible

#### Scenario: Empty blog

- GIVEN no published posts exist
- WHEN a visitor navigates to `/blog`
- THEN an empty state message SHALL be displayed

---

### ADM-018: Public Blog Detail Page

The public blog detail page at `/blog/[id]` SHALL display a single published blog post. Draft posts SHALL return HTTP 404 when accessed directly.

#### Scenario: View published blog post

- GIVEN a published blog post with ID `abc123` exists
- WHEN a visitor navigates to `/blog/abc123`
- THEN the full post content SHALL be displayed
- AND the page SHALL return HTTP 200

#### Scenario: Cannot view draft post

- GIVEN a draft blog post exists
- WHEN a visitor attempts to access `/blog/[draft-id]`
- THEN the page SHALL return HTTP 404

---

### Data Model

### ADM-019: BlogPost Model in Prisma Schema

The Prisma schema SHALL include a `BlogPost` model with fields: `id` (cuid), `title` (string), `content` (string), `imageUrl` (string, optional), `status` (string: "draft" | "published"), `createdAt` (DateTime, default now), `updatedAt` (DateTime, updated).

#### Scenario: BlogPost model exists

- GIVEN the Prisma schema is applied
- THEN the `BlogPost` table SHALL exist with the specified fields
- AND migrations SHALL run without error

---

### ADM-020: Reservation Notes Field

The `Reservation` model SHALL include an optional `notes` field (string) for storing crew names and admin annotations.

#### Scenario: Reservation notes field exists

- GIVEN the schema migration is applied
- THEN the `Reservation` table SHALL have a nullable `notes` column
- AND admin can read/write notes via reservation detail API
