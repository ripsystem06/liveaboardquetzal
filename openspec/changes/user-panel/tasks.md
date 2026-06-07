# Tasks: user-panel

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~800-1000 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 (stacked-to-main) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation: UserContext + use-user-storage + UserProvider in layout | PR 1 | Base = main; includes mock credentials; tests for hook |
| 2 | Account page: /account route, ProfileForm, ReservationHistory, AccountGuard | PR 2 | Base = PR 1; tests for guard + form + list |
| 3 | Booking flow migration: LoginForm → BookingPageClient + nav + translations | PR 3 | Base = PR 2; integration tests; E2E |

## Phase 1: Foundation (PR 1 — base: main)

- [x] 1.1 Create `contexts/user-context.tsx` with `UserProvider`, `useUser()` hook, `User` type, and mock credentials (`demo@quetzal.com / 123456`)
- [x] 1.2 Create `hooks/use-user-storage.ts` with load-on-mount and save-on-change logic, graceful handling of corrupted/missing data
- [x] 1.3 Add `UserProvider` inside `LanguageProvider` in `app/layout.tsx`
- [x] 1.4 Write unit tests for `use-user-storage`: corrupted JSON, missing key, null user
- [x] 1.5 Write unit tests for `useUser()`: login → state updates, logout → state clears, session restore on mount

## Phase 2: Account Page (PR 2 — base: PR 1)

- [x] 2.1 Create `app/account/page.tsx` with client-side `AccountGuard` redirect to `/booking` if unauthenticated
- [x] 2.2 Create `components/account/profile-form.tsx` with editable name/phone, read-only email, save button calling `updateProfile()`
- [x] 2.3 Create `components/account/reservation-history.tsx` displaying reservations from `quetzal_reservations` with status badges (yellow/amber=Pending, blue=Confirmed, green=Completed), "No reservations yet" when empty
- [x] 2.4 Add account translation keys to `contexts/language-context.tsx` (EN + ES): `account.title`, `account.profile`, `account.reservations`, `account.save`, `account.edit`, `account.name`, `account.email`, `account.phone`, `account.noReservations`
- [x] 2.5 Write integration tests: unauthenticated `/account` access redirects to `/booking` (test written, redirect behavior verified via component render)
- [x] 2.6 Write unit tests: ProfileForm pre-fills and calls `updateProfile()`, ReservationHistory renders badges and empty state

## Phase 3: Booking Flow Migration + Navigation + Tests (PR 3 — base: PR 2)

- [x] 3.1 Migrate `components/booking/login-form.tsx`: remove local `VALID_EMAIL/VALID_PASSWORD`, call `login()` from `useUser()` context instead of `onSuccess` prop
- [x] 3.2 Migrate `components/booking/booking-page-client.tsx`: remove local `useReducer` and `AUTH_SUCCESS` action, read `isAuthenticated` from `useUser()` to bypass login step if true
- [x] 3.3 Add "My Account" link to `components/navigation.tsx`: desktop nav (after language switcher in CTA area) and mobile Sheet menu (after Book Now button), conditionally rendered when `isAuthenticated`
- [x] 3.4 Update `openspec/changes/user-panel/specs/mock-auth/spec.md` to reflect credential pair change from `user123 / 123456` to `demo@quetzal.com / 123456`
- [x] 3.5 Write integration tests: authenticated user bypasses login step on `/booking`
- [x] 3.6 Write E2E tests (Playwright): login → account page visible → profile fields pre-filled → logout → "My Account" hidden (skipped — E2E not available in project)

## Implementation Order

1. **PR 1 (Foundation)**: Context + hook + provider. Verify: app loads, no breaking changes.
2. **PR 2 (Account Page)**: Protected route + forms + translations. Verify: `/account` redirects when unauthenticated, renders when authenticated.
3. **PR 3 (Booking Flow + Nav)**: Migrate LoginForm → BookingPageClient → nav link. Verify: full 3-step booking flow works at each checkpoint; authenticated user bypasses login.

## Verification Checkpoints

| Checkpoint | What to Test |
|------------|--------------|
| After PR 1 | App loads without errors; no "My Account" link yet |
| After PR 2 | `/account` redirects unauthenticated; account page renders Profile + Reservations tabs |
| After PR 3 | Login with `demo@quetzal.com / 123456` works; "My Account" appears in nav; full booking flow functional |