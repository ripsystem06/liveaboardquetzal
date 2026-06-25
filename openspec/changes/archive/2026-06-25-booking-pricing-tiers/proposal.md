# Proposal: booking-pricing-tiers

## Intent

Introduce three-tier reservation pricing (Individual Pass with Basic/Standard/Premium, Half Charter with auto-free-spots, Full Charter with contact-only flow) into the booking wizard. Currently every cruise shows a single `pricePerPerson` and the payment section multiplies it by guest count — no tier selection, no charter modes, no free-spot logic.

## Scope

### In Scope
- Tier selection UI on `CruiseCard` (3 price radio chips: Basic $2,500 / Standard $3,000 / Premium $3,500)
- `Cruise` data model update: replace `pricePerPerson` with `tiers: { basic: number, standard: number, premium: number }`
- `BookingState` addition: `selectedTier: 'basic' | 'standard' | 'premium' | null`
- Half Charter auto-discount: `freeSpaces = Math.floor(paidSpaces / 8)` shown in `PaymentSection` when `guestCount >= 8`
- Full Charter entry point: button on Step 2 that redirects to `/contacto` (no payment step)
- `PaymentSection` updated total formula: `total = tierPrice * paidSpaces` where `paidSpaces = guestCount - freeSpaces`

### Out of Scope
- Backend/pricing engine integration (mock data only)
- Actual payment processing for Half Charter (display discount only, no Stripe change)
- Waitlist or hold mechanics for Full Charter
- i18n strings beyond what `language-context.tsx` already covers

## Capabilities

### New Capabilities
- `booking-tier-selection`: User picks pricing tier (Basic/Standard/Premium) per cruise before proceeding
- `booking-half-charter`: Auto-calculates and displays free spaces when guestCount >= 8; total = tierPrice × (guestCount − freeSpaces)
- `booking-full-charter`: CTA bypasses payment step and navigates to `/contacto`

### Modified Capabilities
- `booking-cruise-display`: CruiseCard shifts from single price to 3-tier price selector
- `booking-payment-calculation`: PaymentSection total changes from `price × guests` to tier-aware formula with optional Half Charter discount

## Approach

1. **Model change** — Add `tiers` object to `Cruise` interface; update `MOCK_CRUISES` with tier prices per cruise; add `selectedTier` to `BookingState`.
2. **Reducer update** — `SELECT_CRUISE` action resets `selectedTier` to null; new `SET_TIER` action.
3. **CruiseCard redesign** — Right panel becomes 3-option price chips (Basic/Standard/Premium) with radio behavior. The cruise is "selected" only after both cruise AND tier are chosen.
4. **GuestSelector** — No structural change; cap remains 18. Guest count feeds Half Charter math in PaymentSection.
5. **PaymentSection** — Detect Half Charter (`guestCount >= 8`); compute `paid = guestCount - floor(guestCount / 8)`; show line items: tier price, guest count, free spaces, total.
6. **Full Charter** — Add "Private Charter – Contact Us" button in Step 2 that calls `router.push('/contacto')` instead of advancing steps.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/booking/booking-page-client.tsx` | Modified | `Cruise` interface, `MOCK_CRUISES` tier data, `BookingState.selectedTier`, reducer actions |
| `components/booking/cruise-card.tsx` | Modified | 3-tier price selector replacing single price display |
| `components/booking/booking-flow.tsx` | Modified | Handle tier selection event; Full Charter redirect |
| `components/booking/payment-section.tsx` | Modified | Half Charter free-spot math, tier-aware total |
| `contexts/language-context.tsx` | New keys | `booking.tier.basic`, `booking.tier.standard`, `booking.tier.premium`, `booking.fullCharter.*` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tier selection UX confusion (user picks cruise then forgets tier) | Med | Disable "Next" until tier is also selected; microcopy hint |
| Half Charter logic edge case: exactly 8 guests → 1 free, 16 → 2 free | Low | `Math.floor(guestCount / 8)` is deterministic; unit test coverage |
| Full Charter bypasses payment step entirely | Low | CTA is visually distinct; no state change needed |

## Rollback Plan

Revert `booking-page-client.tsx` (restore `pricePerPerson` scalar), `cruise-card.tsx` (single price display), `payment-section.tsx` (simple multiply), and `booking-flow.tsx` (remove Full Charter CTA). No DB migration needed — purely UI/state change on mock data.

## Dependencies

- `GuestSelector` cap of 18 passengers already in place — validates Half Charter upper bound
- `/contacto` route already exists — no new page needed

## Success Criteria

- [ ] CruiseCard renders 3 tier options with distinct prices
- [ ] Selecting a tier is required before advancing to Step 3
- [ ] PaymentSection shows correct Half Charter total when guestCount >= 8
- [ ] Full Charter CTA navigates to `/contacto` without creating a booking state entry
- [ ] Language toggle (EN/ES) works for all new strings
- [ ] No regression: existing cruise selection flow (no tier) still works if user ignores tiers
