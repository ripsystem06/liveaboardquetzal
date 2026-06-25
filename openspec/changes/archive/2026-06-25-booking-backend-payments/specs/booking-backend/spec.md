# Delta for booking-backend

## ADDED Requirements

### Requirement: Reservation Creation

The system SHALL create a reservation with status `pending_approval` when payment is confirmed. `holdExpiry` SHALL be set to 48h if created Mon–Fri, 72h if created Sat–Sun.

#### Scenario: Create reservation

- GIVEN user at payment step with cruise, tier, guest count selected
- WHEN user confirms PayPal or Bank Transfer
- THEN reservation created with `pending_approval` and correct `holdExpiry`

### Requirement: Date Blocking

When any reservation for a cruise+date enters `pending_approval`, ALL tiers for that cruise+date SHALL be blocked. No new reservation SHALL be created for that cruise+date while a hold is active.

#### Scenario: Block all tiers

- GIVEN cruise "X" date "2025-07-15" has a pending_approval reservation for tier "Standard"
- WHEN another user attempts any tier for same cruise+date
- THEN HTTP 409 returned

### Requirement: Hold Duration Calculation

`holdExpiry` SHALL be 48h from `createdAt` for Mon–Fri reservations, 72h for Sat–Sun.

#### Scenario: Weekend hold is 72h

- GIVEN reservation created on Saturday
- THEN `holdExpiry` = Monday + 72h

### Requirement: PayPal Mock Payment

`POST /api/reservations/:id/confirm-paypal` SHALL simulate instant payment confirmation. Reservation status SHALL remain `pending_approval`. No real PayPal API is called.

#### Scenario: PayPal mock confirms

- GIVEN reservation with paymentMethod "PAYPAL" and status `pending_approval`
- WHEN confirm-paypal called
- THEN status stays `pending_approval`, no external API invoked

### Requirement: Bank Transfer PDF Generation

Bank Transfer selection SHALL generate a PDF with bank name, SWIFT, IBAN, account number, cruiseName, tier, guestCount, totalPrice, and reservation ID. PDF SHALL auto-download.

#### Scenario: PDF auto-downloads

- GIVEN reservation with paymentMethod "BANK_TRANSFER"
- WHEN PDF generated
- THEN saved to `public/pdfs/{id}.pdf` and browser auto-downloads

### Requirement: Account Panel — Reservation List

The account panel SHALL display all user reservations with cruise name, date, tier, guestCount, totalPrice, status badge, and payment method.

#### Scenario: List shows reservations

- GIVEN user has pending, confirmed, and expired reservations
- WHEN account panel loads
- THEN all appear with correct status badges

### Requirement: Account Panel — Receipt Actions

For `pending_approval` reservations, Email and WhatsApp buttons SHALL open pre-filled messages containing reservation ID and total price.

#### Scenario: WhatsApp pre-fills message

- GIVEN pending reservation "res_123" total "$1,200"
- WHEN WhatsApp clicked
- THEN `wa.me` opens with "Reservation res_123 — Total: $1,200"

### Requirement: Account Panel — PDF Re-download

Users SHALL be able to re-download the bank transfer PDF for any `pending_approval` reservation with paymentMethod "BANK_TRANSFER".

#### Scenario: Re-download PDF

- GIVEN pending reservation with paymentMethod "BANK_TRANSFER"
- WHEN "Download PDF" clicked
- THEN `public/pdfs/{id}.pdf` downloaded

### Requirement: Hold Expiry and Auto-Release

`GET /api/reservations` SHALL check all `pending_approval` reservations and atomically update expired ones to `expired`, releasing the blocked date.

#### Scenario: Auto-release expired hold

- GIVEN reservation with `pending_approval` and `holdExpiry` in past
- WHEN GET /api/reservations called
- THEN status becomes `expired`, date unblocked

### Requirement: Expiry Email Notification

When a reservation becomes `expired`, the system SHALL send a mock email to the client with cruise name, date, and reservation ID.

#### Scenario: Expiry email sent

- GIVEN reservation transitions to `expired`
- WHEN auto-release occurs
- THEN email sent with cruise name, date, reservation ID

### Requirement: Reservation Status Transitions

Valid transitions: `pending_approval` → `confirmed`, `expired`, `cancelled`; `confirmed` → `cancelled`. Invalid transitions SHALL be rejected.

#### Scenario: Invalid transition rejected

- GIVEN reservation with status `expired`
- WHEN transition to `confirmed` attempted
- THEN validation error returned

### Requirement: Duplicate Reservation Prevention

The system SHALL reject any reservation request for a cruise+date that already has a `pending_approval` reservation for ANY tier.

#### Scenario: Prevent double-booking

- GIVEN `pending_approval` reservation for cruise "X" on "2025-07-15"
- WHEN new POST targets same cruise+date
- THEN HTTP 409 returned
