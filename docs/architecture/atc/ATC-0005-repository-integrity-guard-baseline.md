---
title: ATC-0005 repository integrity guard baseline
description: Enforceable contract for the Repository Integrity Guard command surface, report contract, evidence paths, and warn-first promotion baseline.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 21
---

# ATC-0005: Repository integrity guard baseline

## Contract identity

- **Contract ID:** ATC-0005
- **Bound domain ID:** GOV-TRUTH-001
- **Owner:** Governance toolchain
- **Scope:** Repo-wide repository-truth guard baseline
- **Decision anchor:** ADR-0008

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract binds the Repository Integrity Guard to real commands, real evidence, and explicit warn/block semantics so the repo can prove what the repo-truth layer does today without overstating V1 coverage.

## Implementation bindings

- In-scope paths:
  `scripts/repo-integrity/`, `scripts/lib/repo-guard.ts`, `scripts/check-repo-guard.ts`, `docs/architecture/governance/REPOSITORY_INTEGRITY_GUARD.md`, `docs/architecture/adr/ADR-0008-repository-integrity-guard-architecture.md`
- Bound code/config surfaces:
  `scripts/afenda.config.json`, `.artifacts/reports/governance/repo-integrity-guard.report.json`, `.artifacts/reports/governance/repo-integrity-guard.report.md`, governance evidence loading in `scripts/lib/governance-spine.ts`
- Explicitly out of scope:
  duplicate/overlap, source/evidence mismatch, and advanced document-control guardrails that are not yet fully implemented

## Enforcement surfaces

- Static checks:
  `pnpm run script:check-repo-guard`
- Tests:
  `pnpm run script:test-repo-guard`, `pnpm run script:test-governance`
- CI gates:
  governance checks and governance evidence completeness through `pnpm run script:check-governance`
- Runtime assertions:
  none in V1

## Evidence

- **Evidence path:** `.artifacts/reports/governance/repo-integrity-guard.report.json`
- Required evidence artifacts:
  repo-guard JSON report, repo-guard Markdown report, aggregate governance report, generated governance register
- Validation cadence:
  every repo-guard CI run and every governance run

## Drift handling

- What counts as drift:
  broken repo-guard command surface, broken report contract, evidence unreadable by the control plane, or V1 claiming stronger coverage than the repo can prove
- How drift is recorded:
  repo-guard evidence, governance aggregate report, and generated governance register
- When drift blocks:
  this contract does not block directly in V1; the bound domain warns while the repo-truth layer is still partial

## Linked commands

- **Check command:** `pnpm run script:check-repo-guard`
- **Report command:** `pnpm run repo:guard:report`

## Notes

- The public operator surface is:
  - `pnpm run repo:guard`
  - `pnpm run repo:guard:ci`
  - `pnpm run repo:guard:report`
- V1 native scanners are intentionally limited to:
  - dirty file scan
  - working tree legitimacy
- Current warned baseline also includes:
  - `RG-STRUCT-001` placement and ownership
  - `RG-TRUTH-002` generated artifact authenticity
  - `RG-STRUCT-003` boundary and import regression
  - `RG-TRUTH-004` source and evidence mismatch
  - `RG-HYGIENE-005` duplicate and overlap hygiene
  - `RG-ADVISORY-006` stronger document control
- Promotion from warned to blocking requires:
  - ADR + ATC baseline remains current
  - truth-critical guards are implemented
  - structure guards are implemented
  - false positive rate is below the agreed threshold
  - no unresolved fail findings persist for one full cycle
