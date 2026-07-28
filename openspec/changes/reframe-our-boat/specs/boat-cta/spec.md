# Boat CTA Specification

## Purpose
Social-proof and booking CTA for `/nuestro-barco`, replacing destination-namespace keys with dedicated `boat.cta`, `boat.ctaButton`, `boat.socialProof`.

## Requirements

### Requirement: Heading from boat.cta
The CTA heading SHALL render from `boat.cta`, NOT `dest.bookNow`.

#### Scenario: Boat-specific heading
- GIVEN locale is `en`
- WHEN CTA section renders → heading = `boat.cta`

### Requirement: Button from boat.ctaButton → /contacto
The CTA button SHALL use `boat.ctaButton` and link to `/contacto`.

#### Scenario: Button label and link
- GIVEN locale is `es`
- WHEN CTA button renders → label = `boat.ctaButton`, `href` = `/contacto`

### Requirement: Social Proof
A `<p>` SHALL render `boat.socialProof` between the CTA heading and button.

#### Scenario: Social proof placement
- GIVEN locale is `en` or `es`
- WHEN CTA renders → `boat.socialProof` displays between heading and button

### Requirement: Missing-Key Fallback
If a CTA key is absent from the active locale map, the page SHALL render the EN fallback without error.

#### Scenario: ES fallback to EN
- GIVEN locale is `es` and `boat.cta` missing from ES map
- WHEN CTA renders → EN `boat.cta` displays, no runtime error, no blank section

### Requirement: No Destination-Key References
The boat page SHALL NOT reference `dest.bookNow` or `destination.cta`.

#### Scenario: Destination keys absent from boat CTA
- GIVEN the boat page renders
- WHEN CTA section is inspected → zero calls to `t('dest.bookNow')` or `t('destination.cta')`
