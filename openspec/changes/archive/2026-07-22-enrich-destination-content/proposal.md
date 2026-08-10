# Proposal: Enrich Destination Content

## Intent

Replace the 3 structurally identical destination pages (77 lines each, copy-pasted) with a shared `<DestinationPage>` component and add rich content: zone-grouped dive sites, expanded highlights (6+ cards), seasonal calendars, image galleries, and conservation info. Fix 3 missing hero images.

## Scope

### In Scope
- Extract shared `<DestinationPage>` component; each `page.tsx` reduces to ~10 lines
- Expand highlights from 4 to 6+ cards per destination with specific fauna/site content
- Add dive sites section grouped by zone/island with fauna lists per location
- Add seasonal wildlife calendar (monthly fauna presence per destination)
- Add image gallery section at page bottom using existing panoramicas
- Add conservation section (UNESCO, national park, protected area per destination)
- Fix 3 missing hero images: `/socorro-destination.jpg`, `/sea-cortez-destination.jpg`, `/mag-bay-destination.jpg`
- ~25 new translation keys per destination (EN + ES) for new sections

### Out of Scope
- Redesign of existing Hero, Description, or CTA sections
- Data-driven content layer (CMS, API, external data files)
- Individual dive site profile pages
- Interactive map, booking integration
- New destination pages beyond existing 3

## Capabilities

### New Capabilities
- `destination-page`: shared `<DestinationPage>` component with unified layout (Hero → Description → Highlights → Dive Sites → Calendar → Gallery → Conservation → CTA)
- `destination-content`: structured content for dive sites by zone, expanded highlights, seasonal calendar, conservation, and gallery per destination prefix

### Modified Capabilities
None

## Approach

Extract `<DestinationPage prefix="socorro" | "cortez" | "magbay">` component per exploration recommendation. New sections render conditionally when translation keys exist. Use `public/images/panoramicas/` (17 existing) for gallery; source hero images from photo library.

**Zone groupings**: Socorro by island (San Benedicto, Roca Partida, Socorro Island); Sea of Cortez by region (La Paz Bay, Northern Islands, East Cape); Bahía Magdalena remains combined with Socorro sites on one page.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `components/destination-page.tsx` | New | Shared destination page with all sections |
| `app/destinos/*/page.tsx` (3 files) | Major Δ | Replace inline JSX with `<DestinationPage>` |
| `contexts/language-context.tsx` | Modified | ~75 new keys per language (~150 total lines) |
| `public/` | New | 3 hero `.jpg` images |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Translation key explosion bloats 1166-line context file | High | Keep minimum viable keys; defer nested resolution to separate module |
| Missing hero images block deployment | Medium | Source images early; fallback to existing panoramicas |
| Section layout decisions stall on UX approval | Medium | Start with simple 2-column grid; refine in design phase |

## Rollback Plan

Revert `<DestinationPage>` component, restore 3 original `page.tsx` files (each ~77 lines), delete new translation keys. No database migration — text and component only.

## Dependencies

- Hero image assets (3 `.jpg` files for `public/`)
- Content copy approved (provided in product decisions)

## Success Criteria

- [ ] All 3 destination pages render via shared `<DestinationPage>` component
- [ ] 6+ highlight cards per destination with specific content
- [ ] Dive sites section shows zones/islands with fauna per zone
- [ ] Seasonal calendar displays month-by-month wildlife presence
- [ ] Conservation section shows UNESCO/protected-area info
- [ ] Image gallery renders with existing panoramicas at page bottom
- [ ] EN + ES translations complete (no missing-key fallbacks)
- [ ] `npx vitest run` passes; `npm run build` succeeds
