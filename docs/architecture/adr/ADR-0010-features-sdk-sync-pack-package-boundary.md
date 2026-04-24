---
title: ADR-0010 Features SDK Sync-Pack package boundary
description: Decision record for keeping @afenda/features-sdk as the internal Sync-Pack package with a package-contract surface, governed docs, and CLI plus SDK ownership in one workspace package.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 23
---

# ADR-0010: Features SDK Sync-Pack package boundary

- **Decision status:** Accepted
- **Implementation status:** Substantially implemented
- **Enforcement status:** Partial automation
- **Evidence status:** Partial
- **Date:** 2026-04-25
- **Owner:** Governance toolchain
- **Review by:** 2026-07-25
- **Scope:** app/package-specific
- **Decision type:** Record existing baseline
- **Operational posture:** Active contract
- **Related governance domains:** GOV-ARCH-001
- **Related ATCs:** ATC-0007

## Context

`@afenda/features-sdk` has grown into a real internal package boundary rather than a loose bucket of helper scripts.

The package now owns a coherent Sync-Pack surface that combines:

- SDK exports under `packages/features-sdk/src/sync-pack/**`
- CLI entrypoints under `packages/features-sdk/src/sync-pack/cli/**`
- package release-contract validation in `package-contract.ts`
- governed package docs under `packages/features-sdk/docs/sync-pack/**`
- governed rules and seeds under `packages/features-sdk/rules/sync-pack/**`
- package tests under `packages/features-sdk/tests/sync-pack/**`

Without an explicit architecture record, the package can be misread in two different ways:

- as only a CLI wrapper rather than a package with SDK, docs, rules, and contract ownership
- as an unbounded staging area where unrelated feature-planning logic can accumulate without package-level discipline

The repository needs an ADR that states what this package is, what it owns, and what it does not claim yet.

## Decision summary

1. `@afenda/features-sdk` remains the internal package boundary for the Sync-Pack SDK and operator CLI.
2. The live public package export surface remains rooted in `src/index.ts` and `src/sync-pack/index.ts`.
3. Package rules, docs, examples, and seeds are part of the owned package contract rather than optional supporting clutter.
4. The package-contract surface in `src/sync-pack/package-contract.ts` is part of the package truth model and must remain aligned with package metadata and shipped files.
5. The package remains internal-only; it does not yet claim public externalization, partner support, or a stable public semver contract.

## Delivery classification

### What is immediately true

- `packages/features-sdk` is a real workspace package with code, CLI bins, tests, rules, and docs.
- The package exports the active Sync-Pack SDK surface.
- The package has a real package-contract checker and related tests.

### What is not yet true

- This ADR does not claim every package boundary rule is enforced by dedicated architecture-only static analysis.
- This ADR does not claim the package is ready for public npm publication.
- This ADR does not claim every internal contract in `docs/sync-pack/**` is elevated to repo-level ADR/ATC governance.

### How this ADR should be used

- Treat as **binding policy** for the current package boundary, owned surfaces, and internal-only interpretation.
- Treat as **directional guidance** for future extraction only if the Sync-Pack surface grows beyond one coherent package.
- Do **not** use this ADR as proof that the package is already an external product distribution.

## Scope and boundaries

- In scope:
  `packages/features-sdk` source layout, export surface, package contract, docs/rules ownership, and internal CLI plus SDK posture.
- Out of scope:
  public package distribution, multi-package split, non-Sync-Pack features, and repo-wide governance beyond this package boundary.
- Affected repos/apps/packages:
  `packages/features-sdk`, `docs/architecture/adr`, `docs/architecture/atc`.
- Interfaces/contracts touched:
  `@afenda/features-sdk`, `@afenda/features-sdk/sync-pack`, `afenda-sync-pack*` bins, package-contract validation, and package-owned docs/rules assets.

## Architecture contract

### Required

- `packages/features-sdk/src/index.ts` must remain a narrow package entrypoint rather than a dumping ground for unrelated exports.
- Active Sync-Pack logic must live under `packages/features-sdk/src/sync-pack/**`.
- Package docs, rules, templates, and shipped assets required by the package contract must remain aligned with the package metadata and build outputs.
- Package-level CLI bins must resolve to built `dist/sync-pack/cli/**` targets.

### Forbidden

- Treating `@afenda/features-sdk` as a general-purpose workspace scratchpad for unrelated runtime concerns.
- Shipping a package surface that drifts from the package-contract checker expectations.
- Claiming public/external support or stability guarantees that the package does not currently prove.

### Allowed exceptions

- Additional Sync-Pack submodules may be added under `src/sync-pack/**` when they remain aligned with the package boundary.
- A future split into multiple packages is allowed only if package growth proves one package is no longer the right ownership unit.

## Alternatives considered

### Option A: Treat Features SDK as only a CLI package

- Pros:
  simpler story for command usage
- Cons:
  hides the real SDK, rules, docs, and contract ownership that already exist

### Option B: Keep the package undocumented at architecture level

- Pros:
  no extra doctrine to maintain
- Cons:
  package intent stays implicit and easier to misread during future changes

### Option C: Record the package as the internal Sync-Pack boundary now

- Pros:
  matches the actual codebase, clarifies ownership, and supports future review
- Cons:
  adds another ADR/ATC pair that must stay current

## Consequences

### Positive

- Reviewers can reason about `packages/features-sdk` as one owned package boundary.
- The package-contract checker has architecture-level context rather than standing alone as an internal implementation detail.
- Documentation now reflects that this package is more than a CLI wrapper.

### Negative

- The package boundary now carries doctrine maintenance overhead.
- Some enforcement remains package-contract focused rather than architecture-rule focused.
- Future externalization decisions will need a follow-on ADR rather than ad hoc package drift.

## Evidence and enforcement matrix

| Contract statement                                                    | Source of truth                                        | Current evidence                                                            | Enforcement mechanism                           | Gap / follow-up                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------- |
| Features SDK is an internal Sync-Pack package boundary                | this ADR, `packages/features-sdk/**`                   | package tree, `package.json`, `README.md`, `src/sync-pack/**`               | review discipline + typecheck                   | stronger package-boundary automation can come later           |
| Public package exports stay narrow and Sync-Pack-focused              | this ADR, `packages/features-sdk/src/index.ts`         | `src/index.ts` exports only `./sync-pack/index.js`                          | code review + typecheck                         | no dedicated export-scope lint rule yet                       |
| Package contract is part of the owned truth model                     | this ADR, `src/sync-pack/package-contract.ts`          | package-contract checker plus `tests/sync-pack/package-contract.test.ts`    | tests + package validation                      | contract is package-focused, not yet a repo ATC evidence feed |
| Docs, rules, templates, and shipped assets remain part of package law | this ADR, package docs/rules, package `files` metadata | package-contract required file checks and built template asset expectations | package-contract tests + install/build behavior | richer CI evidence for this package can be added later        |

## Implementation plan

### Completed now

- `packages/features-sdk` exists as a real workspace package.
- The active export surface is Sync-Pack-focused.
- The package-contract checker and tests exist.
- Package docs and rules are present and tied to the package contract.

### Required follow-through

- [x] Document the package boundary with a repo-level ADR — governance-toolchain — current phase
- [x] Add the companion ATC for the package boundary — governance-toolchain — current phase
- [ ] Add stronger package-boundary checks if export scope or ownership starts drifting — governance-toolchain — next phase
- [ ] Evaluate whether a package-local evidence surface is warranted beyond current package-contract outputs — governance-toolchain — next phase

### Exit criteria for “implemented”

- [x] `packages/features-sdk` has a clear package-boundary ADR + ATC pair
- [x] Package exports remain Sync-Pack-focused
- [x] Package contract checks and tests exist
- [ ] Boundary drift has dedicated stronger automation if review friction grows

## Validation plan

- Required checks:
  `pnpm --filter @afenda/features-sdk typecheck`, `pnpm --filter @afenda/features-sdk test:run`, `pnpm run script:check-architecture-contracts`
- Required manual QA:
  review `packages/features-sdk/src/index.ts`, package docs, and package contract expectations together before boundary changes
- Runtime/operational signals to watch:
  widening exports, package files drifting from contract expectations, or unrelated capabilities being added outside the Sync-Pack boundary
- How success will be measured after rollout:
  contributors can explain what `@afenda/features-sdk` owns, what it exports, and what remains intentionally internal-only

## Trigger metrics (for revisit, escalation, or migration)

- Trigger 1: the package starts owning a second major capability not clearly inside Sync-Pack
- Trigger 2: export-surface growth causes repeated review friction or accidental contract drift
- Trigger 3: public/partner distribution becomes a real requirement rather than deferred possibility

## Rollout and rollback / containment

### Rollout plan

- Land ADR + ATC pair for the package boundary.
- Keep package-contract, docs, and export surface aligned.
- Revisit only if package scope materially changes.

### Rollback/containment plan

- If this ADR becomes too broad, narrow it to the Sync-Pack package boundary only and move future package expansion into follow-on ADRs.

## References

- [ATC-0007 Features SDK Sync-Pack package boundary](../atc/ATC-0007-features-sdk-sync-pack-package-boundary.md)
- [packages/features-sdk/README.md](../../../packages/features-sdk/README.md)
- [packages/features-sdk/docs/sync-pack/architecture-map.md](../../../packages/features-sdk/docs/sync-pack/architecture-map.md)
