---
name: react-testing
description: "Trigger: React tests, Vitest, Testing Library, RTL, jest, component test, unit test, integration test. Apply React testing patterns with Vitest and Testing Library."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Apply this skill whenever writing, reviewing, or debugging tests for React components or Next.js pages. Use Vitest + React Testing Library as the default stack.

## Hard Rules

1. **Test behavior, not implementation.** Query by visible text (`getByRole`, `getByText`), ARIA labels, or accessible names. Never query by CSS class or `data-testid` unless there's no accessible alternative.
2. **`render` wraps providers.** Create a custom `render` that wraps components with all required providers (LanguageProvider, ThemeProvider, etc.). Use it in every test.
3. **Mock `next/image`** in all tests. Next.js Image component requires special mocking — use the asset for dynamic `mock` with `jest.fn()`.
4. **Mock `next/navigation`** when testing components that use `useRouter`, `usePathname`, or `useSearchParams`.
5. **Server Components are not directly testable.** Test Server Components through integration tests or export a testable Client Component.
6. **`userEvent` over `fireEvent`.** Use `@testing-library/user-event` for interactions — it simulates real user behavior (focus, type, click). Only use `fireEvent` when `userEvent` cannot handle the case.
7. **One assertion per concept, not per test.** Group related assertions in a single `it` block. Use `describe` blocks to organize by feature/concern.
8. **Async state: use `waitFor`**. Never use `setTimeout` or arbitrary delays. Always use `waitFor(() => ...)` or `findBy*` queries.
9. **Co-locate tests.** Test files go next to the component: `Component.tsx` → `Component.test.tsx`.

## Decision Gates

| Need | Pattern |
|------|---------|
| Simple component render | `render(<Comp />)` + `getByRole` assertions |
| Component with context | Custom `render` wrapping providers |
| User interaction | `userEvent.setup()` → `user.click()`, `user.type()` |
| Async data loading | `waitFor` or `findBy*` queries |
| Next.js routing | Mock `next/navigation` module |
| Next.js Image | Mock `next/image` to return `<img>` |
| Language/i18n | Wrap in `LanguageProvider` with desired `language` prop |
| API calls | Mock `fetch` or use MSW |

## Execution Steps

1. Set up Vitest + `@testing-library/react` + `@testing-library/user-event` if not present.
2. Create `test-utils.tsx` with custom `render` wrapping all providers.
3. Co-locate test file next to the component.
4. Write test: import custom `render`, render component, assert behavior.
5. For user interactions: use `userEvent`, assert visible changes.
6. For async: wrap assertions in `waitFor`.
7. Run `vitest run` to verify. Fix any failures before committing.

## Output Contract

- Tests query by accessible roles and text, not implementation details
- Custom `render` wraps all required providers
- All `next/*` modules properly mocked
- Async assertions use `waitFor` or `findBy*`
- All tests pass with `vitest run`