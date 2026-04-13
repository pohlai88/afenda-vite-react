# App Features

`_features` owns ERP business modules and user-facing product capabilities. Each feature must expose a stable public API from `index.ts` and keep implementation details inside its own folder.

## Dependency Direction

Allowed:

- platform routing may import a feature root, such as `@/app/_features/_template` (copy to `_features/<name>` for real modules);
- a feature may import `_platform` public APIs;
- a feature may import shared browser/API helpers through approved public APIs.

Forbidden:

- deep imports into another feature, such as `_features/finance/services/*`;
- platform runtime policies inside a feature;
- browser-owned database schema or migrations.

## Feature Template Shape

```text
_features/<feature-name>/
├── __tests__/     # Feature contract tests
├── actions/       # User/workflow commands and mutations
├── components/    # Feature UI
├── db-schema/     # Boundary notes only; real schema belongs outside Vite
├── hooks/         # Feature composition hooks
├── scripts/       # Feature-local maintenance/report modules
├── services/      # Data boundary and API adapters
├── types/         # Public and feature-local contracts
├── utils/         # Pure feature helpers
├── index.ts       # Public API only
└── README.md      # Ownership, naming, and copy checklist
```

## Naming

- feature folders: `kebab-case`
- component files: `PascalCase.tsx`
- hooks: `use-<feature>-<purpose>.ts`
- actions: `<feature>-actions.ts`
- services: `<feature>-service.ts`
- scripts: `<feature>-template-report.ts` or `check-<feature>-contract.ts`
- tests: `<feature>-contract.test.ts`
