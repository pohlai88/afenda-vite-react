# Marketing Feature

This directory owns the public marketing route tree for `apps/web`.

It is separate from:

- authenticated ERP UI under `src/app`
- auth routes and auth-specific shells

## Current Boundary

Use these files as the current contract:

- [docs/MARKETING_FRONTEND_CONTRACT.md](../../../../docs/MARKETING_FRONTEND_CONTRACT.md)
- [docs/marketing/FLAGSHIP_SECTION_MATRIX.md](../../../../docs/marketing/FLAGSHIP_SECTION_MATRIX.md)
- [docs/decisions/ADR-0006-marketing-feature-topology.md](../../../../docs/decisions/ADR-0006-marketing-feature-topology.md)

The contract is:

- shared marketing code stays structural
- page files own composition
- page-local content stays near the page
- homepage strategy is controlled by [`marketing.config.ts`](./marketing.config.ts)

## Active Topology

```text
marketing/
├── marketing.config.ts
├── marketing-configured-home.tsx
├── marketing-layout.tsx
├── marketing-loading-fallback.tsx
├── marketing-page-registry.ts
├── marketing-random-home.tsx
├── marketing-routes.tsx
├── marketing-theme-provider.tsx
├── marketing.css
├── components/
├── pages/
└── __tests__/
```

## Shared Marketing Surface

The approved shared marketing primitives live under `components/`:

- `MarketingPageShell`
- `MarketingPageScaffold`
- `MarketingPageSection`
- `MarketingSectionHeading`
- `MarketingSectionKicker`
- reveal helpers in `marketing-reveal.ts`

`MarketingPageScaffold` is structural only: it enforces `hero -> sections -> footer`
ordering without deciding route-specific art direction.

Do not add new shared wrappers unless they satisfy the reuse and ownership rules
in the contract document.

## Page Domains

Marketing pages are grouped by business domain:

- `landing`
- `product`
- `company`
- `legal`
- `campaigns`
- `regional`

## Route Ownership

- [`marketing-page-registry.ts`](./marketing-page-registry.ts) is the registry for slugs, page loaders, and routable marketing pages.
- [`marketing-routes.tsx`](./marketing-routes.tsx) mounts the public route tree.
- [`marketing-configured-home.tsx`](./marketing-configured-home.tsx) decides whether the home route resolves to flagship or random mode.

## Notes

- The numeric landing files under `pages/landing/` are active editorial variants registered in `marketing-page-registry.ts`.
- The canonical flagship lives under `pages/landing/flagship/`.
- Legacy `_components/`, flat page files, and in-source `prompt/` notes are retired and must not be reintroduced.
- Marketing docs or plans should live under repo `docs/`, not inside this source tree, unless they are directly required by runtime or tests.

## Governance and quality bar

- **Section contract:** [`docs/marketing/FLAGSHIP_SECTION_MATRIX.md`](../../../docs/marketing/FLAGSHIP_SECTION_MATRIX.md) defines the canonical flagship section order and intensity; the composer in `pages/landing/flagship/flagship-page.tsx` tracks it in file comments.
- **Front-end contract:** [`docs/MARKETING_FRONTEND_CONTRACT.md`](../../../docs/MARKETING_FRONTEND_CONTRACT.md) limits shared wrappers; prefer `marketing/components` primitives and page-owned composition.
- **Accessibility:** Target WCAG 2.2 Level AA patterns (meaningful headings in source order, skip link via `MarketingPageShell`, `prefers-reduced-motion` honored in flagship motion helpers). Baseline checks in [`docs/marketing/FLAGSHIP_BASELINE.md`](../../../docs/marketing/FLAGSHIP_BASELINE.md).
