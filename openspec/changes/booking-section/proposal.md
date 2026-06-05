# Proposal: booking-section

## Intent

Rebuild the booking section that existed on the deleted branch `feature/booking-section`. The booking flow is a mockup for presentation purposes: mock auth (user123/123456), mock cruise data, decorative payment buttons. No real backend or payment processing.

## Scope

### In Scope
- Booking page route at `/booking` (server component with metadata)
- Mock auth form (hardcoded credentials, no backend)
- 3-step flow coordinator: Login → Cruise Selection → Payment
- CruiseCard component for displaying available cruises
- Guest selector (1–18 passengers)
- Payment section with Stripe / PayPal / Bank Transfer mockup buttons
- Navigation update: "Book Now" links point to `/booking`
- ~38 booking translation keys (EN/ES) added to language context

### Out of Scope
- Real authentication or user accounts
- Real payment processing or Stripe integration
- Persistent booking state or database
- User profile or booking history pages
- Email notifications or confirmation flows

## Capabilities

### New Capabilities
- `booking-flow`: 3-step mockup booking flow (login → select cruise → pay)
- `mock-auth`: Hardcoded credential validation (user123/123456), no session or token
- `cruise-selection`: Display fixed/mock cruise data with date, route, price
- `guest-count-selector`: Passenger count picker, 1–18 range
- `payment-mockup`: Decorative payment method buttons (no processing)

### Modified Capabilities
- None — this is a greenfield feature with no existing booking capability

## Approach

- **`app/booking/page.tsx`**: Server component, export metadata, render client wrapper
- **`components/booking/booking-page-client.tsx`**: `"use client"` — auth state orchestrator, step management
- **`components/booking/login-form.tsx`**: Email/password form, validate against mock credentials
- **`components/booking/booking-flow.tsx`**: 3-step coordinator (step indicator, conditional rendering)
- **`components/booking/cruise-card.tsx`**: Card with cruise info, price, "Select" action
- **`components/booking/guest-selector.tsx`**: Numeric stepper 1–18
- **`components/booking/payment-section.tsx`**: Stripe / PayPal / Bank Transfer buttons (decorative)
- **`contexts/language-context.tsx`**: Add ~38 booking translation keys (EN/ES)
- **`components/navigation.tsx`**: Change `href="/contacto?subject=booking"` → `href="/booking"`

Follow existing project patterns: Tailwind + CSS custom properties, `cn()` utility, `useLanguage()` hook, shadcn/ui components.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/booking/page.tsx` | New | Server component page route |
| `components/booking/` | New | 6 new components under new directory |
| `components/navigation.tsx` | Modified | Book Now link target |
| `contexts/language-context.tsx` | Modified | Add booking translation keys |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Deleted branch leaves no survivors to reference | Low | Exploration already done; engram #106 documents the structure |
| Scope creep to real auth/payment | Low | Explicit out-of-scope list; mock-only decision is product-confirmed |

## Rollback Plan

1. Delete `app/booking/` directory
2. Delete `components/booking/` directory
3. Restore `components/navigation.tsx` to prior state (revert Book Now link change)
4. Remove booking keys from `contexts/language-context.tsx`
5. Remove any booking-related imports from `app/layout.tsx`

## Dependencies

- None — no external services, no new packages

## Success Criteria

- [ ] `/booking` route renders without errors
- [ ] Mock login accepts `user123` / `123456` and rejects invalid credentials
- [ ] 3-step flow navigates correctly: Login → Cruise Selection → Payment
- [ ] Guest selector enforces 1–18 range
- [ ] "Book Now" in navigation links to `/booking`
- [ ] All booking UI text renders in both EN and ES when language context switches
- [ ] Build passes clean (`npm run build`)