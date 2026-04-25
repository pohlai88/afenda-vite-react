---
title: ATC-0012 governed shared events package boundary
description: Enforceable architecture contract for packages/events as Afenda's narrow shared event-truth package.
status: active
owner: web-api-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 29
---

# ATC-0012: Governed shared events package boundary

## Contract identity

- **Contract ID:** ATC-0012
- **Bound domain ID:** GOV-ARCH-001
- **Owner:** Web API architecture
- **Scope:** `packages/events/**` and package consumers
- **Decision anchor:** ADR-0014

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract keeps `packages/events` narrow, versioned, and transport-free so the package remains the shared event-truth layer rather than becoming an accidental workflow engine.

## Implementation bindings

- In-scope paths:
  `packages/events/**`, `apps/api/src/workflow/**`, `apps/api/package.json`, `scripts/afenda.config.json`
- Bound code/config surfaces:
  package exports, package dependency edges, versioned envelope helpers, and workflow consumers
- Explicitly out of scope:
  brokers, outbox runners, domain payload registries, and extension runtime

## Enforcement surfaces

- Static checks:
  `pnpm --filter @afenda/events typecheck`, `pnpm --filter @afenda/api typecheck`, `pnpm run script:check-governance`
- Tests:
  `packages/events/tests/**`
- CI gates:
  package typecheck/test plus architecture/governance checks
- Runtime assertions:
  workflow command results and audit metadata continue to share the same execution linkage

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  architecture-contracts report, package tests, and workflow linkage regression evidence in `apps/api`
- Validation cadence:
  every package boundary change and every workflow promotion touching `packages/events`

## Drift handling

- What counts as drift:
  domain payload definitions entering `packages/events`, package consumers reaching private package internals, transport runtime appearing in the package, or hidden event-envelope shape changes without versioning
- How drift is recorded:
  architecture-contract findings, repo-guard findings, package diffs, and unit-test failures
- When drift blocks:
  drift blocks further package promotion work and should block architecture approval when the package stops matching ADR-0014

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- Allowed public exports:
  `ExecutionLinkage`, `EventEnvelopeV1`, serialization helpers, validation helpers, hashing helpers
- Forbidden package growth:
  workflow engines, brokers, outbox runtime, domain payload catalogs
