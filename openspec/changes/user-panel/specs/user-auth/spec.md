# User Auth Specification

## Purpose

Shared authentication state across the application via `UserContext`, replacing isolated auth logic in individual components. Provides login, logout, and profile update capabilities with localStorage persistence.

## Requirements

### Requirement: UserContext Provider

The system MUST provide a `UserProvider` component that wraps the application and exposes authentication state and actions via `useUser()` hook. The context MUST expose: `{ user, isAuthenticated, login, logout, updateProfile }`.

### Requirement: Login with Credentials

The system MUST authenticate users with the hardcoded credential pair `demo@quetzal.com` / `123456`. Authentication MUST succeed when both email and password match exactly. Authentication MUST fail with message "Invalid email or password" when credentials do not match.

#### Scenario: Valid login

- GIVEN the user has entered email "demo@quetzal.com" and password "123456"
- WHEN the login form is submitted
- THEN the system MUST set user state to `{ id: 1, name: "Demo User", email: "demo@quetzal.com", phone: "+1 555 0100" }`
- AND the system MUST set `isAuthenticated` to `true`
- AND the system MUST persist user data to `localStorage` key `quetzal_user`

#### Scenario: Invalid password

- GIVEN the user has entered email "demo@quetzal.com" and password "wrong"
- WHEN the login form is submitted
- THEN the system MUST display error "Invalid email or password"
- AND the system MUST NOT change authentication state

#### Scenario: Invalid email

- GIVEN the user has entered email "other@example.com" and password "123456"
- WHEN the login form is submitted
- THEN the system MUST display error "Invalid email or password"
- AND the system MUST NOT change authentication state

#### Scenario: Empty fields

- GIVEN the user has left email or password empty
- WHEN the login form is submitted
- THEN the system MUST display validation error before attempting authentication

### Requirement: Logout

The system MUST clear user state and `localStorage` when logout is called. The "My Account" link MUST be hidden from navigation after logout.

#### Scenario: Logout clears state

- GIVEN the user is authenticated
- WHEN `logout()` is called
- THEN the system MUST set user to `null`
- AND the system MUST set `isAuthenticated` to `false`
- AND the system MUST remove `quetzal_user` from `localStorage`

### Requirement: Update Profile

The system MUST allow authenticated users to update their `name` and `phone` fields. Email updates are not supported.

#### Scenario: Profile update persists

- GIVEN the user is authenticated with `{ name: "Demo User", email: "demo@quetzal.com", phone: "+1 555 0100" }`
- WHEN `updateProfile({ name: "New Name", phone: "+1 555 0199" })` is called
- THEN the system MUST update user state with new values
- AND the system MUST persist updated data to `localStorage` key `quetzal_user`

### Requirement: localStorage Persistence

The system MUST load persisted user data from `localStorage` key `quetzal_user` on mount. If valid data exists, the system MUST restore authentication state without requiring re-login.

#### Scenario: Session restore on mount

- GIVEN the user has previously logged in and `quetzal_user` exists in localStorage
- WHEN the application mounts
- THEN the system MUST load and restore user data
- AND the system MUST set `isAuthenticated` to `true`

### Requirement: Navigation Integration

The system MUST show "My Account" link in navigation only when `isAuthenticated` is `true`. When `false`, the link MUST NOT be rendered.

#### Scenario: Account link visible when authenticated

- GIVEN `isAuthenticated` is `true`
- THEN the navigation MUST render "My Account" link pointing to `/account`

#### Scenario: Account link hidden when unauthenticated

- GIVEN `isAuthenticated` is `false`
- THEN the navigation MUST NOT render "My Account" link