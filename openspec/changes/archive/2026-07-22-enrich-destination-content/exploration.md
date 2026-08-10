## Exploration: Enrich Destination Content

### Current State

The three destination pages (Socorro, Mar de Cortés, Bahía Magdalena) are structurally identical, rendered as client components with inline JSX. Each page follows the same pattern: Hero → Description (2 paragraphs) → Highlights (4 cards) → CTA. Content comes entirely from the `translations` object in `contexts/language-context.tsx`, with keys prefixed by `socorro.`, `cortez.`, or `magbay.`.

**Translation coverage per destination (current)**:
- `{prefix}.title` — page title
- `{prefix}.subtitle` — tagline below title
- `{prefix}.description1` / `{prefix}.description2` — two intro paragraphs
- `{prefix}.highlights` — section header ("What You'll See")
- `{prefix}.h1`–`{prefix}.h4` — highlight card titles
- `{prefix}.h1d`–`{prefix}.h4d` — highlight card descriptions

That is **11 keys per destination**, all with EN and ES variants (22 total translations). No keys exist for dive sites, marine fauna, or ecosystem characteristics beyond the 4 generic highlights.

**Translation sections in `contexts/language-context.tsx`**:
- EN: Lines 73–79 (grid), 157–166 (shared dest page strs), 167–210 (3 destinations)
- ES: Lines 633–642 (grid), 720–729 (shared dest page strs), 730–773 (3 destinations)

### Affected Areas

| File | Role | Lines |
|------|------|-------|
| `app/destinos/islas-socorro/page.tsx` | Socorro page (77 lines) | Full file |
| `app/destinos/mar-de-cortes/page.tsx` | Sea of Cortez page (77 lines) | Full file |
| `app/destinos/bahia-magdalena/page.tsx` | Bahía Magdalena page (77 lines) | Full file |
| `components/destinations-grid.tsx` | Home page grid (139 lines) | L8–33 (data array), L115–121 (content rendering) |
| `components/destination-section.tsx` | Home page CTA section (54 lines) | Uses `destination.*` keys, unrelated to detail pages |
| `components/navigation.tsx` | Nav with destinos dropdown | L78–87 (desktop), L193–201 (mobile compact), L286–294 (mobile menu) |
| `contexts/language-context.tsx` | All translations (1166 lines) | EN: L73–79, L157–210; ES: L633–642, L720–773 |

**Files that may need changes but are NOT destination-specific**:
- `components/footer.tsx` — uses `footer.socorro`, `footer.cortez`, `footer.magBay` (EN: L118–121, ES: L681–684) — only titles
- `app/page.tsx` — renders `DestinationSection` + `DestinationsGrid`
- No `app/destinos/layout.tsx` exists — each page renders `<Navigation />` and `<Footer />` inline
- No `app/destinos/page.tsx` index/listing page exists

### Approaches

1. **Flat: Extend each page inline (current pattern)**
   - Add new sections directly into each `page.tsx` with new translation keys
   - Keep all 3 pages as separate, copy-pasted structures
   - Pros: Zero architectural change, least risk, fast
   - Cons: 3x duplication for every new section, 77→200+ lines per page, hard to maintain consistency
   - Effort: Medium

2. **Shared component + per-destination config**
   - Extract a `<DestinationPage>` component that accepts a prefix (`socorro` | `cortez` | `magbay`) and optionally a list of additional section keys
   - Each `page.tsx` becomes ~15 lines passing config
   - Pros: DRY, consistent layout, easy to add sections to all destinations at once
   - Cons: Adds abstraction layer, requires TypeScript for section typing
   - Effort: Low

3. **Data-driven: externalize destination content to a config/data file**
   - Create `lib/destinations.ts` with structured data (title, subtitle, description, highlights, diveSites, fauna, ecosystem, images, etc.)
   - Use a single dynamic route `[slug]` or keep separate pages that consume the data
   - Use Zod for validation, co-locate data with types
   - Pros: Content == data — easy to add, CMS-ready later, testable in isolation
   - Cons: Most architectural change, needs migration of existing translations to data
   - Effort: Medium–High

### Recommendation

**Approach 2 (shared `<DestinationPage>` component)** is the right balance. The 3 pages are ALREADY structurally identical — the only difference is the key prefix. Adding a shared component eliminates the 3x copy-paste problem for every future section while keeping Translations as the single source of text content.

Specific plan:
1. Create `<DestinationPage prefix="socorro" />` component in `components/destination-page.tsx`
2. Each `page.tsx` becomes: `export default function SocorroPage() { return <DestinationPage prefix="socorro" /> }`
3. Add new translation sections: `{prefix}.diveSites.title`, `{prefix}.diveSites.sites[0].name`, etc., `{prefix}.fauna.title`, etc., `{prefix}.ecosystem.title`, etc.
4. If a section needs specific images, pass them as optional props or use a data map keyed by prefix

Includes fixing the missing hero images: `/socorro-destination.jpg`, `/sea-cortez-destination.jpg`, `/mag-bay-destination.jpg` are referenced but do not exist in `public/`.

### Risk: Translation key explosion

Adding dive sites, fauna, and ecosystem sections could mean 20+ new keys per destination (60+ total, 120+ with ES). Storing all of them as flat keys in `language-context.tsx` will bloat the file. Consider nested key resolution or a separate `destinations/` translation module.

### Route Structure

Confirmed:
- `/destinos/islas-socorro` → `app/destinos/islas-socorro/page.tsx`
- `/destinos/mar-de-cortes` → `app/destinos/mar-de-cortes/page.tsx`
- `/destinos/bahia-magdalena` → `app/destinos/bahia-magdalena/page.tsx`

Grid links on home page point to these exact routes (lines 14, 22, 30 of `destinations-grid.tsx`).
Navigation dropdown points to the same routes (lines 79, 82, 85 of `navigation.tsx`).

### Image References

**Hero images (MISSING — referenced but not in public/)**:
- `/socorro-destination.jpg` — Socorro hero
- `/sea-cortez-destination.jpg` — Sea of Cortez hero
- `/mag-bay-destination.jpg` — Bahía Magdalena hero

**Grid images (exist in `public/images/panoramicas/`)**:
- `/images/panoramicas/Isla Socorro.webp` — Socorro card
- `/images/panoramicas/loreto-magdalena-bay.webp` — Mag Bay card
- `/images/panoramicas/PuntaTosca.webp` — Sea of Cortez card

**Available images in public/ that could enrich destinations**:
- `public/images/Exterior/quetzal-islas-socorro.webp`
- `public/images/Exterior/quetzal-bahia-magdalena.webp`
- `public/images/panoramicas/Manta el Boiler 1.webp`
- `public/images/panoramicas/Manta Clariones.webp`
- `public/images/panoramicas/Delfin Kike.webp`
- `public/images/panoramicas/Puntas blancas *.webp` (4 files)
- `public/images/panoramicas/ROca Partida .webp`
- `public/images/panoramicas/Cabo Pearce .webp`
- `public/images/panoramicas/Clariones.webp`
- `public/images/panoramicas/burritos galapagos 1.webp`

### Key Inventory (Translation Keys Used)

**Used by all 3 destination pages (shared)**:
- `dest.hero`, `dest.heroHighlight` (not used by detail pages?)
  - Actually: `dest.hero` IS used: Socorro line 26, Cortez line 26, MagBay line 26
- `dest.bookNow` — Socorro L63, Cortez L63, MagBay L63
- `destination.cta` — Socorro L67, Cortez L67, MagBay L67

**Used by each page (prefix-specific)**:
- Socorros: `socorro.title`, `.subtitle`, `.description1`, `.description2`, `.highlights`, `.h1`, `.h1d`, `.h2`, `.h2d`, `.h3`, `.h3d`, `.h4`, `.h4d`
- Cortez: same with `cortez.*`
- MagBay: same with `magbay.*`

**Used by DestinationsGrid**:
- `destinations.subtitle`, `destinations.title`, `destinations.explore`
- `destinations.socorro.title`, `.socorro.description`
- `destinations.magbay.title`, `.magbay.description`
- `destinations.cortez.title`, `.cortez.description`

**Used by Navigation (destinations dropdown)**:
- `nav.destinations`, `nav.socorro`, `nav.cortez`, `nav.magbay`

**Used by DestinationSection (home CTA)**:
- `destination.days`, `destination.title`, `destination.year`, `destination.price`, `destination.cta`
- Note: `destination.title` is hardcoded to "SEA OF CORTEZ" — not dynamic

**No existing keys for**: dive sites, dive site descriptions, marine fauna details, ecosystem info, seasonal info, water temperature, visibility, current conditions, conservation notes.

### Component Patterns

The 3 destination pages ARE the pattern — they are structurally identical:

```
<main>
  <Navigation />

  {/* Hero — full-screen image, gradient overlay */}
  <section> → Image (fill, object-cover), overlay div, text (hero label, title, subtitle)

  {/* Description — 2 paragraphs */}
  <section> → max-w-3xl, t(description1), t(description2)

  {/* Highlights — 4 cards in 2×2 grid */}
  <section> → section title, .map over ['h1'..'h4'] → Card with t(h) + t(hd)

  {/* CTA — primary color bar */}
  <section> → t(dest.bookNow), t(subtitle), Button→/contacto

  <Footer />
</main>
```

**No shared components exist for this pattern** — each page repeats the same structure. This is strong evidence for extracting a shared `DestinationPage` component.
