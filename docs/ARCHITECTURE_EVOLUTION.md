---
title: Architecture evolution
description: Decision policy for when to upgrade architecture now vs later, with measurable triggers and ownership.
order: 180
status: active
---

# Architecture evolution (upgrade policy)

This document prevents architecture "blackholes" as Afenda scales.
It defines when to:

- **upgrade now** (low-risk, high-leverage changes),
- **document now and defer implementation** (high-impact migrations),
- or **reject a change** for the current phase.

Use this with:

- [Architecture](./ARCHITECTURE.md)
- [Project structure](./PROJECT_STRUCTURE.md)
- [Project configuration](./PROJECT_CONFIGURATION.md)
- [Testing](./TESTING.md)

---

## 1. Decision rule: "possible" is not enough

A change being technically possible is not sufficient.
Upgrade now only when all are true:

1. **Problem is observed**, not hypothetical.
2. **Impact is measurable** (defect rate, lead time, incident count, regression cost).
3. **Migration blast radius is bounded** (rollback path, staged rollout).
4. **Owner and timeline exist** (not "someone later").

If any item is missing, capture as an ADR candidate and review at the next architecture checkpoint.

---

## 2. Upgrade categories

### A. Upgrade now (default if low risk)

Changes with low migration risk and high governance value.

Examples:

- Strengthening config guards and validation scripts.
- Standardizing HTTP error normalization behind one client boundary.
- Expanding test utilities and API mocking incrementally.
- Documentation and automation policy hardening.

### B. Document now, defer implementation

Changes with large migration surface and uncertain near-term ROI.

Examples:

- Router framework migration.
- Full application folder model rewrite.
- Multi-library replacement across many features.

For these, produce an ADR with triggers and reevaluation date.

### C. Reject for now

Changes that add complexity without solving a measured problem.

---

## 3. Trigger-based migration model

Major upgrades are approved only when trigger thresholds are met.

### Router migration trigger (example)

Open migration planning only when at least one is true for two consecutive iterations:

- Route/search-param typing causes recurring production defects.
- Refactors repeatedly stall due to route coupling and unsafe navigation changes.
- Team spends significant rework time on route contract drift.

### API layer hardening trigger (example)

Upgrade now when:

- Inconsistent HTTP error handling causes repeated UX defects.
- Auth/header/retry behavior is duplicated across multiple modules.
- Observability needs request metadata that is unavailable in the current boundary.

### Test pyramid expansion trigger (example)

Expand MSW/integration coverage when:

- Escaped regressions cluster around API contract behavior.
- Route + data-loading interactions are hard to validate with unit tests alone.

---

## 4. Mandatory ADR fields for deferred upgrades

Every deferred architecture item must specify:

- **Context** (current constraint and pain).
- **Decision** (chosen status: adopt/defer/reject).
- **Consequences** (benefits, cost, risks).
- **Trigger metrics** (objective conditions to revisit).
- **Owner** and **review date**.

No deferred item is valid without owner and review date.

---

## 5. Operating cadence

- **Quarterly architecture review** for all open ADRs.
- **Release-train checkpoint**: reassess triggered items before major feature waves.
- **Incident-driven reassessment**: reopen ADR when incidents expose architectural gaps.

---

## 6. Current baseline decisions

As of this document:

- Keep current React Router approach unless router trigger metrics are met.
- Continue incremental hardening of automation, docs, and config governance.
- Expand testing depth by measured risk, not by stack-completeness goals.
- Keep client/server separation explicit (SPA consumes APIs; DB concerns stay server-side).

Related ADRs:

- [`docs/decisions/ADR-0001-core-web-architecture-baseline.md`](./decisions/ADR-0001-core-web-architecture-baseline.md)
- [`docs/decisions/ADR-0002-trigger-based-upgrades.md`](./decisions/ADR-0002-trigger-based-upgrades.md)
