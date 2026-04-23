---
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
---

# ADR-0005: Zustand client UI store adoption

- **Decision status:** Accepted
- **Implementation status:** Not started
- **Enforcement status:** Manual
- **Evidence status:** Planned
- **Date:** 2026-04-19
- **Owner:** Platform / web
- **Review by:** 2026-10-01
- **Scope:** cross-cutting client UI state in `apps/web`
- **Decision type:** Defer with triggers
- **Operational posture:** Active contract
- **Related governance domains:** GOV-DOC-001

## Context

`apps/web` already uses several state mechanisms with clear ownership:

- local React state for local UI behavior,
- React Context for scoped runtime values,
- TanStack Query for server-backed cache,
- route/session/theme ownership where those concerns already have a stable source of truth.

Zustand is already an approved workspace tool, and it is a plausible answer for future cross-cutting client UI state.
What the repo does not currently have is a demonstrated need for a shared store that justifies introducing one now.

This ADR exists to make two things explicit:

- Zustand is the approved pattern when a cross-cutting client UI store is truly needed.
- The repo should not introduce a store by default before that pressure exists.

## Decision summary

1. Zustand is the approved client UI store pattern for future cross-cutting browser-only UI state in `apps/web`.
2. The repo should not add a Zustand store by default; local state, Context, theme ownership, and Query remain first choices until measured pressure exists.
3. When introduced, stores belong in `apps/web/src/share/client-store/` and stay narrow rather than becoming a monolithic app store.
4. Zustand must not mirror TanStack Query server state, theme state, or other concerns that already have a stable owner.

## Delivery classification

### What is immediately true

- Zustand is the approved future pattern for cross-cutting client UI state.
- The repo is explicitly not store-first by default.
- Future store work already has a named home and a defined ownership rule.

### What is not yet true

- This ADR does not create an implemented store.
- This ADR does not claim the repo already has a measured Zustand-worthy use case.
- This ADR does not claim store behavior is machine-enforced today.

### How this ADR should be used

- Treat as **binding policy** for when and how Zustand may be introduced.
- Treat as **directional guidance** for evaluating future shared UI state needs.
- Do **not** use this ADR as justification to add a store just because Zustand is allowed.

## Scope and boundaries

- In scope:
  cross-cutting browser-only UI state in `apps/web`, store placement, and ownership constraints.
- Out of scope:
  TanStack Query server state, theme/session ownership, package-level state tooling, and non-browser runtime state.
- Affected repos/apps/packages:
  `apps/web` and companion state-management docs.
- Interfaces/contracts touched:
  shared client-state ownership, store placement, naming, and rollout timing.

## Architecture contract

### Required

- Shared cross-cutting client UI state uses Zustand only when local state and Context are no longer sufficient.
- Future stores live under `apps/web/src/share/client-store/`.
- Stores remain narrow and concern-specific.

### Forbidden

- Mirroring TanStack Query server data into Zustand as a second source of truth.
- Mirroring theme, route, or session ownership into a redundant store.
- Introducing a monolithic catch-all app store as the default state model.

### Allowed exceptions

- A temporary compatibility layer is allowed during a future rollout if it has clear retirement intent and does not duplicate ownership permanently.
- Alternative patterns remain acceptable when the state is still local or subtree-scoped.

## Alternatives considered

### Option A: Local state and Context only

- Pros:
  minimal abstraction and clear ownership at small scale.
- Cons:
  becomes awkward when distant branches need to coordinate the same client UI state.

### Option B: Adopt Zustand immediately as a default

- Pros:
  one global pattern from the start.
- Cons:
  premature global state and easy duplication of existing ownership systems.

## Consequences

### Positive

- Future shared UI state work has a clear approved path.
- The repo avoids unnecessary store-first architecture.
- Contributors have a documented rule for where Zustand belongs if it becomes necessary.

### Negative

- Teams must still evaluate each proposed store against real evidence rather than habit.
- Some future cross-cutting UI state may continue using intermediate Context patterns until a trigger is met.

## Evidence and enforcement matrix

| Contract statement                                            | Source of truth                      | Current evidence                   | Enforcement mechanism  | Gap / follow-up                                   |
| ------------------------------------------------------------- | ------------------------------------ | ---------------------------------- | ---------------------- | ------------------------------------------------- |
| Zustand is approved but not default                           | this ADR, `docs/STATE_MANAGEMENT.md` | documented policy only             | manual review          | no dedicated CI/store policy yet                  |
| Stores belong under `src/share/client-store/` when introduced | this ADR, companion state doc        | named path and naming expectations | docs/review discipline | not yet exercised by a concrete implementation    |
| Query/theme/session ownership must not be mirrored            | this ADR, state-management guidance  | doctrine only                      | manual review          | future store implementation must prove compliance |

## Implementation plan

### Completed now

- The repo has an explicit decision for when Zustand is allowed.
- Companion state-management guidance already references Zustand as optional, not default.

### Required follow-through

- [ ] Reassess whether any concrete feature now meets the store trigger metrics — platform / web — by 2026-10-01
- [ ] If Zustand is introduced, add focused tests and explicit ownership boundaries before expansion — platform / web — deferred
- [ ] Keep companion state docs aligned with the implemented ownership model — docs-policy — ongoing

### Exit criteria for “implemented”

- [ ] A real cross-cutting UI state problem has met the trigger metrics
- [ ] A first store exists under `src/share/client-store/` with narrow scope and tests
- [ ] The repo can prove no duplicate ownership with Query/theme/session state

## Validation plan

- Required checks:
  docs review against `docs/STATE_MANAGEMENT.md`
- Required manual QA:
  future store proposals must explain why local state and Context are insufficient
- Runtime/operational signals to watch:
  provider sprawl, repeated prop-threading for the same UI concern, or repeated defects caused by split UI-state ownership
- How success will be measured after rollout:
  if Zustand is introduced later, it solves a real cross-cutting UI problem without becoming a second source of truth

## Trigger metrics (for revisit, escalation, or migration)

Open implementation work only when at least one of these is true for a real feature or platform slice:

- the same UI runtime state is coordinated across three or more distant component branches and current wiring causes repeated churn across two consecutive iterations,
- a shared UI behavior causes repeated defects because ownership is split between unrelated components,
- a provider/context solution introduces measurable complexity through provider sprawl, repeated prop-threading, or repeated custom test harness setup.

## Rollout and rollback / containment

### Rollout plan

- Keep current ownership as-is until a trigger is met.
- Introduce one narrow store first if implementation becomes justified.
- Document boundaries and tests before expanding usage.

### Rollback/containment plan

- If a future store becomes too broad, split it or move state back to component/provider ownership.
- Remove any store logic that duplicates an existing source of truth.

## References

- [`docs/STATE_MANAGEMENT.md`](../STATE_MANAGEMENT.md)
- [`docs/ARCHITECTURE_EVOLUTION.md`](../ARCHITECTURE_EVOLUTION.md)
- [`docs/PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md)
