## Exploration: Reframe Our Boat — Customer-Centric Narrative

**status**: success

### Executive Summary

The `/nuestro-barco` page is a product showcase — six sections dominated by self-referential, third-person descriptions of the vessel. Four sections use translation keys (`boat.*` namespace, 29 keys × 2 languages), one major section ("Deck Plans") is completely hardcoded in English with Spanish image labels, and the CTA reuses destination page keys (`dest.bookNow`, `destination.cta`) instead of having boat-specific calls to action. The reframe requires rewriting all self-referential copy to second-person "you" voice, extracting hardcoded text into translation keys, and adding a dedicated CTA with social proof — mirroring the About reframe pattern.

---

### Current State

#### Page Structure: `app/nuestro-barco/page.tsx` (198 lines, `'use client'`)

| # | Section | Background | Layout | Keys / Text |
|---|---------|------------|--------|-------------|
| 1 | Hero | Image + `bg-primary/60` overlay | Centered text over full-bleed image | `t('boat.hero')`, `t('boat.subtitle')` |
| 2 | Deck Plans | `bg-background` | Centered header + 2×2 image grid | **HARDCODED** "Deck Plans" + "Explore the layout of our 120-foot vessel, designed for comfort and functionality at sea." + four Spanish labels |
| 3 | Specs | `bg-background` | Centered header + 6-column stat grid | `t('boat.specs.title')`, `t('boat.specs.{key})`, `t('boat.specs.{key}Val')` (6 specs × 2 keys each) |
| 4 | Comfort | `bg-muted/30` | Centered header + 2×2 icon card grid | `t('boat.comfort.title')`, `t('boat.comfort.subtitle')`, `t('boat.comfort.{key})`, `t('boat.comfort.{key}Desc')` (4 items × 2 keys each) |
| 5 | Gallery | `bg-background` | Centered header + 4-column image grid with hover overlays | `t('boat.gallery.title')`, `t('boat.gallery.subtitle')`, `t('boat.gallery.staterooms')`, `t('boat.gallery.interior')` |
| 6 | CTA | `bg-primary text-primary-foreground` | Centered heading + Button → /contacto | `t('dest.bookNow')`*, `t('destination.cta')`* |

*\* Reused from destination namespace — not boat-specific.*

**Specs icon mapping** (in `app/nuestro-barco/page.tsx`, lines 24-31):
| Key | Icon (lucide-react) |
|-----|---------------------|
| `length` | `Ship` |
| `guests` | `Bed` |
| `cabins` | `Bed` |
| `speed` | `ArrowRight` |
| `beam` | `ArrowRight` |
| `compressor` | `ArrowRight` |

**Comfort icon mapping** (lines 33-38):
| Key | Icon (lucide-react) |
|-----|---------------------|
| `dining` | `UtensilsCrossed` |
| `sunDeck` | `ThermometerSun` |
| `cabin` | `Bed` |
| `dive` | `Ship` |

**Gallery categories** (lines 11-22): 4 stateroom images + 4 interior images, all with hardcoded English `alt` text. Hover overlays show category labels via `boat.gallery.staterooms` / `boat.gallery.interior` keys.

---

### Translation Keys Inventory

**`contexts/language-context.tsx`** — total 29 unique `boat.*` keys × 2 languages = 58 string entries.

#### EN Keys (lines 132-157)

| Key | Current EN Value | Self-Ref? |
|-----|-----------------|-----------|
| `boat.hero` | "Meet the Quetzal" | ✓ (passive, about the boat) |
| `boat.subtitle` | "A classic luxury vessel designed for exploration, comfort, and unforgettable moments on the open sea." | ✓ ("vessel designed for…") |
| `boat.specs.title` | "Vessel Specifications" | ✓ ("Vessel" = technical/distanced) |
| `boat.specs.length` | "Length" | Neutral |
| `boat.specs.lengthVal` | "120 ft (36.5 m)" | Neutral (data) |
| `boat.specs.beam` | "Beam" | Neutral |
| `boat.specs.beamVal` | "24 ft (7.3 m)" | Neutral (data) |
| `boat.specs.guests` | "Guests" | Neutral |
| `boat.specs.guestsVal` | "Up to 20" | Neutral (data) |
| `boat.specs.cabins` | "Cabins" | Neutral |
| `boat.specs.cabinsVal` | "10 Private" | Neutral (data) |
| `boat.specs.speed` | "Cruising Speed" | Neutral |
| `boat.specs.speedVal` | "10 knots" | Neutral (data) |
| `boat.specs.compressor` | "Compressors" | Neutral |
| `boat.specs.compressorVal` | "2x Bauer" | Neutral (data) |
| `boat.comfort.title` | "Comfort Onboard" | Mildly self-ref (could be "Your Comfort") |
| `boat.comfort.subtitle` | "Every detail is designed so you can focus on what matters — the adventure." | **Actually decent** — uses "you" |
| `boat.comfort.dining` | "Gourmet Dining" | Neutral (feature name) |
| `boat.comfort.diningDesc` | "Freshly prepared meals with local seafood and international cuisine, paired with fine wines and cold beverages." | Third-person, no "you" |
| `boat.comfort.sunDeck` | "Sun Deck & Lounge" | Neutral (feature name) |
| `boat.comfort.sunDeckDesc` | "A spacious top deck with lounge chairs and shade areas, perfect for sunset cocktails between dives." | Third-person, no "you" |
| `boat.comfort.cabin` | "Private Cabins" | Neutral (feature name) |
| `boat.comfort.cabinDesc` | "Comfortable cabins with air conditioning, private bathrooms, and ample storage for your gear." | Mixed — ends with "your gear" |
| `boat.comfort.dive` | "Dive Platform" | Neutral (feature name) |
| `boat.comfort.diveDesc` | "A purpose-built dive deck with individual gear stations, camera rinse tanks, and warm showers." | Third-person, no "you" |
| `boat.gallery.title` | "Our Boat" | ✗ (but self-referential title for a gallery) |
| `boat.gallery.subtitle` | "Step aboard the Quetzal — a classic vessel designed for comfort, adventure, and unforgettable moments at sea." | Mixed — "Step aboard" is inviting but "vessel designed for…" is detached |
| `boat.gallery.staterooms` | "Staterooms" | Neutral (label) |
| `boat.gallery.interior` | "Interior" | Neutral (label) |

#### ES Keys (lines 826-851)

| Key | Current ES Value | Notes |
|-----|-----------------|-------|
| `boat.hero` | "Conoce el Quetzal" | Same passive framing as EN |
| `boat.subtitle` | "Una embarcación clásica de lujo diseñada para la exploración, la comodidad y los momentos inolvidables en alta mar." | Third-person |
| `boat.specs.title` | "Especificaciones del Barco" | Technical |
| `boat.specs.length`–`specs.compressorVal` | Functional labels | Same as EN, translated |
| `boat.comfort.title` | "Comodidad a Bordo" | Neutral |
| `boat.comfort.subtitle` | "Cada detalle está diseñado para que te enfoques en lo importante — la aventura." | **Already uses voseo!** "te enfoques" |
| `boat.comfort.diningDesc` | "Comidas recién preparadas con mariscos locales y cocina internacional, acompañadas de vinos finos y bebidas frías." | Third-person, no "vos" |
| `boat.comfort.sunDeckDesc` | "Una cubierta superior espaciosa con tumbonas y zonas con sombra, perfecta para cócteles al atardecer entre inmersiones." | Third-person |
| `boat.comfort.cabinDesc` | "Cabinas cómodas con aire acondicionado, baños privados y amplio espacio de almacenamiento para tu equipo." | Ends with "tu equipo" |
| `boat.comfort.diveDesc` | "Un área de buceo diseñada con estaciones individuales de equipo, tanques de enjuague para cámaras y duchas de agua caliente." | Third-person |
| `boat.gallery.title` | "Nuestro Bote" | Self-referential |

**Notable**: The ES comfort subtitle already uses voseo ("te enfoques"), but inconsistency — only this one key uses second person while the rest is third-person.

---

### Hardcoded Text (Not Using Translation Keys)

| Location | Text | Language Issue |
|----------|------|---------------|
| Hero `<Image>` alt (line 51) | `"Quetzal Liveaboard"` | English-only, hardcoded |
| Deck Plans `<h2>` (line 73) | `"Deck Plans"` | English hardcoded in page meant for Spanish audience (route is `/nuestro-barco`) |
| Deck Plans `<p>` (line 76) | `"Explore the layout of our 120-foot vessel, designed for comfort and functionality at sea."` | English hardcoded; also self-referential ("our") |
| Deck plan image labels (lines 82-85) | `'Vista de Perfil'`, `'Cubierta Principal'`, `'Cubierta Superior'`, `'Distribución de Fondo'` | Spanish labels hardcoded (not using translation keys) |
| Gallery `<Image>` alts (lines 13-21) | 8 hardcoded English alt texts | English-only, not translatable |
| CTA heading (line 185) | `t('dest.bookNow')` → renders "Book This Trip" / "Reservar Este Viaje" | Wrong context — this is a destination key, not boat-specific |
| CTA button (line 188) | `t('destination.cta')` → renders "Ask Our Travel Expert" / "Consulta con Nuestro Experto" | Wrong context — shared destination key |

---

### Tone Analysis

#### Self-Referential Percentage

| Section | Keys Used | Self-Referential Keys | % Self-Ref |
|---------|-----------|----------------------|------------|
| Hero | 2 | 2 ("Meet the Quetzal", "vessel designed for…") | 100% |
| Deck Plans | 0 (hardcoded) | 1 ("our 120-foot vessel") + title "Deck Plans" | 100% |
| Specs | 13 | 1 (title "Vessel Specifications") | ~8% |
| Comfort | 10 | 2–3 (title "Comfort Onboard", all descriptions are third-person except partial "your gear") | ~60% |
| Gallery | 4 | 1 (title "Our Boat"); subtitle is mixed | ~50% |
| CTA | 2 (reused) | 0 (but wrong context) | N/A |

**Overall**: ~40–50% of the page is self-referential or third-person detached. The Deck Plans section is the worst offender — 100% hardcoded English on a Spanish-route page.

#### Section Quality Assessment

| Section | Current Quality | Emotional Hook? | Keep/Reframe/Rewrite |
|---------|----------------|-----------------|---------------------|
| Hero | Functional but passive | None | **Rewrite** — make "you" the subject |
| Deck Plans | **Broken** — hardcoded EN on ES page, zero emotional hook, dry layout diagrams | None | **Complete rewrite** — transform into narrative "Your Space" walkthrough |
| Specs | Functional, factual | None (nor needed) | **Keep** — specs are specs. Maybe soften the title. |
| Comfort | Best section currently — ES subtitle already uses voseo. Structure is solid. | Partial | **Reframe** — rewrite all descriptions as second-person narrative |
| Gallery | Mixed — "Our Boat" title is self-ref, subtitle is inviting | Low | **Reframe** — new title, new subtitle, extract alt texts |
| CTA | Wrong context keys, no social proof | None | **Rewrite** — boat-specific CTA + social proof |

---

### Gap Analysis — What's Missing

| Missing Element | Impact | Reframe Pattern |
|----------------|--------|----------------|
| No narrative "story" section | Page is a catalog, not an experience. The boat page should make the reader FEEL what it's like to be on board. | Add "Your Floating Home" section — a narrative walkthrough before Deck Plans |
| No social proof | Every other reframed page has "+500 divers…" social proof. Boat page has none. | Add `boat.socialProof` key |
| No dedicated CTA | Reuses `dest.bookNow` ("Book This Trip") and `destination.cta` ("Ask Our Travel Expert") — both are destination-context keys. | Add `boat.cta`, `boat.ctaButton` keys |
| Deck Plans is a dead section | Technical diagrams with Spanish labels + English header/description = confusing UX. Zero emotional engagement. | Transform into "Explore Your Space" with narrative intro + deck plan images |
| No "you" voice anywhere | Unlike the About page (100% second-person) and Destinations (in progress), the boat page has zero "you" narrative | Inject second-person throughout hero, comfort, and gallery sections |
| Gallery alt texts hardcoded | 8 English alt texts not translatable, hurting accessibility and SEO for ES users | Extract to translation keys or a JSON array pattern (like destinations use) |
| Inconsistent voseo | Only one key (`boat.comfort.subtitle` ES) uses voseo — everything else is neutral/third-person | Standardize to Rioplatense voseo for ALL ES keys (matching About + Destinations) |

---

### Pattern Match: About Reframe → Boat Page

The About reframe established this structure:
```
Hero → Story ("Your Journey Begins") → Values ("What You'll Experience") → CTA ("Ready to Write Your Own Ocean Story?")
```

For the boat page, the equivalent mapping is:

| About Pattern | Boat Equivalent | Current State | Action |
|---------------|----------------|---------------|--------|
| Hero (title + subtitle) | Hero (full-bleed image + text overlay) | Passive, self-ref | **Rewrite** both keys |
| "Your Journey Begins" (narrative story) | *(missing)* | No narrative section exists | **Add** — "Your Floating Home" or similar, placed after Hero, before Deck Plans |
| "What You'll Experience" (values cards) | **Comfort section** (icon cards: dining, sun deck, cabins, dive platform) | Structure solid, copy needs reframe | **Reframe** all titles + descriptions to second-person |
| *(no About equivalent)* | **Deck Plans** (deck layout images) | Hardcoded, dry | **Rewrite** — transform into "Explore Your Space" with narrative intro + plan images |
| *(no About equivalent)* | **Specs** (stat grid) | Functional, factual | **Keep** — soften title if needed |
| *(no About equivalent)* | **Gallery** (photo grid) | Mixed tone | **Reframe** — new title, rewrite subtitle, extract alt texts |
| CTA + social proof | CTA + social proof | Wrong keys, no social proof | **Add** dedicated `boat.cta`, `boat.ctaButton`, `boat.socialProof` |

**Key insight**: The boat page is structurally close to being customer-centric — it's the COPY that's the problem, not the layout. The main structural change needed is:
1. Adding a narrative section between Hero and Deck Plans
2. Extracting hardcoded Deck Plans text into translation keys
3. Fixing the CTA keys

---

### Translation Key Requirements

#### Keys to REWRITE (same keys, new content)

| Key | EN Before | EN After (Tone Direction) |
|-----|-----------|--------------------------|
| `boat.hero` | "Meet the Quetzal" | "Your Floating Home Awaits" — makes "you" the subject |
| `boat.subtitle` | "A classic luxury vessel designed for…" | "For the next 8 days, this is your world — your deck for sunrise coffee, your cabin for deep sleep after epic dives, your dining table for stories that get better with every meal." |
| `boat.comfort.title` | "Comfort Onboard" | "Life Onboard" or "Your Space at Sea" |
| `boat.comfort.subtitle` | (keep — already decent) | Minor polish if needed |
| `boat.comfort.diningDesc` | "Freshly prepared meals…" | "You'll wake up to the smell of fresh coffee and pan dulce. Lunch is ceviche on deck while you swap dive stories. Dinner is a three-course affair under the stars…" |
| `boat.comfort.sunDeckDesc` | "A spacious top deck…" | "Between dives, this is your sanctuary. Stretch out on a lounge chair, cold drink in hand, watching the Pacific stretch to every horizon…" |
| `boat.comfort.cabinDesc` | "Comfortable cabins…" | "After four dives, your cabin feels like a five-star hotel. Air conditioning, a hot shower, and a bed that pulls you under…" |
| `boat.comfort.diveDesc` | "A purpose-built dive deck…" | "Your dive station is ready before you are. Individual gear racks, camera rinse tanks, warm freshwater showers — everything exactly where you need it…" |
| `boat.gallery.title` | "Our Boat" | "Your Home at Sea" |
| `boat.gallery.subtitle` | "Step aboard the Quetzal…" | "Every corner of the Quetzal exists for one reason: so you can focus on the dive, the moment, and the memory." |

**Count**: ~12 keys to rewrite (hero, subtitle, comfort title + 4 descriptions, gallery title + subtitle + potentially staterooms/interior labels). Specs keys (13) stay as-is or get minor polish.

#### Keys to ADD (new content)

| New Key | Purpose |
|---------|---------|
| `boat.story` | New narrative section heading: "Your Floating Home" / "Tu Hogar Flotante" |
| `boat.storyText1`–`boat.storyText4` | Narrative paragraphs walking the reader through the boat experience (waking up, the rhythm of the day, the crew, the feeling of belonging) |
| `boat.deck.title` | Deck Plans section heading: "Explore Your Space" / "Explorá Tu Espacio" |
| `boat.deck.subtitle` | Deck Plans intro paragraph (replaces hardcoded EN text) |
| `boat.deck.plan1`–`boat.deck.plan4` | Image labels for the 4 deck plan diagrams (replaces hardcoded Spanish labels) |
| `boat.gallery.alt1`–`boat.gallery.alt8` | Translatable alt texts for gallery images (replaces hardcoded EN alts) |
| `boat.cta` | CTA heading: "Ready to Come Aboard?" / "¿Listo para Subir a Bordo?" |
| `boat.ctaButton` | CTA button: "Plan Your Expedition" / "Planificá Tu Expedición" |
| `boat.socialProof` | Social proof: "+500 divers have called the Quetzal home" / "+500 buzos han llamado hogar al Quetzal" |
| `boat.heroImageAlt` | Hero image alt text (replaces hardcoded "Quetzal Liveaboard") |

**Count**: ~24 new keys × 2 languages = 48 new string entries.

---

### Proposed Section Restructure

**Current order**:
```
Hero → Deck Plans → Specs → Comfort → Gallery → CTA
```

**Proposed order** (post-reframe):
```
Hero → Your Floating Home (NEW narrative) → Explore Your Space (reframed Deck Plans) → Specs → Life Onboard (reframed Comfort) → Gallery → CTA (boat-specific + social proof)
```

**Rationale**:
1. **Hero**: Sets the emotional hook — "this is YOUR boat for the next week"
2. **Your Floating Home**: Narrative section that paints the full sensory experience of living aboard. This bridges the gap between "here's a picture of a boat" and "here's what it FEELS like to be there."
3. **Explore Your Space**: The deck plans, but with a narrative intro that frames them as "your domain" rather than technical diagrams
4. **Specs**: Quick-hit factual data. Keep it after the emotional sections — once the reader is invested, the numbers add credibility.
5. **Life Onboard**: The comfort cards — already the strongest section, just needs copy reframe
6. **Gallery**: Visual proof — "this is what your days will look like"
7. **CTA**: Strong close with social proof

---

### Affected Areas

| File | Impact | Nature of Change |
|------|--------|-----------------|
| `app/nuestro-barco/page.tsx` | **MEDIUM-HIGH** | Add new narrative section component, extract hardcoded strings to translation keys, fix CTA key references, add social proof line |
| `contexts/language-context.tsx` | **HIGH** | ~12 key rewrites + ~24 new keys in both EN and ES blocks (`boat.*` namespace). Largest file change. |
| `app/about/page.tsx` | **NONE** | Already reframed — no shared keys with boat page |
| `app/destinos/**/page.tsx` | **LOW** | Check if any destination page depends on `dest.bookNow` or `destination.cta` (verifying the keys we're moving away from aren't orphaned) |
| OpenSpec specs | **MEDIUM** | May need delta to `about-page-content/spec.md` or a new spec; coordinate with reframe-destinations change |

---

### Approaches

1. **Copy rewrite only** — Rewrite ALL self-referential `boat.*` copy to second-person. Fix Deck Plans by extracting text into translation keys (no new narrative section). Add boat-specific CTA keys. Keep 6-section order.
   - **Pros**: Lowest risk, no new components, fastest delivery, fixes the hardcoded English problem
   - **Cons**: No narrative story section — page remains a catalog, just better written. Less impactful than About reframe.
   - **Effort**: **Medium** (~12 rewrites + ~16 new keys × 2 languages = ~56 string changes. Minor component edits.)

2. **Add narrative section + rewrite** — Approach 1 PLUS a new "Your Floating Home" narrative section (4 paragraphs) between Hero and Deck Plans. Transform Deck Plans into "Explore Your Space" with narrative intro. Add social proof.
   - **Pros**: Delivers the full narrative arc, matches About reframe depth, transforms the most broken section (Deck Plans), boat-specific CTA with social proof
   - **Cons**: New component code, more translation keys to write, slightly higher risk of layout issues
   - **Effort**: **Medium-High** (~12 rewrites + ~24 new keys × 2 languages = ~72 string changes. New section component. Deck Plans restructure.)

3. **Full interactive reframe** — Approach 2 PLUS interactive deck plan (clickable zones), virtual tour integration, embedded video, dynamic gallery with lightbox.
   - **Pros**: Most immersive experience, could be a marketing differentiator
   - **Cons**: Massive scope creep, requires new dependencies (lightbox, video hosting), far beyond the "copy reframe" goal
   - **Effort**: **High**

---

### Recommendation

**Approach 2: Add narrative section + rewrite + boat-specific CTA.** This mirrors the depth of the About reframe (which also added a narrative section + dedicated CTA keys). The boat page gets:
- A story section that makes the reader imagine themselves on board
- Deck Plans transformed from dry diagrams to "your space" context
- All comfort descriptions rewritten in "you" voice with Rioplatense voseo for ES
- Dedicated CTA with social proof (no more wrong-context keys)

The Deck Plans hardcoded English is the most urgent bug fix — a Spanish-route page with English content is broken UX. Approach 2 fixes this while delivering the narrative reframe.

---

### Risks

- **Deck plan image labels language policy** — The current hardcoded labels ('Vista de Perfil', etc.) are Spanish because the diagrams themselves contain Spanish text. Moving to translation keys means they'll be in English when the language is EN. Is this desired, or should diagram labels stay in Spanish regardless of UI language? **Needs product decision.**
- **No test coverage** — Zero tests exist for the boat page. Any structural change has no regression safety net. Adding a basic render test is recommended as part of this change.
- **CTA key migration** — The boat page currently reuses `dest.bookNow` and `destination.cta`. Once we create `boat.cta` / `boat.ctaButton`, we should verify those shared keys still have valid consumers elsewhere (they're destination keys — they should still be fine).
- **Gallery alt text extraction** — 8 hardcoded alt texts need extraction. The destinations pattern uses JSON arrays in translation keys for galleries — the boat page currently uses a hardcoded TypeScript array. Both approaches work; JSON in translation keys is more i18n-friendly.
- **Language consistency** — The reframed About page uses Rioplatense Spanish (voseo: "te despertás", "vas a explorar", "sos"). All new ES boat keys MUST maintain this voice for consistency. The comfort ES subtitle already uses voseo — standardizing is natural.
- **Section count grows** — Adding a narrative section increases the page from 6 to 7 sections. This is a longer scroll but follows the About page pattern (which is 3 sections + CTA). The narrative section should be concise — 4 paragraphs max.

---

### Test & Spec Status

| Artifact | Exists? |
|----------|---------|
| Page test (`__tests__/**/*nuestro-barco*` or `*boat*`) | ❌ None |
| Component test for boat page | ❌ None |
| OpenSpec spec — about-page-content | ✅ `openspec/specs/about-page-content/spec.md` |
| OpenSpec spec — boat | ❌ None |
| Existing reframe change in progress | ✅ `reframe-destinations` (active) |

---

### Next Recommended

**propose** — Create a proposal for Approach 2 with the deck plan language policy decision as a blocking question.

---

### Artifacts

- `openspec/changes/reframe-our-boat/exploration.md` — this file
- Engram: topic_key `sdd/reframe-our-boat/explore`

### Skill Resolution

None required — this is a content + component reframe using existing patterns (Next.js App Router, shadcn/ui, React Context for translations).
