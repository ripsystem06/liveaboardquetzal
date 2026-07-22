# DestinationPage Specification

## Purpose

Shared `<DestinationPage>` component replacing 3 structurally identical `page.tsx` files (77 lines each, copy-pasted). Renders a unified destination layout: Hero → Description → Highlights → Dive Sites → Calendar → Gallery → Conservation → CTA.

## Requirements

### Requirement: Props Interface

The component SHALL accept a single `prefix` prop typed as the union `'socorro' | 'cortez' | 'magbay'` and MUST derive all content via `t(\`${prefix}.\${key}\`)` translation lookups.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `prefix` | `'socorro' \| 'cortez' \| 'magbay'` | Yes | Translation key prefix for all content |

#### Scenario: Render Socorro with prefix
- GIVEN a valid `prefix="socorro"`
- WHEN the component mounts
- THEN `t('socorro.title')` resolves to "Socorro Islands"
- AND `t('socorro.h1')` through `t('socorro.h6')` resolve highlight cards

#### Scenario: Invalid prefix fails at compile time
- GIVEN TypeScript strict mode
- WHEN a developer passes `prefix="nonsense"`
- THEN the build SHALL fail with a type error

### Requirement: Section Ordering and Layout

The component MUST render sections in fixed order: Hero → Description → Highlights → Dive Sites → Calendar → Gallery → Conservation → CTA. Navigation and Footer SHALL bracket the entire flow.

#### Scenario: Full section sequence renders
- GIVEN translation keys exist for all sections
- WHEN the component renders
- THEN section DOM order matches: Hero > Description > Highlights > Dive Sites > Calendar > Gallery > Conservation > CTA
- AND Navigation appears before Hero and Footer appears after CTA

### Requirement: Conditional Rendering

Sections without corresponding translation keys SHALL NOT render. The `t()` function returning the raw key (missing translation) SHALL suppress that section.

#### Scenario: Section suppressed when no translation keys exist
- GIVEN `prefix="magbay"` and `t('magbay.diveSites.title')` returns `'magbay.diveSites.title'` (missing key)
- WHEN the component renders
- THEN the Dive Sites section SHALL NOT appear in the DOM

#### Scenario: Partial section data yields partial render
- GIVEN calendar has Jan-Apr keys but missing Nov-Dec keys
- WHEN the component renders the Calendar section
- THEN only months with resolved translation keys SHALL display

### Requirement: Highlights Section Expands to 6+ Cards

The Highlights section MUST render at least 6 highlight cards per destination. Each card SHALL display a title and description via `t(\`${prefix}.h{N}\`)` and `t(\`${prefix}.h{N}d\`)` for N = 1 through at least 6. Cards SHALL be disabled (not rendered) when the translation key is missing, preserving backward compatibility with the current 4-card layout.

#### Scenario: Six cards render for Socorro
- GIVEN `prefix="socorro"` with all 6 highlight translation keys present (`h1`–`h6`)
- WHEN the component renders
- THEN 6 highlight cards SHALL appear in the Highlights section

#### Scenario: Fallback when only 4 cards exist
- GIVEN `prefix="magbay"` with only `h1`–`h4` and `h5d` missing
- WHEN the component renders
- THEN 4 cards SHALL render, and `h5`–`h6` SHALL NOT appear

### Requirement: Image Handling

The component MUST render a full-width hero image from `/{prefix}-destination.jpg` using Next.js `<Image>` with `priority`. Gallery images SHALL load from `public/images/panoramicas/` via translation-key-driven paths.

#### Scenario: Hero image renders
- GIVEN `prefix="socorro"`
- WHEN the Hero section renders
- THEN `<Image src="/socorro-destination.jpg" priority />` SHALL be present

#### Scenario: Gallery images render from panoramicas
- GIVEN `prefix="socorro"` and `t('socorro.gallery.images')` returns a JSON array of paths
- WHEN the Gallery section renders
- THEN each path SHALL render as `<Image src={path} />` within the Gallery section

### Requirement: Responsive Behavior

All sections MUST use responsive Tailwind utilities (`grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-3`) to adapt from mobile through tablet to desktop.

#### Scenario: Mobile single-column layout
- GIVEN viewport width < 768px
- WHEN rendering highlight cards
- THEN cards SHALL stack in a single column via `grid-cols-1`

#### Scenario: Desktop multi-column layout
- GIVEN viewport width >= 1024px
- WHEN rendering the Dive Sites section
- THEN zones SHALL display in a 3-column grid

### Requirement: Page Simplification

Each `page.tsx` SHALL reduce to approximately 10 lines: import `DestinationPage`, `<Navigation />`, and `<Footer />`, passing only the `prefix` prop.

#### Scenario: Socorro page after extraction
- GIVEN the `<DestinationPage>` component exists
- WHEN `app/destinos/islas-socorro/page.tsx` renders
- THEN it SHALL contain `<DestinationPage prefix="socorro" />`
- AND SHALL NOT contain inline JSX for Hero, Description, Highlights, or CTA sections
