# Design: booking-auth-guard

## Status

`in_progress` → `completed`

## Executive Summary

Enforce authentication before cruise selection by passing `isLoginRequired={!isAuthenticated}` from `BookingFlow` step 2 down to each `CruiseCard`. When `isLoginRequired=true`, the card's button shows a login CTA and redirects to step 1 via `router.push('/booking?step=1')`. No new components, no state management changes, no guest checkout path.

---

## 1. Component Contract

### CruiseCard Props Interface

```typescript
// components/booking/cruise-card.tsx

interface CruiseCardProps {
  cruise: Cruise
  onSelect: (cruise: Cruise) => void
  isSelected?: boolean
  isLoginRequired?: boolean   // NEW — default false
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoginRequired` | `boolean` | `false` | When `true`, button shows sign-in CTA and redirects instead of calling `onSelect` |

**Decision**: `isLoginRequired` is optional with a default of `false` to preserve backward compatibility — existing call sites without the prop continue to behave as authenticated.

### Button Behavior Matrix

| `isLoginRequired` | `isSelected` | Button Text (EN) | onClick Action |
|-------------------|---------------|------------------|----------------|
| `false` | `false` | `booking.cruise.select` ("Select") | `onSelect(cruise)` |
| `false` | `true` | `booking.cruise.selected` ("Selected") | `onSelect(cruise)` |
| `true` | any | `booking.cruise.signIn` ("Sign in") | `router.push('/booking?step=1')` |

---

## 2. Data Flow

```
UserContext (useUser)
  └── isAuthenticated: boolean
        │
        ▼
BookingPageClient
  └── passes isAuthenticated → BookingFlow
        │
        ▼
BookingFlow (step 2)
  └── passes isLoginRequired={!isAuthenticated} → CruiseCard[]
        │
        ▼
CruiseCard
  └── button text + onClick branch on isLoginRequired
```

**Path**:
1. `UserContext` exposes `isAuthenticated` via `useUser()`
2. `BookingPageClient` calls `useUser()` and forwards `isAuthenticated` to `BookingFlow`
3. `BookingFlow` step 2 computes `isLoginRequired={!isAuthenticated}` and passes it to each `CruiseCard`

No new context, no new state in the reducer, no lifted state.

---

## 3. Translation Keys

### Location

`contexts/language-context.tsx`

### EN additions (line ~317)

```typescript
'booking.cruise.select': 'Select',
'booking.cruise.selected': 'Selected',
'booking.cruise.signIn': 'Sign in',   // NEW
```

### ES additions (line ~657)

```typescript
'booking.cruise.select': 'Seleccionar',
'booking.cruise.selected': 'Seleccionado',
'booking.cruise.signIn': 'Inicia sesión',   // NEW
```

The key is inserted alphabetically within the `booking.cruise.*` block. The existing keys (`booking.cruise.select`, `booking.cruise.selected`) are at lines 316–317 (EN) and 656–657 (ES); the new key `booking.cruise.signIn` goes between them.

---

## 4. Redirect Mechanism

### Choice: `router.push('/booking?step=1')`

**Rationale**: The booking page already uses a URL query param `?step=N` to track the current step (observed in `BookingFlow` step indicator and spec scenarios). Using `router.push('/booking?step=1')` is consistent with existing navigation patterns, works with Next.js client-side routing, and is testable with the existing `vi.mock('next/navigation')` setup in `test-utils.tsx`.

**Alternative considered**: Passing a `onSignInClick` callback prop from `BookingFlow` was rejected — it introduces a callback chain and doesn't reflect the actual navigation intent. A URL param approach is more explicit and debuggable.

### Implementation in CruiseCard

```typescript
import { useRouter } from 'next/navigation'

// Inside CruiseCard:
const router = useRouter()

const handleButtonClick = () => {
  if (isLoginRequired) {
    router.push('/booking?step=1')
  } else {
    onSelect(cruise)
  }
}
```

`useRouter` is already mocked in `test-utils.tsx` with `push: vi.fn()`, so tests can assert `expect(push).toHaveBeenCalledWith('/booking?step=1')`.

---

## 5. Test Strategy

### Files to Modify

| File | Changes |
|------|---------|
| `components/booking/cruise-card.test.tsx` | Add auth-gated scenarios |
| `components/booking/booking-flow.test.tsx` | Add unauthenticated step 2 scenarios |

### CruiseCard Tests (update existing + add)

| Scenario | Assertion |
|----------|-----------|
| `isLoginRequired=false`, not selected | button shows "Select", onClick calls `onSelect` |
| `isLoginRequired=false`, isSelected | button shows "Selected", onClick calls `onSelect` |
| `isLoginRequired=true` | button shows "Sign in", onClick calls `router.push('/booking?step=1')`, **onSelect NOT called** |
| Card layout identical for both auth states | snapshot or query identical non-button elements |

**Breaking change to existing test**: The test at line 37 ("calls onSelect with the cruise when Select button is clicked") passes `isLoginRequired` implicitly as `undefined` (falsy). No change needed — existing behavior is preserved.

### BookingFlow Tests (add new)

| Scenario | Steps |
|----------|-------|
| Unauthenticated user on step 2 | Render with `isAuthenticated=false`, verify `isLoginRequired=true` passed to CruiseCard (indirectly, by checking button text) |
| Authenticated user on step 2 | Render with `isAuthenticated=true`, verify "Select" buttons present |

### BookingPageClient Tests

If `booking-page-client.test.tsx` tests auth propagation to `BookingFlow`, check it still passes. No changes expected since the prop name (`isAuthenticated`) is unchanged.

---

## 6. Edge Cases

### Auto-advance past login

`BookingFlow` has a `useEffect` that auto-advances authenticated users from step 1 to step 2 on mount (line 38–43). This is unaffected by the auth gate — it only fires when `isAuthenticated` becomes `true`, not the other direction.

### Direct URL navigation to `/booking?step=2`

If an unauthenticated user navigates directly to step 2 via URL, `isAuthenticated` is `false`, so `isLoginRequired=true` is passed to all `CruiseCard`s. The user sees "Sign in" buttons and is redirected to step 1 on click. No cruise can be selected. ✅ Spec requirement met.

### Logout mid-flow

If a user logs out while on step 2 or step 3, `isAuthenticated` flips to `false`. Cruises already selected remain in `BookingState.selectedCruise`. The step indicator still shows the current step. If the user somehow navigates back to step 2 (e.g., via back button), they will now see "Sign in" buttons. The `LOGIN_COMPLETED` flag from the reducer is not cleared on logout — only when going back from step 2 (line 68 of `booking-page-client.tsx`). This is existing behavior; the auth gate does not change it.

### Multiple cruise cards

All `CruiseCard` instances in step 2 receive the same `isLoginRequired` value. No per-card auth state exists.

### No guest checkout

The redirect to step 1 always goes through `router.push('/booking?step=1')`. There is no escape hatch. ✅ Spec requirement met.

---

## 7. File Inventory

| Path | Action | Reason |
|------|--------|--------|
| `components/booking/cruise-card.tsx` | Modify | Add `isLoginRequired` prop, conditional button |
| `components/booking/booking-flow.tsx` | Modify | Pass `isLoginRequired={!isAuthenticated}` in step 2 |
| `contexts/language-context.tsx` | Modify | Add `booking.cruise.signIn` to EN and ES dicts |
| `components/booking/cruise-card.test.tsx` | Modify | Add auth-gated test scenarios |
| `components/booking/booking-flow.test.tsx` | Modify | Add unauthenticated step 2 scenarios |

---

## 8. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `useRouter` not available in CruiseCard (needs `'use client'`) | Low | Crash | `cruise-card.tsx` already has `'use client'` |
| Test assertions break because button text now differs by auth state | Medium | False negatives | Run tests immediately after prop change; update button queries to be auth-state-aware |
| `booking-flow.test.tsx` hard-codes `isAuthenticated=true` in step 2 scenarios | Low | Existing tests still pass since `isLoginRequired=false` preserves old behavior | — |
| Translation key typo causing missing text | Low | Runtime fallback to key name | Verify keys match between EN and ES dicts |

---

## 9. Rollback

1. Remove `isLoginRequired?: boolean` from `CruiseCardProps` interface
2. Restore button in `CruiseCard` to unconditional `onClick={() => onSelect(cruise)}` and text `isSelected ? t('booking.cruise.selected') : t('booking.cruise.select')`
3. Remove `isLoginRequired={!isAuthenticated}` prop from `CruiseCard` invocations in `BookingFlow`
4. Remove `booking.cruise.signIn` keys from both EN and ES dicts in `language-context.tsx`
5. Revert test files — no structural changes required if tests were added alongside existing ones
