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
├── pages/
└── __tests__/
```

## Shared Marketing Surface

The approved shared marketing primitives live under `pages/_components/`:

- `MarketingPageShell`
- `MarketingPageSection`
- `MarketingSectionHeading`
- `MarketingSectionKicker`
- reveal helpers in `marketing-reveal.ts`

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
- Marketing docs or plans should live under repo `docs/`, not inside this source tree, unless they are directly required by runtime or tests.
