# Design: Enrich Destination Content

## Technical Approach

Extract shared `<DestinationPage prefix>` component driving all 8 sections via flat translation keys. Each `page.tsx` reduces to ~10 lines wrapping `<DestinationPage>` between `<Navigation>` and `<Footer>`. No data layer — all content in `language-context.tsx` flat keys. Conditional rendering: `t(key) === key` (missing) suppresses the section.

## Architecture Decisions

| Decision | Option | Tradeoff | Chosen |
|----------|--------|----------|--------|
| File placement | `components/destination-page.tsx` vs subfolder | Single file simpler at ~400 lines; subfolder only if sections grow complex | Single file |
| Nav/Footer placement | Inside DestinationPage vs page.tsx wrapper | Inside: simpler page. Wrapper: shared components at page level per existing pattern | page.tsx wrapper |
| Section rendering | Inline JSX vs private sub-components in same file | Inline: one big function. Private: readable, each section has distinct logic | Private sub-components |
| Zone iteration | Hardcoded zone arrays vs dynamic key matching | Hardcoded: typed, Tree-shakeable. Dynamic: needs key iteration on flat object | Hardcoded arrays |
| Gallery images | JSON array in translation value vs import-based config | Translation value: self-contained i18n, locale-switchable. Import: needs file-based config | JSON string in translation key |

## Component Tree

```
page.tsx
├── <Navigation />
├── <DestinationPage prefix />
│   ├── HeroSection      — 60vh bg-image + overlay
│   ├── DescriptionSection — max-w-3xl, 2 paragraphs
│   ├── HighlightsSection  — grid-cols-1 md:2 lg:3, 2-6 cards
│   ├── DiveSitesSection   — <details> per zone, site cards
│   ├── CalendarSection    — grid-cols-2 md:3 lg:4, months with fauna
│   ├── GallerySection     — grid-cols-2 md:3, next/image
│   ├── ConservationSection — single card max-w-2xl
│   └── CTASection         — bg-primary, accent button → /contacto
└── <Footer />
```

## Types

```typescript
type DestinationPrefix = 'socorro' | 'cortez' | 'magbay'

interface DestinationPageProps { prefix: DestinationPrefix }

// Hardcoded per-prefix constant for dive site iteration
interface ZoneInfo { zoneKey: string; siteKeys: string[] }
```

## Translation Key Convention

```
{prefix}.h5, {prefix}.h5d, {prefix}.h6, {prefix}.h6d   — extended highlights
{prefix}.diveSites.title                                — section heading
{prefix}.diveSites.{zone}.{site}.name                   — site name
{prefix}.diveSites.{zone}.{site}.description             — site description
{prefix}.diveSites.{zone}.{site}.fauna                   — fauna list
{prefix}.calendar.{month}                               — month → fauna string
{prefix}.conservation.unesco                            — UNESCO status
{prefix}.conservation.protectedArea                     — protected area name
{prefix}.conservation.designation                       — year designated
{prefix}.gallery.title                                  — section heading
{prefix}.gallery.images                                 — JSON array of paths
```

**~25 keys per destination × 2 languages = ~150 new entries in `language-context.tsx`.** Zone/site iteration uses hardcoded zone arrays — the component looks up keys by known suffixes. Months Jan–Dec are tried; only resolved keys render.

## Layout by Section

- **Hero**: `relative h-[60vh] min-h-[400px]`, `Image fill priority` + `overlay bg-primary/60`
- **Description**: `max-w-3xl mx-auto space-y-6`
- **Highlights**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8` — iterates h1→h6, skips missing
- **Dive Sites**: `<details open>` per zone, zone heading via `t()`, sites in 3-col card grid. Missing `diveSites.title` suppresses entire section (magbay).
- **Calendar**: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`, month label + fauna text per card
- **Gallery**: `grid-cols-2 md:grid-cols-3 gap-4`, `JSON.parse(t('gallery.images'))`, each `<Image width={400} height={300} className="rounded-lg object-cover" />`
- **Conservation**: `max-w-2xl mx-auto p-8 bg-muted/30 rounded-lg`, UNESCO Badge icon + text
- **CTA**: `py-16 bg-primary text-primary-foreground`, `Button asChild size="lg"` linking `/contacto`

## Image Path Mapping

| Prefix | Hero (new, .webp) | Gallery (existing panoramicas/) |
|--------|-------------------|----------------------------------|
| `socorro` | `/socorro-destination.jpg` | 6 Socorro images (Manta el Boiler, Cabo Pearce, Clariones, Pargos Roca, Delfin Kike, Isla Socorro) |
| `cortez` | `/sea-cortez-destination.jpg` | 5 Cortez images (ROca Partida, Quetzal San Bene, Manta Clariones, PuntaTosca, loreto-magdalena-bay) |
| `magbay` | `/mag-bay-destination.jpg` | 4 MagBay images (Puntas blancas × 4) |

Hero images: current references broken. New convention: replace with `.webp` equivalents stored at root `public/` once photo library assets are sourced. Gallery assignments encoded in translation value — reassign without code changes.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Conditional rendering | Mock `useLanguage`, assert section presence/absence per missing keys |
| Unit | Highlights card count | 4 keys → 4 cards; 6 keys → 6 cards; missing h5→4 cards |
| Unit | Gallery JSON parse | Valid JSON → grid renders; invalid JSON → graceful skip |
| Integration | Full Socorro page render | RTL render `SocorroPage`, verify all 8 sections in DOM |
| Integration | MagBay omits dive sites | Assert `<DiveSitesSection>` not in DOM |
| Build | `npm run build` + `npx tsc --noEmit` | Zero type errors, zero missing-key fallback crashes |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `components/destination-page.tsx` | Create | 8-section shared component, ~400 lines |
| `app/destinos/islas-socorro/page.tsx` | Modify | Replace 77 lines with ~10-line wrapper |
| `app/destinos/mar-de-cortes/page.tsx` | Modify | Replace 77 lines with ~10-line wrapper |
| `app/destinos/bahia-magdalena/page.tsx` | Modify | Replace 77 lines with ~10-line wrapper |
| `contexts/language-context.tsx` | Modify | ~150 new keys (75 per language) |
| `public/{socorro,sea-cortez,mag-bay}-destination.jpg` | Create | 3 hero images |

## Migration / Rollout

No migration required. Feature is additive — old `page.tsx` files replaced with thin wrappers. Rollback: restore original 3 `page.tsx` files, delete `destination-page.tsx`, remove new translation keys.

## Open Questions

- [ ] Hero image assets: confirm source for 3 `.webp` files; use existing panoramicas as fallback?
- [ ] Gallery image assignment per destination: which specific panoramicas per destination?
- [ ] `magbay.diveSites` keys: spec says omit for MagBay. Confirm no dive content for Bahía Magdalena page?
