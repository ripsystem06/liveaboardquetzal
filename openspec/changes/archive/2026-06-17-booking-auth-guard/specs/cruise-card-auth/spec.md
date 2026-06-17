# cruise-card-auth

## Purpose

Controls the CruiseCard button's text and behavior based on authentication state. The card appearance remains identical; only the button changes.

## Requirements

### Requirement: Authenticated button text

When `isLoginRequired` is `false`, the CruiseCard button SHALL display the localized "Select" text from `booking.cruise.select`. When the cruise is already selected, it SHALL display "Selected" from `booking.cruise.selected`.

#### Scenario: Authenticated user views unselected cruise

- GIVEN the user is authenticated (`isLoginRequired=false`)
- AND the cruise is not currently selected
- WHEN the CruiseCard is rendered
- THEN the button text displays "Select"

#### Scenario: Authenticated user views selected cruise

- GIVEN the user is authenticated (`isLoginRequired=false`)
- AND the cruise is currently selected
- WHEN the CruiseCard is rendered
- THEN the button text displays "Selected"

### Requirement: Authenticated button action

When `isLoginRequired` is `false`, clicking the button SHALL call `onSelect(cruise)` and SHALL NOT redirect the user.

#### Scenario: Authenticated user clicks Select

- GIVEN the user is authenticated
- AND the cruise is not selected
- WHEN the user clicks the button
- THEN `onSelect(cruise)` is called with the correct cruise
- AND the user is NOT redirected

### Requirement: Unauthenticated button text

When `isLoginRequired` is `true`, the CruiseCard button SHALL display the localized login CTA text from `booking.cruise.signIn`.

#### Scenario: Unauthenticated user views CruiseCard

- GIVEN the user is NOT authenticated (`isLoginRequired=true`)
- WHEN the CruiseCard is rendered
- THEN the button text displays the sign-in CTA (e.g., "Sign in")

### Requirement: Unauthenticated button action

When `isLoginRequired` is `true`, clicking the button SHALL redirect to `/booking?step=1` and SHALL NOT call `onSelect`.

#### Scenario: Unauthenticated user clicks sign-in button

- GIVEN the user is NOT authenticated
- WHEN the user clicks the button
- THEN the browser redirects to `/booking?step=1`
- AND `onSelect` is NOT called

### Requirement: Card appearance invariant

The CruiseCard visual appearance (excluding button text) SHALL be identical regardless of the `isLoginRequired` value.

#### Scenario: Card layout matches for both auth states

- GIVEN two CruiseCard instances, one with `isLoginRequired=true` and one with `isLoginRequired=false`
- WHEN both cards are rendered
- THEN all non-button elements are visually identical
