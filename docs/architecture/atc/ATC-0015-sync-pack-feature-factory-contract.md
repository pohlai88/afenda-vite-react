---
title: ATC-0015 Sync-Pack Feature Factory contract
description: Enforceable architecture contract for the Feature Factory role of @afenda/features-sdk, covering candidate truth, ranking artifacts, generated packs, scaffold manifests, and workflow parity.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 25
---

# ATC-0015: Sync-Pack Feature Factory contract

## Contract identity

- **Contract ID:** ATC-0015
- **Bound domain ID:** GOV-ARCH-001
- **Owner:** Governance toolchain
- **Scope:** app/package-specific
- **Decision anchor:** ADR-0017

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract binds `@afenda/features-sdk` to the Feature Factory pipeline so the repo can prove Sync-Pack owns candidate truth, ranking/report decision artifacts, generated packs, scaffold manifests, and implementation handoff contracts while leaving product implementation to app packages.

## Implementation bindings

- In-scope paths:
  `packages/features-sdk/**`, `docs/architecture/adr/ADR-0017-features-sdk-feature-factory-doctrine.md`
- Bound code/config surfaces:
  `packages/features-sdk/src/index.ts`, `packages/features-sdk/src/sync-pack/**`, `packages/features-sdk/src/sync-pack/workflow-catalog.ts`, `packages/features-sdk/src/sync-pack/cli/**`, `packages/features-sdk/tests/sync-pack/**`, `packages/features-sdk/docs/**`, `packages/features-sdk/rules/sync-pack/**`
- Explicitly out of scope:
  product runtime implementation in app packages, Operator Kernel package internals, and public externalization guarantees

## Feature Factory pipeline

The governed pipeline is:

`candidate seed -> candidate validation -> candidate ranking report -> generated implementation pack -> scaffold manifest -> app/operator handoff`

Each stage must remain deterministic, typed, and traceable to package-owned truth surfaces.

## Enforceable rules

- `packages/features-sdk/src/**` must not contain product feature implementation.
- `packages/features-sdk/src/index.ts` must not widen the package root beyond the existing narrow Sync-Pack export surface.
- Ranking output must include prioritization reasons, confidence, likely implementation surfaces, and required validation.
- Generated implementation packs must remain handoff artifacts rather than implementation code.
- Scaffold output must remain manifest/handoff only, not full app generation.
- Workflow changes must remain aligned across the workflow catalog, CLI definitions, docs, tests, and Operator Kernel parity expectations.

## Enforcement surfaces

- Static checks:
  `pnpm run script:check-architecture-contracts`, `pnpm --filter @afenda/features-sdk typecheck`, `pnpm --filter @afenda/features-sdk surface:check`
- Tests:
  `pnpm --filter @afenda/features-sdk test:run`, `pnpm --filter @afenda/operator-kernel test:run`
- CI gates:
  workspace quality, package tests, package surface checks, and architecture evidence
- Runtime assertions:
  scaffold path validation and package-contract-backed asset checks

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  package build/typecheck/test logs, package surface logs, workflow parity evidence, ranking/report contract tests, generated pack tests, and scaffold manifest tests
- Validation cadence:
  every package change and every architecture contract review

## Drift handling

- What counts as drift:
  product code appearing under `packages/features-sdk/src/**`, ranking/report artifacts losing decision context, generated packs or scaffold manifests drifting from handoff shape, widened root exports, or workflow drift between catalog/CLI/docs/tests/runtime parity
- How drift is recorded:
  architecture-contract findings, package test failures, package surface failures, and code review findings
- When drift blocks:
  architecture evidence still warns overall, but package build/test/surface checks and runtime parity checks fail immediately for the documented surfaces

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- This contract extends `ATC-0007`; it does not replace the existing Sync-Pack package-boundary contract.
- The Feature Factory pipeline is package-owned truth. Product implementation remains downstream work for app packages.
