---
name: nextjs-react
description: "Trigger: Next.js, React, App Router, Server Components, RSC, next/image, next/link, metadata, SEO, React 19. Apply Next.js App Router patterns and constraints."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Apply this skill when working on a Next.js project using App Router (React 19+). Enforce on every file create, edit, or review touching pages, layouts, components, or config.

## Hard Rules

1. **Server Components by default.** Every file in `app/` is a Server Component unless it has `'use client'`. Only add `'use client'` when the component uses hooks (`useState`, `useEffect`, etc.), browser APIs, or event handlers.
2. **Data fetching belongs in Server Components.** Use `async` server components and `await` directly. Do NOT fetch data in `'use client'` components unless it's a dynamic client interaction (search, filters).
3. **`next/image` always.** Use `<Image>` over `<img>`. Set `width`/`height` or `fill` + `className="object-cover"`. For external hosts, add them to `next.config.mjs` `images.remotePatterns`.
4. **`next/link` for navigation.** Always use `<Link>` for internal routes. Never use `<a>` for internal navigation.
5. **Metadata API for SEO.** Use `export const metadata` (static) or `export async function generateMetadata()` (dynamic) in page/layout files. Never `<title>` or `<meta>` in JSX.
6. **Never use `images.unoptimized: true` in production.** If present, it's a dev shortcut — remove before deploy.
7. **Never use `typescript.ignoreBuildErrors: true` in production.** Fix the type errors instead.
8. **Colocation.** Page-specific components go in the same route folder. Shared components in `components/`. Utilities in `lib/`.

## Decision Gates

| Need | Pattern |
|------|---------|
| Client-side state, effects, event handlers | `'use client'` + hooks |
| Static page data, DB reads, API calls | Server Component with `async` |
| Dynamic route params | `generateStaticParams` + `params` prop |
| Client-side navigation with state | `<Link>` + `useSearchParams` |
| Form submission | Server Actions (`'use server'`) or API routes |
| Language/i18n context | `'use client'` provider wrapping layout children |
| Third-party browser-only library | Dynamic import with `ssr: false` |

## Execution Steps

1. Identify if the file is a Server Component or needs `'use client'`.
2. If Server Component: validate no hooks, no browser APIs, no event handlers.
3. If Client Component: ensure the provider is correctly placed in the layout tree.
4. For any `<img>` tag: replace with `<Image>` from `next/image`.
5. For any `<a href="/...">`: replace with `<Link href="/...">`.
6. For metadata: ensure `Metadata` export on page/layout, not JSX `<head>`.
7. Verify `next.config.mjs` has no production-breaking flags.

## Output Contract

- All components follow Server/Client boundary correctly
- No raw `<img>` or `<a>` for internal routes
- Metadata handled via Next.js API only
- `next.config.mjs` clean for production deployment