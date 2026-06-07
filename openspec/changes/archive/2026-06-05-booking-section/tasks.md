# Tasks: booking-section

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900–1200 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (foundation) → PR 2 (components) → PR 3 (wiring+tests) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Translation keys + navigation update | PR 1 | Independent; base = main |
| 2 | All 6 booking components + reducer | PR 2 | Depends on PR 1; base = PR 1 |
| 3 | Booking page route + all tests | PR 3 | Depends on PR 2; base = PR 2 |

## Phase 1: Foundation

- [x] 1.1 Add ~38 booking translation keys to `contexts/language-context.tsx` (EN/ES under `booking.*` prefix)
- [x] 1.2 Update `components/navigation.tsx`: change Book Now link from `/contacto?subject=booking` to `/booking`

## Phase 2: Core Components

- [x] 2.1 Create `components/booking/booking-page-client.tsx` — `"use client"`, define `BookingState` interface, `BookingAction` type, `useReducer` with AUTH_SUCCESS / SELECT_CRUISE / SET_GUEST_COUNT / ADVANCE_STEP / GO_BACK / CONFIRM_PAYMENT; export MOCK_CRUISES array (3 cruises: Socorro Islands $3500, Sea of Cortez $2350, Mag Bay + Socorro $5199)
- [x] 2.2 Create `components/booking/login-form.tsx` — email/password form, validates against `user123` / `123456`, error message "Invalid email or password", calls `onSuccess()` prop on success; no token/session
- [x] 2.3 Create `components/booking/cruise-card.tsx` — `CruiseCardProps` interface, displays cruise name/date/route/price, "Select" button calls `onSelect(cruise)`
- [x] 2.4 Create `components/booking/guest-selector.tsx` — `GuestSelectorProps`, numeric stepper, range 1–18, decrement disabled at 1, increment disabled at 18, default 1
- [x] 2.5 Create `components/booking/payment-section.tsx` — `PaymentSectionProps`, shows cruise summary + total (price × guests), 3 decorative buttons (Credit Card / PayPal / Bank Transfer), mock confirmation message on click; no network requests
- [x] 2.6 Create `components/booking/booking-flow.tsx` — `BookingFlowProps`, step indicator (Login / Select Cruise / Payment), conditional rendering per step, back button on step 2, advance button gated by reducer guard (step 3 unreachable without completing steps 1–2)

## Phase 3: Wiring

- [x] 3.1 Create `app/booking/page.tsx` — server component, export metadata, render `<BookingPageClient />`
- [x] 3.2 Wire `BookingPageClient` → `BookingFlow` → step components (LoginForm, CruiseCard+GuestSelector, PaymentSection)

## Phase 4: Testing

- [x] 4.1 Write unit tests for `BookingReducer`: step transitions AUTH_SUCCESS, SELECT_CRUISE, SET_GUEST_COUNT, ADVANCE_STEP, GO_BACK, CONFIRM_PAYMENT; guard blocks ADVANCE_STEP from step 1 without auth
- [x] 4.2 Write unit tests for `LoginForm`: valid credentials, invalid password, invalid email, empty fields
- [x] 4.3 Write unit tests for `GuestSelector`: default 1, increment up to 18, decrement down to 1, disabled states at boundaries
- [x] 4.4 Write integration test: full 3-step flow — login → select cruise + guests → advance → payment → confirm

## Implementation Order

1. **Phase 1** (foundation) — no dependencies; any developer can start here
2. **Phase 2** (components) — components are independent of each other; all depend on language-context keys being present
3. **Phase 3** (wiring) — depends on all Phase 2 components existing
4. **Phase 4** (tests) — depends on Phase 3 wiring complete