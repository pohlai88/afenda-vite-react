---
title: Feature module template scaffold
description: Supporting scaffold for shaping feature-owned modules and local surfaces under the current `apps/web/src` ownership model.
status: template
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: doctrine
relatedDomain: feature-template
order: 40
---

# Feature Module Template (Scaffold)

Use this contract for every new ERP feature module.
It should be used when shaping feature-owned modules and their local surfaces.
It does not replace the canonical structure and boundary doctrine in [`../../workspace/PROJECT_STRUCTURE.md`](../../workspace/PROJECT_STRUCTURE.md), [`../../workspace/MONOREPO_BOUNDARIES.md`](../../workspace/MONOREPO_BOUNDARIES.md), and [`../../workspace/BOUNDARY_SURFACES.md`](../../workspace/BOUNDARY_SURFACES.md).

## Folder Template

```text
apps/web/src/app/_features/<feature-name>/
├── components/
├── hooks/
├── services/
├── types/
├── docs/                 # optional feature-local guidance
├── rules/                # optional feature-local policy artifacts
├── scripts/              # optional feature-local generators or validators
├── schema/               # optional feature-local schema
├── tests/ or __tests__/  # owner-local verification
└── index.ts              # only when a public feature surface is intentional
```

## Public API Rule

Export only stable surfaces from feature root `index.ts`.

```ts
export { FinanceView } from "./components/FinanceView"
export { useFinanceFeature } from "./hooks/useFinanceFeature"
export type { FinanceSummary } from "./types/finance.types"
```

Avoid importing other feature internals directly when a public feature surface exists:

- Good: `import { FinanceView } from '@/app/_features/finance'`
- Avoid: `import { FinanceView } from '@/app/_features/finance/components/FinanceView'`

## Routing Rule

Register routes through the governed route/runtime structure rather than inventing feature-local global roots.

- Marketing routes belong to `src/marketing/*`.
- Product feature routes are owned under `src/app/_features/*`.
- Platform route/runtime wiring belongs under `src/app/_platform/*`, `src/routes/*`, and `src/share/*` as appropriate.

## Data Rule

- Server state: TanStack Query in feature hooks/services.
- Local UI state: component state first, then feature-local store only when needed, then shared store only when the state is genuinely cross-owner.

## UI Rule

- Use primitives from workspace UI packages.
- Keep reusable cross-feature or cross-platform widgets in `src/share/`.
- Do not create a second primitive library inside app feature folders.
