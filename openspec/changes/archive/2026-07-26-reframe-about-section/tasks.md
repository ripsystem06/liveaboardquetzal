# Tasks: Reframe About Section — Customer-Centric Narrative

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~100 (content rewrites ~1:1 replacements, ~42 deletion lines, ~6 addition lines) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-always |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Translation Foundation

- [x] 1.1 Rewrite EN about keys (L331-366) — replace kept keys with customer-centric second-person copy, remove 17 obsolete keys, add `about.cta`, `about.ctaButton`, `about.socialProof`. File: `contexts/language-context.tsx`
- [x] 1.2 Rewrite ES about keys (L989-1024) — mirror all EN changes using informal second-person (te/tu/vos). Same file, same edit session.
- [x] 1.3 Verify: grep `about.mission|about.vision|about.philosophy|about.v4|about.v6` in the file returns zero hits. All kept+added keys resolve in both languages.

## Phase 2: Page Restructure

- [x] 2.1 Clean imports — remove `Shield`, `Users` from lucide-react import. File: `app/about/page.tsx`
- [x] 2.2 Remove Mission section (L60-70), Vision section (L72-82), Philosophy section (L104-115).
- [x] 2.3 Reduce values array from 6→4 — remove `{ icon: Shield, key: 'v4' }` and `{ icon: Users, key: 'v6' }`.
- [x] 2.4 Replace CTA keys: `t('collab.cta')` → `t('about.cta')`, `t('destination.cta')` → `t('about.ctaButton')`. Add `<p>{t('about.socialProof')}</p>` between CTA heading and button.

## Phase 3: Build & Verify

- [x] 3.1 Run `npm run build` — zero errors, zero warnings for about page.
- [x] 3.2 Run `npx tsc --noEmit` — clean output (only pre-existing test file errors unrelated to this change).
- [x] 3.3 Manual verify spec scenarios: 4 sections in order (no Mission/Vision/Philosophy headings), 4 value cards (Fish/Compass/Heart/Star), second-person voice in both languages, CTA invites booking not partnering, social proof visible, `/about/colaboraciones` unaffected with its own `collab.cta`.
