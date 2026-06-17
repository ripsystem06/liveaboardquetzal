# Tasks: booking-auth-guard

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~70–90 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Translations + Component + Integration + Tests | Single PR | All changes are tightly coupled; no benefit from splitting |

---

## Phase 1: Translations

- [x] 1.1 Add `booking.cruise.signIn: 'Sign in'` to EN dict in `contexts/language-context.tsx` (after `booking.cruise.select` at line ~316)
- [x] 1.2 Add `booking.cruise.signIn: 'Inicia sesión'` to ES dict in `contexts/language-context.tsx` (after `booking.cruise.select` at line ~656)

## Phase 2: Core Implementation (CruiseCard)

- [x] 2.1 Add `isLoginRequired?: boolean` to `CruiseCardProps` interface in `components/booking/cruise-card.tsx` (default: `false`)
- [x] 2.2 Add `useRouter` import from `next/navigation` to `components/booking/cruise-card.tsx`
- [x] 2.3 Extract `router` via `useRouter()` inside `CruiseCard` component
- [x] 2.4 Add `handleButtonClick` function: if `isLoginRequired`, call `router.push('/booking?step=1')`; else call `onSelect(cruise)`
- [x] 2.5 Update `<Button onClick>` to use `handleButtonClick` and change button text to use `isLoginRequired ? t('booking.cruise.signIn') : (isSelected ? t('booking.cruise.selected') : t('booking.cruise.select'))`

## Phase 3: Integration (BookingFlow)

- [x] 3.1 Pass `isLoginRequired={!isAuthenticated}` to each `CruiseCard` in step 2 of `components/booking/booking-flow.tsx` (line ~129–134)

## Phase 4: Testing

- [x] 4.1 Add test to `components/booking/cruise-card.test.tsx`: renders "Sign in" button when `isLoginRequired=true`
- [x] 4.2 Add test to `components/booking/cruise-card.test.tsx`: clicking sign-in button calls `router.push('/booking?step=1')` and does NOT call `onSelect`
- [x] 4.3 Add test to `components/booking/booking-flow.test.tsx`: unauthenticated user on step 2 sees sign-in buttons
- [x] 4.4 Run `pnpm test` to verify all existing and new tests pass

## Verification Checklist

- [ ] `pnpm test` passes with 0 failures
- [ ] Unauthenticated user sees "Sign in" / "Inicia sesión" on CruiseCard buttons
- [ ] Clicking sign-in button redirects to `/booking?step=1`
- [ ] Authenticated user sees "Select" / "Selected" and cruise selection works
- [ ] No guest checkout path exists
