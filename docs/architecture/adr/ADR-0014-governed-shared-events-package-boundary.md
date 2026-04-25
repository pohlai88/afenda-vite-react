---
title: ADR-0014 governed shared events package boundary
description: Decision record for introducing packages/events as Afenda's governed shared execution-linkage and versioned event-envelope package without transport or workflow runtime creep.
status: active
owner: web-api-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 29
---

# ADR-0014: Governed shared events package boundary

This document records a governed architecture decision.
Use it for package purpose, export scope, and boundary posture.

- **Decision status:** Accepted
- **Implementation status:** Active
- **Enforcement status:** Partial automation
- **Evidence status:** Partial
- **Date:** 2026-04-25
- **Owner:** Web API architecture
- **Review by:** 2026-06-25
- **Scope:** `packages/events`, `apps/api/src/workflow/**`, and consumers of shared event truth
- **Decision type:** Adopt now
- **Operational posture:** Binding package boundary
- **Related governance domains:** GOV-ARCH-001, GOV-TRUTH-001
- **Related ATCs:** ATC-0012
- **Supersedes:** None
- **Superseded by:** None

## Context

Afenda's current workflow extraction needs one promoted shared surface, but only one:

- execution linkage
- versioned event envelopes
- serialization, validation, and hashing helpers

The repo previously had no governed `packages/events` package at all. Without a package-level decision, the likely failure mode is predictable: transport concerns, brokers, domain payloads, or workflow engines creep into a package that should only carry truth-envelope primitives.

## Decision summary

1. `packages/events` is introduced as Afenda's governed shared event truth package.
2. Version 1 scope is intentionally narrow:
   `ExecutionLinkage`, `EventEnvelopeV1`, and serialization/hash/validation helpers only.
3. Domain payload definitions remain in the owning app or module.
4. Transport orchestration, brokers, outbox runners, and workflow/state-machine logic are explicitly excluded from the package.
5. `apps/api` must consume the package through its public export surface only.

## Delivery classification

### What is immediately true

- `packages/events` is now the approved package for execution linkage and versioned event-envelope primitives.
- The package is private, workspace-scoped, and governed.
- The package does not own ops-specific payload semantics.

### What is not yet true

- This ADR does not create an outbox, broker, queue runner, or event bus.
- This ADR does not authorize module payload schemas to move into the package.
- This ADR does not claim Afenda has a full enterprise event platform.

### How this ADR should be used

- Treat as **binding policy** for package scope, allowed exports, and forbidden runtime creep.
- Treat as **directional guidance** for future promotion of additional shared event primitives only after evidence exists.

## Scope and boundaries

- In scope:
  `packages/events/**`, `apps/api/src/workflow/**`, package consumers in `apps/api`
- Out of scope:
  transport runtime, outbox orchestration, broker connectors, partner event APIs, module-local payload schemas, and extension event contracts
- Interfaces/contracts touched:
  `ExecutionLinkage`, `EventEnvelopeV1`, package hashing/serialization helpers, package validation helpers

## Architecture contract

### Required

- `packages/events` must expose only public package exports.
- Event envelopes must be versioned.
- Shared execution linkage must stay consistent with the workflow truth spine.
- Consumers must import through `@afenda/events`, not package-relative source paths.

### Forbidden

- Domain payload registries in `packages/events`
- broker or transport adapters in `packages/events`
- workflow or state-machine orchestration in `packages/events`
- direct benchmark-code import into the package

### Allowed exceptions

- App-local workflow contracts may wrap or alias package types while extraction is still stabilizing.

## Alternatives considered

### Option A: keep event-envelope primitives app-local forever

- Pros:
  fewer package-level changes today
- Cons:
  keeps shared truth primitives duplicated or trapped inside one app

### Option B: create a broad event platform package immediately

- Pros:
  looks ambitious and future-ready
- Cons:
  invites scope creep before Afenda proves the shared surface

## Consequences

### Positive

- Afenda now has one governed shared package for event truth primitives.
- Workflow extraction can reuse a stable envelope/linkage surface without promoting ops behavior into a shared package.

### Negative

- The package is intentionally narrow, so some future event-related work still belongs elsewhere.

## Evidence and enforcement matrix

| Contract statement                           | Source of truth                          | Current evidence                                             | Enforcement mechanism     | Gap / follow-up                                       |
| -------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------ | ------------------------- | ----------------------------------------------------- |
| `packages/events` stays package-thin         | `packages/events/src/index.ts`           | package exports only linkage, envelope, and helper functions | package review + ATC-0012 | keep future additions inside the same narrow contract |
| Consumers import only public package exports | package manifest + imports in `apps/api` | `apps/api` depends on `@afenda/events`                       | repo guard + code review  | add stronger package boundary checks if needed        |
| Event envelope is versioned                  | `EventEnvelopeV1`                        | package export includes `version: "v1"`                      | unit tests + code review  | evolve through new versions, not hidden shape drift   |

## Implementation plan

### Completed now

- [x] Added `packages/events`
- [x] Added versioned event-envelope and linkage helpers
- [x] Added package unit tests

### Required follow-through

- [ ] Keep future additions inside the package-thin boundary
- [ ] Add stricter package-boundary enforcement if future drift appears

## Validation plan

- Required checks:
  `pnpm --filter @afenda/events typecheck`, `pnpm --filter @afenda/events test:run`, `pnpm --filter @afenda/api typecheck`
- Required manual QA:
  verify workflow outputs in `apps/api` still carry the same linkage into truth metadata and event envelopes

## References

- Related docs:
  [`ADR-0013`](./ADR-0013-gap-closure-sequencing-and-runtime-truth-convergence.md), [`ATC-0012`](../atc/ATC-0012-governed-shared-events-package-boundary.md)
