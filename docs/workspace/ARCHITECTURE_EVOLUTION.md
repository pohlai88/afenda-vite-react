---
title: Architecture evolution
description: Operating guide for applying ADR-0002 trigger-based upgrade policy during architecture review.
status: active
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-governance
order: 180
---

# Architecture evolution

This document is the operating guide for [`ADR-0002: Trigger-based architecture upgrades`](./architecture/adr/ADR-0002-trigger-based-upgrades.md).
`ADR-0002` is the decision record.
This page explains how to apply that decision during review, planning, and later migration discussion.

Use this with:

- [Architecture](./ARCHITECTURE.md)
- [Project structure](./PROJECT_STRUCTURE.md)
- [Project configuration](./PROJECT_CONFIGURATION.md)
- [Testing](./TESTING.md)

## Decision anchor

The canonical decision is:

- [`docs/architecture/adr/ADR-0002-trigger-based-upgrades.md`](./architecture/adr/ADR-0002-trigger-based-upgrades.md)

Supporting related decisions:

- [`docs/architecture/adr/ADR-0001-core-web-architecture-baseline.md`](./architecture/adr/ADR-0001-core-web-architecture-baseline.md)

## Review rule

A major architecture change should move forward only when all are true:

1. The problem is observed, not hypothetical.
2. The impact is measurable.
3. The migration blast radius is bounded.
4. An owner and review cadence exist.

If any one of those is missing, the upgrade is not ready for implementation.
Record it as a deferred ADR candidate or keep it as a documented review note until the evidence becomes stronger.

## Operating categories

### Upgrade now

Use this when migration risk is low and governance value is high.

Typical examples:

- strengthening validation scripts,
- tightening repo-level guardrails,
- reducing duplicated boundary behavior with a bounded rollout.

### Document now, defer implementation

Use this when the improvement is plausible, but the migration surface is large or the current pain is not yet measurable enough.

Typical examples:

- router framework migration,
- broad folder-model rewrite,
- multi-package runtime replacement.

### Reject for now

Use this when the change adds complexity without solving a measured problem.

## Trigger examples

### Router migration

Escalate only when one or more signals persist across two review cycles:

- route or search-param defects recur,
- refactors repeatedly stall because route contracts are hard to change safely,
- teams spend measurable rework time fixing route drift.

### API boundary hardening

Escalate when:

- auth, retry, or error handling is duplicated across multiple features,
- inconsistent API-boundary behavior causes recurring UX or reliability defects,
- observability requires request metadata the current boundary cannot provide.

### Test-depth expansion

Escalate when:

- escaped regressions cluster around integration behavior,
- route and data-loading interactions cannot be covered well enough at the current test depth.

## Review checklist

When reviewing a major upgrade proposal, confirm that the ADR or proposal states:

- the observed problem,
- the measurable impact,
- the migration blast radius,
- the owner,
- the review date,
- the trigger metrics,
- the rollback or containment expectation.

If those are missing, the proposal is not ready to be treated as an active migration contract.

## ADR and ATC usage

- Use ADRs for narrative decisions and migration timing.
- Use ATCs only when the repo intends to bind doctrine to checks, evidence, and CI visibility.
- No ATC may claim `enforced` unless a real check command and evidence path exist.

## Operating cadence

- Review deferred architecture items at the regular architecture checkpoint.
- Re-open them earlier when incidents or repeated regressions show the current posture is failing.
- Keep owner and review date current; stale deferred items should not sit indefinitely as architectural folklore.
