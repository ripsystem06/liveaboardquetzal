# Tasks: Reframe Destinations — Customer-Centric Narrative

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~430 (274 translation + 130 component + 50 test) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | ask-on-risk |
| Suggested split | PR 1 → PR 2 |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | All translation rewrites + new keys (dayAtSea, dayInLagoon, cta, ctaButton, socialProof, areas, waterTemp) across EN + ES | PR 1 | `npx vitest run __tests__/components/destination-page.test.tsx` (existing tests pass) | `npm run dev` → visit /destinos/islas-socorro, verify no raw-key fallbacks | Revert contexts/language-context.tsx; components still read old shared keys |
| 2 | DayAtSeaSection, WaterTempSection, enhanced DiveSites/CTASection + test updates | PR 2 | `npx vitest run` (all dest tests) | `npm run dev` → verify 10-section order, second-person voice, zero raw keys | Revert components/destination-page.tsx + 2 test files |

## Phase 1: Translation Foundation

- [x] 1.1 Rewrite `socorro.description1`, `socorro.description2` in second-person EN + ES (Rioplatense voseo)
- [x] 1.2 Rewrite `socorro.h1`–`h6`, `socorro.h1d`–`h6d` — each highlight becomes "you"-centric narrative
- [x] 1.3 Rewrite all Socorro dive site descriptions + fauna keys (4 sites, 3 keys each)
- [x] 1.4 Rewrite `cortez.description1`–`description2` — hook: playful sea lions greet you
- [x] 1.5 Rewrite `cortez.h1`–`h6`, `cortez.h1d`–`h6d` — second-person voice
- [x] 1.6 Rewrite all Cortez dive site descriptions + fauna (10 sites, 3 keys each)
- [x] 1.7 Rewrite `magbay.description1`–`description2` — hook: gray whales within arm's reach
- [x] 1.8 Rewrite `magbay.h1`–`h6`, `magbay.h1d`–`h6d` — second-person voice
- [x] 1.9 Add `{socorro|cortez}.dayAtSea.*` keys (heading, intro, morning, afternoon, evening, note) in EN + ES
- [x] 1.10 Add `magbay.dayInLagoon.*` keys (same structure, two-phase lagoon + archipelago narrative) in EN + ES
- [x] 1.11 Add `{prefix}.cta`, `{prefix}.ctaButton`, `{prefix}.socialProof` for all 3 destinations in EN + ES
- [x] 1.12 Add `socorro.areas.sanBenedicto`, `socorro.areas.rocaPartida`, `socorro.areas.socorroIsland` — zone intro narratives from `Informacion_del_area.md` in EN + ES
- [x] 1.13 Add `socorro.waterTemp.*` keys (title + nov–may months, 21–29°C) in EN + ES

## Phase 2: Component Changes

- [x] 2.1 Create `DayAtSeaSection({ prefix })` — reads `{prefix}.dayAtSea.*`, conditional null if heading missing, positioned between Highlights and Dive Sites
- [x] 2.2 Wire MagBay asymmetry: when `prefix === 'magbay'`, read `magbay.dayInLagoon.*` instead of `dayAtSea.*`
- [x] 2.3 Create `WaterTempSection({ prefix })` — reads `{prefix}.waterTemp.title`, renders 7 months (Socorro), returns null when key absent (Cortez/MagBay)
- [x] 2.4 Enhance `DiveSitesSection`: render `t('{prefix}.areas.{zoneKey}')` narrative intro paragraph above each zone's site cards (Socorro only; Cortez/MagBay skip when key missing)
- [x] 2.5 Update `CTASection`: heading from `t('{prefix}.cta')`, button from `t('{prefix}.ctaButton')`, social proof from `t('{prefix}.socialProof')` below heading. Fallback to shared keys when absent

## Phase 3: Test Updates

- [x] 3.1 Add Day at Sea keys to mock Socorro/Cortez translations in destination-page.test.tsx and integration test
- [x] 3.2 Add test: renders DayAtSeaSection with heading + morning/afternoon/evening narrative between Highlights and DiveSitesSection
- [x] 3.3 Add test: Socorro renders WaterTempSection with 7 months (21–29°C) between Dive Sites and Calendar
- [x] 3.4 Add test: Cortez WaterTempSection returns null (no gap)
- [x] 3.5 Add test: MagBay reads `dayInLagoon.*` not `dayAtSea.*`, hides DiveSitesSection
- [x] 3.6 Add per-destination CTA keys to mock translations; update CTA assertions to expect `{prefix}.cta` text
- [x] 3.7 Update integration test CTA assertions for new per-destination keys; verify shared `dest.bookNow`/`destination.cta` still resolve

## Phase 4: Verification

- [x] 4.1 Run `npx tsc --noEmit` — zero type errors (no new errors in changed files)
- [x] 4.2 Run `npx eslint .` — zero new warnings
- [x] 4.3 Run all tests: `npx vitest run` — zero failures (477/477)
- [ ] 4.4 Visual review: `npm run dev`, visit all 3 /destinos/* pages in EN, verify zero third-person patterns, 10-section order, Day at Sea renders, water temp (Socorro only)
- [ ] 4.5 Visual review: switch to ES, verify Rioplatense voseo in all sections, zero tuteo patterns, no raw keys
