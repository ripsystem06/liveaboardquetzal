# Proposal: Reframe Destinations — Customer-Centric Narrative

## Intent

All 3 destination pages (Socorro, Mar de Cortés, Bahía Magdalena) read like encyclopedias: third-person, factual, emotionally flat. The About reframe proved second-person narrative drives booking intent. This change applies the same transformation — rewriting ~164 string keys + adding a "Your Day at Sea" section, destination-specific CTAs with social proof, zone introductions in dive sites, and a water temperature display. The reader becomes the protagonist.

## Scope

### In Scope
- Rewrite all `socorro.*`, `cortez.*`, `magbay.*` copy to second-person narrative (EN + ES, Rioplatense voseo)
- New `DayAtSeaSection` component: immersive daily dive schedule from `Dia_de_buceo.md` (1 unified version, no boarding variants)
- MagBay variant: "Your Day in the Lagoon" — two-phase narrative (lagoon + archipelago), no dive sites
- Per-destination CTA keys: `{prefix}.cta`, `{prefix}.ctaButton`, `{prefix}.socialProof`
- Zone narrative intros in `DiveSitesSection` (Socorro only — data from `Informacion_del_area.md`)
- New `WaterTempSection`: premium visual display alongside Calendar. Socorro Nov–May data (21–29°C). Cortez/MagBay: component structure prepared, data deferred
- Unique narrative hooks: Socorro opens with mantas, Cortez with sea lions, MagBay with gray whales
- Update existing tests to cover new sections and keys

### Out of Scope
- Additional dive sites from `Informacion_del_area.md` (Las Cuevitas, Punta Tosca, etc.) — deferred
- Cortez/MagBay water temperature data — deferred until source data exists
- Layout redesign, new animations, image changes, database changes

## Capabilities

### New Capabilities
- `destination-page-content`: Content contract for all 3 destination pages — section structure, translation keys (rewrites + additions), customer-centric voice requirements, per-destination CTAs, Day at Sea narratives, water temperature display. Defines 9-section order: Hero → Description → Highlights → Day at Sea → Dive Sites → Water Temp → Calendar → Gallery → Conservation → CTA.

### Modified Capabilities
None. No active OpenSpec specs cover destination pages.

## Approach

1. **Copy rewrite**: ~82 unique keys × 2 langs = ~164 rewrites in `contexts/language-context.tsx`. Third-person → second-person. Each destination gets unique narrative hook.
2. **New component**: `DayAtSeaSection` in `components/destination-page.tsx` (~60 lines). Reads `{prefix}.dayAtSea.*` keys. MagBay reads `magbay.dayInLagoon.*` instead.
3. **Enhanced dive sites**: Zone intro paragraph before each zone group in `DiveSitesSection` — Socorro only (`{prefix}.areas.{zone}`).
4. **Water temp**: New `WaterTempSection` component. Conditionally renders per `{prefix}.waterTemp.*` keys. Socorro: 7 months data. Cortez/MagBay: gracefully hidden until data exists.
5. **Per-destination CTAs**: `CTASection` reads `{prefix}.cta`/`{prefix}.ctaButton`/`{prefix}.socialProof`. Shared `destination.cta`/`dest.bookNow` keys preserved for other pages (boat, destination index).
6. **Tests**: Extend existing `destination-page.test.tsx` (11 tests) with Day at Sea and water temp coverage. Add MagBay-specific assertions.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `contexts/language-context.tsx` | Modified | ~164 rewrites + ~55 new keys (dayAtSea, cta, socialProof, areas, waterTemp) in EN + ES |
| `components/destination-page.tsx` | Modified | 2 new components (DayAtSeaSection, WaterTempSection), enhanced CTASection + DiveSitesSection |
| `__tests__/components/destination-page.test.tsx` | Modified | New assertions for added sections, MagBay Day-in-Lagoon path |
| `__tests__/app/destinos/destination-pages.integration.test.tsx` | Modified | Update `destination.cta` references |
| `app/destinos/*/page.tsx` | None | Thin wrappers unchanged |
| `components/destination-section.tsx` | None | Uses shared `destination.cta` — preserved |
| `app/nuestro-barco/page.tsx` | None | Uses shared `dest.bookNow`/`destination.cta` — preserved |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Translation drift EN/ES | Medium | Both blocks edited in same commit; visual review per language |
| ~430 string changes — manual typos | Medium | Key-by-key verification; ESLint type-check catches missing keys |
| Test assertions on shared CTA keys break other pages | Low | Preserve `destination.cta`/`dest.bookNow`; add, never rename |
| Day at Sea schedule contradicts actual operations | Low | Content sourced from `Dia_de_buceo.md` — product-approved reference |
| MagBay asymmetry complicates component | Low | Separate key namespace (`dayInLagoon`) + conditional rendering — zero shared assumptions |

## Rollback Plan

Revert the commit. All changes confined to 2 files + 1 test file. No DB migrations, no API changes, no package updates. Component conditional rendering ensures missing keys → section gracefully hidden.

## Dependencies

None. No external APIs, database changes, or package updates.

## Success Criteria

- [ ] Zero third-person copy remaining in rendered destination pages (EN + ES)
- [ ] All 3 destinations use second-person voice — no "The Revillagigedo Archipelago is..." patterns
- [ ] Day at Sea section renders between Highlights and Dive Sites for all 3 destinations
- [ ] MagBay renders "Your Day in the Lagoon" with two-phase narrative, no dive site references
- [ ] Water temp section renders for Socorro (7 months data); hidden for Cortez/MagBay
- [ ] Per-destination CTA reads `{prefix}.cta`/`{prefix}.ctaButton`/`{prefix}.socialProof`
- [ ] Boat page and destination index continue using shared `destination.cta`/`dest.bookNow`
- [ ] Both EN and ES render without missing-key fallbacks
- [ ] All 11 existing tests pass + new Day at Sea / water temp assertions pass
