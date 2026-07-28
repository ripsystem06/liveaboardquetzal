# Tasks: Reframe Our Boat — Customer-Centric Narrative

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150 (72 translation lines + 30 new section + 20 page edits + 30 test) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | All tasks (single PR) | PR 1 | `npx vitest run __tests__/app/nuestro-barco/page.test.tsx` | `npm run dev` → visit `/nuestro-barco` in EN and ES | `git revert` — all changes are additive/replacements with no schema migrations |

## Phase 1: RED — Render Tests (TDD)

- [x] 1.1 Create `__tests__/app/nuestro-barco/page.test.tsx` with mock setup: next/image, next/link, lucide-react, useLanguage (mutable `translationStore`) — mirror `__tests__/components/destination-page.test.tsx` pattern
- [x] 1.2 RED test: renders 7 sections in order — Hero → Your Floating Home (`boat.story`) → Deck Plans → Specs → Life Onboard → Gallery → CTA
- [x] 1.3 RED test: Hero image `alt` attribute = `t('boat.heroImageAlt')`, not hardcoded `"Quetzal Liveaboard"`
- [x] 1.4 RED test: Deck Plans heading = `t('boat.deck.title')`, description = `t('boat.deck.subtitle')` — not hardcoded English
- [x] 1.5 RED test: CTA renders `boat.cta` heading, `boat.ctaButton` → `/contacto`, `boat.socialProof` between them; zero references to `dest.bookNow` or `destination.cta`
- [x] 1.6 RED test: gallery `<Image>` alt attributes use `boat.gallery.altStateroom`/`boat.gallery.altInterior`, not hardcoded English strings
- [x] 1.7 Verify RED: `npx vitest run __tests__/app/nuestro-barco` — all tests FAIL (page not yet updated)

## Phase 2: GREEN — Translation Keys (language-context.tsx)

- [x] 2.1 Add EN keys at `boat.hero` block end: `boat.story`, `boat.storyText1`–`boat.storyText4` ("Your Floating Home" + 4 narrative paragraphs)
- [x] 2.2 Add EN keys: `boat.deck.title`, `boat.deck.subtitle` ("Explore Your Space" heading + intro)
- [x] 2.3 Add EN keys: `boat.gallery.altStateroom`, `boat.gallery.altInterior` (2 reusable category alt texts)
- [x] 2.4 Add EN keys: `boat.cta`, `boat.ctaButton`, `boat.socialProof` (boat-specific CTA + social proof)
- [x] 2.5 Add EN key: `boat.heroImageAlt` (extracted from hardcoded hero Image alt)
- [x] 2.6 Rewrite ~12 self-referential EN keys to second-person "you" voice: `boat.hero`, `boat.subtitle`, `boat.comfort.title`, `boat.comfort.{dining,sunDeck,cabin,dive}Desc`, `boat.gallery.title`, `boat.gallery.subtitle`
- [x] 2.7 Mirror all new + rewritten keys to ES block with Rioplatense voseo (matching About + Destinations voice)

## Phase 3: GREEN — Page Component (app/nuestro-barco/page.tsx)

- [x] 3.1 Add `YourFloatingHome` narrative section (4 paragraphs from `boat.storyText1`–`boat.storyText4`, heading from `boat.story`) between Hero and Deck Plans — ~30 JSX lines, `font-serif`, generous padding
- [x] 3.2 Replace hardcoded Hero `<Image>` alt `"Quetzal Liveaboard"` → `{t('boat.heroImageAlt')}`
- [x] 3.3 Replace hardcoded Deck Plans `<h2>`/`<p>` text with `{t('boat.deck.title')}` / `{t('boat.deck.subtitle')}`
- [x] 3.4 Replace CTA keys: `dest.bookNow` → `boat.cta`, `destination.cta` → `boat.ctaButton`, add `<p>{t('boat.socialProof')}</p>` between heading and button (match `app/about/page.tsx` CTA pattern)
- [x] 3.5 Replace gallery alt texts: hardcoded per-image strings → `t('boat.gallery.altStateroom')` for staterooms, `t('boat.gallery.altInterior')` for interior images

## Phase 4: REFACTOR — Verification

- [x] 4.1 Run `npx vitest run __tests__/app/nuestro-barco` — all tests GREEN (7 sections, boat.* keys, no dest keys, social proof, /contacto link)
- [x] 4.2 Run `npx tsc --noEmit` — zero type errors
- [x] 4.3 Visual check: `npm run dev`, visit `/nuestro-barco` in `en` and `es` locales — page renders without errors, all 7 sections visible
