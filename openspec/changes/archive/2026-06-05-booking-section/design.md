# Design: booking-section

## Technical Approach

Implement a mock 3-step booking flow: Login → Cruise Selection → Payment. All state held in React component state in `booking-page-client.tsx`. No API calls, no cookies, no tokens. Page is a server component that renders a client orchestrator.

## Architecture Decisions

### Decision: State management with useReducer

**Choice**: Single `useReducer` in `booking-page-client.tsx` manages all booking state
**Alternatives considered**: Multiple `useState` hooks, dedicated BookingContext
**Rationale**: Single reducer keeps state co-located and makes transitions explicit. Booking state is flat (step, auth, cruise, guests, confirmation) — no deep nesting requiring context. Prop drilling through `booking-flow` is acceptable given 3 levels of depth.

### Decision: Step gating via reducer guard

**Choice**: Reducer rejects step advancement unless prerequisites are met
**Alternatives considered**: Conditional rendering without guard, separate validation functions
**Rationale**: The reducer's `canAdvance` logic ensures step 3 is unreachable without completing steps 1-2. Centralized in one place, easy to audit.

### Decision: Mock cruise data as const array

**Choice**: Hardcoded `MOCK_CRUISES` array in `cruise-card.tsx` (or separate `data/cruises.ts`)
**Alternatives considered**: Data in language context, separate data file
**Rationale**: Keeps cruise data close to where it's consumed. No API, no fetch — pure client-side constant.

### Decision: Booking translation keys under `booking.*` prefix

**Choice**: Keys like `booking.step1.login`, `booking.login.email`, `booking.cruise.select`
**Alternatives considered**: Flat namespace, `book.*` prefix
**Rationale**: Follows existing `section.subsection.key` pattern in the codebase. Grouped logically under `booking.*`.

## Data Flow

```
app/booking/page.tsx (Server)
    └── <BookingPageClient />        ← useReducer({ step, auth, cruise, guests, confirmed })
            │
            ├── <BookingFlow step={state.step} onStepChange={dispatch}>
            │       ├── Step 1: <LoginForm onSuccess={() => dispatch({ type: 'AUTH_SUCCESS' })} />
            │       ├── Step 2: <>
            │       │           <CruiseCard cruise={cruise} onSelect={...} />
            │       │           <GuestSelector value={guests} onChange={...} />
            │       │           <Button onClick={() => dispatch({ type: 'ADVANCE_STEP' })} />
            │       └── Step 3: <PaymentSection cruise={cruise} guests={guests} onPay={...} />
            │       └── <StepIndicator step={state.step} />
```

**State shape**:
```typescript
interface BookingState {
  step: 1 | 2 | 3
  isAuthenticated: boolean
  selectedCruise: Cruise | null
  guestCount: number
  bookingConfirmed: boolean
}
```

**Actions**: `AUTH_SUCCESS`, `SELECT_CRUISE`, `SET_GUEST_COUNT`, `ADVANCE_STEP`, `GO_BACK`, `CONFIRM_PAYMENT`

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/booking/page.tsx` | Create | Server component with metadata, renders BookingPageClient |
| `components/booking/booking-page-client.tsx` | Create | `"use client"`, useReducer orchestrator, step coordination |
| `components/booking/login-form.tsx` | Create | Email/password form, validates against `user123/123456` |
| `components/booking/booking-flow.tsx` | Create | Step indicator + conditional step rendering |
| `components/booking/cruise-card.tsx` | Create | Card with mock cruise data, Select button |
| `components/booking/guest-selector.tsx` | Create | +/- stepper, 1–18 range, enforces limits |
| `components/booking/payment-section.tsx` | Create | Summary display + 3 decorative payment buttons |
| `components/navigation.tsx` | Modify | Change `href="/contacto?subject=booking"` → `href="/booking"` |
| `contexts/language-context.tsx` | Modify | Add ~38 booking translation keys (EN/ES) |

## Mock Data Structure

```typescript
interface Cruise {
  id: string
  name: string
  departureDate: string
  route: string
  pricePerPerson: number
}

const MOCK_CRUISES: Cruise[] = [
  { id: 'socorro-1', name: 'Socorro Islands', departureDate: '2026-03-15', route: 'Revillagigedo Archipelago', pricePerPerson: 3500 },
  { id: 'cortez-1', name: 'Sea of Cortez', departureDate: '2026-07-09', route: 'Bahía de La Paz', pricePerPerson: 2350 },
  { id: 'magbay-1', name: 'Mag Bay + Socorro', departureDate: '2026-10-16', route: 'Bahía Magdalena → Socorro', pricePerPerson: 5199 },
]
```

## Interfaces / Contracts

```typescript
// booking-page-client.tsx
interface BookingState {
  step: 1 | 2 | 3
  isAuthenticated: boolean
  selectedCruise: Cruise | null
  guestCount: number
  bookingConfirmed: boolean
}

type BookingAction =
  | { type: 'AUTH_SUCCESS' }
  | { type: 'SELECT_CRUISE'; cruise: Cruise }
  | { type: 'SET_GUEST_COUNT'; count: number }
  | { type: 'ADVANCE_STEP' }
  | { type: 'GO_BACK' }
  | { type: 'CONFIRM_PAYMENT' }

// login-form.tsx
interface LoginFormProps {
  onSuccess: () => void
}

// cruise-card.tsx
interface CruiseCardProps {
  cruise: Cruise
  onSelect: (cruise: Cruise) => void
  isSelected?: boolean
}

// guest-selector.tsx
interface GuestSelectorProps {
  value: number
  onChange: (count: number) => void
}

// payment-section.tsx
interface PaymentSectionProps {
  cruise: Cruise
  guestCount: number
  onPay: (method: 'card' | 'paypal' | 'bank') => void
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | LoginForm validation (valid/invalid/empty) | Render with RTL, simulate submit |
| Unit | GuestSelector enforce 1–18 range | Test disabled state at boundaries |
| Unit | BookingReducer step transitions | Unit test reducer directly |
| Integration | Full 3-step flow | Render BookingPageClient, simulate user interactions |
| E2E | `/booking` route renders | Playwright: visit route, verify step 1 appears |

## Migration / Rollout

No migration required. Greenfield feature with no prior booking state. Rollback: delete `app/booking/` and `components/booking/`, revert navigation link, remove translation keys.

## Open Questions

None — all decisions resolved in proposal and specs.