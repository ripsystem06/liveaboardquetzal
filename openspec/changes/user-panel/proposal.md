# Proposal: user-panel

## Intent

Create a shared `UserContext` that replaces the booking flow's local auth reducer, then build an `/account` page with profile editing and reservation history. This establishes the auth pattern for the app and gives users a dedicated space to manage their information.

## Scope

### In Scope
- Shared `UserContext` with login/logout/updateProfile actions
- `use-user-storage` hook for localStorage persistence
- `/account` page (protected route, redirects to `/booking` if unauthenticated)
- Profile section: view/edit name, email, phone (mock data)
- Reservation history: list with status workflow (Pending → Confirmed → Completed)
- Migrate `BookingPageClient` and `LoginForm` to use shared context
- "My Account" link in navigation (shown when authenticated)
- Account translation keys (EN + ES)

### Out of Scope
- Real authentication backend or database
- Email verification or password reset
- Session expiry or timeout handling

## Capabilities

### New Capabilities
- `user-auth`: Shared authentication state across the app with localStorage persistence
- `user-account`: Account dashboard with profile management and reservation history

### Modified Capabilities
- `mock-auth`: Update credential pair from `user123 / 123456` to `demo@quetzal.com / 123456` (per user decision)

## Approach

1. **Create `UserContext`** (`contexts/user-context.tsx`): Provider with `{ user, isAuthenticated, login, logout, updateProfile }`. User object shape: `{ id, name, email, phone }`. Auth state persists to `localStorage` via the storage hook.

2. **Create `use-user-storage` hook** (`hooks/use-user-storage.ts`): Handles `quetzal_user` and `quetzal_reservations` keys. Loads on mount, saves on change.

3. **Build account page** (`app/account/page.tsx`): Client component with client-side guard — redirects to `/booking` if not authenticated. Renders `ProfileForm` and `ReservationHistory` sections.

4. **Migrate booking flow**: Replace local `useReducer` in `BookingPageClient` with `useUser()`. Update `LoginForm` to call `login()` from context instead of dispatching locally.

5. **Update navigation**: Add "My Account" link in desktop and mobile nav, conditionally rendered when `isAuthenticated`.

6. **Add translations**: Account-related keys in `language-context.tsx` for both EN and ES.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `contexts/user-context.tsx` | New | Shared UserProvider |
| `hooks/use-user-storage.ts` | New | localStorage persistence |
| `components/account/profile-form.tsx` | New | Editable profile form |
| `components/account/reservation-history.tsx` | New | Reservation list with statuses |
| `app/account/page.tsx` | New | Protected account dashboard |
| `app/layout.tsx` | Modified | Wrap with UserProvider |
| `components/navigation.tsx` | Modified | Add "My Account" link |
| `contexts/language-context.tsx` | Modified | Add account translation keys |
| `components/booking/booking-page-client.tsx` | Modified | Use shared UserContext |
| `components/booking/login-form.tsx` | Modified | Use shared UserContext |
| `openspec/specs/mock-auth/spec.md` | Modified | Update credential pair |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Race conditions on localStorage sync | Low | Single source of truth in context; storage hook debounces writes |
| Client-side guard is bypassable | Low | Server components are out of scope; this is mock/demo only |
| Breaking booking flow during migration | Medium | Incremental migration: add context first, migrate LoginForm, then BookingPageClient |

## Rollback Plan

1. Remove `UserProvider` from `app/layout.tsx`
2. Revert `LoginForm` and `BookingPageClient` to local reducer
3. Delete `contexts/user-context.tsx`, `hooks/use-user-storage.ts`, `components/account/`, and `app/account/page.tsx`
4. Remove "My Account" link from navigation
5. Revert `mock-auth/spec.md` credential change

## Dependencies

- `demo@quetzal.com / 123456` credentials (hardcoded mock — no external dependency)

## Success Criteria

- [ ] User can log in with `demo@quetzal.com / 123456` and see "My Account" in nav
- [ ] `/account` redirects to `/booking` when unauthenticated
- [ ] Profile form pre-fills with mock user data and saves to localStorage
- [ ] Reservation history shows mock bookings with correct status badges
- [ ] Logout clears context and localStorage, removes "My Account" from nav
- [ ] Booking flow continues to work after migration to shared context
