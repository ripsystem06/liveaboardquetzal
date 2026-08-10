# Proposal: Reframe About Section — Customer-Centric Narrative

## Intent

The `/about` page is a corporate brochure: 62% of its copy is self-referential ("Our Mission", "Our Vision", "Our Values"). It fails to create urgency or make the reader imagine themselves onboard. This change transforms the page into a customer-centric narrative where the reader is the protagonist — driving booking intent through experiential language, social proof, and a direct call to action.

## Scope

### In Scope
- **Eliminate** Mission, Vision, and Philosophy sections. Weave their best ideas — especially "personal connection" (`about.v3`/`about.v3d`) — into surviving sections.
- **Transform** Story section from company history to second-person immersive narrative. Reader is the protagonist ("You wake to the sound of the sea...").
- **Refactor** Values: remove Safety (baseline expectation, not a differentiator) and Community (overlaps with Personal Connection). Keep 4 cards — Respect for the Ocean, Authentic Experiences, Personal Connection, Personalized Service — each reframed as a guest benefit. Grid changes from 2×3 to 2×2.
- **Fix CTA**: new `about.cta` and `about.ctaButton` keys with booking-oriented copy. Stop reusing `collab.cta` ("Interested in partnering with us?") and `destination.cta`.
- **Add social proof**: hardcoded "+500 divers have lived this experience" counter near CTA.
- **Hero subtitle** shift to customer-centric tone.
- All translation keys: rewrite affected EN and ES entries synchronously.

### Out of Scope
- Layout redesign, new components, animations, or image changes.
- Dynamic social proof counter (database query) — deferred follow-up.
- Changes to `colaboraciones/page.tsx` (it keeps `collab.cta`, unaffected).
- Test infrastructure or coverage thresholds.

## Capabilities

### New Capabilities
- `about-page-content`: Defines the content contract for the About page — section structure, translation keys, customer-centric voice requirements, CTA behavior, social proof element.

### Modified Capabilities
None. No existing OpenSpec specs cover the About page.

## Approach

Content-only refactor with minor structural reduction:
1. Rewrite EN and ES translation keys in `contexts/language-context.tsx`.
2. Remove Mission (`bg-primary`), Vision (`bg-muted/30`), and Philosophy (`bg-primary`) sections from `app/about/page.tsx`.
3. Restyle Story section copy — same 2-col layout (text + image), new second-person narrative.
4. Reduce Values `v4` (Shield) and `v6` (Users) from the icon array. Keep 4 cards: Fish, Compass, Heart, Star.
5. Replace CTA keys from `collab.cta`/`destination.cta` to `about.cta`/`about.ctaButton`.
6. Add social proof `<p>` element between CTA heading and button.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/about/page.tsx` | Modified | Remove 3 sections, values 6→4, fix CTA keys, add social proof |
| `contexts/language-context.tsx` | Modified | ~24 keys rewritten (EN L331–366, ES L989–1024), 2 keys added, ~14 removed |
| `app/about/colaboraciones/page.tsx` | None | Keeps its own `collab.cta` — unaffected |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CTA key rename breaks colaboraciones page | Low | `collab.cta` stays untouched — we add new keys, never rename existing ones |
| Translation drift (EN/ES out of sync) | Low | Both blocks edited in same commit; visual review of both languages |
| Removed sections break visual rhythm | Low | 7→5 sections preserves alternating `bg-background`/`bg-muted`/`bg-primary` pattern |
| No test coverage | Medium | Manual visual verification; tests out of scope for this change |

## Rollback Plan

Revert the commit. All changes are confined to two files (`app/about/page.tsx`, `contexts/language-context.tsx`) with no database or API changes. No migration to undo.

## Dependencies

None. No external APIs, database changes, or package updates.

## Success Criteria

- [ ] Zero "Our Mission", "Our Vision", "Our Values", "Our Philosophy" headings in rendered output
- [ ] Story section uses second-person voice ("You'll...", "Your...") in both EN and ES
- [ ] Values grid renders exactly 4 cards (Fish, Compass, Heart, Star), each with a guest benefit
- [ ] CTA heading no longer reads "Interested in partnering with us?" — replaced with booking-oriented copy
- [ ] Social proof element visible between CTA heading and button
- [ ] Both EN and ES render without missing-key fallbacks or `undefined` text
