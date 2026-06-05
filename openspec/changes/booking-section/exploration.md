# Exploration: booking-section Rebuild

## Current State

**No booking page exists on main.** The branch `feature/booking-section` was deleted before merging. All booking-related code is gone from the codebase.

### Codebase on Main Today
- **15 pages** under `app/` (home, destinos/, about/, contacto, faqs, blog, testimonios, nuestro-barco, privacidad, terminos)
- **shadcn/ui components** in `components/ui/` (new-york style, 50+ components)
- **Design tokens**: background #f3f1ec, primary #0a1d2f, secondary #0e6b7a, accent #c99a46, border #d4d0c8
- **Fonts**: Montserrat (sans), Playfair Display (serif/heading)
- **Language context** at `contexts/language-context.tsx` with full EN/ES translations (~300 keys per language)
- **No openspec directory** exists yet

### What Survived on Main
- **Zero booking-specific code** — the deleted branch left nothing
- Navigation: Book Now links point to `/contacto?subject=booking` (generic contact form route)
- FAQ page has booking-related Q&A but no dedicated booking flow
- 38 booking translation keys from the previous implementation are **NOT** in the current language-context.tsx

## Affected Areas

| File | Impact | Reason |
|------|--------|--------|
| `app/booking/page.tsx` | Create new | No booking page exists — was on deleted branch |
| `components/booking/` | Create new | Was `components/booking/` on branch — not on main |
| `components/navigation.tsx` | Modify | Currently links to `/contacto?subject=booking` — needs `/booking` |
| `contexts/language-context.tsx` | Modify | Need ~38 new booking translation keys (EN/ES) |

## Approaches

### 1. Direct Rebuild (Recommended)
Rebuild the booking section exactly as before using the engram #106 description as reference. No changes to architecture — same mock login, same 3-step flow, same components.

- **Pros**: Fast, proven approach, matches user expectations from prior work
- **Cons**: No improvements over deleted implementation
- **Effort**: Medium

### 2. Improved Rebuild with Data Layer
Add a proper cruise/trip data model and structured data instead of hardcoded values. Could use a JSON file or simple data module.

- **Pros**: More maintainable, easier to update trip data
- **Cons**: More upfront design work needed
- **Effort**: Medium-High

### 3. Integrate with Contact Form
Instead of a dedicated `/booking` page, enhance the existing contact form at `/contacto` with booking-specific fields.

- **Pros**: Less code, leverages existing infrastructure
- **Cons**: Doesn't match user's prior implementation, different UX pattern
- **Effort**: High (would require significant UX redesign)

## Recommendation

**Approach 1: Direct Rebuild** — Follow the engram #106 description exactly. The prior implementation was a mockup/presentation with hardcoded mock login. User wants this rebuilt, so matching the prior approach is the right call.

Key decisions to confirm in proposal phase:
1. Should the "Book Now" nav link point to `/booking` or keep `/contacto?subject=booking`?
2. Real auth or keep mock (user123/123456)?
3. Any improvements to the deleted implementation?

## Risks

1. **No openspec setup**: Project doesn't use SDD/OpenSpec yet — may need `sdd-init` first
2. **No existing booking data model**: Need to define cruise/trip data structure if going approach #2
3. **Mock auth vs real auth**: Previous was mock only; decision needed if real auth is desired
4. **Deleted branch**: No code survivors, must rebuild from memory description only

## Ready for Proposal

**Yes.** Clear scope: rebuild the booking page with same mockup functionality as before. No architectural decisions needed — follow existing patterns. User should confirm:
- Is mock login (user123/123456) still acceptable?
- Any improvements desired over the deleted implementation?