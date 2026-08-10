## Exploration: Reframe Destinations — Customer-Centric Narrative

**status**: success

### Executive Summary

All three destination pages (`islas-socorro`, `mar-de-cortes`, `bahia-magdalena`) are thin 15-line wrappers that delegate entirely to a single shared `DestinationPage` component with a `prefix` prop. The actual content lives in `contexts/language-context.tsx` (translation keys) and `components/destination-page.tsx` (layout + section structure). The current tone is third-person/encyclopedic — "The Revillagigedo Archipelago is..." — not second-person narrative. The reframe requires rewriting translations in the `socorro.*`, `cortez.*`, and `magbay.*` namespaces (EN + ES) to match the "you" voice of the completed About reframe, plus optionally adding a new "Your Day at Sea" section using content from `Dia_de_buceo.md` and water temperature data from `Informacion_del_area.md`.

---

### Current State

#### Destination Page Wrappers (3 files, ~15 lines each)

| File | Prefix | Component |
|------|--------|-----------|
| `app/destinos/islas-socorro/page.tsx` | `socorro` | `<DestinationPage prefix="socorro" />` |
| `app/destinos/mar-de-cortes/page.tsx` | `cortez` | `<DestinationPage prefix="cortez" />` |
| `app/destinos/bahia-magdalena/page.tsx` | `magbay` | `<DestinationPage prefix="magbay" />` |

All three use `'use client'` with `<Navigation />` + `<DestinationPage />` + `<Footer />` inside a snap-scroll `main`. These wrappers will NOT change significantly — the reframe work is in the shared component and translation keys.

#### Shared Component: `components/destination-page.tsx` (388 lines)

Section order and behavior:

| # | Section | Component | Background | Key Pattern |
|---|---------|-----------|------------|-------------|
| 1 | Hero | `HeroSection` | Unsplash image + gradient overlay | `{prefix}.title`, `{prefix}.subtitle` |
| 2 | Description | `DescriptionSection` | `bg-background` | `{prefix}.description1`, `{prefix}.description2` |
| 3 | Highlights | `HighlightsSection` | `bg-background` | `{prefix}.highlights`, `{prefix}.h1`–`h6`, `{prefix}.h1d`–`h6d` |
| 4 | Dive Sites | `DiveSitesSection` | Hero image + `bg-primary/80` | `{prefix}.diveSites.title`, `{prefix}.diveSites.{zone}.{site}.{name\|description\|fauna}` |
| 5 | Calendar | `CalendarSection` | `bg-muted/20` | `dest.calendar`, `{prefix}.calendar.{jan\|feb\|...}` |
| 6 | Gallery Intro | `GalleryIntro` | `bg-primary` | `{prefix}.subtitle` (reuse), `gallery.promise`, `gallery.scrollHint` |
| 7 | Gallery Images | `GalleryImages` | Per-image | `{prefix}.gallery.images` (JSON array) |
| 8 | Conservation | `ConservationSection` | `bg-primary/90` | `{prefix}.conservation.{unesco\|protectedArea\|designation}` |
| 9 | CTA | `CTASection` | `bg-background` | `dest.bookNow`, `{prefix}.subtitle` (reuse), `destination.cta` |

**Key implementation details**:
- Each section is a snap-scroll "slide" (`SnapSection` wrapper with `min-h-screen snap-start`)
- Sections conditionally render based on whether their translation keys exist (graceful fallback)
- Dive sites are organized in zones (grouped by geography) with fauna tags
- Calendar dynamically filters to months that have fauna data
- Gallery reads a JSON-encoded image array from a single translation key
- CTA uses shared `dest.*` and `destination.*` keys (not destination-specific)
- MagBay has `ZONES: []` — no dive site section renders for MagBay

#### Translation Keys per Destination

**Socorro** (prefix: `socorro`):
- 2 description keys (`description1`, `description2`)
- 6 highlights × 2 keys each = 12 keys
- 4 dive sites across 3 zones (El Boiler, The Canyon, Roca Partida, Cabo Pearce) × 3 keys each = 12 keys
- 10 calendar months
- 3 conservation keys
- 1 gallery JSON key
- **Total: ~42 unique keys × 2 languages = 84 string entries**

**Cortez** (prefix: `cortez`):
- 2 description keys
- 6 highlights × 2 = 12 keys
- 10 dive sites across 3 zones (Los Islotes, La Paz Bay, Swannee Reef, Salvatierra, El Corralito, El Bajo, Whale Island, San Francisquito, Las Ánimas, Cabo Pulmo) × 3 = 30 keys
- 4 calendar months
- 3 conservation keys
- 1 gallery JSON key
- **Total: ~54 unique keys × 2 languages = 108 string entries**

**MagBay** (prefix: `magbay`):
- 2 description keys
- 6 highlights × 2 = 12 keys
- 0 dive sites (zones array is empty)
- 7 calendar months
- 3 conservation keys
- 1 gallery JSON key
- **Total: ~31 unique keys × 2 languages = 62 string entries**

---

### Tone Analysis: Current vs. Target

#### Current Tone (Third-Person, Encyclopedia)

**Socorro description1** (EN):
> "The Revillagigedo Archipelago, known as the Socorro Islands, is a UNESCO World Heritage Site located 250 miles south of Cabo San Lucas. These volcanic islands rise from the deep ocean, creating a unique ecosystem that attracts some of the largest marine species on Earth."

**Socorro h1d** (EN):
> "Witness mantas with wingspans over 20 feet glide gracefully through crystal-clear waters, often approaching divers with gentle curiosity."

**Socorro dive site** (EN):
> "A submerged seamount rising from the ocean floor to about 50m — a renowned manta cleaning station where giants gather."

Pattern: Factual, third-person, informative but emotionally flat. "Witness" is imperative, not immersive.

#### Target Tone (Second-Person, Narrative — from About reframe)

**About storyText1** (ES):
> "Te despertás con el sonido del mar — el balanceo suave del barco, la sal en el aire, y la primera luz asomando en el horizonte."

**About storyText2** (ES):
> "Esto no es un tour. Es tu expedición. Desde el momento en que subís a bordo, cada ritmo del día gira alrededor de tu experiencia — tus inmersiones, tu ritmo, tu conexión con el océano."

**About storyText3** (ES):
> "Vas a explorar ecosistemas marinos remotos que pocas personas llegan a ver. Mantas gigantes que planean a tu lado en Socorro. Tiburones ballena en el Mar de Cortés."

Pattern: Personal, immersive, "you"-centric. The reader is the protagonist. Urgency through emotional connection.

---

### Content Gap Analysis

#### Missing from `Dia_de_buceo.md`

The dive day schedule file contains structured daily program information NOT present in any translation key:

| Content | Detail | Translation Key Needed? |
|---------|--------|------------------------|
| Boarding options (afternoon vs. morning) | Two boarding scenarios with time tables | Yes — new section |
| Day 0-1 navigation activities | Welcome briefing, safety instructions, meals, transit | Yes |
| Typical dive day program | 7:00 AM – 8:00 PM schedule: continental breakfast, dive 1, full breakfast, dive 2, lunch, dive 3, snack, dive 4 (if possible), dinner | Yes |
| Approach timing | Arrival at dive zone between 2:00–6:00 AM or PM depending on option | Yes |

This content is ideal for a "Your Day at Sea" narrative section — not a dry table, but an immersive description of what the reader will experience from wake-up to sunset.

#### Missing from `Informacion_del_area.md`

The Revillagigedo area info file contains data NOT fully present in current translations:

| Content | Current State | Gap |
|---------|--------------|-----|
| **Water temperatures** | Not in any translation key | Temperature data for Nov–May (21–29°C) across all areas. Ideal for calendar section enhancement. |
| **Area taglines** | Not present | "El reino de las mantas gigantes" (San Benedicto), "El corazón de Revillagigedo" (Isla Socorro), "El encuentro con el océano abierto" (Roca Partida) — narrative hooks |
| **Area introductions** | Partially covered by dive site descriptions | Each area has a narrative paragraph describing the overall experience |
| **Additional dive sites** | Not in translations | Las Cuevitas (San Benedicto), Punta Tosca, Roca O'Neal, Aquarium, Punta Blanca (Socorro Island) — 5 additional sites with narrative descriptions |
| **Species per area** | Partially covered by calendar | Per-area species lists (e.g., Galapagos sharks specifically at San Benedicto, bottlenose dolphins specifically at Isla Socorro) |

---

### Pattern Match: About Reframe → Destinations

The About reframe established this structure:

```
Hero → Story ("Your Journey Begins") → Values ("What You'll Experience") → CTA ("Ready to Write Your Own Ocean Story?")
```

**Key reframe decisions from About**:
1. **Removed**: Mission, Vision, Philosophy sections (4 of 7 sections eliminated)
2. **Repurposed**: Values with same card layout but content reframed as "What You'll Experience" (not "Our Values")
3. **Rewritten**: Story shifted from "Our Story" to "Your Journey Begins" — entirely "you"-centric
4. **New**: Dedicated `about.cta`, `about.ctaButton`, `about.socialProof` keys (replaced wrong-context `collab.cta` / `destination.cta`)
5. **Social proof added**: "+500 divers have lived this experience"

For destinations, the equivalent mapping is:

| About Pattern | Destination Equivalent | Current State |
|---------------|----------------------|---------------|
| Hero (title + subtitle) | Hero (title + subtitle + background image) | **Already works** — keep, maybe refresh subtitle tone |
| "Your Journey Begins" (narrative story) | Description section | **Needs reframe** — shift from encyclopedic to "you"-centric narrative |
| "What You'll Experience" (values cards) | Highlights section | **Structure stays** — rewrite content to second-person |
| *(no About equivalent)* | Dive Sites | **Structure stays** — rewrite descriptions to immersive narrative |
| *(no About equivalent)* | Calendar (wildlife timing) | **Structure stays** — content can become "What you'll see in [month]" |
| *(no About equivalent)* | Gallery (visual promise) | **Structure stays** — already customer-centric ("This is what awaits you") |
| *(no About equivalent)* | Conservation (UNESCO context) | **Structure stays** — adds credibility |
| CTA + social proof | CTA + social proof | **Needs enhancement** — add `{prefix}.cta`, `{prefix}.ctaButton`, `{prefix}.socialProof` keys |

**New section opportunity**: "Your Day at Sea" — a narrative section between Highlights and Dive Sites (or before Calendar) that describes the daily rhythm in immersive second-person voice, drawing from `Dia_de_buceo.md`.

---

### Content Inventory for Narrative Weaving

#### Socorro (Revillagigedo)

| Category | Raw Material |
|----------|-------------|
| **Species** | Giant oceanic mantas (6m+), hammerhead sharks (hundreds), humpback whales (Jan–Apr), bottlenose dolphins, whale sharks (Nov/Dec/May), false orcas (May), tiger sharks, silky sharks, Galapagos sharks, yellowfin tuna, amberjack, giant bait balls (May) |
| **Dive sites** | El Boiler (manta cleaning station), The Canyon (manta + whale songs), Roca Partida (open ocean pinnacle, 70-80m walls), Cabo Pearce (multi-species hotspot) |
| **Water temp** | 21–29°C depending on month (Nov–May data available) |
| **Seasons** | Jan–Apr: humpbacks + mantas + hammerheads. May: whale sharks + false orcas + bait balls. Jun–Jul: mantas + hammerheads + dolphins. Nov–Dec: whale sharks + mantas + hammerheads |
| **Conservation** | UNESCO World Heritage Site (2016), Revillagigedo National Park |
| **Additional .md sites** | Las Cuevitas, Punta Tosca (dolphin interactions), Roca O'Neal (volcanic pinnacle), Aquarium (reef fish diversity), Punta Blanca (sharks + pelagics) |

#### Cortez (Sea of Cortez)

| Category | Raw Material |
|----------|-------------|
| **Species** | 400+ sea lions at Los Islotes, whale sharks (La Paz Bay), mobula rays by the thousands (Jul–Oct), hammerhead sharks (hundreds at El Bajo), Cortez angelfish, giant jawfishes, nudibranchs, marlin, bull sharks, sea turtles |
| **Dive sites** | 10 sites across 3 zones: La Paz Bay (5 sites incl. wreck), Northern Islands (3 sites incl. El Bajo hammerhead drift), East Cape (2 sites incl. Cabo Pulmo) |
| **Water temp** | Not in .md file — data unavailable for Cortez |
| **Seasons** | Aug–Nov: whale sharks + hammerheads + mobula rays (peak Sep–Oct) + sea lions |
| **Conservation** | UNESCO World Heritage Site (2005), Islands and Protected Areas of the Gulf of California
| **Standout experiences** | Sea lion pups playing with divers (Sep+), mobula ray aggregations, Salvatierra wreck (80m, 20m depth), San Francisquito (calm sea lions, liveaboard-only access) |

#### MagBay (Magdalena Bay)

| Category | Raw Material |
|----------|-------------|
| **Species** | Gray whales + calves (Jan–Apr peak), striped marlin (Oct–Dec sardine run), seabirds, coyotes, osprey, desert foxes |
| **Experiences** | Close whale encounters (arm's reach), kayaking mangroves, desert wildlife, second half = Socorro diving |
| **Seasons** | Jan–Apr: gray whales. Oct–Dec: sardine run |
| **Conservation** | UNESCO Whale Sanctuary, Bahía Magdalena Protected Lagoon |
| **Special structure** | This is a combined 14-day trip (MagBay lagoon + Socorro diving). No specific dive sites listed. |

---

### Translation Key Requirements

#### Keys to REWRITE (same keys, new content)

These keys already exist and only need content reframing from third-person to second-person:

| Namespace | Keys to Reframe | Count (×2 langs) |
|-----------|----------------|------------------|
| `socorro.*` | `description1`, `description2`, `h1`–`h6`, `h1d`–`h6d`, all dive site `description` + `fauna` keys | ~28 keys × 2 = 56 rewrites |
| `cortez.*` | `description1`, `description2`, `h1`–`h6`, `h1d`–`h6d`, all dive site `description` + `fauna` keys | ~40 keys × 2 = 80 rewrites |
| `magbay.*` | `description1`, `description2`, `h1`–`h6`, `h1d`–`h6d` (no dive sites to rewrite) | ~14 keys × 2 = 28 rewrites |

**Tone shift formula** (examples):
- Before: "Witness mantas with wingspans over 20 feet glide gracefully..."
- After: "Vas a encontrarte cara a cara con mantas de más de 6 metros que planean a centímetros de vos..."

- Before: "A submerged seamount rising from the ocean floor to about 50m..."
- After: "Te sumergís en El Boiler, un monte submarino donde las mantas gigantes vienen a limpiarse..."

#### Keys to ADD (new content)

| New Key Pattern | Content | Needed For |
|----------------|---------|------------|
| `{prefix}.dayAtSea` | Section heading: "Your Day at Sea" / "Tu Día de Buceo" | All three destinations |
| `{prefix}.dayAtSea.intro` | Narrative intro to the daily schedule | All three |
| `{prefix}.dayAtSea.morning` | Morning routine narrative (wake-up, continental breakfast, dive 1) | All three |
| `{prefix}.dayAtSea.afternoon` | Afternoon narrative (lunch, dive 2-3, snack time) | All three |
| `{prefix}.dayAtSea.evening` | Evening narrative (dive 4, dinner, sunset on deck) | All three |
| `{prefix}.dayAtSea.note` | Note about weather-dependent flexibility | All three (or shared) |
| `{prefix}.cta` | Destination-specific CTA heading | All three |
| `{prefix}.ctaButton` | Destination-specific CTA button text | All three |
| `{prefix}.socialProof` | Social proof line | All three |
| `{prefix}.areas.sanBenedicto` | "El reino de las mantas gigantes" narrative | Socorro |
| `{prefix}.areas.socorroIsland` | "El corazón de Revillagigedo" narrative | Socorro |
| `{prefix}.areas.rocaPartida` | "El encuentro con el océano abierto" narrative | Socorro |
| `{prefix}.waterTemp.title` | Section title for water temperatures | Socorro (if added to component) |
| `{prefix}.waterTemp.{month}` | Monthly water temperature data | Socorro (Nov–May data exists) |

**Estimated new keys**: ~20–25 per destination × 2 languages = 40–50 new string entries.

#### Component Changes Required

| Change | Section | Effort |
|--------|---------|--------|
| **NEW: DayAtSeaSection** | Between Highlights and Dive Sites | Medium — new component function, new translation reads |
| **ENHANCE: CTASection** | Use destination-specific keys instead of shared ones | Low — trivial prop change |
| **ENHANCE: DiveSitesSection** | Add per-zone area introductions (from `Informacion_del_area.md` taglines) | Low-Medium — add heading + intro paragraph per zone group |
| **OPTIONAL: WaterTempSection** | After Calendar or before Dive Sites | Medium — new component, only applicable to Socorro (data available) |

**Component structure is already solid** — the reframe is 80% translation work, 20% component work.

---

### Affected Areas

| File | Impact | Nature of Change |
|------|--------|-----------------|
| `contexts/language-context.tsx` | **HIGH** | ~100 key rewrites + ~40-50 new keys in both EN and ES blocks (socorro/cortez/magbay sections). Largest file change. |
| `components/destination-page.tsx` | **MEDIUM** | New `DayAtSeaSection` component, enhanced `CTASection` to use destination-specific keys, possibly zone intros in `DiveSitesSection` |
| `app/destinos/islas-socorro/page.tsx` | **NONE** | Thin wrapper — no changes needed |
| `app/destinos/mar-de-cortes/page.tsx` | **NONE** | Thin wrapper — no changes needed |
| `app/destinos/bahia-magdalena/page.tsx` | **NONE** | Thin wrapper — no changes needed |
| `app/about/page.tsx` | **NONE** | Already reframed — no shared keys to worry about |
| Other pages using `destination.cta` key | **LOW** | Check if any other page reads `destination.cta` (used in About CTA button too; may need separate keys) |
| OpenSpec specs | **MEDIUM** | Existing `destination-content` spec in archive may need delta; or create new `reframe-destinations` spec |

---

### Comparison: What the About Reframe Taught Us

| Lesson | Application to Destinations |
|--------|---------------------------|
| **Dedicated CTA keys matter** | Create `{prefix}.cta`, `{prefix}.ctaButton`, `{prefix}.socialProof` instead of reusing `collab.cta` / `destination.cta` |
| **Remove corporate sections entirely** | Destinations don't have "Our Mission"-style sections to remove, but the third-person descriptions ARE the equivalent — rewrite, don't re-add |
| **Same structure, new voice** | Keep all 9 sections (Hero through CTA), add 1 new section (Day at Sea), rewrite ALL copy |
| **Social proof converts** | Add diver count or testimonial reference to CTA sections |
| **No tests, no safety net** | Zero tests exist for destination pages. Regressions from copy changes are unlikely but structural changes (new sections) have no coverage. Consider adding a basic render test. |
| **Both languages in lockstep** | Every key rewrite requires synchronized EN + ES updates. Never update one without the other. |

---

### Approaches

1. **Copy rewrite only** — Rewrite ALL `{prefix}.description*`, `{prefix}.h*`, `{prefix}.h*d`, and dive site descriptions in second-person narrative voice. No new sections, no new keys (except destination-specific CTAs). Keep the same 9-section layout.
   - **Pros**: Lowest risk, purely content work, no component changes, fastest delivery
   - **Cons**: Misses "Day at Sea" opportunity, dive schedule and water temps remain absent, less impactful than About reframe
   - **Effort**: **Medium** (~164 string rewrites across 6 translation blocks)

2. **Copy rewrite + Day at Sea** — Approach 1 PLUS a new narrative "Your Day at Sea" section (drawing from `Dia_de_buceo.md`), destination-specific CTA keys, and zone introductions in the Dive Sites section. One new component function in `destination-page.tsx`.
   - **Pros**: Delivers the full narrative arc, adds unique value beyond copy rewrite, matches About reframe depth, integrates reference files
   - **Cons**: Requires new component, new translation keys, more content to write
   - **Effort**: **Medium-High** (~164 rewrites + ~50 new keys + 1 new section component)

3. **Full restructuring** — Approach 2 PLUS water temperature integration, additional dive sites from `Informacion_del_area.md`, new gallery narrative text, possibly restructuring the snap-scroll order. Heavy component refactor.
   - **Pros**: Most comprehensive, fully leverages all reference material
   - **Cons**: Scope creep, delays delivery, risks layout breakage, no test coverage for complex restructuring
   - **Effort**: **High**

---

### Recommendation

**Approach 2: Copy rewrite + Day at Sea + Destination-specific CTAs.** This delivers the core narrative shift (second-person voice) while adding the most impactful missing content (dive schedule as immersive narrative). It mirrors the depth of the About reframe without over-engineering. The additional dive sites and water temperatures from `Informacion_del_area.md` can be a follow-up change or folded into Approach 2 if scope allows.

**Recommended section order** (post-reframe):
```
Hero → Description (reframed) → Highlights (reframed) → Your Day at Sea (NEW) → Dive Sites (enhanced with zone intros) → Calendar → Gallery → Conservation → CTA (enhanced with social proof)
```

### Risks

- **Large translation surface** — ~164 rewrites + ~50 new keys × 2 languages = ~430 string changes. Manual errors (typos, key mismatches, missing ES counterpart) are the primary risk.
- **No test coverage** — Zero tests exist for destination pages or the `DestinationPage` component. Any structural change (new section) has no regression safety net.
- **Key namespace collisions** — The `destination.cta` key is reused in the CTA section. Adding destination-specific CTA keys leaves stale shared keys — need to verify no other page depends on them in this context.
- **MagBay asymmetry** — MagBay has no dive sites (`ZONES: []`) and is a combined trip. The Day at Sea section must work without dive site context for MagBay. Content must reflect the two-phase nature (lagoon + archipelago).
- **`Informacion_del_area.md` is Socorro-only** — The area info file only covers Revillagigedo. Cortez and MagBay don't have equivalent .md content, so the "enhanced zone introductions" pattern only applies fully to Socorro.
- **Language consistency** — The About reframe uses Rioplatense Spanish (voseo: "te despertás", "vas a explorar", "sos"). Destination content must maintain this same voice in ES for consistency across pages.
- **No `Dia_de_buceo.md` for Cortez/MagBay** — The dive schedule reference file appears generic (applicable to all trips), but Cortez and MagBay may have different logistics (e.g., MagBay is combined, Cortez has coastal/shallow options). Verify before applying the same schedule narrative to all three.

### Test & Spec Status

| Artifact | Exists? |
|----------|---------|
| Page test (`__tests__/**/*destination*`) | ❌ None |
| Component test (`__tests__/**/*DestinationPage*`) | ❌ None |
| Integration test referencing destination pages | ❌ None |
| OpenSpec spec — destination content | ✅ Archived: `archive/2026-07-22-enrich-destination-content/` |
| OpenSpec spec — active | ❌ None currently active |

### Next Recommended

**propose** — Create a proposal for Approach 2 with scope boundaries and key inventory.

### Artifacts

- `openspec/changes/reframe-destinations/exploration.md` — this file
- Engram: topic_key `sdd/reframe-destinations/explore`

### Skill Resolution

None required — this is a content + component reframe using existing patterns (Next.js App Router, shadcn/ui, React Context for translations).
