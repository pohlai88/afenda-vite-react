# FSDK-SYNC-001 Feature Factory Boundary Contract

`@afenda/features-sdk` is Afenda's internal Feature Factory package.

It owns the Sync-Pack pipeline:

`candidate seed -> candidate validation -> candidate ranking report -> generated implementation pack -> scaffold manifest -> app/operator handoff`

## Required

- Keep product implementation out of `packages/features-sdk/src/**`.
- Keep the public package surface rooted at `@afenda/features-sdk/sync-pack`.
- Keep `packages/features-sdk/src/index.ts` narrow.
- Keep ranking/report output decision-oriented:
  - why the candidate ranked high or low
  - what assumptions affect confidence
  - which app/API surfaces are likely touched
  - what validation is required before implementation
- Keep generated packs as handoff-ready planning artifacts.
- Keep scaffold output as manifest/handoff only.
- Keep workflow changes aligned across catalog, CLI, docs, tests, and Operator Kernel parity.

## Forbidden

- Adding product runtime code to `packages/features-sdk`.
- Turning scaffold generation into complete app generation.
- Adding new public root exports that widen package ownership.
- Treating Sync-Pack as a general-purpose scratchpad for unrelated capabilities.

## Review rule

If a change causes `@afenda/features-sdk` to own a second major capability outside Sync-Pack, stop and raise a follow-on ADR instead of accreting more scope.
