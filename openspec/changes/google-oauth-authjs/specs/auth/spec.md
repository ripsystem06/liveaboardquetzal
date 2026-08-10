# Auth Specification

## Purpose

Auth.js v5: Google OAuth primary, credentials fallback, JWT sessions, admin guards.

## Requirements

### Requirement: Google OAuth Sign-In

Users MUST sign in via Google OAuth 2.0 with JWT session result.

#### Scenario: Successful OAuth sign-in

- GIVEN unauthenticated user on booking page
- WHEN user clicks "Sign in with Google" and authorizes consent
- THEN Auth.js creates JWT session and redirects to booking callbackUrl

#### Scenario: OAuth consent denied

- GIVEN user on Google consent screen
- WHEN user denies consent
- THEN no session created and user returns to booking page with error

### Requirement: Credentials Login Fallback

The system MUST retain email/password login via Auth.js Credentials provider wrapping scrypt.

#### Scenario: Valid credentials

- GIVEN existing user with passwordHash
- WHEN user submits matching email and password
- THEN credentials provider verifies via scrypt and creates JWT session

#### Scenario: Invalid credentials

- GIVEN user submits email and password
- WHEN credentials do not match stored hash
- THEN provider returns null and Auth.js rejects sign-in

### Requirement: Session Management

Sessions MUST use Auth.js JWT in HTTP-only cookies. Server: `auth()`. Client: `useSession()`.

#### Scenario: Server reads valid session

- GIVEN active JWT session cookie
- WHEN protected route calls `auth()`
- THEN session contains user id, email, name, and isAdmin

#### Scenario: Expired or missing session

- GIVEN no valid Auth.js session cookie
- WHEN protected route calls `auth()`
- THEN returns null and route responds 401

### Requirement: Admin Authorization

`requireAdmin()` MUST read isAdmin from JWT. MUST return 401 (no session) or 403 (non-admin).

#### Scenario: Admin authorized

- GIVEN JWT has isAdmin=true
- WHEN `requireAdmin()` executes
- THEN guard passes and request continues

#### Scenario: Non-admin rejected

- GIVEN JWT has isAdmin=false
- WHEN `requireAdmin()` executes
- THEN 403 Forbidden returned

#### Scenario: Unauthenticated access

- GIVEN no session cookie
- WHEN `requireAdmin()` executes
- THEN 401 Unauthorized returned

### Requirement: Account Linking

The system MUST link Google accounts to existing users by email match via Prisma adapter.

#### Scenario: Matching email links accounts

- GIVEN User with email "a@b.com" and passwordHash exists
- WHEN same email signs in via Google OAuth first time
- THEN adapter creates Account linking Google identity to existing User

#### Scenario: New Google-only user

- GIVEN no user with the OAuth email exists
- WHEN user signs in via Google
- THEN new User (passwordHash=null) and linked Account created

### Requirement: Booking Flow State Preservation

The system MUST encode booking step in callbackUrl so user returns to correct step after OAuth.

#### Scenario: Step preserved through OAuth redirect

- GIVEN user at booking page step 1
- WHEN "Sign in with Google" is clicked
- THEN callbackUrl includes step and cruise params
- AND user lands at correct booking step after callback

### Requirement: Protected Route Guards

Auth.js middleware MUST protect `/api/admin/*`. User-owned routes MUST verify session via `auth()`.

#### Scenario: Middleware blocks unauthenticated admin access

- GIVEN Auth.js middleware matcher covers /api/admin/*
- WHEN unauthenticated request hits admin API route
- THEN middleware returns 401 before handler executes

#### Scenario: User-owned route with valid session

- GIVEN authenticated user with id "user-1"
- WHEN user requests GET /api/reservations
- THEN `auth()` returns session and reservations filter by user-1

### Requirement: Schema Migration

User.passwordHash MUST become optional. Account, Session, VerificationToken tables MUST exist via Prisma adapter.

#### Scenario: OAuth user created without password

- GIVEN schema migration has run
- WHEN new user signs in via Google OAuth
- THEN User created with passwordHash=null and Account linked

### Requirement: Session Invalidation on Deploy

All pre-migration `quetzal_session` cookies MUST be invalidated; Auth.js uses different cookie names.

#### Scenario: Old session ignored after deploy

- GIVEN user has active `quetzal_session` cookie from old auth
- WHEN Auth.js deployment is live
- THEN old cookie is ignored and user must sign in again
