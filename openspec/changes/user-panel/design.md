# Design: user-panel

## Technical Approach

Implement a shared `UserContext` (mirroring `LanguageProvider` pattern) for authentication state, then build a protected `/account` page. The booking flow migration follows an incremental sequence: add context provider → migrate `LoginForm` → migrate `BookingPageClient`. This ensures the 3-step flow (Login → Select Cruise → Payment) remains functional at each checkpoint.

## Architecture Decisions

### Decision: UserContext Shape

**Choice**: `{ user: User | null, isAuthenticated: boolean, login, logout, updateProfile }`
**Alternatives considered**: Splitting into `useUser()` and `useUserActions()` hooks; combining into a single complex object
**Rationale**: Mirrors `LanguageProvider` pattern (`{ language, setLanguage, t }`). Single hook `useUser()` keeps consumption simple. `isAuthenticated` is derived but stored for convenience.

```typescript
type User = { id: string, name: string, email: string, phone: string }

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: { name?: string, phone?: string }) => void
}
```

### Decision: localStorage Hook (`use-user-storage`)

**Choice**: Custom hook that loads on mount, writes on state change, handles corrupted/missing data gracefully
**Alternatives considered**: Third-party persistence library; using context directly without a hook
**Rationale**: Separates persistence from business logic. Allows graceful degradation if localStorage is unavailable or corrupted. Hook pattern is idiomatic React.

Key behaviors:
- On mount: try-catch around `JSON.parse(localStorage.getItem(key))` — invalid JSON silently returns `null`
- On write: try-catch around `JSON.stringify` — serialization failure logs error but doesn't crash
- Missing key: returns `null` (not error), allowing initialization to proceed

### Decision: Route Guard

**Choice**: Client-side redirect component (`<AccountGuard>`) wrapping account page content
**Alternatives considered**: `useEffect` in page component; middleware (not viable for client-only check)
**Rationale**: Composable, reusable. `useEffect` in page scatters the logic. Middleware doesn't work with client-side auth check.

```typescript
// Redirect if not authenticated — before rendering sensitive content
if (!isAuthenticated) {
  router.replace('/booking')
  return null
}
```

### Decision: Account Page Layout

**Choice**: Tab-based layout using shadcn/ui `Tabs` component (Profile | Reservations)
**Alternatives considered**: Single scrollable page with section headers
**Rationale**: Matches spec requirement for "Profile" and "Reservation History" as section headers. Tabs provide clear visual separation and align with existing shadcn/ui usage in the project.

### Decision: Navigation Integration

**Choice**: Conditional "My Account" link in both desktop nav and mobile Sheet menu
**Alternatives considered**: Desktop only; mobile only; separate dropdown
**Rationale**: Spec requires link visible when authenticated in both contexts. Integration point is after language switcher in desktop CTA area, and after Book Now button in mobile Sheet.

### Decision: Booking Flow Migration Sequence

**Choice**: Three-phase incremental migration with verification checkpoints
**Alternatives considered**: Big-bang migration (too risky); single PR for all changes (hard to review)
**Rationale**: Spec explicitly requires LoginForm migration BEFORE BookingPageClient. Each phase is independently testable.

**Phase 1** (Add UserProvider to layout):
- Create `contexts/user-context.tsx` with mock credentials
- Create `hooks/use-user-storage.ts`
- Add `UserProvider` to `app/layout.tsx` (inside `LanguageProvider`)
- Verify: app loads, no breaking changes

**Phase 2** (Migrate LoginForm):
- Update `LoginForm` to call `login()` from `useUser()` instead of `onSuccess` callback
- Keep `BookingPageClient` using local reducer
- Verify: login on booking page works, proceeds to Step 2

**Phase 3** (Migrate BookingPageClient):
- Remove local `useReducer` from `BookingPageClient`
- Read `isAuthenticated` from `useUser()` — bypass login step if true
- Remove `AUTH_SUCCESS` dispatch (no longer needed)
- Verify: full 3-step flow works; authenticated user bypasses login

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      app/layout.tsx                         │
│  LanguageProvider → UserProvider → children │
└─────────────────────────────────────────────────────────────┘
 │
 ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌──────────────────┐
│ navigation.tsx│   │ booking-page-   │   │ app/account/   │
│               │   │ client.tsx     │   │     page.tsx     │
│ useUser()     │   │                │   │                  │
│ → isAuth      │   │ useUser()      │   │ useUser()        │
│ → show My     │   │ → isAuth       │   │ → AccountGuard   │
│   Account    │   │ → bypass login  │   │ → render tabs    │
└───────────────┘   └─────────────────┘   └──────────────────┘
 │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   contexts/user-context.tsx │
│  use-user-storage → localStorage (quetzal_user)             │
└─────────────────────────────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `contexts/user-context.tsx` | Create | UserProvider + useUser hook |
| `hooks/use-user-storage.ts` | Create | localStorage persistence hook |
| `app/account/page.tsx` | Create | Protected account dashboard |
| `components/account/profile-form.tsx` | Create | Editable profile form |
| `components/account/reservation-history.tsx` | Create | Reservation list with badges |
| `app/layout.tsx` | Modify | Wrap with UserProvider |
| `components/navigation.tsx` | Modify | Add conditional "My Account" link |
| `components/booking/booking-page-client.tsx` | Modify | Remove local reducer, use useUser() |
| `components/booking/login-form.tsx` | Modify | Call login() from context |
| `contexts/language-context.tsx` | Modify | Add account translation keys |

## Interfaces / Contracts

### UserContext API

```typescript
// contexts/user-context.tsx
type User = { id: string, name: string, email: string, phone: string }

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (data: { name?: string, phone?: string }) => void
}

// Mock credentials: demo@quetzal.com / 123456
// Mock user: { id: '1', name: 'Demo User', email: 'demo@quetzal.com', phone: '+1 555 0100' }
```

### Reservation Type

```typescript
type Reservation = {
  id: string
  cruiseName: string
  date: string
  guests: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'completed'
}
```

### Account Translations (add to language-context.tsx)

```typescript
// English
'account.title': 'My Account'
'account.profile': 'Profile'
'account.reservations': 'Reservation History'
'account.save': 'Save'
'account.edit': 'Edit'
'account.name': 'Name'
'account.email': 'Email'
'account.phone': 'Phone'
'account.noReservations': 'No reservations yet'

// Spanish
'account.title': 'Mi Cuenta'
'account.profile': 'Perfil'
'account.reservations': 'Historial de Reservas'
'account.save': 'Guardar'
'account.edit': 'Editar'
'account.name': 'Nombre'
'account.email': 'Correo Electrónico'
'account.phone': 'Teléfono'
'account.noReservations': 'Sin reservas aún'
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `useUser()` hook state transitions | Vitest: login → state updates; logout → state clears |
| Unit | `use-user-storage` edge cases | Vitest: corrupted JSON, missing key, null user |
| Unit | `LoginForm` calls correct context method | Vitest: submit → login() called with email/password |
| Integration | Booking flow step bypass | Verify authenticated user skips to Step 2 |
| Integration | Account redirect guard | Verify unauthenticated access redirects to /booking |
| E2E | Full login → account → logout flow | Playwright: credential login → profile visible → logout |

## Migration / Rollback

### Migration Sequence (with checkpoints)

1. **Phase 1**: Add `UserContext` + `use-user-storage` + `UserProvider` to layout
   - Checkpoint: App loads, no console errors

2. **Phase 2**: Migrate `LoginForm` to use `login()` from context
   - Checkpoint: Login works on booking page, proceeds to Step 2

3. **Phase 3**: Migrate `BookingPageClient` to remove local reducer
   - Checkpoint: Full 3-step flow works; authenticated user bypasses login

### Rollback

1. Remove `UserProvider` from `app/layout.tsx`
2. Revert `LoginForm` to `onSuccess` callback pattern
3. Revert `BookingPageClient` to local `useReducer`
4. Delete new files (`contexts/user-context.tsx`, `hooks/use-user-storage.ts`, `components/account/`, `app/account/page.tsx`)
5. Remove "My Account" link from navigation

## Open Questions

- [ ] Should reservation history display mock data when `quetzal_reservations` is empty, or seed with sample data on first login?
- [ ] Is there a preference for how status badge colors map to status values? (Spec says yellow/amber for Pending, blue for Confirmed, green for Completed — confirm this aligns with shadcn/ui default palette)
