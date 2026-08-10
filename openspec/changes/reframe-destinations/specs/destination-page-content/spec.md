# Destination Page Content Specification

Content contract for Socorro, Mar de Cortés, and Bahía Magdalena destination pages after the customer-centric narrative reframe. Defines section structure, translation key contracts, voice requirements, and conditional rendering rules.

## Requirements

### Requirement: Section Rendering Order

The `DestinationPage` component MUST render sections in this order: Hero → Description → Highlights → Day at Sea → Dive Sites → Water Temp → Calendar → Gallery → Conservation → CTA. Each section SHALL be a `SnapSection` with consistent scroll-snap behavior.

| Section | Component | Key Pattern |
|---------|-----------|-------------|
| 1. Hero | `HeroSection` | `{prefix}.title`, `.subtitle` |
| 2. Description | `DescriptionSection` | `{prefix}.description1`, `.description2` |
| 3. Highlights | `HighlightsSection` | `{prefix}.highlights`, `.h1`–`.h6`, `.h1d`–`.h6d` |
| 4. Day at Sea | `DayAtSeaSection` | `{prefix}.dayAtSea.*` |
| 5. Dive Sites | `DiveSitesSection` | `{prefix}.diveSites.*` |
| 6. Water Temp | `WaterTempSection` | `{prefix}.waterTemp.*` |
| 7. Calendar | `CalendarSection` | `{prefix}.calendar.{month}` |
| 8. Gallery | `GalleryIntro` + `GalleryImages` | `{prefix}.gallery.images` |
| 9. Conservation | `ConservationSection` | `{prefix}.conservation.*` |
| 10. CTA | `CTASection` | `{prefix}.cta`, `.ctaButton`, `.socialProof` |

#### Scenario: Socorro renders all 10 sections in order

- GIVEN prefix is `socorro` AND language is `en`
- WHEN `DestinationPage` mounts
- THEN sections render in order: Hero, Description, Highlights, Day at Sea, Dive Sites, Water Temp, Calendar, Gallery, Conservation, CTA
- AND no section is skipped due to missing keys

#### Scenario: Gallery renders as two consecutive snap sections

- GIVEN prefix has valid `gallery.images` JSON
- WHEN Gallery section renders
- THEN `GalleryIntro` snap section appears first with promise text and scroll hint
- AND each gallery image renders as a separate `SnapSection` with full-bleed image

---

### Requirement: Second-Person Narrative Voice

ALL destination copy in `socorro.*`, `cortez.*`, `magbay.*` MUST use second-person narrative. Zero third-person encyclopedic patterns SHALL remain in rendered output for both EN and ES languages. Spanish MUST use Rioplatense voseo ("te despertás", "vas a explorar").

#### Scenario: Description uses "you"-centric narrative

- GIVEN language is `en`
- WHEN Description section renders for any destination
- THEN text MUST NOT contain patterns like "The Revillagigedo Archipelago is..." or "Witness mantas..."
- AND text MUST contain second-person patterns like "You'll experience", "your dive", "you descend"

#### Scenario: Spanish uses Rioplatense voseo consistently

- GIVEN language is `es`
- WHEN any destination page renders
- THEN all Spanish copy MUST use voseo forms ("te encontrás", "vas a ver", "sos")
- AND no pattern uses tuteo ("te encuentras", "vas a ver", "eres")

---

### Requirement: Day at Sea Section

A new `DayAtSeaSection` MUST render between Highlights and Dive Sites. It SHALL read keys from `{prefix}.dayAtSea.*` namespace. Content MUST reflect the unified dive day schedule from `Dia_de_buceo.md`: wake-up, continental breakfast, 4 dives, meals, and weather flexibility note. The section SHALL present this as immersive second-person narrative, never a dry schedule table.

| Translation Key | Content |
|----------------|---------|
| `{prefix}.dayAtSea` | Section heading |
| `{prefix}.dayAtSea.intro` | Narrative intro |
| `{prefix}.dayAtSea.morning` | Wake-up + breakfast + dive 1 |
| `{prefix}.dayAtSea.afternoon` | Lunch + dives 2–3 + snack |
| `{prefix}.dayAtSea.evening` | Dive 4 + dinner + sunset |
| `{prefix}.dayAtSea.note` | Weather-dependent flexibility |

#### Scenario: Day at Sea renders for Socorro

- GIVEN prefix is `socorro` AND all `socorro.dayAtSea.*` keys exist
- WHEN `DayAtSeaSection` renders
- THEN heading displays "Your Day at Sea" (EN) or "Tu Día de Buceo" (ES)
- AND content covers morning continental breakfast + first dive, afternoon schedule, evening routine
- AND weather flexibility note appears at the bottom

#### Scenario: Day at Sea gracefully hides when keys are missing

- GIVEN `{prefix}.dayAtSea` key is absent
- WHEN `DayAtSeaSection` evaluates
- THEN the entire section SHALL return null without errors
- AND adjacent sections render without layout gaps

---

### Requirement: MagBay Day-in-Lagoon Asymmetry

Bahía Magdalena MUST use `magbay.dayInLagoon.*` keys instead of `dayAtSea.*`. The narrative SHALL use a two-phase structure: lagoon phase (gray whales, mangroves) followed by archipelago phase (Socorro diving). The `DiveSitesSection` MUST NOT render for MagBay since `ZONES: []` produces no dive site entries.

#### Scenario: MagBay renders Day-in-Lagoon narrative

- GIVEN prefix is `magbay`
- WHEN `DayAtSeaSection` evaluates
- THEN it reads `magbay.dayInLagoon.*` keys, NOT `magbay.dayAtSea.*`
- AND content describes lagoon + archipelago as two distinct phases

#### Scenario: MagBay hides Dive Sites section

- GIVEN prefix is `magbay` AND `ZONES[magbay]` is an empty array
- WHEN `DiveSitesSection` evaluates
- THEN section returns null
- AND Day at Sea section is immediately followed by Water Temp section with no visible gap

---

### Requirement: Water Temperature Section

A `WaterTempSection` SHALL render after Dive Sites and before Calendar. Socorro MUST render Nov–May data (21–29°C) from `socorro.waterTemp.*` keys. Cortez and MagBay SHALL have the component structure prepared but MUST render nothing when `{prefix}.waterTemp` keys are absent. The visual display MUST feel premium — not a raw data table.

| Key Pattern | Socorro | Cortez/MagBay |
|------------|---------|---------------|
| `{prefix}.waterTemp.title` | Present | Absent |
| `{prefix}.waterTemp.{month}` | Nov–May (7 months) | Absent |

#### Scenario: Socorro renders water temperature data

- GIVEN prefix is `socorro` AND `socorro.waterTemp.*` keys exist for Nov–May
- WHEN `WaterTempSection` renders
- THEN 7 months display with temperature ranges (e.g., "Nov 26–29°C")
- AND visual presentation uses styled cards or gradient display, not a raw `<table>`

#### Scenario: Cortez and MagBay gracefully hide water temperature

- GIVEN prefix is `cortez` AND `cortez.waterTemp` key does not exist
- WHEN `WaterTempSection` evaluates
- THEN section returns null
- AND Calendar renders immediately after Dive Sites without layout gaps

---

### Requirement: Per-Destination CTA with Social Proof

The `CTASection` MUST read `{prefix}.cta` (heading), `{prefix}.ctaButton` (button text), and `{prefix}.socialProof` (trust line below heading). The shared `dest.bookNow` and `destination.cta` keys SHALL remain unchanged — they continue powering the boat page and destination index respectively.

#### Scenario: Destination CTA uses per-destination keys

- GIVEN prefix is `cortez` AND `cortez.cta`, `cortez.ctaButton`, `cortez.socialProof` exist
- WHEN `CTASection` renders
- THEN heading uses `cortez.cta` value
- THEN button text uses `cortez.ctaButton` value
- THEN social proof line renders below heading from `cortez.socialProof`

#### Scenario: Shared keys preserved for other pages

- GIVEN the boat page (`nuestro-barco`) reads `dest.bookNow` and `destination.cta`
- WHEN destination pages use per-destination CTA keys
- THEN `dest.bookNow` and `destination.cta` values in `language-context.tsx` remain unchanged
- AND boat page CTA still renders correctly

---

### Requirement: Unique Narrative Hooks

Each destination MUST open with a distinct emotional hook in its Hero subtitle and Description: Socorro with giant mantas ("you'll drift face-to-face with oceanic mantas"), Cortez with sea lions ("playful sea lions greet you at Los Islotes"), MagBay with gray whales ("gentle gray whales and their calves swim within arm's reach").

#### Scenario: Each destination has a distinct opening hook

- GIVEN three destination pages are rendered side by side
- WHEN comparing Hero subtitle and Description1 text
- THEN Socorro hooks on mantas, Cortez on sea lions, MagBay on gray whales
- AND no two destinations share the same emotional opening hook

---

### Requirement: Dive Sites with Zone Introductions

Socorro's `DiveSitesSection` MUST include narrative zone introductions from `Informacion_del_area.md` before each zone group. Zone intros SHALL be keyed as `{prefix}.areas.{zone}`. Cortez MAY adopt this pattern but is not required for the initial delivery.

#### Scenario: Socorro renders zone introductions before each zone group

- GIVEN prefix is `socorro` AND `socorro.areas.sanBenedicto`, `.socorroIsland`, `.rocaPartida` exist
- WHEN `DiveSitesSection` renders San Benedicto zone
- THEN a narrative paragraph precedes the dive site cards for El Boiler and The Canyon
- AND Socorro Island zone intro precedes Cabo Pearce card
- AND Roca Partida zone intro precedes its lone dive site card

---

### Requirement: Translation Coverage

Every key in `socorro.*`, `cortez.*`, and `magbay.*` namespaces MUST exist in both `en` and `es` blocks. No key SHALL fall back to its raw key string in either language. New keys added by this change (`dayAtSea`, `dayInLagoon`, `cta`, `ctaButton`, `socialProof`, `areas`, `waterTemp`) MUST have both EN and ES values.

#### Scenario: All keys resolve in both languages

- GIVEN language is `en`
- WHEN any `t('socorro.*')`, `t('cortez.*')`, or `t('magbay.*')` is called
- THEN return value is a meaningful string, not the raw key
- AND the same holds when language is switched to `es`

#### Scenario: New keys exist in both EN and ES

- GIVEN `t('socorro.dayAtSea.morning')` is called with language `en`
- THEN it returns English narrative text
- WHEN language switches to `es`
- THEN it returns Spanish narrative text in Rioplatense voseo
- AND neither call returns the raw key string
