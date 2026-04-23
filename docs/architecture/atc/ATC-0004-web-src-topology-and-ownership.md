---
title: ATC-0004 web src topology and ownership
description: Enforceable contract for the governed apps/web src topology and the evidence path that keeps its status visible.
status: active
owner: web-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 20
---

# ATC-0004: Web `src` topology and ownership

## Contract identity

- **Contract ID:** ATC-0004
- **Bound domain ID:** GOV-FS-002
- **Owner:** Platform / web
- **Scope:** `apps/web/src` topology and ownership vocabulary
- **Decision anchor:** ADR-0004

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract binds the governed `apps/web/src` topology to named checks and evidence so the repo can prove that the current root ownership model is real rather than purely narrative.

## Implementation bindings

- In-scope paths:
  `apps/web/src`, `scripts/afenda.config.json`, `docs/PROJECT_STRUCTURE.md`, `docs/architecture/adr/ADR-0004-web-src-architecture-rpc-runtime-features.md`
- Bound code/config surfaces:
  `apps/web/src/app/_features`, `apps/web/src/app/_platform`, `apps/web/src/marketing`, `apps/web/src/rpc`, `apps/web/src/share`
- Explicitly out of scope:
  deeper route-level or component-level rules not yet promoted into dedicated checks

## Enforcement surfaces

- Static checks:
  `pnpm run script:check-afenda-config`
- Tests:
  companion governance and topology tests where present
- CI gates:
  governance checks and governance evidence completeness
- Runtime assertions:
  deferred for later waves

## Evidence

- **Evidence path:** `.artifacts/reports/governance/workspace-topology.report.json`
- Required evidence artifacts:
  workspace-topology domain report, aggregate governance report, generated governance register
- Validation cadence:
  every governance run and every topology review cycle

## Drift handling

- What counts as drift:
  new ungoverned root buckets, revived legacy ownership vocabulary, or topology docs that no longer describe the live tree
- How drift is recorded:
  workspace-topology evidence and companion docs review
- When drift blocks:
  the bound governance domain blocks in CI, but this ATC remains `partial` while companion-doc and sub-boundary enforcement is still being matured

## Linked commands

- **Check command:** `pnpm run script:check-afenda-config`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- This contract is intentionally `partial` and `warned` even though its bound domain is stronger.
- No ATC may claim `enforced` unless a real check command and evidence path exist.
