---
title: ATC-0017 knowledge ownership and retrieval quality contract
description: Enforceable architecture contract for knowledge ownership boundaries, lexical-first retrieval quality gates, and governed progression to cited AI.
status: active
owner: web-api-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 32
---

# ATC-0017: Knowledge ownership and retrieval quality contract

## Contract identity

- **Contract ID:** ATC-0017
- **Bound domain ID:** GOV-ARCH-001
- **Bound domain IDs:** GOV-ARCH-001, GOV-KNOW-001
- **Owner:** Web API architecture
- **Scope:** `apps/api/src/modules/knowledge/**`, `apps/web/src/app/_features/knowledge/**`, and `packages/knowledge-*`
- **Decision anchor:** ADR-0019

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Lifecycle status detail:** retrieval/Phase 3 slice implemented with enforced GOV-KNOW-001 checks while the bound architecture domain remains warned.
- **Enforcement maturity:** warned

## Intent

Keep Afenda Omni Knowledge as a governed team knowledge engine with strict ownership boundaries, lexical-first quality, and citation-gated AI progression.

## Implementation bindings

- In-scope paths:
  - `apps/api/src/modules/knowledge/**`
  - `apps/web/src/app/_features/knowledge/**`
  - `packages/knowledge-*`
- Bound code/config surfaces:
  - `/api/v1/knowledge/*` routes
  - `@afenda/knowledge-contracts` schemas
  - lexical search implementation in `@afenda/knowledge-search`
- Explicitly out of scope:
  - whiteboard/canvas and CRDT-first collaboration runtime

## Enforcement surfaces

- Static checks:
  - `pnpm run script:check-architecture-contracts`
  - `pnpm run script:check-knowledge-intelligence-thresholds` (ATC-0017 KPI policy)
  - `pnpm run script:check-governance` (includes `script:run-governance-checks` and GOV-KNOW-001)
  - `pnpm --filter @afenda/api typecheck`
  - `pnpm --filter @afenda/web typecheck`
- Tests:
  - `apps/api/src/modules/knowledge/__tests__/knowledge.routes.test.ts` (success + 403/409 paths)
- CI gates:
  - quality job running lint/typecheck/test/build
  - knowledge intelligence governance domain in registered checks
- Runtime assertions:
  - tenant scope required for knowledge capture and retrieval

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- **Architecture evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json` (produced with governance suite)
- **Intelligence / retrieval evidence:** `.artifacts/reports/governance/knowledge-intelligence.report.json` (GOV-KNOW-001) plus `knowledge-intelligence.evidence.json` / `.md` from `pnpm run script:generate-knowledge-intelligence-evidence`
- **Policy baselines (committed):** `rules/knowledge-intelligence/kpi-thresholds.json`, `rules/knowledge-intelligence/kpi-baseline.json`
- Required evidence artifacts:
  - API route surface report
  - architecture contract report findings
  - knowledge intelligence baseline vs threshold attestation
- Validation cadence:
  - every knowledge API or package boundary change

## Drift handling

- What counts as drift:
  - knowledge logic bypassing `apps/api` ownership
  - semantic AI surfaces added without citation outputs
  - unbounded scope growth into unrelated PM/whiteboard suite features
- How drift is recorded:
  - architecture contract checks and route-surface diffs
- When drift blocks:
  - before promoting knowledge features as GA

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts` and `pnpm run script:check-knowledge-intelligence-thresholds`
- **Report command:** `pnpm run script:generate-governance-report` and `pnpm run script:generate-knowledge-intelligence-evidence`
