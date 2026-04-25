---
title: ATC-0013 governed extension and plugin boundaries
description: Enforceable architecture contract for Afenda's future extension model: declarative, registered, auditable, and never allowed to bypass command or truth law.
status: active
owner: governance-extension-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 30
---

# ATC-0013: Governed extension and plugin boundaries

## Contract identity

- **Contract ID:** ATC-0013
- **Bound domain ID:** GOV-ARCH-001
- **Owner:** Governance extension architecture
- **Scope:** future extension and plugin implementation work
- **Decision anchor:** ADR-0015

## Lifecycle and enforcement

- **Lifecycle status:** watcher
- **Enforcement maturity:** defined

## Intent

This contract prevents future extensibility work from weakening Afenda's command, truth, tenancy, permission, and governance boundaries.

## Implementation bindings

- In-scope paths:
  future extension runtime, registry, generators, doctrine, and governance bindings
- Bound code/config surfaces:
  extension registration model, lifecycle evidence, command/truth integration, and permission/tenant boundaries
- Explicitly out of scope:
  current runtime behavior before extension implementation begins

## Enforcement surfaces

- Static checks:
  `pnpm run script:check-architecture-contracts`, `pnpm run script:check-governance`
- Tests:
  future extension-runtime tests once implementation begins
- CI gates:
  architecture approval is required before extension runtime lands
- Runtime assertions:
  none yet; runtime implementation is intentionally deferred

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  accepted doctrine docs first; runtime evidence only when extension implementation is proposed
- Validation cadence:
  every extension-related architecture proposal

## Drift handling

- What counts as drift:
  extension code arriving before doctrine, monkey-patch hooks, bypass of command execution, direct truth-record writes, or benchmark-code imports as production extension runtime
- How drift is recorded:
  architecture-contract findings, review findings, and governance findings
- When drift blocks:
  drift blocks extension runtime approval immediately

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- Required future model:
  declarative, registered, auditable
- Forbidden future model:
  monkey patching, direct truth writes, command bypass, tenant bypass, direct benchmark coupling
