---
title: ADR-0017 Features SDK Feature Factory doctrine
description: Decision record for treating @afenda/features-sdk as Afenda's internal Feature Factory while keeping product implementation in app packages and governed execution in Operator Kernel.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 27
---

# ADR-0017: Features SDK Feature Factory doctrine

- **Decision status:** Accepted
- **Implementation status:** Implemented
- **Enforcement status:** Blocking package checks + tests + architecture evidence
- **Evidence status:** Active
- **Date:** 2026-04-25
- **Owner:** Governance toolchain
- **Review by:** 2026-07-25
- **Scope:** app/package-specific
- **Decision type:** Adopt now
- **Operational posture:** Active contract
- **Related governance domains:** GOV-ARCH-001
- **Related ATCs:** ATC-0015
- **Extends:** ADR-0010

## Context

`ADR-0010` already records that `@afenda/features-sdk` is the internal Sync-Pack execution truth boundary. That package boundary is still correct, but it does not fully state the intended product role of the package.

The repo now needs a clearer doctrinal line:

- `@afenda/features-sdk` should decide, rank, package, scaffold, and hand off feature work.
- `apps/web` and `apps/api` should implement product behavior.
- `@afenda/operator-kernel` should execute governed workflows against the typed Sync-Pack truth surface.

Without this doctrine, `packages/features-sdk` can drift toward two failure modes:

- it becomes a loose CLI bucket instead of a governed feature-factory engine
- it starts absorbing product implementation that belongs in app packages

## Decision summary

1. `@afenda/features-sdk` is Afenda's internal Feature Factory package.
2. The package owns Sync-Pack candidate evaluation, ranking, generated implementation packs, scaffold manifests, and app/operator handoff contracts.
3. The package does **not** own product feature implementation.
4. The public package surface remains rooted in `@afenda/features-sdk/sync-pack`.
5. `packages/features-sdk/src/index.ts` must remain narrow and must not expand into a general-purpose export surface.
6. `syncPackWorkflowCatalog` remains the authoritative workflow metadata + execution binding surface for Operator Kernel consumption.
7. Scaffold output remains a manifest and handoff artifact, not full application generation.

## Delivery classification

### What is immediately true

- `packages/features-sdk` is the internal package that turns curated feature candidates into governed decision artifacts.
- Generated packs, ranking output, and scaffold manifests are part of the package truth model.
- Product implementation still belongs in `apps/web` and `apps/api`.

### What is not yet true

- This ADR does not make `@afenda/features-sdk` the home of product runtime code.
- This ADR does not widen the public package surface beyond `@afenda/features-sdk/sync-pack`.
- This ADR does not make scaffold generation equivalent to complete app generation.

### How this ADR should be used

- Treat as **binding policy** for the Feature Factory role of `packages/features-sdk`.
- Treat `ADR-0010` as the package-boundary anchor and this ADR as the follow-on role doctrine.
- Do **not** use this ADR to justify unrelated runtime concerns or app feature implementation inside `packages/features-sdk`.

## Scope and boundaries

- In scope:
  candidate validation, candidate ranking, ranking explanation artifacts, generated planning packs, scaffold manifests, handoff contracts, and workflow parity enforcement for `packages/features-sdk`
- Out of scope:
  `apps/web` feature code, `apps/api` product modules, Operator Kernel runtime ownership, public npm externalization, and non-Sync-Pack package expansion
- Affected repos/apps/packages:
  `packages/features-sdk`, `packages/operator-kernel`, `apps/web`, `apps/api`, `docs/architecture/adr`, `docs/architecture/atc`
- Interfaces/contracts touched:
  `@afenda/features-sdk/sync-pack`, `syncPackWorkflowCatalog`, generated pack contracts, scaffold manifest contracts, and Sync-Pack package rules

## Architecture contract

### Required

- `packages/features-sdk` must remain the repo's feature-factory truth engine, not the feature-implementation home.
- Candidate ranking output must explain prioritization, confidence, likely implementation surfaces, and required validation before implementation.
- Generated implementation packs must remain handoff-ready artifacts with explicit unknowns and implementation constraints.
- Scaffold manifests must remain workspace-relative, contract-bound, and handoff-oriented.
- Workflow changes must stay aligned across SDK code, CLI registry, docs, tests, and Operator Kernel parity expectations.

### Forbidden

- Adding product runtime behavior under `packages/features-sdk/src/**`
- Widening `packages/features-sdk/src/index.ts` beyond the narrow Sync-Pack surface
- Treating scaffold output as a complete app generator
- Adding a second unrelated capability under `@afenda/features-sdk` without a follow-on architecture decision

### Allowed exceptions

- Additional Sync-Pack feature-factory submodules may be added under `src/sync-pack/**` when they stay inside the boundary above.
- Future package splits are allowed only if the Feature Factory surface no longer fits one coherent package.

## Consequences

### Positive

- The package role is now explicit: roadmap-to-implementation truth engine.
- Reviewers can distinguish feature-factory work from product implementation work.
- Operator Kernel can continue consuming one typed workflow truth surface.

### Negative

- Package doctrine is stricter and adds review overhead.
- More package-local contracts now need to remain aligned with docs, tests, and generated artifacts.

## Evidence and enforcement matrix

| Contract statement                                          | Source of truth                                   | Current evidence                                                     | Enforcement mechanism                                         | Gap / follow-up                     |
| ----------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------- |
| Features SDK is the Feature Factory, not the feature home   | this ADR, package docs, package rules             | ranking/report generation, planning packs, scaffold manifests        | package tests + package docs + architecture contract evidence | none                                |
| Public surface stays narrow and Sync-Pack-only              | this ADR, ADR-0010, package exports               | `src/index.ts` re-exports only `./sync-pack/index.js`                | typecheck + package tests + package-contract checks           | none                                |
| Ranking output is a decision artifact, not only a scorecard | this ADR, Sync-Pack report/rank contracts         | structured ranking explanation, confidence, surface, and validation  | package tests                                                 | none                                |
| Scaffold output remains manifest/handoff only               | this ADR, scaffold schema and tests               | scaffold manifest schema + README + path contract                    | runtime assertions + package tests                            | none                                |
| Workflow changes stay aligned across surfaces               | this ADR, ATC-0015, workflow catalog, CLI surface | SDK workflow catalog, CLI definitions, Operator Kernel parity checks | package tests + Operator Kernel tests + architecture evidence | richer CI-only evidence is optional |

## Validation plan

- Required checks:
  `pnpm --filter @afenda/features-sdk build`, `pnpm --filter @afenda/features-sdk typecheck`, `pnpm --filter @afenda/features-sdk test:run`, `pnpm --filter @afenda/features-sdk surface:check`, `pnpm --filter @afenda/operator-kernel test:run`, `pnpm run script:check-architecture-contracts`
- Required manual QA:
  review a generated ranking/report artifact, generated pack, and scaffold manifest together before accepting boundary changes
- Runtime/operational signals to watch:
  product implementation creeping into `packages/features-sdk`, public export widening, workflow drift, or scaffold output becoming app-generation logic
- How success will be measured after rollout:
  a maintainer can move from candidate seed to ranked decision artifact, generated implementation pack, scaffold manifest, and app/operator handoff without inventing missing implementation truth

## References

- [ADR-0010 Features SDK Sync-Pack execution truth boundary](./ADR-0010-features-sdk-sync-pack-package-boundary.md)
- [ATC-0007 Features SDK Sync-Pack execution truth boundary](../atc/ATC-0007-features-sdk-sync-pack-package-boundary.md)
- [ATC-0015 Sync-Pack Feature Factory contract](../atc/ATC-0015-sync-pack-feature-factory-contract.md)
