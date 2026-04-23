---
title: Vite frontend blueprint
description: Supporting blueprint for assembling a Vite frontend baseline that matches current Afenda workspace doctrine and topology.
status: template
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: doctrine
relatedDomain: vite-blueprint
order: 10
---

# Vite Frontend Blueprint

This document defines the supporting scaffold baseline for a scalable, maintainable Vite frontend in the current Afenda workspace.
Use it when creating a new app or resetting architecture drift.
It does not replace the canonical workspace policy in [`../../workspace/VITE_ENTERPRISE_WORKSPACE.md`](../../workspace/VITE_ENTERPRISE_WORKSPACE.md) and [`../../workspace/PROJECT_STRUCTURE.md`](../../workspace/PROJECT_STRUCTURE.md).

## Scope

- Vite + React SPA architecture (non-SSR by default)
- Folder ownership and boundaries
- Vite production hardening defaults
- Performance-by-default rules
- CI quality gates for release confidence

## Canonical Structure Contract

Paths below are relative to `apps/web/src`:

- `app/_features/`: product feature ownership
- `app/_platform/`: app-wide platform runtime, shell, auth, tenant, i18n
- `marketing/`: public marketing ownership
- `routes/`: route composition
- `rpc/`: typed RPC/client contracts
- `share/`: cross-cutting code that does not belong to one feature or one platform slice

Do not add a new top-level `src/components/`; keep shared composition in `share/` and feature-owned code inside the owning feature or platform slice.

Feature module contract:

```text
app/_features/<feature-name>/
├── components/
├── hooks/
├── services/
├── types/
├── docs/                 # optional owner-local guidance
├── scripts/              # optional owner-local tooling
├── schema/               # optional owner-local schema
├── tests/ or __tests__/  # owner-local verification
└── index.ts              # only when intentional public surface is needed
```

## Design Rules

1. Keep business UI in `app/_features/*`, not in `share/*`.
2. Keep cross-feature concerns in `share/*`, not at `src/` root.
3. Keep marketing ownership in `marketing/*`, not mixed into product features.
4. Keep platform runtime concerns in `app/_platform/*`, not scattered across feature roots.
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
- Governance authoring template: [GOVERNANCE_AUTHORING_TEMPLATE.md](./GOVERNANCE_AUTHORING_TEMPLATE.md)

## Adoption Sequence

1. Create app shell (`main.tsx`, `App.tsx`, routing root, providers).
2. Add one exemplar feature using the feature contract.
3. Add env contract + `base` policy + preload recovery.
4. Add route-level lazy loading and chunk strategy.
5. Enforce CI gates (typecheck, lint, test, build, preview smoke, env safety).
6. Add budgets and profiling cadence for performance.
