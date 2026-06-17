# Proposal: booking-auth-guard

## Intent

Enforce authentication before cruise selection. Unauthenticated users clicking "Select" on a CruiseCard must be redirected to the login step instead of selecting a cruise. This closes the gap where unauthenticated users could interact with the booking flow as if guest checkout were allowed.

## Scope

### In Scope
- Conditionally render CruiseCard button text based on `isAuthenticated`
- Conditionally route click action: login redirect (step 1) vs. cruise selection
- Add translation keys for unauthenticated CTA text
- Test coverage for auth-gated button behavior

### Out of Scope
- Any changes to authentication logic itself (mock-auth is untouched)
- Guest checkout feature
- Changes to step indicator or flow navigation UX
- Modifications to LoginForm component

## Capabilities

### Modified Capabilities
- `booking-flow`: The "Select Cruise" step now enforces authentication as a prerequisite. A user who is not authenticated cannot select a cruise — they are redirected to step 1. This modifies the existing linear-step requirement to include an auth gate.

### New Capabilities
- `auth-gated-selection`: CruiseCard exposes an auth-aware button that renders different text and behavior based on `isAuthenticated`. When unauthenticated, the button shows a login CTA and redirects to step 1 on click. When authenticated, it behaves as before.

## Approach

Implement **Approach 3** (per exploration): In `BookingFlow` step 2, pass `isAuthenticated` to `CruiseCard` via a new `isLoginRequired` prop.

- `CruiseCard` receives `isLoginRequired: boolean`
- If `true`: button shows "Sign in" / "Inicia sesión", click calls `router.push('/booking?step=1')`
- If `false`: button shows "Select" / "Selected", click calls `onSelect(cruise)` as before
- Translation: use `booking.cruise.signIn` for EN and ES

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/booking/cruise-card.tsx` | Modified | New `isLoginRequired` prop; conditional button text + onClick |
| `components/booking/booking-flow.tsx` | Modified | Pass `isLoginRequired={!isAuthenticated}` to CruiseCard |
| `lib/translations/en.ts` | Modified | Add `booking.cruise.signIn: "Sign in"` |
| `lib/translations/es.ts` | Modified | Add `booking.cruise.signIn: "Inicia sesión"` |
| `contexts/user-context.tsx` | Read-only | `useUser()` hook already provides `isAuthenticated` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Button text mismatch with LoginForm CTA | Low | Reuse existing translation patterns from LoginForm |
| Unauthenticated user confusion (why can't I select?) | Low | The redirect to login step provides context |
| Breaking existing tests | Medium | Update CruiseCard and BookingFlow tests to cover auth-gated state |

## Rollback Plan

1. Remove `isLoginRequired` prop from `CruiseCard`
2. Revert button in CruiseCard to unconditional "Select" + `onSelect`
3. Remove `isLoginRequired={!isAuthenticated}` prop from BookingFlow
4. Remove translation keys `booking.cruise.signIn` from both files
5. Revert test files to previous assertions

## Dependencies

- `contexts/user-context.tsx` with `useUser()` hook providing `isAuthenticated` — already in place

## Success Criteria

- [ ] Unauthenticated user sees "Sign in" / "Inicia sesión" on CruiseCard buttons
- [ ] Clicking the button redirects to step 1 (login)
- [ ] Authenticated user sees "Select" / "Selected" and cruise selection works normally
- [ ] All existing tests pass; new auth-gated scenarios covered
- [ ] No guest checkout path exists