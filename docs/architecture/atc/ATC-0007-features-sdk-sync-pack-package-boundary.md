---
title: ATC-0007 Features SDK Sync-Pack package boundary
description: Enforceable architecture contract for the @afenda/features-sdk package boundary, its Sync-Pack-focused export surface, and its package-contract-backed shipped assets.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 24
---

# ATC-0007: Features SDK Sync-Pack package boundary

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

This contract binds `@afenda/features-sdk` to its actual Sync-Pack package boundary so the repo can prove the package owns a narrow export surface, a real package-contract validator, and the docs/rules/assets required by that package contract without overstating publication or enforcement maturity.

## Implementation bindings

- In-scope paths:
  `packages/features-sdk/**`, `docs/architecture/adr/ADR-0010-features-sdk-sync-pack-package-boundary.md`
- Bound code/config surfaces:
  `packages/features-sdk/package.json`, `packages/features-sdk/src/index.ts`, `packages/features-sdk/src/sync-pack/**`, `packages/features-sdk/tests/sync-pack/package-contract.test.ts`, `packages/features-sdk/docs/sync-pack/**`, `packages/features-sdk/rules/sync-pack/**`
- Explicitly out of scope:
  public package distribution, non-Sync-Pack feature ownership, and stronger repo-wide blocking enforcement for package-internal architecture drift

## Enforcement surfaces

- Static checks:
  `pnpm run script:check-architecture-contracts`, `pnpm --filter @afenda/features-sdk typecheck`
- Tests:
  `pnpm --filter @afenda/features-sdk test:run`
- CI gates:
  workspace quality and architecture contract evidence completeness
- Runtime assertions:
  none

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  architecture-contracts report, CI logs for package typecheck/test, and package-contract test coverage in package test results
- Validation cadence:
  every architecture contract check and every Features SDK package change

## Drift handling

- What counts as drift:
  widening `@afenda/features-sdk` exports beyond the Sync-Pack boundary, broken package-contract-backed file expectations, or docs claiming stronger package maturity than the repo can prove
- How drift is recorded:
  architecture-contract findings, package test failures, and code review findings
- When drift blocks:
  this contract currently warns rather than blocks while stronger package-boundary automation is still pending

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- `packages/features-sdk/src/index.ts` is intentionally narrow and currently exports only the Sync-Pack surface.
- `src/sync-pack/package-contract.ts` is a real owned contract surface and part of the package boundary story.
- This contract does not make `@afenda/features-sdk` a public distribution promise.
