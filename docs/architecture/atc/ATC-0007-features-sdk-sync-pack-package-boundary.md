---
title: ATC-0007 Features SDK Sync-Pack execution truth boundary
description: Enforceable architecture contract for the @afenda/features-sdk truth engine, its public workflow catalog, scaffold path contract, and package-contract-backed export surface.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 24
---

# ATC-0007: Features SDK Sync-Pack execution truth boundary

## Contract identity

- **Contract ID:** ATC-0007
- **Bound domain ID:** GOV-ARCH-001
- **Owner:** Governance toolchain
- **Scope:** app/package-specific
- **Decision anchor:** ADR-0010

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract binds `@afenda/features-sdk` to its actual Sync-Pack truth boundary so the repo can prove the package owns a narrow export surface, a public workflow catalog, a scaffold path contract, and the docs/rules/assets required by that package contract without overstating publication scope.

## Implementation bindings

- In-scope paths:
  `packages/features-sdk/**`, `docs/architecture/adr/ADR-0010-features-sdk-sync-pack-package-boundary.md`
- Bound code/config surfaces:
  `packages/features-sdk/package.json`, `packages/features-sdk/src/index.ts`, `packages/features-sdk/src/sync-pack/**`, `packages/features-sdk/src/sync-pack/workflow-catalog.ts`, `packages/features-sdk/src/sync-pack/scaffold/path-contract.ts`, `packages/features-sdk/tests/sync-pack/**`, `packages/features-sdk/docs/sync-pack/**`, `packages/features-sdk/rules/sync-pack/**`
- Explicitly out of scope:
  public package distribution, non-Sync-Pack feature ownership, and stronger repo-wide blocking enforcement for package-internal architecture drift

## Enforcement surfaces

- Static checks:
  `pnpm run script:check-architecture-contracts`, `pnpm --filter @afenda/features-sdk build`, `pnpm --filter @afenda/features-sdk typecheck`
- Tests:
  `pnpm --filter @afenda/features-sdk test:run`, `pnpm --filter @afenda/cline test:run`
- CI gates:
  workspace quality, package tests, and architecture contract evidence completeness
- Runtime assertions:
  scaffold placement path validation through `FSDK-SCAFFOLD-PATH-001`

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  architecture-contracts report, CI logs for package build/typecheck/test, scaffold contract validation in package test results, and runtime parity evidence in Cline package tests
- Validation cadence:
  every architecture contract check and every Features SDK package change

## Drift handling

- What counts as drift:
  widening `@afenda/features-sdk` exports beyond the Sync-Pack boundary, tool catalog drift, broken scaffold path contracts, broken package-contract-backed file expectations, or docs claiming stronger package maturity than the repo can prove
- How drift is recorded:
  architecture-contract findings, package test failures, runtime parity failures, and code review findings
- When drift blocks:
  the bound architecture-contract domain still warns overall, but package build, runtime assertions, and package tests fail immediately for the documented surfaces

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- `packages/features-sdk/src/index.ts` is intentionally narrow and currently exports only the Sync-Pack surface.
- `syncPackWorkflowCatalog` is part of the public truth model for the governed runtime slice.
- `FSDK-SCAFFOLD-PATH-001` makes scaffold placement output a runtime-checked contract rather than a loose convention.
- This contract does not make `@afenda/features-sdk` a public distribution promise.
