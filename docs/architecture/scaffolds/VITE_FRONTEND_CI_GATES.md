---
title: CI quality gates scaffold
description: Supporting scaffold for release-readiness gates that should be applied to Vite frontend work in the Afenda workspace.
status: template
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: doctrine
relatedDomain: frontend-ci
order: 20
---

# CI Quality Gates (Scaffold)

Use this checklist as non-negotiable CI policy for Vite frontend release readiness.
It should be used during rollout and review of frontend changes.
It does not replace the canonical workspace policy in [`../../workspace/VITE_ENTERPRISE_WORKSPACE.md`](../../workspace/VITE_ENTERPRISE_WORKSPACE.md), [`../../workspace/TESTING.md`](../../workspace/TESTING.md), and [`../../workspace/PROJECT_CONFIGURATION.md`](../../workspace/PROJECT_CONFIGURATION.md).

## Required Gates

1. `pnpm run format:check`
2. `pnpm run lint`
3. `pnpm run typecheck`
4. `pnpm run test:run`
5. `pnpm run build`
6. `pnpm run preview` smoke check (or equivalent automated smoke against built output)

## Environment Safety Gate

- Verify no secret-bearing variables use `VITE_` prefix.
- Verify client env contract is typed (`vite-env.d.ts`) and reviewed.

## Vite Resilience Gate

- Ensure `vite:preloadError` recovery is present in bootstrap.
- Ensure deployment serves HTML with non-stale caching policy to avoid stale chunk references.

## Performance Regression Gate

At minimum for release branches:

- Bundle analysis report generated and reviewed.
- Largest initial JS chunk and total initial JS compared against baseline budget.
- If regression exceeds budget, block release until justified or fixed.

## Suggested Root Commands

From repository root:

- `pnpm run check`
- `pnpm exec turbo run lint typecheck test:run build`

For app-specific verification:

- `pnpm --filter @afenda/web build:analyze`
- `pnpm --filter @afenda/web preview`

## Workspace graph smoke

Use this smoke check when upgrading Turborepo, changing `turbo.json`, or touching package `test:run` scripts that affect the shared web/test graph.

Run from the repository root:

```bash
pnpm exec turbo run test:run --filter=@afenda/design-system --dry-run
```

Healthy output should still show:

- `@afenda/design-system#test:run` in scope
- `vitest run --configLoader native` as the design-system test command
- upstream `^transit` dependencies preserved in the task graph
- `VITEST_*` passthrough still available to the task
