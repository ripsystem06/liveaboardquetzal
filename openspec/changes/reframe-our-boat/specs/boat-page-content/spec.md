# Boat Page Content Specification

## Purpose
Content contract for `/nuestro-barco`: 7-section structure, second-person voice, `boat.*` key coverage across EN/ES.

## Requirements

### Requirement: Section Order
The page SHALL render sections in fixed order: Hero → Your Floating Home → Deck Plans → Specs → Life Onboard → Gallery → CTA.

#### Scenario: Order preserved across locales
- GIVEN locale is `en` or `es`
- WHEN `/nuestro-barco` renders
- THEN all 7 sections appear in that order without omission

### Requirement: Second-Person Voice
Every narrative key (`hero`, `subtitle`, `storyText*`, `comfort.*Desc`, `gallery.title`, `gallery.subtitle`, `deck.subtitle`, `cta`) SHALL use "you"/"your" in EN and voseo in ES. Zero third-person self-referential phrasing ("the vessel designed for", "our boat") SHALL remain.

#### Scenario: EN = you/your, ES = voseo
- GIVEN any narrative key
- WHEN rendered in `en` → contains "you"/"your", no vessel-centric phrasing
- WHEN rendered in `es` → uses voseo (e.g., "despertás", "vas a explorar"), zero tú/usted

### Requirement: Your Floating Home Section
A new section SHALL render between Hero and Deck Plans using `boat.story` (heading) and `boat.storyText1`–`boat.storyText4` (four thematic paragraphs).

#### Scenario: Heading and 4 paragraphs render
- GIVEN the boat page is loaded
- WHEN Your Floating Home renders → heading = `boat.story`, paragraphs = `boat.storyText1`–`boat.storyText4`

### Requirement: Extracted Hardcoded Text
All hardcoded strings SHALL be replaced:

| Location | Key |
|---|---|
| Hero image alt | `boat.heroImageAlt` |
| Deck Plans heading | `boat.deck.title` |
| Deck Plans description | `boat.deck.subtitle` |
| Gallery alts (8 images) | `boat.gallery.altStateroom` + `boat.gallery.altInterior` |

#### Scenario: Zero hardcoded strings
- GIVEN the boat page source
- WHEN audited for plain strings in JSX headings, descriptions, or alt attributes
- THEN every user-facing string passes through `t()`

### Requirement: Life Onboard Reframe
The Comfort section SHALL be reframed: `boat.comfort.title` rewritten to second-person, all four `boat.comfort.{key}Desc` keys rewritten to "you"/"your" (EN) and voseo (ES).

### Requirement: Key Contract
All keys SHALL exist in EN and ES. Missing-key fallback SHALL render EN without runtime error.

| Section | Key Pattern |
|---|---|
| Hero | `hero`, `subtitle`, `heroImageAlt` |
| Your Floating Home | `story`, `storyText1`–`storyText4` |
| Deck Plans | `deck.title`, `deck.subtitle` |
| Specs (unchanged) | `specs.{title,length,lengthVal,beam,beamVal,guests,guestsVal,cabins,cabinsVal,speed,speedVal,compressor,compressorVal}` |
| Life Onboard | `comfort.{title,subtitle,dining,diningDesc,sunDeck,sunDeckDesc,cabin,cabinDesc,dive,diveDesc}` |
| Gallery | `gallery.{title,subtitle,staterooms,interior,altStateroom,altInterior}` |
| CTA | `cta`, `ctaButton`, `socialProof` |

#### Scenario: All keys produce non-empty content
- GIVEN locale is `en` or `es`
- WHEN the boat page renders completely
- THEN every key in the inventory produces non-empty text
