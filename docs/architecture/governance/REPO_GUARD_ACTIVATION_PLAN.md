---
title: Repo guard activation plan
description: Repo-specific activation blueprint for calibrating, hardening, and reviewing the Repository Integrity Guard before promotion from warned to blocking.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
relatedDomain: governance-registry
order: 15
---

# Repo guard activation plan

This document is the operationalization plan for the Repository Integrity Guard.

It bridges the gap between:

- architecture defined
- packs drafted
- guardrails implemented

and:

- repo-native policy calibration
- stable CI behavior
- explicit promotion review for `GOV-TRUTH-001`

## Current stage

The repository is past the architecture-invention phase.

Already landed:

- repo guard doctrine
- `ADR-0008`
- `ATC-0005`
- Repository Integrity Guard V1
- all major first-cut native guardrails
- shared waiver registry
- promotion-readiness evaluator and templates

The active phase is now:

> operationalization and calibration

## Phase 0 — Governance spine

Status: `complete`

Required base surfaces:

- [ADR-0008-repository-integrity-guard-architecture.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/adr/ADR-0008-repository-integrity-guard-architecture.md)
- [ATC-0005-repository-integrity-guard-baseline.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/atc/ATC-0005-repository-integrity-guard-baseline.md)
- [REPOSITORY_INTEGRITY_GUARD.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/governance/REPOSITORY_INTEGRITY_GUARD.md)
- [run-repo-guard.ts](/C:/NexusCanon/afenda-react-vite/scripts/repo-integrity/run-repo-guard.ts)
- [repo-guard-policy.ts](/C:/NexusCanon/afenda-react-vite/scripts/repo-integrity/repo-guard-policy.ts)

Bound operational surfaces:

- root package scripts
- `GOV-TRUTH-001` in [scripts/afenda.config.json](/C:/NexusCanon/afenda-react-vite/scripts/afenda.config.json)
- repo-guard evidence paths
- governance doctrine references

Exit condition:

- repo guard exists as a real governance domain, not loose code

## Phase 1 — Repo truth-map calibration

Status: `in progress`

Calibration source:

- [REPO_GUARD_REPO_MAP.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/governance/REPO_GUARD_REPO_MAP.md)

### 1A. Ownership map

Calibrate and review:

- root governance and tooling roots
- app-owned web roots
- shared web roots
- package roots and profiles
- package public surfaces vs internal surfaces
- generated roots
- doctrine roots
- evidence roots

Feeds:

- `RG-STRUCT-001`
- `RG-STRUCT-003`
- `RG-ADVISORY-006`

### 1B. Generation map

Calibrate and review:

- generator identity
- source surfaces
- output surfaces
- manifest path
- provenance or regeneration contract

Current high-value generator families already identified:

- docs/readme generation
- governance aggregate and register generation
- repo-guard report generation
- web i18n corpus and audit generation
- design-system icon generation
- design-system component-governance generation
- Better Auth schema generation
- database inventory, glossary snapshot, and Drizzle generation

Feeds:

- `RG-TRUTH-002`
- `RG-TRUTH-004`
- duplicate generator detection follow-through

### 1C. Import map

Calibrate and review:

- `@/*`
- `@afenda/*`
- package public entrypoints
- forbidden deep-import rules

Feeds:

- `RG-STRUCT-003`

### 1D. Governance and evidence map

Calibrate and review:

- doctrine docs
- ADR and ATC docs
- config roots
- evidence outputs
- generated discovery surfaces

Feeds:

- `RG-TRUTH-004`
- `RG-ADVISORY-006`
- promotion-readiness review

Exit condition:

- repo-guard policy stops being generic and reflects the actual repo map

Current calibration progress:

- owner-root policy is now broader than the initial marketing-only rollout
- major app/package families are represented in static ownership scopes
- generator truth map is seeded with real repo-global, app-local, and package-local generators
- remaining work is tighter package-internal boundary rules and wider provenance bindings

## Phase 2 — Guard activation and tightening

Status: `implemented as first cuts; tightening required`

Activation order:

1. `RG-STRUCT-001` placement and ownership
2. `RG-TRUTH-002` generated artifact authenticity
3. `RG-STRUCT-003` boundary and import regression
4. `RG-TRUTH-004` source and evidence mismatch
5. `RG-HYGIENE-005` duplicate and overlap
6. `RG-ADVISORY-006` stronger document control

Current rule:

- keep high-confidence fail behavior only where the repo map is strong enough to justify it
- use warnings where advisory interpretation is still expected

Exit condition:

- each implemented guard is calibrated against the repo map and produces acceptable findings quality

## Phase 3 — Waiver hardening

Status: `complete for baseline; review remains continuous`

Current waiver surface:

- [repo-guard-waivers.json](/C:/NexusCanon/afenda-react-vite/rules/repo-integrity/repo-guard-waivers.json)

Required posture:

- no inline/local waiver arrays for native repo-guard findings
- expired waivers never apply
- soon-to-expire waivers are surfaced in human and markdown output
- waiver usage remains explicit and reviewable

Exit condition:

- exceptions are bounded, explicit, and auditable

## Phase 4 — Warned calibration cycle

Status: `not complete`

This phase must happen before promotion.

For each live finding, classify it as:

- true positive
- false positive
- expected temporary exception
- policy gap
- missing manifest/config/doctrine input
- waiver candidate

Tracking surfaces:

- [REPO_GUARD_FALSE_POSITIVE_LOG.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/governance/REPO_GUARD_FALSE_POSITIVE_LOG.md)
- repo-guard evidence outputs
- promotion-readiness report outputs

Rule:

- do not promote from warned to blocking without at least one stable review cycle

Exit condition:

- false-positive behavior is understood and bounded

## Phase 5 — Policy tightening

Status: `not complete`

Tighten:

- owner-root rules
- alias resolution
- package entrypoint rules
- generator manifests
- doctrine/evidence bindings

Use this decision rule:

- policy problem -> change policy
- temporary real exception -> add waiver
- architecture drift -> fix the repo

Exit condition:

- policy is repo-native enough that waivers are exceptional rather than compensating for weak rules

## Phase 6 — Promotion review

Status: `started, not ready`

Required artifacts:

- [REPO_GUARD_PROMOTION_REVIEW_TEMPLATE.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/governance/REPO_GUARD_PROMOTION_REVIEW_TEMPLATE.md)
- [REPO_GUARD_PROMOTION_SCORECARD_TEMPLATE.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/governance/REPO_GUARD_PROMOTION_SCORECARD_TEMPLATE.md)
- [REPO_GUARD_PROMOTION_DECISION_TEMPLATE.md](/C:/NexusCanon/afenda-react-vite/docs/architecture/governance/REPO_GUARD_PROMOTION_DECISION_TEMPLATE.md)
- [repo-guard-promotion-readiness.report.json](/C:/NexusCanon/afenda-react-vite/.artifacts/reports/governance/repo-guard-promotion-readiness.report.json)
- [repo-guard-promotion-readiness.report.md](/C:/NexusCanon/afenda-react-vite/.artifacts/reports/governance/repo-guard-promotion-readiness.report.md)

Promotion gate:

- ADR exists and is current
- ATC exists and is current
- required guardrails exist
- shared waiver registry exists and is reviewed
- false positives are acceptable
- a stable warned cycle is complete
- no unresolved fail findings remain for the promotion window

Exit condition:

- promotion decision can be made from evidence instead of intuition

## Immediate next actions

1. Convert the current generator truth map into explicit provenance/manifests where the repo already has durable generator entrypoints.
2. Tighten package public-vs-internal boundary rules from export lists into enforceable import policy.
3. Clear the live advisory backlog from older ADR linkage markers.
4. Run and record one real warned-cycle review in the false-positive log.
5. Re-run promotion readiness after the current working-tree legitimacy blocker is cleared.
