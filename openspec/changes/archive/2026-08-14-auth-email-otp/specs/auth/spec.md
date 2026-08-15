# Auth Specification

## Purpose

Passwordless authentication: email + 6-digit OTP is the primary login, Google OAuth stays as the social option, JWT sessions, admin guards. Email/password (Credentials) login is removed.

## Requirements

### Requirement: Email OTP Request

The system MUST issue a single-use 6-digit OTP when a user requests login by email. The code MUST be stored as a hash with an expiry and an attempt counter, and MUST be emailed via `sendOtpEmail`. Requests MUST be rate-limited per-IP and per-email. The system MUST NOT reveal whether an email is registered.

#### Scenario: OTP requested and delivered

- GIVEN a user submits an email on the booking login form
- WHEN the user requests a login code
- THEN a 6-digit code is generated, stored only as a hash with expiry and attempts
- AND the code is emailed via `sendOtpEmail`

#### Scenario: No account enumeration

- GIVEN an email that may or may not be registered
- WHEN an OTP is requested
- THEN the response is identical regardless of registration status

#### Scenario: Request rate limit exceeded

- GIVEN a client that has exceeded the OTP request rate limit
- WHEN another code is requested
- THEN HTTP 429 is returned

### Requirement: OTP Verification and Session Issuance

The system MUST verify a submitted OTP using a timing-safe hash comparison, checking expiry, single-use, and remaining attempts. On success the repurposed Credentials `authorize` MUST return the user and Auth.js SHALL mint a JWT session. A wrong, expired, or reused code MUST fail, and exceeding max attempts SHALL invalidate the code and lock it out. Verification MUST be audit-logged.

#### Scenario: Valid code issues a session

- GIVEN an unexpired, unused OTP code for an email
- WHEN the user submits the matching email and code
- THEN the code is marked consumed and a JWT session is issued

#### Scenario: Wrong, expired, or reused code fails

- GIVEN a submitted code that does not match, is expired, or was already consumed
- WHEN verification runs
- THEN sign-in fails and no session is issued

#### Scenario: Lockout after max attempts

- GIVEN a code that has reached its maximum attempt count
- WHEN another attempt is made
- THEN the code is invalidated, sign-in is rejected, and an audit event is logged

### Requirement: Registration via First Login

The system MUST create an account on the first successful OTP verification for an unknown email, capturing the `name`. A known email MUST link to the existing account (upsert, no duplicate).

#### Scenario: New email creates account

- GIVEN no user exists for the submitted email
- WHEN OTP verification succeeds with a `name` supplied
- THEN a User is created with that email and name

#### Scenario: Existing email links account

- GIVEN a user already exists for the submitted email
- WHEN OTP verification succeeds
- THEN sign-in links to the existing account without creating a duplicate

### Requirement: Google OAuth Unchanged

The Google provider MUST remain available and SHALL issue the same JWT session shape (`id`, `isAdmin`, `phone`).

#### Scenario: Google sign-in still works

- GIVEN a user chooses Google sign-in
- WHEN OAuth completes
- THEN the session carries the same `id`, `isAdmin`, and `phone` fields as before

### Requirement: Password Login Removal

The system MUST NOT authenticate via email/password. `POST /api/auth/register` SHALL be removed. `User.passwordHash` SHALL be retained but unused, and MUST remain nullable.

#### Scenario: Password no longer authenticates

- GIVEN a user submits an email and password
- WHEN they attempt to sign in
- THEN the system does not authenticate via password

#### Scenario: Legacy hashes retained

- GIVEN existing users have a `passwordHash`
- WHEN the schema changes
- THEN `passwordHash` stays nullable and retained but is never used for authentication

### Requirement: Admin Login

Admins MUST authenticate through the same email OTP flow. `requireAdmin` MUST continue to read `isAdmin` from the JWT.

#### Scenario: Admin signs in via OTP

- GIVEN a user with `isAdmin=true`
- WHEN they complete OTP login
- THEN the JWT carries `isAdmin=true` and `requireAdmin` passes

### Requirement: OTP Security Invariants

The system MUST hash OTP codes at rest, MUST enforce a 10-minute expiry, MUST enforce a 5-attempt maximum with lockout, MUST prevent replay (single-use), and MUST rate-limit both request and verify endpoints.

#### Scenario: Reused code rejected

- GIVEN a code already consumed
- WHEN it is submitted again
- THEN verification fails (replay prevented)

#### Scenario: Exhausted attempts lock out

- GIVEN a code with 5 failed attempts
- WHEN a further attempt is made
- THEN the code is invalidated and a fresh request is required

### Requirement: Email Delivery

Resend MUST deliver the OTP email via `sendOtpEmail`. When `RESEND_API_KEY` is unset, the system SHALL fall back to a mock email client. `FROM_EMAIL` SHALL be respected.

#### Scenario: Production delivery via Resend

- GIVEN `RESEND_API_KEY` is set
- WHEN an OTP is requested
- THEN Resend sends the email from `FROM_EMAIL`

#### Scenario: Mock fallback in development

- GIVEN `RESEND_API_KEY` is unset
- WHEN an OTP is requested
- THEN the mock email client logs the email instead of sending
