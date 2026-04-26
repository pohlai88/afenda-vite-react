---
title: ATC-0016 mdm api ownership boundary
description: Enforceable architecture contract for MDM as a first-class API ownership domain, with canonical master-data writes under /api/v1/mdm and operations constrained to projection surfaces.
status: active
owner: web-api-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 31
---

# ATC-0016: MDM API ownership boundary

## Contract identity

- **Contract ID:** ATC-0016
- **Bound domain ID:** GOV-ARCH-001
- **Owner:** Web API architecture
- **Scope:** `apps/api/src/modules/mdm/**`, `apps/api/src/modules/operations/**`, `docs/API.md`, and web consumers of counterparty module ownership
- **Decision anchor:** ADR-0018

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Intent

This contract keeps canonical master-data ownership under MDM while allowing operations to expose projection feeds without reclaiming business-entity writes.

## Implementation bindings

- In-scope paths:
  `apps/api/src/modules/mdm/**`, `apps/api/src/modules/operations/**`, `apps/api/src/app.ts`, `apps/web/src/app/_platform/erp-catalog/**`, `docs/API.md`
- Bound surfaces:
  `/api/v1/mdm/*`, `/api/v1/ops/*`, enabled web `counterparties` module metadata, and MDM counterparty service/repository seams
- Explicitly out of scope:
  direct database DDL changes, item/location follow-on slices, and event/broker propagation

## MDM-BOUNDARY-001

Rules:

- operations must not own master-data writes
- counterparty, item, location, alias, and external-identity writes must go through MDM ownership surfaces
- ops projections may read MDM-derived truth and projections
- the web counterparties module must declare whether it points at MDM ownership or ops projection

## Enforcement surfaces

- Static checks:
  `pnpm --filter @afenda/api typecheck`, `pnpm --filter @afenda/web typecheck`, `pnpm run script:check-architecture-contracts`
- Tests:
  `apps/api/src/__tests__/app.test.ts`, `apps/api/src/modules/mdm/**/*.test.ts`
- Generated evidence:
  `docs/architecture/governance/generated/api-route-surface.md`, `.artifacts/reports/governance/api-route-surface.report.json`
- CI gates:
  architecture contract review, API route surface generation, app-surface parity, and targeted API/web validation
- Manual review:
  verify that new master-data APIs mount under `/api/v1/mdm/*` and that ops descriptions remain projection-oriented
- Runtime assertions:
  route mount segregation between `/api/v1/mdm/*` and `/api/v1/ops/*`, plus permission-gated MDM handlers

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  architecture contract report, generated API route surface report, generated API route surface markdown, API integration test output, and shell metadata validation output
- Validation cadence:
  every API ownership change and every governance review cycle

## Drift handling

- What counts as drift:
  canonical master-data writes added under operations, web permissions still pointing counterparties at ops ownership, or API docs presenting ops projections as MDM truth
- How drift is recorded:
  architecture-contract findings, API route surface diff, app tests, and code review
- When drift blocks:
  drift should block promotion of further MDM slices until ownership is corrected

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- Initial slice:
  `counterparties`
- Follow-on slices:
  `items`, `locations`, `aliases`, `external-identities`
