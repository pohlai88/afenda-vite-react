---
owner: web-runtime-shell
truthStatus: canonical
docClass: canonical-doc
relatedDomain: project-structure
---

# Project structure

This document is the operating guide for [`ADR-0004: Web src architecture — RPC, runtime, features, marketing`](./architecture/adr/ADR-0004-web-src-architecture-rpc-runtime-features.md).
`ADR-0004` is the decision record.
This page describes the live `apps/web/src` topology and where new code should go.

## Decision anchor

- [`docs/architecture/adr/ADR-0004-web-src-architecture-rpc-runtime-features.md`](./architecture/adr/ADR-0004-web-src-architecture-rpc-runtime-features.md)
- [`docs/architecture/atc/ATC-0004-web-src-topology-and-ownership.md`](./architecture/atc/ATC-0004-web-src-topology-and-ownership.md)

## Current `apps/web/src` shape

The live top-level structure is:

```txt
apps/web/src/
  app/
    _components/
    _features/
    _platform/
  marketing/
  routes/
  rpc/
  share/
  App.tsx
  index.css
  main.tsx
  router.tsx
```

The important ownership model is:

- `app/_features/`
  product feature code and feature-owned UI/services
- `app/_platform/`
  platform runtime, auth, shell, tenant, i18n, and other platform concerns
- `marketing/`
  public marketing feature boundary
- `rpc/`
  typed RPC/client contracts
- `share/`
  cross-cutting shared code that does not belong to one feature or one platform slice

## Placement rules

### `app/_features/`

Use for product features and feature-owned UI/runtime logic.

Typical examples:

- domain screens and feature routes
- feature-local hooks, services, types, and tests
- dependency-grouped feature slices such as `app/_features/hono/<domain>`

### `app/_platform/`

Use for app-wide platform concerns that are not one business feature.

Typical examples:

- auth and route guards
- shell
- tenant/runtime context
- i18n bootstrapping and platform adapters

### `marketing/`

Use for the public marketing surface only.
Keep canonical and experimental landing ownership explicit and follow [`docs/MARKETING_FRONTEND_CONTRACT.md`](./MARKETING_FRONTEND_CONTRACT.md).

### `rpc/`

Use for typed RPC contracts and RPC client wiring.
Do not use this folder as a generic runtime/network junk drawer.

### `share/`

Use for cross-cutting code that legitimately serves multiple ownership areas.
If code clearly belongs to one feature or one platform slice, keep it there instead.

## Anti-patterns

Do not introduce:

- a new global `src/features/` ownership model
- a new global `src/pages/` bucket for app ownership
- a revived umbrella `api-client` vocabulary that mixes RPC and general runtime concerns
- new top-level `src/` roots without a follow-on ADR

## Routing and marketing

- Product and platform routes live through the governed app/runtime structure.
- Public marketing routes live under `src/marketing/`.
- Route-local helper folders are fine inside owning boundaries; what is disallowed is a new competing global root model.

## Machine enforcement

The repo validates important topology expectations through:

- [`scripts/afenda.config.json`](../scripts/afenda.config.json)
- `pnpm run script:check-afenda-config`
- governance evidence under `.artifacts/reports/governance/`

Those checks are the enforcement surface.
This document is the operating guide that helps contributors place new code correctly before the checks need to fail.

## Related docs

- [Architecture](./ARCHITECTURE.md)
- [State management](./STATE_MANAGEMENT.md)
- [Marketing Frontend Contract](./MARKETING_FRONTEND_CONTRACT.md)
- [Monorepo boundaries](./MONOREPO_BOUNDARIES.md)
