# Tasks: booking-pricing-tiers

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150 added / ~50 removed |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full tier pricing implementation | PR 1 | All 5 files; self-contained |

---

## Phase 1: Data Model + Reducer (`booking-page-client.tsx`)

- [ ] 1.1 Add `CruiseTier` interface (`basic`, `standard`, `premium` as numbers) — line ~7
- [ ] 1.2 Replace `Cruise.pricePerPerson: number` with `Cruise.tiers: CruiseTier` — line ~12
- [ ] 1.3 Update `MOCK_CRUISES` with tier prices per cruise (3 cruises × 3 tiers) — lines ~16–20
- [ ] 1.4 Add `selectedTier: 'basic' | 'standard' | 'premium' | null` to `BookingState` — line ~25
- [ ] 1.5 Add `selectedTier: null` to `initialBookingState` — line ~33
- [ ] 1.6 Add `SET_TIER` action variant to `BookingAction` type — line ~39
- [ ] 1.7 In reducer `SELECT_CRUISE` case: reset `selectedTier: null` — line ~50
- [ ] 1.8 Add reducer `SET_TIER` case: set `selectedTier = action.tier` — after line ~51
- [ ] 1.9 In `ADVANCE_STEP`: add `&& !state.selectedTier` guard for step 2 — line ~55
- [ ] 1.10 In `GO_BACK` case: ensure `selectedTier` is NOT reset when going step 3→2 — line ~71

## Phase 2: Translation Keys (`contexts/language-context.tsx`)

The `booking.guest.capacity`, `booking.info.*` and `booking.info.*.how` keys are ALREADY ADDED in the working tree.
Only the tier pricing keys remain to be added.

- [ ] 2.1 Add 13 EN keys to `translations.en` under `// Booking Page` section:
  `booking.tier.basic`, `booking.tier.standard`, `booking.tier.premium`, `booking.tier.selectHint`, `booking.tier.selected`, `booking.payment.freeSpaces`, `booking.payment.paidSpaces`, `booking.payment.tierPrice`, `booking.fullCharter.label`, `booking.fullCharter.description`, `booking.fullCharter.cta`, `booking.confirmation.tier`, `booking.confirmation.freeSpaces`
- [ ] 2.2 Add 13 ES keys to `translations.es` with equivalent translations

## Phase 3: CruiseCard Tier Selector (`cruise-card.tsx`)

- [ ] 3.1 Add `selectedTier?: 'basic' | 'standard' | 'premium' | null` and `onSelectTier?: (tier) => void` props — lines ~10–14
- [ ] 3.2 Replace price display block (`per person USD N,NNN`) with 3-tier radio chip group:
  - Default chip: `border-border bg-card text-muted-foreground`
  - Hover: `border-accent/40`
  - Selected: `border-accent bg-accent/10 text-accent ring-2 ring-accent/30`
- [ ] 3.3 Add hint text below chips: `t('booking.tier.selectHint')` when no tier selected
- [ ] 3.4 Update Select button: when `isLoginRequired` navigate to `/booking?step=1`, otherwise call `onSelect(cruise)` (button text logic unchanged)

## Phase 4: PaymentSection Calculation (`payment-section.tsx`)

- [ ] 4.1 Add `selectedTier: 'basic' | 'standard' | 'premium'` prop — line ~9
- [ ] 4.2 Add `calculatePayment(tierPrice, guestCount)` helper:
  `freeSpaces = guestCount >= 8 ? Math.floor(guestCount / 8) : 0`
  `paidSpaces = guestCount - freeSpaces`
  `total = tierPrice * paidSpaces`
- [ ] 4.3 Replace `total = cruise.pricePerPerson * guestCount` with tier-aware calculation — line ~18
- [ ] 4.4 Update summary render: show tier name + `t('booking.payment.tierPrice')` row, guest count row, conditional `freeSpaces` and `paidSpaces` rows (only when `guestCount >= 8`), then `total` row

## Phase 5: Full Charter CTA + Wiring (`booking-flow.tsx`)

The GuestSelector redesign, `<h3>` removal, and ReservationInfoCards integration are ALREADY DONE in the working tree.

- [ ] 5.1 Add `handleTierSelect` handler: `dispatch({ type: 'SET_TIER', tier })` — after line ~40
- [ ] 5.2 Pass `selectedTier` and `onSelectTier={handleTierSelect}` to each `CruiseCard` — lines ~151–158
- [ ] 5.3 Add tier hint below cruise cards: shown when `selectedCruise && !selectedTier`, text `t('booking.tier.selectHint')`
- [ ] 5.4 Change Next button disabled: `disabled={!selectedCruise || !selectedTier}` — line ~172
- [ ] 5.5 Add Full Charter CTA card below `GuestSelector`: dashed border, `t('booking.fullCharter.label')`, `t('booking.fullCharter.description')`, `t('booking.fullCharter.cta')` button → `router.push('/contacto')` with no dispatch
- [ ] 5.6 Pass `selectedTier={state.selectedTier}` to `PaymentSection` — line ~184
- [ ] 5.7 Pass `tiers={selectedCruise?.tiers}` to `PaymentSection` (for confirmation display)
