# Technical Design: booking-pricing-tiers

## 1. Data Model Changes

### 1.1 `Cruise` Interface — `booking-page-client.tsx`

```typescript
// BEFORE
export interface Cruise {
  id: string
  name: string
  departureDate: string
  route: string
  pricePerPerson: number  // ← REMOVED
  boat?: string
}

// AFTER
export interface CruiseTier {
  basic: number
  standard: number
  premium: number
}

export interface Cruise {
  id: string
  name: string
  departureDate: string
  route: string
  tiers: CruiseTier      // ← ADDED (replaces pricePerPerson)
  boat?: string
}
```

### 1.2 `MOCK_CRUISES` — `booking-page-client.tsx`

Each cruise gets three tier prices. Tier prices are per cruise (different itineraries have different base costs):

```typescript
export const MOCK_CRUISES: Cruise[] = [
  { id: 'socorro-1', name: 'Socorro Islands', departureDate: '2026-03-15', route: 'Revillagigedo Archipelago', tiers: { basic: 2500, standard: 3000, premium: 3500 }, boat: 'Quetzal' },
  { id: 'cortez-1', name: 'Sea of Cortez', departureDate: '2026-07-09', route: 'Bahía de La Paz', tiers: { basic: 1800, standard: 2350, premium: 2900 }, boat: 'Quetzal' },
  { id: 'magbay-1', name: 'Mag Bay + Socorro', departureDate: '2026-10-16', route: 'Bahía Magdalena → Socorro', tiers: { basic: 4200, standard: 5199, premium: 6200 }, boat: 'Quetzal' },
]
```

### 1.3 `BookingState` — `booking-page-client.tsx`

```typescript
// BEFORE
export interface BookingState {
  step: 1 | 2 | 3
  selectedCruise: Cruise | null
  guestCount: number
  bookingConfirmed: boolean
  loginCompleted: boolean
}

// AFTER
export interface BookingState {
  step: 1 | 2 | 3
  selectedCruise: Cruise | null
  selectedTier: 'basic' | 'standard' | 'premium' | null  // ← ADDED
  guestCount: number
  bookingConfirmed: boolean
  loginCompleted: boolean
}

export const initialBookingState: BookingState = {
  step: 1,
  selectedCruise: null,
  selectedTier: null,  // ← ADDED
  guestCount: 1,
  bookingConfirmed: false,
  loginCompleted: false,
}
```

### 1.4 `BookingAction` — `booking-page-client.tsx`

```typescript
// BEFORE
export type BookingAction =
  | { type: 'SELECT_CRUISE'; cruise: Cruise }
  | { type: 'SET_GUEST_COUNT'; count: number }
  | { type: 'ADVANCE_STEP' }
  | { type: 'GO_BACK' }
  | { type: 'CONFIRM_PAYMENT' }
  | { type: 'LOGIN_COMPLETED' }
  | { type: 'RESET_TO_LOGIN' }

// AFTER
export type BookingAction =
  | { type: 'SELECT_CRUISE'; cruise: Cruise }
  | { type: 'SET_TIER'; tier: 'basic' | 'standard' | 'premium' }  // ← ADDED
  | { type: 'SET_GUEST_COUNT'; count: number }
  | { type: 'ADVANCE_STEP' }
  | { type: 'GO_BACK' }
  | { type: 'CONFIRM_PAYMENT' }
  | { type: 'LOGIN_COMPLETED' }
  | { type: 'RESET_TO_LOGIN' }
```

### 1.5 `bookingReducer` — `booking-page-client.tsx`

```typescript
export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SELECT_CRUISE':
      return { ...state, selectedCruise: action.cruise, selectedTier: null }  // ← tier reset
    case 'SET_TIER':  // ← NEW CASE
      return { ...state, selectedTier: action.tier }
    case 'SET_GUEST_COUNT':
      return { ...state, guestCount: action.count }
    case 'ADVANCE_STEP': {
      // Step 2 now requires BOTH selectedCruise AND selectedTier
      if (state.step === 2 && (!state.selectedCruise || !state.selectedTier)) return state
      if (state.step >= 3) return state
      const newState = { ...state, step: (state.step + 1) as 1 | 2 | 3 }
      if (state.step === 1) {
        return { ...newState, loginCompleted: true }
      }
      return newState
    }
    case 'GO_BACK':
      if (state.step <= 1) return state
      const newStep = (state.step - 1) as 1 | 2 | 3
      if (state.step === 2) {
        return { ...state, step: newStep, loginCompleted: false }
      }
      return { ...state, step: newStep }  // ← selectedTier PRESERVED on back-nav from step 3
    case 'CONFIRM_PAYMENT':
      return { ...state, bookingConfirmed: true }
    case 'LOGIN_COMPLETED':
      return { ...state, loginCompleted: true, step: 2 }
    case 'RESET_TO_LOGIN':
      return { ...initialBookingState, step: 1 }
    default:
      return state
  }
}
```

---

## 2. Component Architecture

### 2.1 `CruiseCard` — `cruise-card.tsx`

**Props change**: Add `selectedTier` and `onSelectTier` callback.

```typescript
interface CruiseCardProps {
  cruise: Cruise
  onSelect: (cruise: Cruise) => void
  onSelectTier: (tier: 'basic' | 'standard' | 'premium') => void  // ← ADDED
  isSelected?: boolean
  isLoginRequired?: boolean
  selectedTier?: 'basic' | 'standard' | 'premium' | null  // ← ADDED
}
```

**Layout**: The right panel (`flex flex-col items-end gap-3`) transforms as follows:

```
BEFORE:                          AFTER:
┌────────────────────────────┐   ┌───────────────────────────────────────┐
│ per person                  │   │  Tier Selection (radio chips)          │
│ USD 3,500                   │   │  ┌─────────┐ ┌─────────┐ ┌─────────┐│
│                             │   │  │ Basic   │ │Standard │ │ Premium ││
│ [    Select    ]            │   │  │ $2,500  │ │ $3,000  │ │ $3,500  ││
└────────────────────────────┘   │  └─────────┘ └─────────┘ └─────────┘│
                                 │                                        │
                                 │  [       Select        ]               │
                                 └───────────────────────────────────────┘
```

**Tier Chip design**:
- Three horizontally stacked chips below the cruise details (in the right column)
- Each chip: `rounded-full px-4 py-2 text-sm font-semibold border-2 transition-all`
- Default: `border-border bg-card text-muted-foreground`
- Hover: `border-accent/40 hover:shadow-sm`
- Selected: `border-accent bg-accent/10 text-accent ring-2 ring-accent/30`
- Visual radio behavior: only one can be selected at a time

**Hint text**: Below tier chips, when no tier selected:
- `text-xs text-muted-foreground mt-1`
- Shows `t('booking.tier.selectHint')`

**Select button behavior change**:
- When `isLoginRequired=true`: navigates to `/booking?step=1` (no change)
- When `!isSelected`: calls `onSelect(cruise)` AND shows hint if tier not selected
- When `isSelected && selectedTier`: calls `onSelect(cruise)` (already selected, no-op)

### 2.2 `PaymentSection` — `payment-section.tsx`

**Props change**:

```typescript
interface PaymentSectionProps {
  cruise: Cruise
  selectedTier: 'basic' | 'standard' | 'premium'  // ← ADDED
  guestCount: number
  onPay: (method: 'card' | 'paypal' | 'bank') => void
}
```

**Half Charter calculation** (`calculatePayment` function):

```typescript
function calculatePayment(tierPrice: number, guestCount: number) {
  const freeSpaces = guestCount >= 8 ? Math.floor(guestCount / 8) : 0
  const paidSpaces = guestCount - freeSpaces
  const total = tierPrice * paidSpaces
  return { freeSpaces, paidSpaces, total }
}
```

**Summary card rendering logic**:

```typescript
const tierPrice = cruise.tiers[selectedTier]
const { freeSpaces, paidSpaces, total } = calculatePayment(tierPrice, guestCount)
const isHalfCharter = guestCount >= 8

// Render:
// - Tier price: "per person (tier)" row
// - Guests: guestCount row
// - IF isHalfCharter: "Free spaces: X" row
// - IF isHalfCharter: "Paid spaces: Y" row
// - Total: row with tier-aware total
```

**Example render (Half Charter, 10 guests, Standard $3,000)**:
```
Booking Summary
Cruise:        Socorro Islands
Tier:          Standard ($3,000 per person)
Guests:        10
Free spaces:   1
Paid spaces:   9
─────────────────────
Total:         $27,000
```

### 2.3 `GuestSelector` — `guest-selector.tsx`

**No changes** — already redesigned, guest count flows into PaymentSection unchanged.

### 2.4 `BookingFlow` — `booking-flow.tsx`

**Changes**:
1. `handleCruiseSelect` → dispatches `SELECT_CRUISE` (resets tier automatically via reducer)
2. `handleTierSelect` handler → dispatches `SET_TIER`
3. Next button disabled condition: `disabled={!selectedCruise || !selectedTier}`
4. Hint when cruise selected but no tier: shows `t('booking.tier.selectHint')` in a small text below cruise cards
5. **Full Charter CTA**: Added as a separate card/button below the cruise cards list, styled distinctively:
   - `rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 px-6 py-5`
   - Text: `t('booking.fullCharter.label')` + `t('booking.fullCharter.description')`
   - CTA button: `t('booking.fullCharter.cta')` → `router.push('/contacto')`
6. Passes `selectedTier` to `PaymentSection`

**Step 2 layout** (after changes):

```
┌─────────────────────────────────────────────────┐
│           Select Your Cruise                     │
├─────────────────────────────────────────────────┤
│ [CruiseCard: Socorro]  ← isSelected, selectedTier│
│ [CruiseCard: Cortez]                             │
│ [CruiseCard: Mag Bay]                            │
│                                                  │
│ ⚠️ "Select a pricing tier to continue" (if no tier)│
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ GuestSelector                               │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ [ Full Charter CTA card ] → /contacto           │
│                                                  │
│ [← Back]                    [Next →] (disabled) │
└─────────────────────────────────────────────────┘
```

---

## 3. State Flow

| Action | Trigger | State Change |
|--------|---------|-------------|
| `SELECT_CRUISE` | Click Select on CruiseCard | `selectedCruise = cruise`, `selectedTier = null` |
| `SET_TIER` | Click tier chip | `selectedTier = tier` |
| `SET_GUEST_COUNT` | GuestSelector ± buttons | `guestCount = count` (no tier effect) |
| `ADVANCE_STEP` (step 1→2) | Next on login | `step = 2`, `loginCompleted = true` |
| `ADVANCE_STEP` (step 2→3) | Next on cruise | **Blocked if `!selectedTier`** |
| `GO_BACK` (step 2→1) | Back button | `step = 1`, `loginCompleted = false` |
| `GO_BACK` (step 3→2) | Back button | `step = 2`, `selectedTier` **preserved** |
| `CONFIRM_PAYMENT` | Payment method selected | `bookingConfirmed = true` |

**Key invariants**:
- Selecting a new cruise ALWAYS resets `selectedTier` to null
- Back navigation from step 3 preserves `selectedTier`
- Guest count changes do NOT affect `selectedTier`
- `ADVANCE_STEP` from step 2 requires BOTH `selectedCruise` and `selectedTier` non-null

---

## 4. Half Charter Calculation

```typescript
function calculatePayment(tierPrice: number, guestCount: number) {
  const freeSpaces = guestCount >= 8 ? Math.floor(guestCount / 8) : 0
  const paidSpaces = guestCount - freeSpaces
  const total = tierPrice * paidSpaces
  return { freeSpaces, paidSpaces, total }
}
```

**Truth table**:

| guestCount | freeSpaces | paidSpaces | Formula |
|-----------|------------|------------|---------|
| 1–7 | 0 | guestCount | tierPrice × guestCount |
| 8 | 1 | 7 | tierPrice × 7 |
| 9 | 1 | 8 | tierPrice × 8 |
| 16 | 2 | 14 | tierPrice × 14 |
| 17 | 2 | 15 | tierPrice × 15 |
| 18 | 2 | 16 | tierPrice × 16 |

**Edge cases**: None. `Math.floor(guestCount / 8)` is deterministic and well-defined for all integers 1–18.

---

## 5. Translation Keys

Add to both `translations.en` and `translations.es` in `language-context.tsx`:

### New keys (EN):

```typescript
'booking.tier.basic': 'Basic',
'booking.tier.standard': 'Standard',
'booking.tier.premium': 'Premium',
'booking.tier.selectHint': 'Select a pricing tier to continue',
'booking.tier.selected': 'Tier selected',
'booking.payment.freeSpaces': 'Free spaces',
'booking.payment.paidSpaces': 'Paid spaces',
'booking.payment.tierPrice': 'per person (tier)',
'booking.fullCharter.label': 'Private Charter',
'booking.fullCharter.description': 'Want the whole boat to yourself? Contact us for a custom itinerary and pricing.',
'booking.fullCharter.cta': 'Contact Us',
'booking.confirmation.tier': 'Pricing Tier',
'booking.confirmation.freeSpaces': 'Free Spaces (Half Charter)',
```

### New keys (ES):

```typescript
'booking.tier.basic': 'Básico',
'booking.tier.standard': 'Estándar',
'booking.tier.premium': 'Premium',
'booking.tier.selectHint': 'Selecciona un nivel de precio para continuar',
'booking.tier.selected': 'Nivel seleccionado',
'booking.payment.freeSpaces': 'Espacios gratuitos',
'booking.payment.paidSpaces': 'Espacios pagados',
'booking.payment.tierPrice': 'por persona (nivel)',
'booking.fullCharter.label': 'Charter Privado',
'booking.fullCharter.description': '¿Quieres toda la embarcación para ti? Contáctanos para un itinerario y precio personalizado.',
'booking.fullCharter.cta': 'Contáctanos',
'booking.confirmation.tier': 'Nivel de Precio',
'booking.confirmation.freeSpaces': 'Espacios Gratis (Half Charter)',
```

---

## 6. Rollback Plan

**Trigger**: If tier UX creates user confusion or business priorities shift back to single-price model.

**Steps**:
1. Revert `Cruise` interface: replace `tiers: CruiseTier` back to `pricePerPerson: number`
2. Revert `MOCK_CRUISES` to scalar prices
3. Remove `selectedTier` from `BookingState`
4. Remove `SET_TIER` action from reducer
5. Revert `SELECT_CRUISE` to NOT reset `selectedTier` (field no longer exists)
6. Revert `ADVANCE_STEP` step 2 guard to only check `selectedCruise`
7. Revert `CruiseCard`: remove tier chip UI, restore single price display
8. Revert `PaymentSection`: remove tier props, restore `total = cruise.pricePerPerson * guestCount`
9. Revert `BookingFlow`: remove `handleTierSelect`, restore Next button disabled condition to `!selectedCruise`
10. Remove Full Charter CTA card
11. Remove all new translation keys added above

**Risk**: Low. All changes are additive to state and UI; removal is straightforward.

---

## 7. Files Affected

| File | Change Type | Lines (est.) |
|------|-------------|--------------|
| `components/booking/booking-page-client.tsx` | Modify | +20, -5 |
| `components/booking/cruise-card.tsx` | Modify | +40, -15 |
| `components/booking/payment-section.tsx` | Modify | +30, -8 |
| `components/booking/booking-flow.tsx` | Modify | +35, -5 |
| `contexts/language-context.tsx` | Add keys | +26 keys (13 EN + 13 ES) |

**Total estimated delta**: ~115 lines added, ~33 lines removed across 5 files.

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| User picks cruise but forgets tier → Next disabled, confusion | Medium | Medium | Hint text `booking.tier.selectHint` visible when tier not selected |
| Tier chip layout breaks card on mobile | Low | High | Chips use `flex-wrap`; stack vertically below 400px viewport |
| Half Charter edge case: exactly 8, 16, or 18 guests | Low | Low | Math is deterministic; `Math.floor(guestCount / 8)` handles all cases |
| Full Charter bypasses payment step → no booking record | Low | Low | CTA is visually distinct (dashed border, different bg); no state mutation |
| Back navigation from step 3 doesn't preserve tier | High (if bug) | Medium | Explicit reducer case: `GO_BACK` from step 3 does NOT reset `selectedTier` |

---

## 9. Testing Checklist

- [ ] CruiseCard renders 3 tier chips with correct prices
- [ ] Selecting tier enables Next button (disabled without tier)
- [ ] Selecting new cruise resets tier to null
- [ ] PaymentSection shows correct Half Charter totals (8, 9, 16, 17, 18 guests)
- [ ] PaymentSection shows no Half Charter rows when guestCount < 8
- [ ] Back nav from step 3 preserves selectedTier
- [ ] Full Charter CTA navigates to `/contacto` without dispatching actions
- [ ] All new translation keys work in EN and ES
- [ ] No regression: simple 1-7 guest flow works exactly as before
