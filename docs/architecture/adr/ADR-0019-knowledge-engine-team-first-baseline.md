---
title: ADR-0019 knowledge engine team-first baseline
description: Decision record for Afenda Omni Knowledge as a governed team knowledge engine, with team-first collaboration and lexical-first search before cited AI expansion.
status: active
owner: web-api-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 32
---

# ADR-0019: Knowledge engine team-first baseline

This document records a governed architecture decision for Afenda Omni Knowledge.

- **Decision status:** Accepted
- **Implementation status:** Phase 3 implemented (lexical+hybrid/s semantic retrieval, chunk indexing, plugin registry enforcement, intelligence KPIs, governance evidence+thresholds)
- **Enforcement status:** CI + knowledge GOV-KNOW-001 checks
- **Evidence status:** Present (governance + `rules/knowledge-intelligence/*`)
- **Date:** 2026-04-25
- **Owner:** Web API architecture
- **Review by:** 2026-07-25
- **Scope:** `apps/web/src/app/_features/knowledge/**`, `apps/api/src/modules/knowledge/**`, `packages/knowledge-*`, and tenant-aware knowledge persistence/search surfaces
- **Decision type:** Adopt now
- **Operational posture:** Active contract
- **Related governance domains:** GOV-ARCH-001, GOV-TRUTH-001, GOV-KNOW-001
- **Related ATCs:** ATC-0017
- **Supersedes:** None
- **Superseded by:** None

## Context

Afenda needs a knowledge product that captures operational truth with tenant ownership, auditability, and retrieval quality. The repo already has a strong ownership model (`apps/web`, `apps/api`, package boundaries, governance checks), so the fastest high-confidence path is team-governed knowledge first instead of a broad all-in-one workspace clone.

## Decision summary

1. Afenda adopts **team-first knowledge** as the MVP baseline.
2. Package/module naming uses `knowledge` (`@afenda/knowledge-*`) instead of generic notes naming.
3. MVP requires capture, workspace ownership, RBAC-ready API surfaces, and lexical search.
4. Semantic retrieval and cited AI are Phase 3 capabilities gated by reliability metrics.
5. Full E2EE workspace mode and CRDT real-time editing are deferred by trigger metrics.

## Scope and boundaries

- In scope:
  - `apps/api/src/modules/knowledge/**`
  - `apps/web/src/app/_features/knowledge/**`
  - `packages/knowledge-contracts`, `knowledge-domain`, `knowledge-search`, `knowledge-indexer`, `knowledge-ai`
- Out of scope:
  - Whiteboard/canvas, Notion-style database builder, public plugin marketplace
  - Full E2EE workspace mode in MVP
- Interfaces/contracts touched:
  - Hono API routes under `/api/v1/knowledge/*`
  - Shared package contracts under `@afenda/knowledge-contracts`

## Architecture contract

### Required

- `knowledge` surfaces must remain tenant-aware and auditable.
- API ownership for knowledge stays under `apps/api/src/modules/knowledge/**`.
- Lexical search quality is required before semantic/cited AI expansion.

### Forbidden

- Shipping MVP with broad whiteboard/task-suite scope creep.
- Adding semantic answer generation without citation surfaces.

## Trigger metrics (for revisit)

- Trigger 1: Repeated search dissatisfaction (p95 search response > 1.5s for 2 consecutive reviews).
- Trigger 2: Citation trust gap (less than 30% citation click-through for AI answers in pilot).
- Trigger 3: Collaboration conflict rates exceed agreed threshold and justify CRDT migration study.

## Validation plan

- Required checks:
  - `pnpm run script:check-architecture-contracts`
  - `pnpm run script:check-knowledge-intelligence-thresholds` (KPI policy vs `rules/knowledge-intelligence/kpi-baseline.json`)
  - `pnpm run script:generate-knowledge-intelligence-evidence` (evidence copy for `.artifacts/.../knowledge-intelligence.evidence.*`)
  - `pnpm --filter @afenda/api typecheck`
  - `pnpm --filter @afenda/web typecheck`
- Runtime/operational signals:
  - capture latency, lexical search success, tenant isolation incidents

## References

- [OpenAlternative note-taking and knowledge management category](https://openalternative.co/categories/productivity-utilities/note-taking-knowledge-management)
- `docs/ARCHITECTURE.md`
- `docs/ARCHITECTURE_EVOLUTION.md`
