# App Platform

`_platform` owns cross-feature runtime infrastructure for the authenticated app. Keep ERP business capability code in `_features`; put shared runtime capabilities here only when multiple features need the same contract.

## Dependency Direction

Allowed:

- `_features/*` may import from `_platform` public APIs.
- `_platform/route` may compose feature root exports, such as `@/app/_features/_template` (or a concrete feature package).
- `_platform/*` may import from another `_platform/*` public API when the dependency is explicit.

Forbidden:

- `_platform/*` importing feature internals, such as `_features/foo/services/*`.
- Feature-specific workflow rules inside `_platform`.
- Third-party library details leaking past an adapter boundary.
- Global mutable singletons outside a provider, store, or service module that owns lifecycle.

## Capability Template

Copy `_template` to a concrete platform capability name, then rename files and exported symbols. Use `_template` as the maximum shape; remove folders a capability does not need before committing.

Recommended first capabilities:

- `shell`
- `route`
- `i18n`
- `client-store`
- `server-state`
- `permissions`
- `providers`

## Platform Capability Shape

```text
_platform/<capability>/
├── adapters/      # Third-party/runtime integration boundary
├── components/    # Platform UI composition, guards, providers, boundaries
├── hooks/         # Platform hooks consumed by features
├── policy/        # Rules, constants, and dependency direction
├── scripts/       # Platform-local maintenance/report modules
├── services/      # Runtime service boundary
├── types/         # Public contracts
├── utils/         # Pure helpers local to the capability
├── __tests__/     # Contract tests
├── index.ts       # Public API only
└── README.md      # Ownership and examples
```

## Classification Rule

If users work inside it as an ERP module, put it in `_features`. If it makes the app runtime work for many modules, put it in `_platform`.

## Naming

- capability folders: `kebab-case`
- component files: `PascalCase.tsx`
- hooks: `use-<capability>-<purpose>.ts`
- adapters: `<capability>-adapter.ts`
- policy modules: `<capability>-policy.ts`
- services: `<capability>-service.ts`
- scripts: `<capability>-template-report.ts` or `check-<capability>-contract.ts`
- tests: `<capability>-contract.test.ts` or `<capability>-policy.test.ts`
