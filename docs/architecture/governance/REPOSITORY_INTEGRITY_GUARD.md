---
title: Repository integrity guard
description: Canonical doctrine for the Repository Integrity Guard governance surface, its report contract, and its warn-first rollout posture.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: governance-registry
order: 12
---

# Repository Integrity Guard

This document defines the **Repository Integrity Guard** as a first-class governance surface for repository legitimacy.

The guard does not replace existing domain governance.
It aggregates those surfaces, adds a small set of native hygiene scanners, and emits one repo-truth verdict.

The rollout posture is **warn-first**:

- the guard is registered under `GOV-TRUTH-001`
- the governance-facing command is `pnpm run script:check-repo-guard`
- the public operator command is `pnpm run repo:guard`
- v1 runs as a warned governance domain, not a blocking root check

Decision anchor and contract baseline:

- [ADR-0008 repository integrity guard architecture](../adr/ADR-0008-repository-integrity-guard-architecture.md)
- [ATC-0005 repository integrity guard baseline](../atc/ATC-0005-repository-integrity-guard-baseline.md)
- [Governance guardrail handoff](./GOVERNANCE_GUARDRAIL_HANDOFF.md)
- [Repo guardrail todo](./REPO_GUARDRAIL_TODO.md)
- [Repo guard repo map](./REPO_GUARD_REPO_MAP.md)
- [Repo guard activation plan](./REPO_GUARD_ACTIVATION_PLAN.md)
- [Repo guard false positive log](./REPO_GUARD_FALSE_POSITIVE_LOG.md)

## Architecture binding

The Repository Integrity Guard is architecture-bound, not implementation-defined.

It operates under:

- [ADR-0008 repository integrity guard architecture](../adr/ADR-0008-repository-integrity-guard-architecture.md)
- [ATC-0005 repository integrity guard baseline](../atc/ATC-0005-repository-integrity-guard-baseline.md)

## Contract authority

The guard exists inside the governance chain, but its local behavior is contract-bound.

- ADR-0008 defines why the repo-truth layer exists and why it is aggregate-first.
- ATC-0005 defines the bound command surface, evidence paths, and warn/block semantics.
- If implementation behavior drifts from the documented baseline, ATC-0005 takes precedence.

## Code ownership split

The Repository Integrity Guard now uses a permanent three-way split:

- docs in `docs/architecture/governance/` remain canonical truth
- reusable governance-domain code lives in `packages/governance-toolchain`
- repo-local orchestration remains in `scripts/`

`@afenda/governance-toolchain` is the owned code home for pure governance-domain contracts, coverage/waiver/promotion models, formatters, and report builders.
It must not become a second root control plane:

- no git/process execution
- no repo-root assumptions
- no root config loading
- no artifact emission
- no imports from `scripts/`

`scripts/` remains the only layer that performs repo execution:

- CLI entrypoints
- git/worktree access
- repo-root/path resolution
- root config loading
- artifact writing
- governance register/report orchestration

## Purpose

The guard answers:

- is the repository structurally clean
- is repo truth drifting from current policy
- are there suspicious dirty files or working-tree states
- do existing governance surfaces still agree enough to trust the repo

## V1 scope

V1 is intentionally thin and read-only.

It aggregates existing evaluators for:

- filesystem governance
- generated artifact governance
- storage governance
- naming convention
- documentation governance
- workspace/package topology
- file survival and reviewed survival

It adds only two native scanners:

- dirty file scan
- working tree legitimacy

## Current native scanners

The guard now includes the original V1 native scanners plus the first post-V1 structural extension:

- dirty file scan
- working tree legitimacy
- `RG-STRUCT-001` placement and ownership
- `RG-TRUTH-002` generated artifact authenticity
- `RG-STRUCT-003` boundary and import regression
- `RG-TRUTH-004` source and evidence mismatch
- `RG-HYGIENE-005` duplicate and overlap hygiene
- `RG-ADVISORY-006` stronger document control

`RG-STRUCT-001` is currently grounded in declared rollout owner truth, runtime owners, and shared roots.
It is not yet the full final ownership model for every repo surface.
`RG-TRUTH-002` currently binds design-system component governance artifacts and selected database generated artifacts to explicit provenance and canonical renderers.
It is not yet full generated-artifact authenticity coverage for every governed generated root.
`RG-STRUCT-003` currently enforces high-confidence cross-root drift rules for selected app roots, workspace-private path leakage, and package subpath imports that bypass declared `exports`.
It is not yet the full final package/public-surface import contract for the repo.
`RG-TRUTH-004` currently enforces declared source/evidence bindings for design-system component-governance outputs and selected database generated artifacts.
It is not yet the full final source-to-evidence map for every governed report and generated artifact.
`RG-HYGIENE-005` currently enforces only warning-level suspicious variant detection and duplicate-basename detection in duplicate-sensitive governed surfaces.
It is not yet a full semantic overlap detector for docs, generators, or business logic.
`RG-ADVISORY-006` currently enforces only warning-level frontmatter and linkage checks for governed doctrine, ADR, and ATC surfaces.
It is not yet a full doctrine-network validator or parent/child document authority resolver.

## Operationalization surfaces

The guard is no longer only an architecture-and-code surface.
Its activation and calibration are tracked explicitly through:

- [Repo guard repo map](./REPO_GUARD_REPO_MAP.md)
- [Repo guard activation plan](./REPO_GUARD_ACTIVATION_PLAN.md)
- [Repo guard false positive log](./REPO_GUARD_FALSE_POSITIVE_LOG.md)
- [Repo guardrail todo](./REPO_GUARDRAIL_TODO.md)

These documents exist so promotion decisions are based on repo-native topology, observed findings quality, and explicit activation phases rather than assumption.

## Commands

- `pnpm run repo:guard`
  Human-readable summary for local repo legitimacy checks.
- `pnpm run repo:guard:ci`
  CI-oriented execution with structured report output and fail-only-on-error exit codes.
- `pnpm run repo:guard:report`
  Writes evidence artifacts without changing root check behavior.
- `pnpm run repo:guard:promotion-review`
  Writes a promotion-readiness review report and scorecard for `GOV-TRUTH-001`.
- `pnpm run script:check-repo-guard`
  Governance entrypoint used by the `GOV-TRUTH-001` domain.

## Evidence

The guard writes:

- `.artifacts/reports/governance/repo-integrity-guard.report.json`
- `.artifacts/reports/governance/repo-integrity-guard.report.md`
- `.artifacts/reports/governance/repo-guard-promotion-readiness.report.json`
- `.artifacts/reports/governance/repo-guard-promotion-readiness.report.md`
- shared waiver registry: `rules/repo-integrity/repo-guard-waivers.json`

The JSON report includes a governance-domain projection so the existing governance control plane can load it as standard evidence.
The evidence contract is bound to `GOV-TRUTH-001`, ADR-0008, and ATC-0005.
The report also carries explicit contract-binding metadata so the evidence stays self-describing in review and CI.
The report now also carries waiver registry status, expiry, and validity summary for native repo-guard suppressions.
The report now also carries a deterministic coverage model for implemented, partial, and missing repo-guard program areas.

## V1 rules

The guard must remain:

- deterministic
- explainable
- machine-readable
- conservative in failure behavior

High-confidence native violations may fail the guard.
Lower-confidence findings should warn first.

## Relationship to governance

The Repository Integrity Guard is a repo-truth aggregator, not a second governance constitution.

It depends on the existing governance chain:

```txt
doctrine -> contract binding -> guardrail -> evidence -> CI verdict
```

Its role is to summarize whether the repository is still legitimate enough to trust as a whole.

For the current program-level handoff state, start with [Governance guardrail handoff](./GOVERNANCE_GUARDRAIL_HANDOFF.md).
