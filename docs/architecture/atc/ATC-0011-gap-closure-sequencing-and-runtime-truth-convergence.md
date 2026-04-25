---
title: ATC-0011 gap-closure sequencing and runtime truth convergence
description: Enforceable architecture contract for Afenda's gap-closing execution order: typed web RPC, live Hono API truth, reusable workflow extraction, governed shared events, and deferred extensibility until doctrine exists.
status: active
owner: web-api-architecture
truthStatus: canonical
docClass: canonical-doc
relatedDomain: architecture-contract
order: 28
---

# ATC-0011: Gap-closure sequencing and runtime truth convergence

## Contract identity

- **Contract ID:** ATC-0011
- **Bound domain ID:** GOV-ARCH-001
- **Owner:** Web API architecture
- **Scope:** repo-wide
- **Decision anchor:** ADR-0013

## Lifecycle and enforcement

- **Lifecycle status:** partial
- **Enforcement maturity:** warned

## Doctrine enforcement mode

- `NO DRIFT` tolerance
- `CONTRACT FIRST` validation
- `GENERATED OVER MANUAL` preference
- `SINGLE SOURCE OF TRUTH` enforcement

## Intent

This contract keeps Afenda's current gap-closing program honest by binding the work to a fixed execution order and to live repository surfaces instead of stale architectural assumptions.

## Implementation bindings

- In-scope paths:
  `apps/web/src/rpc/**`, `apps/web/src/app/_platform/runtime/**`, `apps/web/src/app/_platform/tenant/**`, `apps/web/src/app/_features/events-workspace/**`, `docs/API.md`, `apps/api/src/app.ts`, `apps/api/src/routes/**`, `apps/api/src/command/**`, `apps/api/src/modules/operations/**`, `apps/api/src/truth/**`, future `packages/events/**`, `docs/architecture/adr/ADR-0013-gap-closure-sequencing-and-runtime-truth-convergence.md`, `docs/architecture/atc/ATC-0011-gap-closure-sequencing-and-runtime-truth-convergence.md`, and `.artifacts/reports/reuse/afenda-gap-closure-execution-backlog.md`
- Bound code/config surfaces:
  web RPC typing, browser API-client vs RPC boundary decisions, live Hono route truth, command/workflow/truth extraction lineage, shared events ownership, and extension-doctrine prerequisites
- Explicitly out of scope:
  direct benchmark code adoption, finished extension implementation, and unrelated app/package refactors

## Truth spine invariants

### API contract invariant

- The live Hono route tree in [`apps/api/src/app.ts`](../../../apps/api/src/app.ts) is the route truth source.
- [`apps/web/src/rpc/web-client.ts`](../../../apps/web/src/rpc/web-client.ts) must derive its client type from `AppType`.
- The generated route evidence pair is mandatory from phase 2 onward:
  - [`.artifacts/reports/governance/api-route-surface.report.json`](../../../.artifacts/reports/governance/api-route-surface.report.json)
  - [`docs/architecture/governance/generated/api-route-surface.md`](../governance/generated/api-route-surface.md)
- [`docs/API.md`](../../API.md) must remain a narrative companion to the generated route surface rather than a second manually curated route list.

### Command -> truth -> event invariant

- `ExecutionLinkage` is the shared execution identity contract for command, truth, and event outputs.
- Each governed command execution must carry a single `requestId`, `correlationId`, `causationId`, and `executionHash` lineage through both the persisted truth record and the emitted internal event envelope.

### Workflow isolation invariant

- `apps/api/src/workflow/core/**` must stay deterministic and must not import `apps/api/src/modules/operations/**`.
- `apps/api/src/workflow/adapters/**` is the only allowed layer for persistence and side-effect boundaries inside the extracted workflow surface.

### Event package boundary invariant

- `packages/events` may expose only versioned event-envelope truth, linkage, and serialization/hash/validation helpers.
- `packages/events` may not expose domain payloads, transport runtime, broker/outbox orchestration, or workflow engines.

### Extension safety invariant

- Future extensions must be declarative, registered, and auditable.
- Future extensions may not bypass command execution, write truth records directly, override invariant enforcement, or inject runtime monkey patches.

## Enforcement surfaces

- Static checks:
  `pnpm --filter @afenda/web typecheck`, `pnpm --filter @afenda/api typecheck`, `pnpm run script:generate-api-route-surface`, `pnpm run script:check-architecture-contracts`, `pnpm run script:check-governance`
- Route-contract denylist:
  `scripts/governance/check-retired-api-routes.ts` must fail if the live route surface reintroduces `/api/v1/ops/workspace`, `/api/v1/ops/events/:eventId/claim`, or `/api/v1/ops/events/:eventId/advance`
- Tests:
  current route, shell-bootstrap, API-client/RPC regression tests under `apps/web` and `apps/api`, and future `packages/events` unit tests
- CI gates:
  architecture contracts, governance, and package typecheck/lint gates for `@afenda/web` and `@afenda/api`
- Runtime assertions:
  current route-level tenant/auth checks under `/api/v1/me`, `/api/v1/commands`, and `/api/v1/ops`; further runtime assertions are deferred until the workflow/events layers are extracted

## Evidence

- **Evidence path:** `.artifacts/reports/governance/architecture-contracts.report.json`
- Required evidence artifacts:
  architecture-contracts report, generated architecture indexes, governance aggregate/register outputs, the generated API route surface pair, and the working backlog at `.artifacts/reports/reuse/afenda-gap-closure-execution-backlog.md`
- Validation cadence:
  every architecture/governance run and every phase handoff in the gap-closing sequence

## Drift handling

- What counts as drift:
  `apps/web/src/rpc/web-client.ts` continuing to export `any`, [`docs/API.md`](../../API.md) continuing to describe a non-live API topology, the generated API route surface not refreshing with route or API-doc changes, any reintroduction of retired ops wrapper routes, later-phase work starting before earlier gates are met, workflow extraction that skips the current `command` + `operations` + `truth` lineage, a `packages/events` surface arriving without doctrine, or extension/plugin implementation arriving without its own ADR/ATC
- How drift is recorded:
  architecture-contract findings, code review findings, docs diffs, typecheck failures, and working backlog status changes
- When drift blocks:
  this contract is not yet fully blocking in CI, but it must block architecture approval and implementation sign-off for phases 3 to 5 when earlier phase gates are not met

## Linked commands

- **Check command:** `pnpm run script:check-architecture-contracts`
- **Report command:** `pnpm run script:generate-governance-report`

## Notes

- Normative phase order: 0. doctrine hardening
  1. typed web runtime
  2. live API truth
  3. reusable workflow utilities
  4. governed shared events
  5. extension/plugin doctrine
- PR gate contract:
  - PR-0 -> doctrine validity
  - PR-1 -> API runtime behavior
  - PR-2 -> client compile and live route truth
  - PR-3 -> command execution semantics
  - PR-4 -> truth/event linkage
  - PR-5 -> governance enforcement posture
- Current concrete gap signals:
  - [`apps/web/src/rpc/web-client.ts`](../../../apps/web/src/rpc/web-client.ts) is now typed from `AppType`, so future drift pressure moves to keeping consumers and builds on the same contract spine
  - [`docs/API.md`](../../API.md) now has a generated route surface companion and must stay synchronized with [`apps/api/src/app.ts`](../../../apps/api/src/app.ts)
  - workflow truth now has an app-local extraction seed in `apps/api/src/workflow/**`, but it is still proven only through the operations slice
  - `packages/events` now exists and must remain limited to linkage + versioned envelope truth
  - extension/plugin ADR and ATC now exist and must stay doctrine-first
- This contract does not claim the browser should use one client abstraction only; it claims the chosen boundaries must be typed, truthful, and documented.
