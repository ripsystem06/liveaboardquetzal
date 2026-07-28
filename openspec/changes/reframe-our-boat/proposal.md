# Proposal: Reframe Our Boat — Customer-Centric Narrative

## Intent

Transform `/nuestro-barco` from a corporate product brochure (40–50% self-referential copy, hardcoded English on a Spanish-route page) into an immersive second-person narrative — matching the reframe pattern established by `app/about/page.tsx`. The reader should FEEL what it's like to live aboard, not read a spec sheet about a vessel.

## Scope

### In Scope
- Rewrite ~12 self-referential translation keys to second-person "you" voice (Hero, Comfort, Gallery)
- Add new "Your Floating Home" narrative section (4 paragraphs) between Hero and Deck Plans
- Reframe Comfort section title + 4 descriptions to "Life Onboard" with voseo for ES
- Add dedicated `boat.cta`, `boat.ctaButton`, `boat.socialProof` keys — replace wrong `dest.bookNow` / `destination.cta` usage
- Extract hardcoded text: Hero alt, Deck Plans heading/description to translation keys
- Extract 8 gallery alt texts to 2 category-reusable keys (`boat.gallery.altStateroom`, `boat.gallery.altInterior`)
- ~72 total string changes across EN + ES in `contexts/language-context.tsx`

### Out of Scope
- Deck plan diagram images and Spanish labels — stay AS-IS, no keys
- Specs section — copy unchanged, structure unchanged
- Interactive deck plans, virtual tours, lightbox, or video integration
- Any other page (Home, Destinations, Blog, Legal) — this is boat-only

## Capabilities

> No existing `openspec/specs/` found. All are new.

### New Capabilities
- `boat-page-content`: second-person narrative structure for `/nuestro-barco` — Hero, Story, Deck Plans, Specs, Life Onboard, Gallery, CTA sections with translation-key contract
- `boat-cta`: dedicated boat call-to-action with social proof, replacing wrong-namespace destination keys

### Modified Capabilities
- None — no existing spec to modify

## Approach

**Approach 2 from exploration: narrative section + rewrite + boat-specific CTA.** One new section component (`YourFloatingHome`), copy rewrite across Hero/Comfort/Gallery, hardcoded-text extraction, and CTA key migration. Mirrors the About reframe pattern: Hero → Story → Experience → CTA. No new dependencies. Page grows from 6 to 7 sections.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/nuestro-barco/page.tsx` | Medium-High | Add narrative section, extract hardcoded strings, fix CTA keys, gallery alt pattern |
| `contexts/language-context.tsx` | High | ~12 rewrites + ~24 new keys in EN + ES `boat.*` namespace |
| `app/about/page.tsx` | None | Reference pattern only — no shared keys |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| No test coverage for boat page — zero regression safety | Medium | Add basic render test as first task before reframe |
| CTA key migration orphans `dest.bookNow` | Low | Verify dest keys have valid consumers; they're destination-context, should remain in use |
| Section reorder breaks visual flow | Low | Follow About page section-order pattern; test visually before merging |
| Active `reframe-destinations` change may conflict on `language-context.tsx` | Medium | Coordinate merge order; this change touches only `boat.*` keys |

## Rollback Plan

Revert commit. All changes are additive (new keys, new section) or value replacements (existing keys) — no schema migrations, no database changes. Git revert fully restores prior state.

## Dependencies

- **reframe-destinations** (active): both touch `language-context.tsx` — coordinate merge to avoid conflicts on non-`boat.*` keys

## Success Criteria

- [ ] All 12 self-referential keys rewritten to second-person "you" voice in both EN and ES
- [ ] New "Your Floating Home" section renders 4 narrative paragraphs between Hero and Deck Plans
- [ ] Deck Plans heading and description use translation keys (not hardcoded English)
- [ ] Gallery alts use category-reusable keys (not hardcoded English strings)
- [ ] CTA uses `boat.cta` + `boat.ctaButton` + `boat.socialProof` (not destination-namespace keys)
- [ ] ES copy consistent with Rioplatense voseo throughout all new/rewritten keys
- [ ] Page renders without errors in both `en` and `es` locales
- [ ] `npx vitest run` passes with any added tests
