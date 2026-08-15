# Delta Specs: Infrastructure — admin

## MODIFIED Requirements

### Requirement: ADM-REQ-003 — Audit log coverage (MODIFIED)

The system SHALL log admin mutations to the `audit_log` table.

(Previously: the "User registered" scenario recorded registration via the password-based `POST /api/auth/session` route; registration now occurs via OTP-verified user upsert.)

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

- GIVEN a new user verifies an OTP for the first time with a `name` field
- WHEN the user is created (upserted) in the database
- THEN an `audit_log` row is created with `action = 'user.registered'`, `entityType = 'user'`
