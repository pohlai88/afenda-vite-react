# CI Quality Gates (Scaffold)

Use this checklist as non-negotiable CI policy for Vite frontend release readiness.

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
