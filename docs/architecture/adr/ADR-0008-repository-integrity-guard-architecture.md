---
title: ADR-0008 repository integrity guard architecture
description: Decision record for the repository-truth guardrail layer, its aggregate-first design, warn-first rollout, and self-managed evidence model.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 18
---

# ADR-0008: Repository integrity guard architecture

- **Decision status:** Accepted
- **Implementation status:** Substantially implemented
- **Enforcement status:** Partial automation
- **Evidence status:** Current
- **Date:** 2026-04-23
- **Owner:** Governance toolchain
- **Review by:** 2026-07-23
- **Scope:** Repo-wide repository-truth guardrail layer
- **Decision type:** Adopt now
- **Operational posture:** Active contract
- **Related governance domains:** GOV-TRUTH-001, GOV-DOC-001
- **Related ATCs:** ATC-0005

## Context

Afenda already had multiple governance surfaces that proved individual parts of repository legitimacy:

- filesystem governance
- generated artifact governance
- storage governance
- naming convention enforcement
- documentation governance
- workspace/package topology
- file survival and reviewed survival

That was strong at domain truth, but weak at operator-level repo legitimacy because contributors still needed to infer whether the repository was trustworthy as a whole.

The repo needed one first-class repo-truth layer that could answer:

- Is the repository structurally clean?
- Are policy surfaces drifting from each other?
- Is the working tree legitimate enough to trust?
- Are repo-truth checks still coherent as one system rather than only as scattered scripts?

The architecture also needed to avoid two failure modes:

- rewriting existing governance logic into a second parallel implementation
- promoting a broad, high-confidence repo guard to blocking before the rule set was mature enough

This ADR creates that architecture contract.

## Decision summary

1. The repository truth layer is implemented as a **Repository Integrity Guard** that aggregates existing governance evaluators first and adds only a small number of native repo-hygiene scanners.
2. V1 remains **warn-first** through `GOV-TRUTH-001` rather than entering the blocking root `check` chain immediately.
3. The guard writes **self-managed evidence** at its own evidence path, but that evidence must remain readable by the existing governance control plane through a nested governance-domain projection.
4. Native scanners in V1 stay intentionally small: dirty-file scan and working-tree legitimacy only.
5. Deeper guardrails such as placement/ownership, generated-authenticity, and boundary regression are follow-on architecture work, not hidden V1 promises.

## Delivery classification

### What is immediately true

- The Repository Integrity Guard exists as a first-class governance surface.
- The guard is aggregate-first rather than a replacement for existing governance domains.
- The guard emits its own JSON and Markdown evidence.
- The guard is warn-first through `GOV-TRUTH-001`.

### What is not yet true

- This ADR does not claim repository guard coverage is complete.
- This ADR does not claim `GOV-TRUTH-001` is blocking in CI.
- This ADR does not claim advanced placement, boundary, or generated-authenticity guards are already implemented.

### How this ADR should be used

- Treat as **binding policy** for how the repo-truth layer is structured and how V1 is interpreted.
- Treat as **directional guidance** for the next guardrail waves defined in the repo guardrail program.
- Do **not** use this ADR as proof that the repository-truth layer is already feature-complete.

## Scope and boundaries

- In scope:
  repository-truth orchestration, aggregate-first design, warn-first rollout posture, evidence architecture, and native scanner scope for V1.
- Out of scope:
  the complete future guardrail catalog, package-specific architecture rules, and broader CI promotion beyond the repo-truth layer.
- Affected repos/apps/packages:
  repo root governance surfaces, `scripts/`, `docs/architecture/governance/`, and all currently aggregated governance evaluators.
- Interfaces/contracts touched:
  `repo:guard`, `repo:guard:ci`, `repo:guard:report`, `script:check-repo-guard`, `.artifacts/reports/governance/repo-integrity-guard.*`, and governance evidence loading.

## Architecture contract

### Required

- The Repository Integrity Guard must reuse existing governance evaluators through adapters where those evaluators already exist.
- The guard must stay deterministic, explainable, and machine-readable.
- The guard must emit self-managed evidence that the governance control plane can still load as a standard domain report.
- V1 must remain warn-first until the promotion criteria in the companion contract are satisfied.

### Forbidden

- Re-implementing existing domain logic as parallel repo-guard logic without a clear need.
- Promoting `GOV-TRUTH-001` to blocking before the agreed follow-on guardrails and promotion gates exist.
- Treating V1 as if it already guarantees full repository coverage.

### Allowed exceptions

- Small native scanners are allowed when the capability does not already exist in another governance surface.
- Temporary policy exclusions and waivers are allowed when explicitly declared and reviewed; they must not become silent permanent drift.

## Alternatives considered

### Option A: Keep scattered scripts only

- Pros:
  no new orchestration layer, less initial code movement
- Cons:
  no single repo-truth verdict, weak operator readability, no unified evidence surface

### Option B: Rewrite all governance checks inside one new repo-guard engine

- Pros:
  one implementation surface, potentially uniform reporting
- Cons:
  duplicates logic, increases drift risk, weakens domain ownership, and creates a larger migration blast radius

### Option C: Aggregate existing evaluators first, then add thin native scanners

- Pros:
  preserves existing ownership, reduces duplication, enables a single repo-truth verdict, and keeps rollout incremental
- Cons:
  requires adapter mapping and a richer evidence-loading model

## Consequences

### Positive

- The repo now has a single repo-truth command surface.
- Operator readability improves because multiple governance results are summarized together.
- Existing governance domains keep ownership of their own logic.
- The control plane remains coherent because self-managed evidence is still governance-readable.

### Negative

- The guard introduces another governance surface to maintain.
- Warn-first rollout means some contributors may overread “implemented” as “complete” unless ADR/ATC language stays explicit.
- Coverage reporting and deeper guardrails are still follow-on work.

## Evidence and enforcement matrix

| Contract statement                               | Source of truth                                                | Current evidence                                                              | Enforcement mechanism                                     | Gap / follow-up                                                |
| ------------------------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| Repository truth is aggregate-first              | `scripts/lib/repo-guard.ts`, this ADR                          | adapter checks for filesystem/generated/storage/naming/docs/topology/survival | `repo:guard`, `script:check-repo-guard`                   | placement, boundary, and authenticity guardrails still missing |
| V1 is warn-first                                 | `scripts/afenda.config.json`, this ADR                         | `GOV-TRUTH-001` in governance register and evidence                           | governance domain with `ciBehavior: warn`                 | promotion gate still needs ADR/ATC-backed follow-through       |
| Evidence is self-managed but governance-readable | `scripts/lib/repo-guard.ts`, `scripts/lib/governance-spine.ts` | repo-guard evidence JSON with nested governance-domain projection             | governance report loading and aggregate report generation | continue hardening self-managed evidence behavior over time    |
| Native scanners stay intentionally small in V1   | `scripts/lib/repo-guard.ts`, this ADR                          | dirty-file and working-tree scanners only                                     | code review plus repo-guard tests                         | future guardrails still need explicit implementation waves     |

## Implementation plan

### Completed now

- Repository Integrity Guard V1 exists.
- Guard commands and evidence outputs exist.
- `GOV-TRUTH-001` is registered as warn-first.
- Governance loading supports self-managed evidence wrappers.

### Required follow-through

- [ ] Write and maintain the companion ATC baseline for the repo-truth layer — governance-toolchain — immediate
- [ ] Implement placement / ownership guard as the next structure-focused follow-up — governance-toolchain — next guardrail wave
- [ ] Implement generated artifact authenticity guard as the next truth-critical follow-up — governance-toolchain — next guardrail wave
- [ ] Add explicit coverage reporting so the guard can state what remains uncovered — governance-toolchain — after ADR/ATC baseline lands

### Exit criteria for “implemented”

- [ ] The repo-truth layer has a stable ADR + ATC pair
- [ ] The guard command surface and evidence paths remain stable
- [ ] The next guardrail waves are tracked through explicit contracts rather than implied future work

## Validation plan

- Required checks:
  `pnpm run repo:guard`, `pnpm run repo:guard:ci`, `pnpm run script:check-governance`
- Required manual QA:
  confirm the repo guard reads as a repo-truth layer rather than another isolated maintenance script
- Runtime/operational signals to watch:
  false positives in working-tree legitimacy, confusion over warn-first semantics, and evidence-loader drift
- How success will be measured after rollout:
  contributors can answer repo-legitimacy questions from one command and one doctrine/contract pair

## Trigger metrics (for revisit, escalation, or migration)

Re-open this ADR if one or more persist across two review cycles:

- repo guard warnings are ignored because the scope is still too advisory
- false positives remain high enough to undermine trust
- contributors repeatedly ask for missing placement, generated-authenticity, or boundary checks
- the self-managed evidence path creates repeated control-plane friction

## Rollout and rollback / containment

### Rollout plan

- Land ADR + ATC baseline for the repo-truth layer.
- Keep `GOV-TRUTH-001` warned while missing guardrails are implemented.
- Promote only after the explicit promotion gate is satisfied.

### Rollback/containment plan

- If repo-guard behavior becomes too noisy, keep the architecture but narrow native scanners and revert the affected rule set.
- Do not remove the aggregate-first architecture unless a replacement preserves existing domain ownership and evidence readability.

## References

- [ATC-0005 repository integrity guard baseline](../atc/ATC-0005-repository-integrity-guard-baseline.md)
- [Repository integrity guard](../governance/REPOSITORY_INTEGRITY_GUARD.md)
- [Repo guardrail todo](../governance/REPO_GUARDRAIL_TODO.md)
- [Governance constitution](../governance/GOVERNANCE_CONSTITUTION.md)
