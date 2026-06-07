# Delta: booking-flow-migration

## MODIFIED Requirements

### Requirement: LoginForm dispatches to UserContext

The system MUST migrate `LoginForm` to call `login()` from `UserContext` instead of dispatching `AUTH_SUCCESS` to a local reducer. The login flow MUST behave identically after migration.

(Previously: LoginForm dispatched AUTH_SUCCESS to local useReducer in BookingPageClient)

#### Scenario: Login dispatches to context

- GIVEN the user is on the booking page login form
- WHEN the user submits valid credentials (demo@quetzal.com / 123456)
- THEN the form MUST call `login(email, password)` from `useUser()` context
- AND the system MUST authenticate the user via UserContext
- AND the user MUST proceed to Step 2 (cruise selection)
- AND the system MUST NOT use any local dispatch mechanism

#### Scenario: Login form error handling unchanged

- GIVEN the user submits invalid credentials on the booking page
- WHEN the form is submitted
- THEN the system MUST display "Invalid email or password"
- AND the system MUST NOT change authentication state

### Requirement: BookingPageClient uses shared UserContext

The system MUST migrate `BookingPageClient` from local `useReducer` auth to shared `UserContext`. The 3-step booking flow (Login → Select Cruise → Payment) MUST continue to work identically.

(Previously: BookingPageClient contained local useReducer with AUTH_LOGIN, AUTH_SUCCESS, AUTH_LOGOUT actions)

#### Scenario: Authenticated user bypasses login step

- GIVEN the user is already authenticated via UserContext
- WHEN the user navigates to `/booking`
- THEN the system MUST skip to Step 2 (cruise selection)
- AND the system MUST NOT display the login form

#### Scenario: Unauthenticated user sees login step

- GIVEN the user is NOT authenticated
- WHEN the user navigates to `/booking`
- THEN the system MUST display Step 1 (login form)

#### Scenario: Step 3 payment after cruise selection

- GIVEN the user has completed Step 2 (cruise selected)
- WHEN the user clicks "Continue to Payment"
- THEN the system MUST advance to Step 3 (payment)
- AND the system MUST display payment form

#### Scenario: Booking flow continues post-migration

- GIVEN the user is authenticated and on Step 2
- WHEN the user selects a cruise and continues to payment
- THEN the mock payment flow MUST execute as before
- AND the system MUST store reservation in `quetzal_reservations` localStorage

## ADDED Requirements

### Requirement: Incremental Migration Order

The system MUST migrate LoginForm to UserContext BEFORE migrating BookingPageClient to ensure the booking flow remains functional during the transition.

The migration sequence MUST be:
1. Add UserContext provider to app/layout.tsx
2. Migrate LoginForm to use `login()` from context
3. Migrate BookingPageClient to remove local reducer and use `useUser()`

#### Scenario: Migration order preserved

- GIVEN UserContext is added to layout
- WHEN LoginForm is migrated first
- THEN the booking flow MUST continue to work at each step
- AND only after LoginForm migration succeeds should BookingPageClient be migrated