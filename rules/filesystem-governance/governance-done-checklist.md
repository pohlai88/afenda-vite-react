# Governance Done Checklist

## Purpose

This checklist marks the stop line for baseline repository governance.

If this checklist remains true, the repo is governance-ready for MVP implementation work.
Future refactor waves may continue, but they are optimization and tightening work rather than missing foundation.

## Baseline Governance Done

Baseline governance is considered done when all items below are true:

- `pnpm run script:check-governance` passes.
- Workspace root topology passes through `scripts/afenda.config.json`.
- Filesystem governance passes for the active governed roots.
- Storage governance passes for `.legacy/` and `archives` policy.
- Generated artifact governance passes for declared machine-owned roots.
- Package-root governance is declared and enforced for active workspace apps/packages.
- Import-boundary lint rules enforce:
  - no relative reach-ins across workspace roots
  - no package-internal `@afenda/*/src/*` reach-ins
  - feature-to-feature public-entrypoint usage
  - `_platform` cross-domain public-entrypoint usage
  - route-to-module or route-to-platform public-entrypoint usage
- The web app has one promoted `share/` boundary instead of nested local shared folders.
- The API app uses `modules/` as the primary capability boundary.
- Generated roots are governed explicitly instead of being ignored by convention.
- Toolchain runtime governance passes with the intended `node` and `pnpm` versions.

## Current Repo Status

Current repo status is baseline-done when these validation commands pass together:

- `pnpm run script:check-governance`
- `tsc -p apps/web/tsconfig.json --noEmit`
- focused or repo-wide ESLint for changed ownership surfaces

Operational interpretation:

- MVP feature work may proceed.
- Housekeeping may proceed.
- New work must conform to the enforced governance.
- Governance work no longer blocks product implementation by default.
- New governed slice surfaces should add their enforcement path in the same slice when the pattern is stable enough.

## What Is Not Part Of “Done”

These are not blockers for baseline governance completion:

- future narrowing of public barrels into smaller secondary surfaces
- stricter test-only boundary enforcement
- additional generated-artifact rollout into new machine-owned roots
- optional archive lifecycle automation beyond current storage checks
- opportunistic naming cleanup outside governed or touched scopes

These belong to future hardening waves, not to baseline completion.

## Future Waves

Only treat the following as follow-on tightening:

1. Shrink compatibility barrels after their remaining consumers move.
2. Add stricter secondary public surfaces for high-churn domains.
3. Expand generated-artifact governance only when a new root is clearly machine-owned.
4. Tighten test boundary policy if the test strategy is ready for it.
5. Continue package-surface review where a public API is still broader than necessary.
6. Add archive lifecycle automation if storage zones need operational cleanup beyond current checks.

## Decision Rule For MVP

Use this rule:

- If the baseline checklist is green, proceed with MVP work.
- Only pause for governance if:
  - a new architecture boundary is being introduced
  - a new promoted layer is being proposed
  - an existing guardrail blocks the intended change for a valid reason

Otherwise, do the product work and keep governance enforcement in the background.
