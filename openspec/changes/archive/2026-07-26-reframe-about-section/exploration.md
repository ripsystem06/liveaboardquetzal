## Exploration: Reframe About Section from Corporate to Customer-Centric

**status**: success

### Executive Summary

The `/about` page is a classic "about us" corporate page — six content sections plus a CTA, dominated by self-referential narrative (Our Mission, Our Vision, Our Values, Our Philosophy). Only the Story section and the CTA speak to the reader's experience. The reframe will require rewriting or replacing most translation keys and possibly restructuring section layout. No tests or specs exist for this page.

---

### Current State

**File**: `app/about/page.tsx` (133 lines, `'use client'`)

The page follows a linear single-page layout with seven sections in this order:

| # | Section | Background | Layout | Keys Used |
|---|---------|------------|--------|------------|
| 1 | Hero | `bg-muted/30` | Centered text | `about.title`, `about.subtitle` |
| 2 | Story | `bg-background` | 2-col grid (text L, image R) | `about.story`, `about.storyText1`–`6` |
| 3 | Mission | `bg-primary text-primary-foreground` | Centered text | `about.mission`, `about.missionText`, `about.missionText2`, `about.missionText3` |
| 4 | Vision | `bg-muted/30` | Centered text | `about.vision`, `about.visionText`, `about.visionText2`, `about.visionText3` |
| 5 | Values | `bg-background` | 2-col card grid with icons | `about.values`, `about.v1`–`v6`, `about.v1d`–`v6d` |
| 6 | Philosophy | `bg-primary text-primary-foreground` | Centered text | `about.philosophy`, `about.philosophyText`, `about.philosophyText2`, `about.philosophyText3`, `about.philosophyText4` |
| 7 | CTA | `bg-muted/30` | Centered, Button → /contacto | `collab.cta`*, `destination.cta`* |

*\* These keys are NOT from the `about.*` namespace — they are repurposed from the Collaborations and Destinations namespaces respectively.*

---

### Translation Keys Inventory

**`contexts/language-context.tsx`** — total 29 unique `about.*` keys × 2 languages = 58 string entries.

| Key Group | Key Count | English Sample Line | Spanish Sample Line |
|-----------|-----------|--------------------|--------------------|
| `about.title` | 1 | "About Quetzal" | "Sobre Quetzal" |
| `about.subtitle` | 1 | "Passion for the ocean, commitment to excellence." | "Pasión por el océano, compromiso con la excelencia." |
| `about.story` | 1 | "Our Story" | "Nuestra Historia" |
| `about.storyText` | 6 | Personal narrative about family origins, small-group philosophy | Same, in Spanish |
| `about.mission` | 1 | "Our Mission" | "Nuestra Misión" |
| `about.missionText` | 3 | Company mission statements | Same, in Spanish |
| `about.vision` | 1 | "Our Vision" | "Nuestra Visión" |
| `about.visionText` | 3 | Company vision statements | Same, in Spanish |
| `about.values` | 1 | "Our Values" | "Nuestros Valores" |
| `about.v1`–`v6` | 6 | Value titles (e.g., "Respect for the Ocean") | Same, in Spanish |
| `about.v1d`–`v6d` | 6 | Value descriptions | Same, in Spanish |
| `about.philosophy` | 1 | "Our Philosophy" | "Nuestra Filosofía" |
| `about.philosophyText` | 4 | Philosophy statements | Same, in Spanish |

**Reused keys (not in about.* namespace)**:

| Key | English Value | Used Where |
|-----|---------------|------------|
| `collab.cta` | "Interested in partnering with us?" | About page CTA heading |
| `destination.cta` | "Ask Our Travel Expert" | About page CTA button, nuestro-barco CTA |

**Values icon mapping** (in `app/about/page.tsx`):

| Key | Icon (lucide-react) | English Title |
|-----|---------------------|---------------|
| `v1` | `Fish` | Respect for the Ocean |
| `v2` | `Compass` | Authentic Experiences |
| `v3` | `Heart` | Human Connection |
| `v4` | `Shield` | Safety and Professionalism |
| `v5` | `Star` | Personalized Service |
| `v6` | `Users` | Community and Connection |

---

### Section Classification

#### Corporate-Self-Referential (4 of 7 sections)

| Section | Self-Referential Markers |
|---------|------------------------|
| Mission | "Our mission is to...", "At Quetzal Expeditions, we believe..." |
| Vision | "Our vision is to become...", "We aim to build...", "As we expand..." |
| Values | "Our Values" as section title, six cards describing company values |
| Philosophy | "Our Philosophy", "At Quetzal Expeditions, we believe...", "Our goal is..." |

These four sections account for **18 of 29 translation keys** (62%) and represent the bulk of the copy that needs rewriting.

#### Customer-Facing (2 of 7 sections — only 1 purely so)

| Section | Nature | Notes |
|---------|--------|-------|
| Story | Mixed | Starts customer-facing ("the greatest adventures are experienced... as explorers") but shifts to self-referential midway ("We are a family-owned company...") |
| CTA | Customer-directed | Direct call to action BUT uses wrong-context keys |

The Hero section (section 1) is neutral — a title and subtitle that could fit either framing.

---

### Visual Structure & Patterns

- **Background alternation**: `bg-background` ↔ `bg-muted/30` ↔ `bg-primary` creates visual rhythm
- **Font hierarchy**: `font-serif` for headings, `font-sans` for body
- **No animations/framer-motion** on this page (unlike `components/destination-page.tsx` which has scroll-triggered animations)
- **Shared components**: `Navigation`, `Footer`, `Button` (shadcn/ui), `Link`, `Image`, lucide-react icons
- **Image**: Static reference to `/images/Interior/interior-07.webp` with alt "Quetzal Crew" — hardcoded, not CMS-driven
- **CTA is wrong**: The heading "Interested in partnering with us?" (`collab.cta`) makes no sense as an About page closer. The button text "Ask Our Travel Expert" (`destination.cta`) is at least action-oriented but not custom to the page.

---

### Translation System Architecture

- Single file: `contexts/language-context.tsx` (~1356 lines)
- Pattern: `const translations = { en: {...}, es: {...} }`
- Hook: `useLanguage()` returns `{ language, setLanguage, t }` via React Context
- `t(key)` is a simple key lookup — no interpolation, no pluralization, no nesting
- Adding/removing keys requires editing BOTH `en` and `es` blocks
- No type safety on translation keys (stringly-typed)

---

### Affected Areas

- `app/about/page.tsx` — component structure, section order, possibly new sections
- `contexts/language-context.tsx` — lines 331-366 (EN about block), lines 989-1024 (ES about block); plus possibly new key additions
- `app/about/colaboraciones/page.tsx` — NOT directly affected by this change, but shares `collab.cta` key; if we rename that key we need to check impact here

---

### Approaches

1. **Rewrite copy only** — Keep the same 7-section layout and structure. Replace ALL self-referential copy with "you"-centric language (e.g., "You'll experience...", "What you'll discover...", "Your journey...").
   - Pros: Lowest effort, no structural changes, minimal risk of layout breakage
   - Cons: The mission/vision/philosophy sections may feel forced even with rewritten copy; the structure itself communicates "corporate"
   - Effort: **Medium** (touches 18+ keys × 2 languages = 36+ string rewrites)

2. **Restructure + rewrite** — Remove corporate sections (Mission, Vision, Philosophy), keep Story + Values, add new customer-facing sections (e.g., "What You'll Experience", "Day in the Life", "Who This Is For").
   - Pros: Properly aligns structure with narrative frame, most impactful UX change
   - Cons: Higher effort, needs new components or layout, new translation keys, visual redesign
   - Effort: **Medium-High**

3. **Full redesign** — Merge the About page into the homepage story or split into dedicated experiential sub-pages.
   - Pros: Most aligned with "urgency to book" goal, could be part of broader marketing funnel
   - Cons: High effort, scope creep, changes navigation and IA
   - Effort: **High**

---

### Recommendation

**Approach 1 (Rewrite copy only)** as the starting point for this change. It delivers the core goal (customer-centric narrative) with the lowest risk. If the result feels compelling, ship it. If the structure still doesn't work, Approach 2 (restructure) can follow as a second change.

### Risks

- **CTA key reuse** — The About page currently uses `collab.cta` ("Interested in partnering with us?") which is jarring. We should either create dedicated `about.cta` / `about.ctaButton` keys or repurpose a more appropriate existing pair.
- **No test coverage** — Zero tests exist for the About page. Regressions from copy changes are unlikely but structural changes have no safety net.
- **Image alt text** — The image alt "Quetzal Crew" is hardcoded; if the framing changes, the alt text should too. Consider making it a translation key.
- **Language consistency** — Adding new keys to the middle of the translation object could disrupt line numbers for adjacent sections. Both EN and ES blocks need synchronized key additions.

### Test & Spec Status

| Artifact | Exists? |
|----------|---------|
| Page test (`__tests__/**/*about*`) | ❌ None |
| OpenSpec spec (`openspec/specs/`) | ❌ No specs at all |
| Integration test referencing about page | ❌ None |
| Snapshot test | ❌ None |

### Next Recommended

**propose** — proceed to create a proposal with the recommended copy-only rewrite approach, including new dedicated CTA keys.

### Artifacts

- `openspec/changes/reframe-about-section/exploration.md` — this file
- Engram: topic_key `sdd/reframe-about-section/explore`, observation #146

### Skill Resolution

none

### Risks Identified

- CTA key reuse (wrong context): `collab.cta` and `destination.cta` shared across pages
- No test coverage for About page
- Hardcoded image alt text
- Large translation blocks (29 keys × 2 languages) without type safety
