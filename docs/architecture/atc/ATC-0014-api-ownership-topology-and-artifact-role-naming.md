---
title: ATC-0014 API ownership topology and artifact-role naming
description: Enforceable architecture contract for ownership-first API source topology, artifact-role filenames, and the repo-guard evidence path that proves drift is visible.
status: active
owner: web-api-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 22
---

# ATC-0014: API ownership topology and artifact-role naming

## Contract identity

- **Contract ID:** ATC-0014
- **Bound domain ID:** GOV-TRUTH-001
- **Owner:** Platform / API
- **Scope:** `apps/api/src` live topology and artifact-role naming
- **Decision anchor:** ADR-0008

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract binds the API app to ownership-first topology.
Top-level API folders must represent real owners.
Artifact function must be expressed by filename suffix rather than generic function-bucket directories.

## Implementation bindings

- In-scope paths:
  `apps/api/src`, `docs/architecture/governance/NAMING_CONVENTION.md`, `docs/architecture/governance/REPOSITORY_INTEGRITY_GUARD.md`, `scripts/repo-integrity/repo-guard-policy.ts`, `scripts/lib/api-ownership-topology-guard.ts`
- Bound code/config surfaces:
  `apps/api/src`, repo-guard policy and report surfaces, repo-guard waiver registry
- Explicitly out of scope:
  full API app folder cleanup, subject-level naming doctrine for every API module, and package-level topology outside `apps/api`

## Enforcement surfaces

- Static checks:
  `pnpm run script:check-repo-guard`
- Tests:
  `pnpm run script:test-repo-guard`
- CI gates:
  repo-guard evidence and governance aggregate review
- Runtime assertions:
  none

## Evidence

- **Evidence path:** `.artifacts/reports/governance/repo-integrity-guard.report.json`
- Required evidence artifacts:
  repo-guard JSON report, repo-guard Markdown report, governance aggregate report
- Validation cadence:
  every repo-guard run and every API topology review cycle

## Drift handling

- What counts as drift:
  API source files living under forbidden top-level function buckets such as `routes/`, `middleware/`, `lib/`, `utils/`, or `helpers/`
- How drift is recorded:
  `RG-STRUCT-004` findings in repo-guard evidence
- When drift blocks:
  this contract remains `partial` while repo-guard is still warn-first overall, but structural drift is recorded as an error-level native finding unless explicitly waived

## Linked commands

- **Check command:** `pnpm run script:check-repo-guard`
- **Report command:** `pnpm run repo:guard:report`

## Notes

- Folders encode ownership.
- Filenames encode artifact role.
- Shared API-wide artifacts may live at `apps/api/src` root only when they are explicitly prefixed with `api-*`.
- Generic top-level function buckets are forbidden in governed API surfaces even when they are temporarily still present in the live tree.
