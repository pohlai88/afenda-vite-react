---
title: ATC template
description: Reusable template for enforceable architecture truth contracts that bind checks and evidence to architecture doctrine.
status: template
owner: web-architecture
truthStatus: supporting
docClass: supporting-doc
relatedDomain: architecture-contract
order: 999
---

# ATC-XXXX: [Contract title]

## Contract identity

- **Contract ID:** ATC-XXXX
- **Bound domain ID:** GOV-XXXX-XXXX
- **Owner:** [team or role]
- **Scope:** [repo-wide | app/package-specific | bounded subsystem]
- **Decision anchor:** [ADR-XXXX or equivalent]

## Lifecycle and enforcement

- **Lifecycle status:** watcher | bound | partial | enforced | drifted | retired
- **Enforcement maturity:** defined | measured | warned | blocking | runtime-enforced

## Intent

Describe the architecture truth this contract is supposed to keep real.

## Implementation bindings

- In-scope paths:
- Bound code/config surfaces:
- Explicitly out of scope:

## Enforcement surfaces

- Static checks:
- Tests:
- CI gates:
- Runtime assertions:

## Evidence

- **Evidence path:** `.artifacts/reports/governance/[domain].report.json`
- Required evidence artifacts:
- Validation cadence:

## Drift handling

- What counts as drift:
- How drift is recorded:
- When drift blocks:

## Linked commands

- **Check command:** `pnpm run [script-name]`
- **Report command:** `pnpm run [script-name]`

## Notes

- No ATC may claim `enforced` unless a real check command and evidence path exist.
- Use ADRs for narrative decision context; use ATCs for enforceable operating contracts.
