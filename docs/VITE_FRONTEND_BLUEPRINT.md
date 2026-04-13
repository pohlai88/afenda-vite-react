# Vite Frontend Blueprint

This document defines the ideal scaffold baseline for a scalable, maintainable Vite frontend in Afenda-style monorepos.

Use this when creating a new app or resetting architecture drift.

## Scope

- Vite + React SPA architecture (non-SSR by default)
- Folder ownership and boundaries
- Vite production hardening defaults
- Performance-by-default rules
- CI quality gates for release confidence

## Canonical Structure Contract

Paths below are relative to `apps/web/src`:

- `features/`: domain modules (`auth`, `finance`, `inventory`, etc.)
- `share/`: cross-feature infrastructure (routing, providers, query, i18n, shared shell UI, theme, reusable hooks)
- `pages/`: public marketing-only pages

Do not add a fourth top-level `src/components/`; put shared composition under `share/components/` and primitives in `packages/shadcn-ui-deprecated`.

Feature module contract:

```text
features/<feature-name>/
├── components/
├── hooks/
├── services/
├── types/
├── actions/
├── utils/
└── index.ts
```

## Design Rules

1. Keep business UI in `features/*`, not in `share/*`.
2. Keep cross-feature concerns in `share/*`, not at `src/` root.
3. Keep `pages/*` for public/marketing routes only.
4. Keep UI primitives in `@afenda/shadcn-ui-deprecated` (`packages/shadcn-ui-deprecated`), not copied in app code.
5. Use feature root `index.ts` as each module's public API to avoid deep-import coupling.

## Vite Core Rules

1. Use `vite.config.ts` with `defineConfig(({ command, mode }) => ...)`.
2. Use `loadEnv(mode, process.cwd(), '')` only for config-time decisions.
3. Keep all browser-exposed variables under `VITE_*`; never expose secrets.
4. Set explicit `base` for root or sub-path deployment.
5. Register `vite:preloadError` recovery in client bootstrap to handle stale chunks after deployment.
6. Keep `tsc` type-checking outside bundling in CI (`tsc --noEmit` / `tsc -b`).
7. Run plugin performance profiling when build/startup regresses.

## Implementation Pack

- Vite config template: [VITE_FRONTEND_CONFIG_TEMPLATE.md](./VITE_FRONTEND_CONFIG_TEMPLATE.md)
- Feature template: [VITE_FRONTEND_FEATURE_TEMPLATE.md](./VITE_FRONTEND_FEATURE_TEMPLATE.md)
- Performance defaults: [VITE_FRONTEND_PERFORMANCE_DEFAULTS.md](./VITE_FRONTEND_PERFORMANCE_DEFAULTS.md)
- CI quality gates: [VITE_FRONTEND_CI_GATES.md](./VITE_FRONTEND_CI_GATES.md)

## Adoption Sequence

1. Create app shell (`main.tsx`, `App.tsx`, routing root, providers).
2. Add one exemplar feature using the feature contract.
3. Add env contract + `base` policy + preload recovery.
4. Add route-level lazy loading and chunk strategy.
5. Enforce CI gates (typecheck, lint, test, build, preview smoke, env safety).
6. Add budgets and profiling cadence for performance.
