---
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
relatedDomain: feature-template
---

# Feature Module Template (Scaffold)

Use this contract for every new ERP feature module.

Canonical structure and boundary policy stay in [`../PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md) and [`../MONOREPO_BOUNDARIES.md`](../MONOREPO_BOUNDARIES.md). This file is a supporting scaffold for applying those rules consistently.

## Folder Template

```text
src/features/<feature-name>/
├── components/
│   └── <FeatureView>.tsx
├── hooks/
│   ├── index.ts
│   └── use<FeatureName>Feature.ts
├── services/
│   └── <feature>Service.ts
├── types/
│   └── <feature>.types.ts
├── actions/
│   └── <feature>Action.ts
├── utils/
│   └── <feature>Utils.ts
└── index.ts
```

## Public API Rule

Export only stable surfaces from feature root `index.ts`.

```ts
export { FinanceView } from "./components/FinanceView"
export { useFinanceFeature } from "./hooks/useFinanceFeature"
export type { FinanceSummary } from "./types/finance.types"
```

Avoid importing other feature internals directly:

- Good: `import { FinanceView } from '@/features/finance'`
- Avoid: `import { FinanceView } from '@/features/finance/components/FinanceView'`

## Routing Rule

Register routes only in `src/share/routing/*`.

- Marketing routes map to `src/pages/*`.
- ERP routes map directly to `src/features/*`.

## Data Rule

- Server state: TanStack Query in feature hooks/services.
- Local UI state: component state first, then `share/client-store` only when cross-feature state is required.

## UI Rule

- Use primitives from workspace UI packages.
- Keep reusable cross-feature shell/navigation widgets in `src/share/components`.
- Do not create a second primitive library inside app feature folders.
