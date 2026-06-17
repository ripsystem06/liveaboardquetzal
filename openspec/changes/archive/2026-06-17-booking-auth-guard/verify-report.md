# Verify Report: booking-auth-guard

## Status

**partial** — All 112 tests pass. Implementation is correct and complete for the core auth-gating behavior. Two minor test gaps identified (see WARNING findings below).

---

## Executive Summary

The `booking-auth-guard` change correctly enforces authentication before cruise selection:

- `CruiseCard` now accepts `isLoginRequired?: boolean` (defaults `false`) and shows a "Sign in" CTA button with `router.push('/booking?step=1')` redirect when true.
- `BookingFlow` step 2 passes `isLoginRequired={!isAuthenticated}` to all `CruiseCard` instances.
- Translation keys `booking.cruise.signIn` are correctly added in both EN and ES.
- 5 files modified, 12 tasks completed, 112 tests passing (0 failures).

---

## Test Results

```
Test Files  13 passed (13)
Tests      112 passed (112)
Duration    4.21s
```

---

## Findings

### CRITICAL — None

All critical spec requirements are met.

---

### WARNING

**W-1** — `router.push('/booking?step=1')` not asserted in CruiseCard test  
Spec: `cruise-card-auth` / "Unauthenticated user clicks sign-in button"  
File: `components/booking/cruise-card.test.tsx` lines 69–77  

The test verifies `onSelect` is NOT called when the sign-in button is clicked, but does **not** assert that `router.push('/booking?step=1')` WAS called. The design doc (section 5) explicitly states this assertion should be made with `expect(push).toHaveBeenCalledWith('/booking?step=1')`. The mock (`test-utils.tsx` line 20) supports this.  

**Risk**: Without this assertion, a future regression that accidentally removes or changes the redirect would not be caught by unit tests. The integration test (`booking-integration.test.tsx`) covers the redirect behavior end-to-end, so the gap has a safety net, but unit-level catching is preferred.

**Recommendation**: Add `const router = useRouter()` retrieval inside the test and assert `expect(router.push).toHaveBeenCalledWith('/booking?step=1')`. Alternatively, if the integration test coverage is deemed sufficient, document this as an accepted trade-off.

---

**W-2** — Card appearance invariant not test-covered  
Spec: `cruise-card-auth` / "Card layout matches for both auth states"  
File: `components/booking/cruise-card.test.tsx`  

No test verifies that non-button elements are identical regardless of `isLoginRequired` value. This is inherently a visual assertion and would require snapshot testing or query-based DOM comparison.

**Risk**: Low. Button text changes based on auth state; the rest of the card DOM is unconditionally rendered. A structural change to the card would require a developer to touch the component directly.

**Recommendation**: Manual verification step: render two `CruiseCard` instances (one with `isLoginRequired=true`, one with `false`) and visually confirm non-button elements match. This is not automatable without snapshot or visual testing infrastructure.

---

### SUGGESTION

**S-1** — "No guest checkout" scenario not explicitly tested at BookingFlow level  
Spec: `booking-flow-auth-gate` / "Unauthenticated user cannot bypass login"  

The scenario is tested indirectly: the integration test confirms the full flow with auth, and the CruiseCard test confirms the sign-in button doesn't call `onSelect`. However, there is no test that simulates an unauthenticated user directly navigating to `/booking?step=2` and clicking a CruiseCard button to verify redirect to step 1. This would require either a Playwright-style E2E test or a more detailed unit test mocking the router.

**Recommendation**: Accept current coverage unless the project has a policy requiring explicit route-redirect unit tests.

---

## Spec Coverage Matrix

| Spec | Requirement | Scenario | Test | Result |
|------|-------------|----------|------|--------|
| cruise-card-auth | Auth button text (unselected) | Auth user views unselected cruise | "shows 'Select' button when not selected" (line 55) | ✅ |
| cruise-card-auth | Auth button text (selected) | Auth user views selected cruise | "shows 'Selected' state when isSelected is true" (line 48) | ✅ |
| cruise-card-auth | Auth button action | Auth user clicks Select | "calls onSelect with the cruise when Select button is clicked" (line 37) | ✅ |
| cruise-card-auth | Unauth button text | Unauth user views CruiseCard | "renders 'Sign in' button when isLoginRequired is true" (line 62) | ✅ |
| cruise-card-auth | Unauth button action | Unauth user clicks sign-in | "does not call onSelect" (line 69) + integration test | ⚠️ partial |
| cruise-card-auth | Card appearance invariant | Card layout identical both auth states | None (visual/manual) | ⚠️ manual verify |
| booking-flow-auth-gate | Auth state propagation | Auth user reaches step 2 | "renders cruise cards on step 2" (line 64) | ✅ |
| booking-flow-auth-gate | Auth state propagation | Unauth user reaches step 2 | "shows sign-in buttons on step 2 when user is unauthenticated" (line 153) | ✅ |
| booking-flow-auth-gate | Step indicator unchanged | Step indicator shows correct step number | "renders step indicator with 3 steps" (line 30) | ✅ |
| booking-flow-auth-gate | No guest checkout | Unauth user cannot bypass login | Indirect via integration + CruiseCard tests | ⚠️ indirect |
| booking-flow-auth-gate | Login redirect returns to step 2 | User logs in and returns to booking | booking-integration.test.tsx "completes entire booking flow" | ✅ |

---

## Artifacts Created

- `openspec/changes/booking-auth-guard/verify-report.md` — this report

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `router.push` redirect not unit-tested | Low | Medium | Covered by integration test; W-1 identified |
| Card layout divergence over time | Low | Low | Visual inspection on PR review; W-2 identified |
| Translation key typo (runtime) | Low | Low | Keys verified in EN and ES dicts at lines 317 and 658 |

---

## Next Recommended

1. **Add router assertion to CruiseCard test** (address W-1): retrieve `router` via `useRouter()` in test and assert `expect(router.push).toHaveBeenCalledWith('/booking?step=1')`.
2. **Manual verification** (address W-2): render two CruiseCards side-by-side in Storybook or dev server — one authenticated, one not — and confirm card body is identical.
3. **Consider E2E test** for the direct-to-step2 bypass scenario if project testing policy requires explicit route-redirect coverage.

---

## Skill Resolution

No skill gaps encountered during verification.
