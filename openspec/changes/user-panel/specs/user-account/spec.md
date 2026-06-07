# User Account Specification

## Purpose

Protected `/account` page providing profile management and reservation history for authenticated users.

## Requirements

### Requirement: Route Protection

The system MUST redirect unauthenticated users from `/account` to `/booking`. The check MUST be client-side and occur before rendering account content.

#### Scenario: Unauthenticated redirect

- GIVEN the user is NOT authenticated (no `quetzal_user` in localStorage)
- WHEN the user navigates to `/account`
- THEN the system MUST redirect to `/booking`

#### Scenario: Authenticated access

- GIVEN the user IS authenticated
- WHEN the user navigates to `/account`
- THEN the system MUST render the account page content

### Requirement: Profile Form

The system MUST display an editable profile form pre-filled with user data. The form MUST include fields for `name` and `phone`. Email MUST be displayed as read-only.

#### Scenario: Profile form pre-fill

- GIVEN the user is authenticated with `{ name: "Demo User", email: "demo@quetzal.com", phone: "+1 555 0100" }`
- WHEN the account page renders
- THEN the form MUST display "Demo User" in the name field
- AND the form MUST display "demo@quetzal.com" as read-only
- AND the form MUST display "+1 555 0100" in the phone field

#### Scenario: Profile save

- GIVEN the user is on the account page with pre-filled data
- WHEN the user modifies name or phone and clicks save
- THEN the system MUST call `updateProfile()` with new values
- AND the system MUST display a success confirmation

### Requirement: Reservation History

The system MUST display a list of mock reservations with status badges. Status workflow: `Pending` → `Confirmed` → `Completed`.

#### Scenario: Reservation list display

- GIVEN the user has mock reservations in localStorage key `quetzal_reservations`
- WHEN the account page renders
- THEN the system MUST display each reservation with cruise name, dates, and status badge

#### Scenario: Status badges

- GIVEN a reservation with status "Pending"
- THEN the system MUST render a yellow/amber badge labeled "Pending"
- AND a reservation with status "Confirmed" MUST show a blue badge
- AND a reservation with status "Completed" MUST show a green badge

#### Scenario: Empty reservation list

- GIVEN the user has no reservations in `quetzal_reservations`
- WHEN the account page renders
- THEN the system MUST display "No reservations yet" message

### Requirement: Translations

The system MUST support account-related strings in English and Spanish.

#### Scenario: English labels

- GIVEN language is set to English
- THEN "My Account" MUST display as page title
- AND "Profile" and "Reservation History" MUST be section headers
- AND "Save" and "Edit" buttons MUST display in English

#### Scenario: Spanish labels

- GIVEN language is set to Spanish
- THEN "My Account" MUST display as "Mi Cuenta"
- AND "Profile" MUST display as "Perfil"
- AND "Reservation History" MUST display as "Historial de Reservas"