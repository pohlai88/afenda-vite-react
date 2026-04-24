---
title: ATC-0006 Cline package boundaries and ownership
description: Enforceable architecture contract for the single-package Cline runtime boundary, its internal ownership rules, migration baseline, and validation surface.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 22
---

# ATC-0006: Cline package boundaries and ownership

## Contract identity

- **Contract ID:** ATC-0006
- **Bound domain ID:** GOV-ARCH-001
- **Owner:** Governance toolchain
- **Scope:** bounded subsystem
- **Decision anchor:** ADR-0009

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract binds the `packages/cline` package boundary, its internal ownership model, and the migration away from the embedded `features-sdk` prototype to real code paths, checks, and evidence.

## Implementation bindings

- In-scope paths:
  `packages/cline/**`, `packages/features-sdk/src/index.ts`, `packages/features-sdk/src/cline/**`, `packages/features-sdk/tests/cline/**`, `docs/architecture/adr/ADR-0009-cline-single-package-extraction-ready-boundaries.md`
- Bound code/config surfaces:
  `packages/cline/src/core/**`, `packages/cline/src/mcp-server/**`, `packages/cline/src/plugins/features-sdk/**`, `packages/cline/package.json`, and the removal of the live `./cline` export surface from `@afenda/features-sdk`
- Explicitly out of scope:
  multi-package extraction, second-plugin support, runtime-enforced import policing, and rich planning/explainer layers beyond the migrated prototype baseline

## Enforcement surfaces

- Static checks:
  `pnpm run script:check-architecture-contracts`, `pnpm --filter @afenda/cline typecheck`, `pnpm --filter @afenda/features-sdk typecheck`
- Tests:
  `pnpm --filter @afenda/cline test:run`
- CI gates:
  governance checks and architecture contract evidence completeness
- Runtime assertions:
  none in Phase 1

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  architecture-contracts report, aggregate governance report, package-local typecheck/test results in CI logs
- Validation cadence:
  every governance run and every Cline package change

## Drift handling

- What counts as drift:
  reintroducing an exported embedded `features-sdk` Cline surface, core importing Feature SDK domain logic, MCP server owning business logic, or docs claiming stronger enforcement than the repo can prove
- How drift is recorded:
  architecture-contract domain report and code review findings
- When drift blocks:
  this contract currently warns rather than blocks while the package boundary is still newly established

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- `packages/cline` is the approved Phase 1 package boundary.
- `packages/features-sdk/src/cline/**` is migration source only and must not remain the live runtime surface after migration.
- `src/core` may expose reusable contracts and orchestration primitives, but no Sync-Pack-shaped business reasoning may enter it unless reuse is proven.
