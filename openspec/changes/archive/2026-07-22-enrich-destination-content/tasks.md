# Tasks: Enrich Destination Content

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~980 (780 additions + ~200 deletions) |
| 800-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (~180 lines) → PR 2 (~600 lines) → PR 3 (~200 changed lines) |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
800-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Translation keys + hero images | PR 1 | `npx vitest run -- language-context.destinations` | N/A — data-only, no runtime surface | Delete new key blocks in language-context.tsx + 3 image files |
| 2 | DestinationPage component + unit tests | PR 2 | `npx vitest run -- destination-page` | `npm run dev` → visit /destinos/islas-socorro | Delete `components/destination-page.tsx` |
| 3 | Page wiring + integration tests | PR 3 | `npx vitest run` (full suite) | `npm run build && npx tsc --noEmit` | Restore 3 original page.tsx from git |

## PR 1: Translation Keys + Hero Images (~180 lines)

- [ ] 1.1 Add Socorro extended keys (h5–h6, diveSites.* per zone/site, calendar.{jan-jul,nov-dec}, conservation.*, gallery.*) — EN section of `contexts/language-context.tsx`
- [ ] 1.2 Same keys — ES section
- [ ] 1.3 Add Cortez extended keys (h5–h6, diveSites.* per zone/site, calendar.{aug-nov}, conservation.*, gallery.*) — EN section
- [ ] 1.4 Same keys — ES section
- [ ] 1.5 Add Magbay extended keys (h5–h6, calendar.{jan-apr,oct-dec}, conservation.*, gallery.*; omit diveSites) — EN section
- [ ] 1.6 Same keys — ES section
- [ ] 1.7 Create hero images: `public/socorro-destination.jpg`, `public/sea-cortez-destination.jpg`, `public/mag-bay-destination.jpg`
- [ ] 1.8 Write `__tests__/contexts/language-context.destinations.test.tsx` — verify keys resolve per locale; verify magbay.diveSites.title returns raw key (missing)
- [ ] 1.9 Verify: `npx vitest run -- language-context.destinations` → pass; `npm run build && npx tsc --noEmit` → pass

## PR 2: DestinationPage Component (~600 lines)

- [ ] 2.1 (RED) Write `__tests__/components/destination-page.test.tsx` — unit tests: 8-section render order, 6 highlights, calendar conditional months, gallery JSON parse, missing diveSites suppress (Magbay)
- [ ] 2.2 (GREEN) Create `components/destination-page.tsx` — private sub-components: HeroSection, DescriptionSection, HighlightsSection, DiveSitesSection, CalendarSection, GallerySection, ConservationSection, CTASection. Hardcode zone arrays per design. Use `useLanguage().t()` for all content. Import Navigation/Footer at page level (not inside component).
- [ ] 2.3 Verify: `npx vitest run -- destination-page` → pass; `npm run build && npx tsc --noEmit` → pass

## PR 3: Page Wiring + Integration Tests (~200 changed lines)

- [x] 3.1 (RED) Write `__tests__/app/destinos/destination-pages.integration.test.tsx` — integration: Socorro renders all 8 sections, Cortez renders its zones, Magbay omits diveSites, hero src correct per prefix
- [x] 3.2 (GREEN) Replace `app/destinos/islas-socorro/page.tsx` with ~10-line wrapper
- [x] 3.3 (GREEN) Replace `app/destinos/mar-de-cortes/page.tsx` with ~10-line wrapper
- [x] 3.4 (GREEN) Replace `app/destinos/bahia-magdalena/page.tsx` with ~10-line wrapper
- [x] 3.5 Verify: `npx vitest run` → new tests pass (14 pre-existing booking failures expected); `npm run build && npx tsc --noEmit` → pass
