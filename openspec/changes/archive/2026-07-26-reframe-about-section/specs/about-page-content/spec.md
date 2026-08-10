# about-page-content Specification

## Purpose

Content contract for About page: sections, keys, voice, CTA, social proof.

## Requirements

### Req: Section Structure

Page MUST render Hero, Story, Values, CTA in order. Mission, Vision, Philosophy MUST NOT render.

| # | Section | Purpose |
|---|---------|---------|
| 1 | Hero | Title + customer-centric subtitle |
| 2 | Story | 2-col. Second-person narrative, 6 paragraphs. |
| 3 | Values | 2×2 grid of 4 guest-benefit cards |
| 4 | CTA | Booking heading + social proof + button → /contacto |

#### Scenario: Correct sections

- GIVEN user navigates to /about
- WHEN page loads
- THEN Hero, Story, Values, CTA render in order
- AND no heading reads "Our Mission", "Our Vision", or "Our Philosophy"

### Req: Customer-Centric Voice

Copy MUST address reader as protagonist. EN: second-person ("you", "your"). ES: second-person informal ("te", "tu", "vos").

Prohibited: "We believe", "Our mission", "At Quetzal", "Creemos que", "Nuestra misión". Required: "You wake to", "Your journey", "Te despertás con", "Tu viaje".

#### Scenario: Story speaks to reader

- GIVEN page renders in EN
- WHEN user reads Story
- THEN paragraphs center on reader ("You wake to...")
- AND ES uses informal second-person ("Te despertás con...")

#### Scenario: Values frame guest benefits

- GIVEN Values section renders
- WHEN user reads any card description
- THEN text describes guest gain, not company action
- AND no card opens with "We believe" in either language

### Req: Values — Four Cards

Values grid MUST render 4 cards. Removed (Shield/v4, Users/v6) MUST NOT render.

| Key | Icon | Guest Benefit |
|-----|------|---------------|
| `about.v1` | Fish | Guest experiences ocean respect firsthand |
| `about.v2` | Compass | Authentic exploration for guest's trip |
| `about.v3` | Heart | Personal connection onboard |
| `about.v5` | Star | Small-group service for guest |

#### Scenario: Four cards

- GIVEN page loads
- WHEN user views Values
- THEN 4 cards: Fish, Compass, Heart, Star
- AND no card references Safety or Community

### Req: Dedicated CTA Keys

CTA MUST use `about.cta` and `about.ctaButton`. MUST NOT reuse `collab.cta` or `destination.cta`.

#### Scenario: Booking CTA

- GIVEN CTA section renders
- WHEN user reads heading
- THEN heading invites booking, not partnering
- AND button text is contact-oriented

#### Scenario: Collaboraciones unaffected

- GIVEN user navigates to /about/colaboraciones
- WHEN page loads
- THEN `collab.cta` and `collab.ctaButton` remain unchanged

### Req: Social Proof

Translation key `about.socialProof` MUST render between CTA heading and button: "+500 divers have lived this experience" (EN), "+500 buzos han vivido esta experiencia" (ES).

#### Scenario: Social proof visible

- GIVEN CTA section renders
- WHEN page loads
- THEN "+500" numeric claim appears after heading, before button

### Req: Translation Key Inventory

| Status | Keys |
|--------|------|
| **Kept (rewritten)** | `about.title`, `about.subtitle`, `about.story`, `about.storyText1`–`6`, `about.values`, `about.v1`, `about.v1d`, `about.v2`, `about.v2d`, `about.v3`, `about.v3d`, `about.v5`, `about.v5d` |
| **Added** | `about.cta`, `about.ctaButton`, `about.socialProof` |
| **Removed** | `about.mission` + 3 texts, `about.vision` + 3 texts, `about.philosophy` + 4 texts, `about.v4` + desc, `about.v6` + desc (17 keys) |

Kept and added keys MUST have EN and ES translations edited synchronously.

#### Scenario: No missing-key fallbacks

- GIVEN page renders in EN or ES
- WHEN `t(key)` calls resolve
- THEN zero keys return `undefined` or fallback
- AND language switch updates all content

#### Scenario: Removed keys unreferenced

- GIVEN page renders
- WHEN About component tree executes
- THEN no `t()` call references any Removed key

### Req: Image Alt Text

Story `<Image>` MUST retain hardcoded `alt="Quetzal Crew"`.

#### Scenario: Alt unchanged

- GIVEN page renders
- WHEN user inspects Story image
- THEN `alt` equals "Quetzal Crew"
