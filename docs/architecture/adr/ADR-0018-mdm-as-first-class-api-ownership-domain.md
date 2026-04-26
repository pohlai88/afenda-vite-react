---
title: ADR-0018 mdm as first-class api ownership domain
description: Decision record for making MDM a first-class API ownership domain, with canonical counterparty writes under /api/v1/mdm and operations limited to projections.
status: active
owner: web-api-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 31
---

# ADR-0018: MDM as first-class API ownership domain

This document records a governed architecture decision.
Use it for API ownership placement, master-data write boundaries, and projection separation.

- **Decision status:** Accepted
- **Implementation status:** Active
- **Enforcement status:** Partial automation
- **Evidence status:** Partial
- **Date:** 2026-04-25
- **Owner:** Web API architecture
- **Review by:** 2026-06-25
- **Scope:** `apps/api/src/modules/mdm/**`, `apps/api/src/modules/operations/**`, `packages/_database/src/schema/mdm/**`, and web consumers of counterparty surfaces
- **Decision type:** Adopt now
- **Operational posture:** Binding ownership boundary
- **Related governance domains:** GOV-ARCH-001, GOV-TRUTH-001
- **Related ATCs:** ATC-0016
- **Supersedes:** None
- **Superseded by:** None

## Context

Afenda already has a physical MDM persistence spine under `packages/_database/src/schema/mdm/**`, but the live API surface did not yet expose MDM as its own ownership domain.

At the same time:

- the web ERP catalog exposes `counterparties` as a first-class module
- the operations slice exposes `/api/v1/ops/counterparties`
- the operations projection explicitly states that counterparties are an anti-corruption outward view rather than the canonical business-entity ownership root

That leaves a development/runtime mismatch:

- developers see a domain-sounding shell module
- the live API still serves it from operations
- the canonical master-data write path is not visible as its own ownership surface

## Decision summary

1. Afenda will treat **MDM** as a first-class API ownership domain under `apps/api/src/modules/mdm/**`.
2. Canonical master-data writes for counterparties, items, locations, aliases, and external identities belong to MDM, not operations.
3. `/api/v1/mdm/*` is the canonical API root for master-data ownership surfaces.
4. `/api/v1/ops/*` may expose operational projections and feeds derived from MDM and truth records, but it must not own master-data writes.
5. The first implemented slice is `counterparties`.

## Decision rule

Use this line across API and web topology:

- If the data defines a business entity, it belongs to MDM.
- If the data explains operational activity, it belongs to Operations.

## Architecture contract

### Required

- `packages/_database` remains the persisted truth layer for MDM tables.
- `apps/api/src/modules/mdm/**` is the canonical API ownership root for MDM business entities.
- Web and API consumers must distinguish canonical MDM surfaces from ops projections.
- The first MDM slice must establish `counterparties` as canonical read/write ownership under `/api/v1/mdm/counterparties`.

### Forbidden

- master-data writes under `apps/api/src/modules/operations/**`
- treating ops projections as canonical entity ownership
- flattening party/customer/supplier/item/location ownership into generic function buckets
- routing canonical MDM semantics through `/api/v1/ops/*`

### Allowed exceptions

- operations may continue to expose projection-only counterparty feeds while canonical MDM surfaces are being introduced
- read-only anti-corruption mappings may remain temporarily in operations until matching MDM-backed projections exist

## Consequences

### Positive

- API ownership now matches ERP semantics more closely
- counterparties have a canonical business boundary instead of being implied through operations
- the web catalog can align permission and ownership language with the live API

### Negative

- Afenda now carries two visibly different counterparty surfaces: canonical MDM and operational projection
- follow-on work is needed to move more entity families into MDM without widening too early

## Implementation plan

### Completed now

- [x] Added `apps/api/src/modules/mdm/**`
- [x] Added canonical `/api/v1/mdm/counterparties` routes
- [x] Marked ops counterparty surface as projection-oriented rather than canonical
- [x] Aligned the enabled web counterparty module permission to MDM ownership

### Required follow-through

- [ ] Add items as the second MDM slice only after the counterparty boundary is stable
- [ ] Add locations, aliases, and external identities under MDM as owned surfaces
- [ ] Replace baseline in-memory MDM repositories with Drizzle-backed persistence against `packages/_database`
- [ ] Add stronger automated boundary checks if operations begins to drift back into MDM write ownership

## Validation plan

- Required checks:
  `pnpm --filter @afenda/api typecheck`, `pnpm --filter @afenda/api test:run`, `pnpm run script:generate-api-route-surface`, `pnpm run script:generate-docs-readme`
- Required manual QA:
  verify `/api/v1/mdm/counterparties` behaves as canonical MDM, `/api/v1/ops/counterparties` remains projection-only, and the web catalog permission model stays aligned

## References

- Related docs:
  [`docs/API.md`](../../API.md), [`ADR-0013`](./ADR-0013-gap-closure-sequencing-and-runtime-truth-convergence.md), [`ATC-0016`](../atc/ATC-0016-mdm-api-ownership-boundary.md)
