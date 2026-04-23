---
title: ATC-0001 core web architecture baseline
description: Enforceable architecture contract for the baseline web client posture, its evidence path, and the commands that keep its status visible.
status: active
owner: web-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 10
---

# ATC-0001: Core web architecture baseline

## Contract identity

- **Contract ID:** ATC-0001
- **Bound domain ID:** GOV-ARCH-001
- **Owner:** Web architecture maintainers
- **Scope:** Repo-wide baseline for `apps/web` and adjacent shared packages
- **Decision anchor:** ADR-0001

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract binds the documented web architecture baseline to named checks and evidence so the repo can distinguish baseline doctrine from actual enforcement state.

## Implementation bindings

- In-scope paths:
  `apps/web`, `apps/api`, `docs/architecture/adr/ADR-0001-core-web-architecture-baseline.md`, `docs/ARCHITECTURE_EVOLUTION.md`
- Bound code/config surfaces:
  React + Vite SPA baseline, client/server boundary posture, and the architecture contract docs under `docs/architecture/atc`
- Explicitly out of scope:
  full runtime enforcement for every architecture rule and future framework migration work not yet promoted into an ATC

## Enforcement surfaces

- Static checks:
  `pnpm run script:check-architecture-contracts`
- Tests:
  governance regression coverage under `scripts/lib/governance-spine.test.ts`
- CI gates:
  governance checks and governance evidence completeness
- Runtime assertions:
  deferred for later waves

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  per-domain architecture-contract report, aggregate governance report, generated governance register
- Validation cadence:
  every governance run and every architecture review cycle

## Drift handling

- What counts as drift:
  missing ATC metadata, broken ADR-to-ATC linkage, an ATC claiming stronger enforcement than the repo can prove
- How drift is recorded:
  the architecture-contract domain report and aggregate governance report
- When drift blocks:
  this contract currently warns rather than blocks while the architecture-contract surface is still partial

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- This contract is intentionally `partial` and `warned`.
- It records the baseline as an active contract without pretending all web-architecture enforcement is complete today.
