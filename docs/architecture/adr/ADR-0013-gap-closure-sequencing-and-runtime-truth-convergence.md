---
title: ADR-0013 gap-closure sequencing and runtime truth convergence
description: Decision record for closing Afenda's highest-risk execution gaps in a fixed order: typed web runtime, live API truth, reusable ERP workflow utilities, a governed events package, and extension doctrine.
status: active
owner: web-api-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 28
---

# ADR-0013: Gap-closure sequencing and runtime truth convergence

This document records a governed architecture decision.
Use it for narrative decision context, implementation posture, and evidence expectations.

- **Decision status:** Accepted
- **Implementation status:** Partial
- **Enforcement status:** Partial automation
- **Evidence status:** Partial
- **Date:** 2026-04-25
- **Owner:** Web API architecture
- **Review by:** 2026-06-25
- **Scope:** Repo-wide
- **Decision type:** Adopt now
- **Operational posture:** Transitional contract
- **Related governance domains:** GOV-ARCH-001, GOV-DOC-001
- **Related ATCs:** ATC-0011
- **Supersedes:** None
- **Superseded by:** None

## Context

Afenda now has a clearer picture of its real implementation gaps:

- [`apps/web/src/rpc/web-client.ts`](../../../apps/web/src/rpc/web-client.ts) still exports `api` and `createApiClient()` as `any`, which hides RPC breakage at compile time.
- [`docs/API.md`](../../API.md) still describes a tenant-scoped `/api/tenants/{tenant}/...` contract and a Fastify/Express-style implementation model, while the live API is a Hono app mounted in [`apps/api/src/app.ts`](../../../apps/api/src/app.ts) with `/api/v1/me`, `/api/v1/commands`, `/api/v1/ops`, and `/api/users`.
- The best current workflow, state, and truth pattern already exists, but only inside the operations slice:
  - [`apps/api/src/command/command-contracts.ts`](../../../apps/api/src/command/command-contracts.ts)
  - [`apps/api/src/command/execute-command.ts`](../../../apps/api/src/command/execute-command.ts)
  - [`apps/api/src/modules/operations/ops.commands.ts`](../../../apps/api/src/modules/operations/ops.commands.ts)
  - [`apps/api/src/modules/operations/ops.state-machine.ts`](../../../apps/api/src/modules/operations/ops.state-machine.ts)
  - [`apps/api/src/truth/truth-record.model.ts`](../../../apps/api/src/truth/truth-record.model.ts)
- There is no governed shared `packages/events` surface yet.
- Afenda has benchmark-driven ideas for future extensibility, but no official extension/plugin doctrine yet.

If these gaps are attacked out of order, Afenda will keep adding business behavior on top of a weak truth boundary: untyped runtime calls, stale API doctrine, duplicated workflow patterns, and premature extensibility.

## Decision summary

1. Afenda will close the current execution gaps in a fixed sequence:
   typed web runtime -> live API truth -> reusable workflow utilities -> governed events package -> extension doctrine.
2. Each phase must produce working evidence before the next phase is treated as implementation-ready.
3. Live code surfaces are authoritative for current behavior; documentation must converge to the live Hono + web runtime model before broader feature expansion.
4. Reusable workflow and event surfaces must be extracted from Afenda's existing operations command/state/truth lineage, not imported from benchmark repos.
5. Extensibility work is deferred until the runtime, API, workflow, and event layers are stabilized under doctrine.

## Doctrine enforcement mode

This wave executes under four binding operating rules:

- **NO DRIFT** tolerance
- **CONTRACT FIRST** validation
- **GENERATED OVER MANUAL** preference
- **SINGLE SOURCE OF TRUTH** enforcement

These rules apply across all five implementation phases. If a later phase introduces a second parallel contract surface, manual route inventory, or duplicated execution lineage, that work is out of policy even if the local code compiles.

## Delivery classification

### What is immediately true

- The execution order above is now the official gap-closure sequence.
- `apps/web/src/rpc/web-client.ts` is recognized as a real typed-boundary defect, not a temporary nuisance to ignore.
- `docs/API.md` is recognized as a drift surface that must be reconciled to the live Hono app before being treated as settled truth.
- The operations slice is the approved extraction seed for generalized ERP workflow utilities.

### What is not yet true

- This ADR does not claim every web API consumer has migrated to the typed Hono RPC surface.
- This ADR does not claim the extracted workflow/event truth layer is generalized beyond the current operations seed.
- This ADR does not approve extension runtime implementation yet.

### How this ADR should be used

- Treat as **binding policy** only for:
  the implementation order, the requirement to reconcile docs to live code, and the extraction lineage for workflow/event surfaces
- Treat as **directional guidance** only for:
  how the future workflow toolkit, events package, and extension doctrine should be shaped
- Do **not** use this ADR as proof that:
  Afenda already has compile-time safe RPC across the web app, finished API doctrine, or a reusable ERP execution fabric

## Scope and boundaries

- In scope:
  `apps/web/src/rpc`, `apps/web/src/app/_platform/runtime`, `docs/API.md`, `apps/api/src/app.ts`, `apps/api/src/routes/**`, `apps/api/src/command/**`, `apps/api/src/modules/operations/**`, `apps/api/src/truth/**`, future `packages/events/**`, and extension/plugin doctrine
- Out of scope:
  implementation of specific ERP modules beyond the current ops/events surfaces, benchmark repo adoption, and public plugin marketplace design
- Affected repos/apps/packages:
  `apps/web`, `apps/api`, `docs/architecture/adr`, `docs/architecture/atc`, `docs/API.md`, and future `packages/events`
- Interfaces/contracts touched:
  browser RPC client contracts, HTTP API documentation, command/truth/workflow abstractions, event envelope ownership, and extension-governance doctrine

## Architecture contract

### Required

- The `web-client.ts` `any` boundary must be removed before Hono RPC usage expands beyond the current narrow slice.
- [`docs/API.md`](../../API.md) must document the live Hono route tree and bootstrap/error model before new API-driven feature work is treated as contract-safe.
- Reusable workflow utilities must be extracted from the current `command` + `operations` + `truth` lineage.
- The shared events package, when introduced, must be governed Afenda code and not a direct transplant from TPM, Gauzy, Akaunting, or Odoo.
- Extension/plugin doctrine must land before Akaunting-style extensibility work begins.

### Forbidden

- Expanding RPC adoption while `apps/web/src/rpc/web-client.ts` still exports `any`.
- Treating hypothetical `/api/tenants/{tenant}/...` routes as live truth when the mounted Hono surface differs.
- Creating a new workflow/event framework detached from the current operations command/state/truth path.
- Shipping a `packages/events` surface or extension/plugin implementation without doctrine.

### Allowed exceptions

- Existing ops/event surfaces may continue to run on their current implementation while the extraction work is being planned.
- Working backlog artifacts under `.artifacts/reports/` may evolve faster than canonical docs as long as they stay within the official phase order and doctrine.

## Cross-PR truth invariants

### API contract invariant

- The live Hono app in [`apps/api/src/app.ts`](../../../apps/api/src/app.ts) is the current route truth source.
- The web RPC client type in [`apps/web/src/rpc/web-client.ts`](../../../apps/web/src/rpc/web-client.ts) must be derived from `AppType`, never hand-authored as a second interface.
- Phase 2 must produce generated route evidence at:
  - [`.artifacts/reports/governance/api-route-surface.report.json`](../../../.artifacts/reports/governance/api-route-surface.report.json)
  - [`docs/architecture/governance/generated/api-route-surface.md`](../governance/generated/api-route-surface.md)
- [`docs/API.md`](../../API.md) is the narrative companion to the generated route surface, not an independently maintained route inventory.

### Command -> truth -> event invariant

- Phase 3 introduces one app-local linkage contract:

```ts
type ExecutionLinkage = {
  tenantId: string
  requestId: string
  correlationId: string
  causationId: string
  executionHash: string
}
```

- `requestId` remains transport-derived.
- `correlationId` defaults to `requestId` for synchronous HTTP entrypoints unless later doctrine says otherwise.
- `causationId` is minted once per command execution.
- `executionHash` is computed once from the canonical transition payload and reused by both truth and event outputs.
- From phase 3 onward, every governed command execution must produce:
  - a truth record carrying `ExecutionLinkage`
  - an internal event envelope carrying the same `ExecutionLinkage`

### Workflow isolation invariant

- Phase 3 creates `apps/api/src/workflow/**` with two layers only:
  - `workflow/core/**` = pure deterministic transition and truth helpers
  - `workflow/adapters/**` = explicit side-effect boundaries
- `workflow/core/**` must not import `apps/api/src/modules/operations/**`.
- Domain-specific payload mapping stays in the owning module.

### Event package boundary invariant

- Phase 4 promotes only the shared event truth surface into `packages/events`.
- `packages/events` may contain only:
  - `ExecutionLinkage`
  - `EventEnvelopeV1`
  - versioned envelope metadata
  - serialization, hashing, and validation helpers
- `packages/events` may not contain:
  - domain payload definitions
  - transport logic
  - broker or outbox runtime
  - workflow or state-machine logic

### Extension safety invariant

- Phase 5 doctrine must define extensions as declarative, registered, and auditable.
- Extensions may not:
  - bypass command execution
  - write truth records directly
  - override invariants or permission enforcement
  - inject runtime monkey patches

## Alternatives considered

### Option A: Fix gaps opportunistically as teams touch files

- Pros:
  lower short-term coordination cost and minimal up-front doctrine work
- Cons:
  keeps drift alive, allows later phases to outrun earlier truth fixes, and makes it hard to tell what is canonical

### Option B: Build workflow/events/extensibility first and clean typing/docs later

- Pros:
  appears to move faster toward platform breadth
- Cons:
  bakes new capabilities onto a weak runtime/API truth boundary and magnifies rework

## Consequences

### Positive

- Afenda gets one official execution sequence instead of competing local priorities.
- Web runtime typing and API truth become the first-class gatekeepers for later platform work.
- Workflow and event abstractions will inherit proven tenant, permission, and truth behavior instead of inventing a second lineage.

### Negative

- Some desirable platform work, especially shared events and extensibility, is intentionally delayed.
- Teams will need to update doctrine and code together instead of treating docs as a later cleanup task.

## Evidence and enforcement matrix

| Contract statement                                         | Source of truth                                                                                                                                                                                      | Current evidence                                                                                  | Enforcement mechanism                       | Gap / follow-up                                                                         |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------- |
| RPC boundary must be compile-time safe                     | [`apps/web/src/rpc/web-client.ts`](../../../apps/web/src/rpc/web-client.ts)                                                                                                                          | typed `hc<AppType>` client exported from `@afenda/api/app` plus RPC type regression coverage      | typecheck + RPC regression tests            | expand typed RPC usage without letting `any` escape the boundary                        |
| API docs must match live Hono routes                       | [`docs/API.md`](../../API.md), [`apps/api/src/app.ts`](../../../apps/api/src/app.ts), [`docs/architecture/governance/generated/api-route-surface.md`](../governance/generated/api-route-surface.md)  | generated route surface now binds the mounted Hono tree to the narrative API contract             | generated route surface + governance checks | keep the narrative docs and generated surface in lock-step as routes evolve             |
| Workflow extraction starts from current ops lineage        | [`apps/api/src/command/**`](../../../apps/api/src/command), [`apps/api/src/modules/operations/**`](../../../apps/api/src/modules/operations), [`apps/api/src/truth/**`](../../../apps/api/src/truth) | command matrix, execute-command, state machine, and truth record model already exist              | code review + architecture review           | extract shared utilities without breaking current ops behavior                          |
| Shared events package remains boundary-limited             | [`packages/events`](../../../packages/events), [`ADR-0014`](./ADR-0014-governed-shared-events-package-boundary.md), [`ATC-0012`](../atc/ATC-0012-governed-shared-events-package-boundary.md)         | versioned event envelope, linkage, and hashing helpers exist under a governed package boundary    | package boundary doctrine + tests           | keep transport, workflow, and domain payload logic out of the package                   |
| Extension doctrine is prerequisite, not optional follow-up | [`ADR-0015`](./ADR-0015-governed-extension-and-plugin-doctrine.md), [`ATC-0013`](../atc/ATC-0013-governed-extension-and-plugin-boundaries.md)                                                        | extension and plugin doctrine now exists, but no runtime extensibility implementation is approved | architecture review + governance checks     | keep doctrine ahead of implementation and reject bypasses of the command/truth pipeline |

## Implementation plan

### Completed now

- [x] Retired the stale `docs/workspace` split and restored root-doc official guidance.
- [x] Produced the consolidated reuse audit and its benchmark authority model.
- [x] Identified the five execution gaps and their current live code/doc surfaces.

### Required follow-through

- [ ] Remove `any` from [`apps/web/src/rpc/web-client.ts`](../../../apps/web/src/rpc/web-client.ts) and prove typed consumption at the web boundary — Web runtime — 2026-05-02
- [ ] Generate the live API route surface and reconcile [`docs/API.md`](../../API.md) to the live Hono `/api/v1/*` route tree and current bootstrap/error surfaces — API + docs — 2026-05-05
- [ ] Extract reusable workflow utilities from the operations `command` + `truth` path without breaking current ops behavior, and bind command output to shared execution linkage — Workflow architecture — 2026-05-12
- [ ] Define a governed Afenda shared events package informed by the extracted workflow truth surfaces — Platform integration — 2026-05-19
- [ ] Ratify extension/plugin doctrine before any extensibility implementation — Governance — 2026-05-26

### Exit criteria for “implemented”

- [ ] `apps/web/src/rpc/web-client.ts` no longer exports `any`
- [ ] A generated API route surface exists and [`docs/API.md`](../../API.md) mirrors the mounted Hono route tree and active error/bootstrap behavior
- [ ] A reusable workflow utility layer exists, the current ops slice consumes it, and command results carry `ExecutionLinkage`
- [ ] A governed shared events package exists or is explicitly deferred by updated doctrine after workflow extraction evidence
- [ ] Extension/plugin doctrine exists before any extensibility implementation begins

## PR gate contract

| PR   | Must not break                      | Required gate                                                                       |
| ---- | ----------------------------------- | ----------------------------------------------------------------------------------- |
| PR-0 | doctrine validity                   | `pnpm run script:check-architecture-contracts` + `pnpm run script:check-governance` |
| PR-1 | API runtime behavior                | `pnpm --filter @afenda/web typecheck` + RPC type regression coverage                |
| PR-2 | client compile and live route truth | generated API route surface + docs/governance checks                                |
| PR-3 | command execution semantics         | `pnpm --filter @afenda/api typecheck` + existing command/state behavior             |
| PR-4 | truth/event linkage                 | package export tests + API consumption through public exports                       |
| PR-5 | governance enforcement posture      | architecture/governance checks with new doctrine                                    |

## Validation plan

- Required checks:
  `pnpm --filter @afenda/web typecheck`, `pnpm --filter @afenda/api typecheck`, `pnpm run script:check-architecture-contracts`, `pnpm run script:check-governance`
- Required manual QA:
  shell bootstrap through `GET /api/v1/me`, events workspace reads, command execution, truth/audit visibility, and docs-to-code review of the mounted route tree
- Runtime/operational signals to watch:
  compile-time RPC breakage, `/api/v1/me` bootstrap failures, stale-state command conflicts, and tenant-context mismatch behavior
- How success will be measured after rollout:
  UI/API drift becomes visible at compile time or in governed docs review instead of surviving as silent mismatch

## Trigger metrics (for revisit, escalation, or migration)

- Trigger 1: a new feature PR tries to expand Hono RPC usage while `web-client.ts` still exports `any`
- Trigger 2: a second module duplicates command/state/truth logic instead of consuming shared workflow utilities
- Trigger 3: a `packages/events` or extension/plugin proposal appears before phases 1 to 3 are complete

## Rollout and rollback / containment

### Rollout plan

- Step 1: close the typed web runtime boundary
- Step 2: reconcile API doctrine to the live Hono surface
- Step 3: extract reusable workflow and truth utilities from ops
- Step 4: define the shared events package from the extracted workflow truth model
- Step 5: ratify extension/plugin doctrine

### Rollback/containment plan

- If a later phase reveals the earlier gate was incomplete, pause the sequence, revert the dependent phase if needed, and re-establish the missing earlier evidence before continuing.

## References

- Related docs:
  [`ADR-0011`](./ADR-0011-consolidated-reuse-decision-audit.md), [`ATC-0009`](../atc/ATC-0009-consolidated-reuse-decision-audit.md), [`ATC-0010`](../atc/ATC-0010-official-documentation-surfaces-and-anti-drift.md), [`docs/API.md`](../../API.md)
- Related issues/PRs:
  none yet; use the execution backlog artifact for implementation wave planning
