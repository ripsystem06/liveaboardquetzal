# Production Contact Details

## Objective
Correct every active customer-facing contact email and phone number in the production site to the values supplied by the user.

## Problem and rationale
The home page, contact page, footer, and legal notices currently show stale or inconsistent addresses/numbers, including placeholder phone values. Accurate contact information is urgent because customers rely on it to reach the business.

## Scope
- Set customer-facing contact email to `info@liveaboardquetzal.com`.
- Set customer-facing phone to `+52 1 646 146 1000`.
- Update active home/contact/footer/legal contact displays and any active shared contact data.
- Add focused regression coverage that asserts the exact values.
- Do not change unrelated addresses, transactional sender identities, site URLs, or user-owned booking/database work.
- Do not deploy or publish; this change only updates the repository working tree.

## Constraints
- Preserve all pre-existing user changes; do not revert or normalize unrelated files.
- The current branch is `main` and the working tree contains many unrelated user-owned modifications; limit writes to authorized contact surfaces and tests.
- Contact correction takes priority. Local booking visual design and demo-only login remain separate follow-up work; do not alter booking/auth in this task.

## Tasks
- [x] **CONTACT-1 — Correct customer-facing contact data** (delegated direct; broad mapping trigger fired because 4+ runtime surfaces; writer trigger fired because multiple files). Contact values and regression coverage are implemented, verified, committed, and pushed.
  - Acceptance: home/contact/footer/legal email displays match exactly; contact-page and legal phone displays match the supplied number; no stale contact emails or phone placeholders remain in active runtime contact content; unrelated transaction sender values and addresses are unchanged.
  - Checks: focused tests covering contact values and affected contact rendering; TypeScript check if supported by project scripts.

## Verification evidence
- Exploration: confirmed duplicate runtime emails `contact@quetzalliveaboard.com` and `info@quetzalliveaboard.com`, placeholder phone values, and existing stale shared contact metadata in `lib/contact.ts`.
- Focused tests: `pnpm exec vitest run lib/payment-config.test.ts components/contact-details.test.tsx` — contact-data-specific regression tests; the initial broader run `pnpm exec vitest run lib/payment-config.test.ts components/contact-form-section.test.tsx` passed 2 files/21 tests.
- TypeScript: `pnpm exec tsc --noEmit` — passed, exit 0.
- Independent verification confirmed exact values on contact surfaces and no stale runtime contact emails/phone placeholders; verification did not change git status.
- TDD mode: no explicit project/session setting was found; strict TDD evidence is not claimed.
- Work-unit commit: `7045255` (`fix(contact): update production contact details`), pushed to `origin/main`.
- No deployment or production release was performed; push updates the GitHub repository only.

## Progress
- CONTACT-1 complete. Verification passed and the contact-only work-unit commit is on `origin/main`.

## Next step
Keep unrelated working-tree changes separate; resume local booking visual design and demo-only login as follow-up work.
