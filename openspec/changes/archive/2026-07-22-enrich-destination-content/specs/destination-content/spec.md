# DestinationContent Specification

## Purpose

Structured content definitions for the 3 destination pages: Socorro Islands (`socorro`), Sea of Cortez (`cortez`), and Bahía Magdalena + Socorro (`magbay`). Defines translation key conventions, zone-grouped dive sites, seasonal wildlife calendars, conservation metadata, and image gallery references.

## Requirements

### Requirement: Translation Key Convention for New Sections

New sections MUST follow the dotted prefix pattern: `{prefix}.{section}.{subkey}`. Unknown keys SHALL return the raw key string (no translation), triggering conditional suppress in the renderer.

| Section | Key pattern | Example |
|---------|-------------|---------|
| Dive Sites | `{prefix}.diveSites.{zone}.{site}.{field}` | `socorro.diveSites.sanBenedicto.boiler.name` |
| Calendar | `{prefix}.calendar.{month}` | `cortez.calendar.jan` |
| Conservation | `{prefix}.conservation.{field}` | `socorro.conservation.unesco` |
| Gallery | `{prefix}.gallery.{field}` | `magbay.gallery.images` |
| Highlights extended | `{prefix}.h{N}` and `{prefix}.h{N}d` for N=5,6 | `socorro.h5`, `socorro.h5d` |

#### Scenario: Dive site key resolves per zone
- GIVEN `prefix="socorro"` in English locale
- WHEN `t('socorro.diveSites.sanBenedicto.boiler.name')` is called
- THEN it SHALL return "The Boiler"

#### Scenario: Missing key returns raw string
- GIVEN `t('socorro.calendar.jun')` has no ES translation
- WHEN `t('socorro.calendar.jun')` is called in `es` locale
- THEN it SHALL return `'socorro.calendar.jun'`

### Requirement: Dive Sites by Zone

Each destination MUST define dive sites grouped under geographic zones. Socorro has 3 zones (San Benedicto, Roca Partida, Socorro Island). Cortez has 3 zones (La Paz Bay Area, Northern Islands, East Cape / Cabo Pulmo). Magbay SHALL omit its own dive sites section and reuse Socorro zones when applicable.

#### Scenario: Socorro zones render with sites
- GIVEN `prefix="socorro"`
- WHEN the Dive Sites section renders
- THEN 3 zone headings SHALL appear: San Benedicto, Roca Partida, Socorro Island
- AND San Benedicto SHALL list The Boiler and The Canyon with fauna per site

#### Scenario: Cortez zones render
- GIVEN `prefix="cortez"`
- WHEN the Dive Sites section renders
- THEN 3 zone headings SHALL appear: La Paz Bay Area, Northern Islands, East Cape / Cabo Pulmo
- AND La Paz Bay Area SHALL list Los Islotes, La Paz Bay, Swannee Reef, Salvatierra Wreck, El Corralito

#### Scenario: Magbay omits dive sites
- GIVEN `prefix="magbay"` and no `magbay.diveSites.*` translation keys exist
- WHEN the component renders
- THEN the Dive Sites section SHALL NOT render

### Requirement: Seasonal Wildlife Calendar

Each destination SHALL provide a month-to-fauna calendar. Only months with wildlife presence SHALL have translation entries. Socorro calendar MUST cover Jan-Jul, Nov-Dec (excludes Aug-Oct). Cortez calendar MUST cover Aug-Nov.

#### Scenario: Socorro calendar shows Jan
- GIVEN `prefix="socorro"` and `t('socorro.calendar.jan')` resolves
- WHEN the Calendar section renders
- THEN "January" SHALL display with fauna list: Humpback whales, mantas, hammerheads, dolphins

#### Scenario: Socorro calendar omits Aug
- GIVEN `prefix="socorro"` and `t('socorro.calendar.aug')` returns raw key (missing)
- WHEN the Calendar section renders
- THEN "August" SHALL NOT appear

#### Scenario: Calendar displays month with peak notation
- GIVEN `prefix="socorro"` and `t('socorro.calendar.feb')` resolves
- WHEN rendered
- THEN "February" SHALL indicate "(peak)" for humpback whales

### Requirement: Conservation Information

Each destination SHALL expose UNESCO designation, protected area name, and designation year via `{prefix}.conservation.{field}` keys. Fields: `unesco` (boolean or status string), `protectedArea`, `designation`.

#### Scenario: Socorro conservation renders
- GIVEN `prefix="socorro"`
- WHEN the Conservation section renders
- THEN it SHALL display: "UNESCO World Heritage Site, Revillagigedo Archipelago — designated 2016"

#### Scenario: Cortez conservation renders
- GIVEN `prefix="cortez"`
- WHEN the Conservation section renders
- THEN it SHALL display: "UNESCO World Heritage Site, Islands and Protected Areas of the Gulf of California — designated 2005"
- AND it SHALL include "Aquarium of the World — Jacques Cousteau"

### Requirement: Gallery Images

Each destination's gallery MUST source images from `public/images/panoramicas/` via a translation key containing a JSON array of relative paths. Missing images SHALL omit gracefully.

#### Scenario: Gallery renders existing panoramicas
- GIVEN `t('socorro.gallery.images')` returns `["/images/panoramicas/Isla Socorro.webp","/images/panoramicas/Manta el Boiler 1.webp","/images/panoramicas/Cabo Pearce .webp","/images/panoramicas/Clariones.webp","/images/panoramicas/Pargos Roca.webp","/images/panoramicas/Delfin Kike.webp"]`
- WHEN the Gallery section renders
- THEN 6 `<Image>` elements SHALL display, each at `width={400} height={300}` with `className="rounded-lg object-cover"`

#### Scenario: Missing image handled gracefully
- GIVEN a gallery path points to a non-existent file
- WHEN that `<Image>` attempts to load
- THEN it SHALL render the Next.js placeholder/error state without crashing the page

### Requirement: Combined Magbay + Socorro Content

The Magbay page SHALL cover both Bahía Magdalena (gray whales, mangrove channels, desert wildlife) AND Socorro diving in a single unified layout. Highlights SHALL span both regions.

#### Scenario: Magbay highlights span both regions
- GIVEN `prefix="magbay"`
- WHEN the Highlights section renders (6 cards)
- THEN cards SHALL cover: Gray Whale Encounters, Mangrove Channels, Socorro Diving, Desert Wildlife, Mexico Sardine Run, 14-Day Expedition

#### Scenario: Magbay calendar covers whale season
- GIVEN `prefix="magbay"` and `t('magbay.calendar.jan')` resolves
- WHEN rendered
- THEN "January–April" SHALL indicate gray whale season (peak)
- AND "October–December" SHALL indicate sardine run
