# booking-flow-auth-gate

## Purpose

Integrates authentication state into the BookingFlow step 2, passing `isLoginRequired` to CruiseCards so they render the appropriate button.

## Requirements

### Requirement: Auth state propagation to CruiseCards

BookingFlow step 2 SHALL pass `isLoginRequired={!isAuthenticated}` to each rendered CruiseCard.

#### Scenario: Authenticated user reaches step 2

- GIVEN the user is authenticated
- WHEN the user advances to step 2 (Select Cruise)
- THEN each CruiseCard receives `isLoginRequired=false`

#### Scenario: Unauthenticated user reaches step 2

- GIVEN the user is NOT authenticated
- WHEN the user navigates to step 2
- THEN each CruiseCard receives `isLoginRequired=true`

### Requirement: Step indicator unchanged

The booking step indicator SHALL NOT reflect the auth gate — it displays step numbers as before.

#### Scenario: Step indicator shows correct step number

- GIVEN the user is on step 2
- WHEN the step indicator renders
- THEN it shows "Step 2" or equivalent, not "Step 1"

### Requirement: No guest checkout path

The system SHALL NOT allow a user without authentication to complete cruise selection. Any attempt to select a cruise without authentication redirects to the login step.

#### Scenario: Unauthenticated user cannot bypass login

- GIVEN the user is NOT authenticated
- WHEN the user directly navigates to `/booking?step=2`
- THEN CruiseCards display sign-in buttons
- AND clicking them redirects to `/booking?step=1`

### Requirement: Login redirect returns to step 2

After successful login, the user SHALL be able to return to step 2 and complete cruise selection.

#### Scenario: User logs in and returns to booking

- GIVEN the user was on step 1 (login) after clicking a CruiseCard sign-in button
- WHEN the user successfully authenticates
- THEN the user can advance to step 2
- AND CruiseCards now show "Select"/"Selected" buttons
