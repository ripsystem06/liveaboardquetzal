# Delta Spec: booking-pricing-tiers

## ADDED Requirements

### Requirement: REQ-BPT-001 — Tier Selection on Cruise Cards

The system SHALL display three pricing tiers (Basic/Standard/Premium) as a radio-style chip group on each CruiseCard, replacing the single `pricePerPerson` display. The user MUST select exactly one tier before the "Next" button is enabled on Step 2. Selecting a tier on a previously selected cruise SHALL preserve the cruise selection.

**Rationale**: Tier selection is a required prerequisite for advancing past Step 2. This prevents users from entering the payment step without a committed pricing tier.

#### Scenario: Happy path — tier selection required

- GIVEN the user is authenticated and on Step 2 (cruise selection)
- AND a cruise is displayed with three tier chips: Basic $2,500 / Standard $3,000 / Premium $3,500
- WHEN the user has selected a cruise but NOT yet selected a tier
- THEN the "Next" button is disabled
- AND a hint message is shown: "Please select a pricing tier to continue"

#### Scenario: Tier selection enables Next

- GIVEN the user is on Step 2 with a cruise selected
- WHEN the user clicks the "Standard $3,000" tier chip
- THEN that chip becomes visually selected (highlighted ring/bg)
- AND the "Next" button becomes enabled

#### Scenario: Switching tier preserves cruise selection

- GIVEN the user is on Step 2 with "Socorro Islands" cruise selected AND "Basic $2,500" tier selected
- WHEN the user clicks the "Premium $3,500" tier chip
- THEN "Socorro Islands" remains the selected cruise
- AND "Premium $3,500" is now the selected tier

#### Scenario: Switching cruise resets tier

- GIVEN the user is on Step 2 with "Socorro Islands" cruise selected AND a tier selected
- WHEN the user selects a different cruise ("Sea of Cortez")
- THEN `selectedTier` is reset to `null`
- AND the "Next" button becomes disabled again

---

### Requirement: REQ-BPT-002 — Tier-Aware Payment Calculation

The system SHALL calculate the payment total using the selected tier's price multiplied by the number of paid spaces (guests minus free spaces from Half Charter). The total SHALL be displayed as a line item in the PaymentSection summary.

**Formula**: `total = tierPrice × (guestCount − freeSpaces)` where `freeSpaces = Math.floor(guestCount / 8)` when `guestCount >= 8`, otherwise `0`.

#### Scenario: Standard guest count — no Half Charter

- GIVEN `selectedTier = 'standard'` ($3,000) AND `guestCount = 4`
- WHEN the user reaches Step 3 (payment)
- THEN the summary shows: tier price $3,000, guests 4, free spaces 0
- AND total = $3,000 × 4 = **$12,000**

#### Scenario: Half Charter threshold — 8 guests

- GIVEN `selectedTier = 'basic'` ($2,500) AND `guestCount = 8`
- WHEN the user reaches Step 3
- THEN free spaces = `Math.floor(8 / 8)` = **1**
- AND paid spaces = 8 − 1 = **7**
- AND total = $2,500 × 7 = **$17,500**

#### Scenario: Half Charter — 16 guests

- GIVEN `selectedTier = 'premium'` ($3,500) AND `guestCount = 16`
- WHEN the user reaches Step 3
- THEN free spaces = `Math.floor(16 / 8)` = **2**
- AND paid spaces = 16 − 2 = **14**
- AND total = $3,500 × 14 = **$49,000**

---

### Requirement: REQ-BPT-003 — Half Charter Auto-Discount Display

The system SHALL detect when `guestCount >= 8` and SHALL display the calculated free spaces and resulting paid spaces as line items in the PaymentSection, alongside the tier price and guest count.

#### Scenario: Half Charter indicator visible

- GIVEN `selectedTier = 'standard'` ($3,000) AND `guestCount = 9`
- WHEN the PaymentSection renders
- THEN it displays:
  - Tier price: $3,000 (per person)
  - Guests: 9
  - Free spaces: `Math.floor(9 / 8)` = 1
  - Paid spaces: 9 − 1 = 8
  - Total: $3,000 × 8 = **$24,000**

#### Scenario: Below Half Charter threshold — no discount row

- GIVEN `selectedTier = 'basic'` ($2,500) AND `guestCount = 7`
- WHEN the PaymentSection renders
- THEN free spaces line item is NOT displayed
- AND total = $2,500 × 7 = **$17,500**

---

### Requirement: REQ-BPT-004 — Full Charter CTA Redirect

The system SHALL display a "Private Charter – Contact Us" button in Step 2 that, when clicked, navigates to `/contacto` without creating any booking state entry and without advancing the booking step flow.

#### Scenario: Full Charter navigation

- GIVEN the user is on Step 2 (any state of cruise/tier selection)
- WHEN the user clicks "Private Charter – Contact Us"
- THEN the browser navigates to `/contacto`
- AND no `SELECT_CRUISE`, `SET_TIER`, or any booking action is dispatched
- AND no booking state is mutated

---

### Requirement: REQ-BPT-005 — Guest Count Limits

The system SHALL enforce a minimum of 1 guest and a maximum of 18 guests via the existing GuestSelector component. Half Charter free spaces SHALL be calculated using `Math.floor(guestCount / 8)` for any guest count >= 8, which may result in a number of free spaces up to `Math.floor(18 / 8) = 2`.

#### Scenario: Minimum guest count

- GIVEN the user has 1 guest selected
- WHEN the user attempts to decrement
- THEN the decrement button is disabled
- AND guest count remains 1

#### Scenario: Maximum guest count

- GIVEN the user has 18 guests selected
- WHEN the user attempts to increment
- THEN the increment button is disabled
- AND guest count remains 18

#### Scenario: Half Charter at max occupancy

- GIVEN `selectedTier = 'premium'` ($3,500) AND `guestCount = 18`
- WHEN the PaymentSection renders
- THEN free spaces = `Math.floor(18 / 8)` = **2**
- AND paid spaces = 18 − 2 = **16**
- AND total = $3,500 × 16 = **$56,000**

---

### Requirement: REQ-BPT-006 — Back Navigation Preserves Tier

The system SHALL preserve the `selectedTier` value when the user navigates back from Step 3 to Step 2 via the "Back" button. The previously selected tier SHALL remain selected and the "Next" button SHALL remain enabled without requiring the user to re-select a tier.

#### Scenario: Back preserves tier selection

- GIVEN the user is on Step 3 with `selectedCruise = 'socorro-1'` AND `selectedTier = 'premium'`
- WHEN the user clicks "Back"
- THEN step returns to 2
- AND `selectedCruise` remains `'socorro-1'`
- AND `selectedTier` remains `'premium'`
- AND the "Next" button is enabled immediately

---

### Requirement: REQ-BPT-007 — Confirmation Display with Tier and Half Charter

The system SHALL display the selected tier name, the per-person tier price, guest count, free spaces (if applicable), and the calculated total on the booking confirmation screen (Step 3 after payment is confirmed) or in the post-payment confirmation view.

#### Scenario: Confirmation shows Standard tier with Half Charter

- GIVEN `selectedTier = 'standard'` ($3,000), `guestCount = 10`
- WHEN the booking confirmation renders
- THEN it displays:
  - Selected tier: Standard
  - Tier price: $3,000 per person
  - Guests: 10
  - Free spaces: 1 (Half Charter)
  - Paid spaces: 9
  - Total charged: **$27,000**

#### Scenario: Confirmation shows Premium tier without Half Charter

- GIVEN `selectedTier = 'premium'` ($3,500), `guestCount = 3`
- WHEN the booking confirmation renders
- THEN it displays:
  - Selected tier: Premium
  - Tier price: $3,500 per person
  - Guests: 3
  - Total charged: **$10,500**

---

## MODIFIED Requirements

### Requirement: REQ-BPT-008 — CruiseCard Price Display → Tier Selector

The `CruiseCard` component SHALL replace the single `pricePerPerson` display with a three-tier price selector (Basic/Standard/Premium chips) that communicates `selectedTier` to the parent via an `onSelectTier` callback prop. The `onSelect` callback (cruise selection) is now gated: a cruise is considered "selected" only after BOTH a cruise and a tier are chosen.

(Previously: Single `pricePerPerson` scalar displayed with a Select button that triggered `onSelect(cruise)` directly.)

#### Scenario: CruiseCard renders tier chips

- GIVEN a `Cruise` with `tiers = { basic: 2500, standard: 3000, premium: 3500 }`
- WHEN the CruiseCard renders on Step 2
- THEN three tier chips are displayed: "Basic $2,500", "Standard $3,000", "Premium $3,500"
- AND each chip is a radio-style selectable element

---

### Requirement: REQ-BPT-009 — Cruise Data Model: tiers field

The `Cruise` interface SHALL replace the `pricePerPerson: number` field with `tiers: { basic: number; standard: number; premium: number }`. The `MOCK_CRUISES` array SHALL be updated to include tier pricing per cruise. The `BookingState` SHALL include `selectedTier: 'basic' | 'standard' | 'premium' | null`.

(Previously: `Cruise` interface had `pricePerPerson: number` as a scalar.)

---

### Requirement: REQ-BPT-010 — PaymentSection Tier-Aware Total

The `PaymentSection` component SHALL accept `selectedTier` and `tiers` as props and SHALL calculate `total` using the tier-aware formula `tierPrice × (guestCount − freeSpaces)`. It SHALL display line items for: tier price per person, guest count, free spaces (when `guestCount >= 8`), paid spaces, and total.

(Previously: `PaymentSection` calculated `total = cruise.pricePerPerson × guestCount` with no tier, no free spaces, and no paid spaces display.)

---

### Requirement: REQ-BPT-011 — BookingState.selectedTier and SET_TIER Action

The `BookingState` interface SHALL include `selectedTier: 'basic' | 'standard' | 'premium' | null`. The `bookingReducer` SHALL add a `SET_TIER` action that sets `selectedTier` to the provided tier value. The `SELECT_CRUISE` action SHALL reset `selectedTier` to `null`. The `ADVANCE_STEP` action from step 2 SHALL be rejected unless `selectedTier !== null`.

(Previously: `BookingState` had no `selectedTier` field and the reducer had no `SET_TIER` action.)

---

## REMOVED Requirements

### Requirement: (Removed) REQ-BPT-OLD-001 — Single Price Per Person Display

(Reason: Replaced by `REQ-BPT-001` — tier selection supersedes the single price display.)

### Requirement: (Removed) REQ-BPT-OLD-002 — Simple Price × Guests Calculation

(Reason: Replaced by `REQ-BPT-002` and `REQ-BPT-003` — tier-aware pricing with Half Charter support supersedes the simple multiply formula.)

## Translation Keys Required

The following new i18n keys must be added to `language-context.tsx`:

| Key | EN | ES |
|-----|----|----|
| `booking.tier.basic` | Basic | Básico |
| `booking.tier.standard` | Standard | Estándar |
| `booking.tier.premium` | Premium | Premium |
| `booking.tier.selectHint` | Select a pricing tier to continue | Selecciona un nivel de precio para continuar |
| `booking.tier.selected` | Tier selected | Nivel seleccionado |
| `booking.payment.freeSpaces` | Free spaces | Espacios gratuitos |
| `booking.payment.paidSpaces` | Paid spaces | Espacios pagados |
| `booking.payment.tierPrice` | per person (tier) | por persona (nivel) |
| `booking.fullCharter.label` | Private Charter | Charter Privado |
| `booking.fullCharter.cta` | Contact Us | Contáctanos |
| `booking.confirmation.tier` | Pricing Tier | Nivel de Precio |
| `booking.confirmation.freeSpaces` | Free Spaces (Half Charter) | Espacios Gratis (Half Charter) |
