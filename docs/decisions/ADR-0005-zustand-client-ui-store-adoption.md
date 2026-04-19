# ADR-0005: Zustand client UI store adoption

- **Status:** Accepted
- **Date:** 2026-04-19
- **Owner:** Platform / web
- **Review by:** 2026-10-01
- **Related:** [ADR-0002](./ADR-0002-trigger-based-upgrades.md) (trigger-based upgrades), [ADR-0004](./ADR-0004-web-src-architecture-rpc-runtime-features.md) (web `src/` boundaries)

## Context

`apps/web` already uses several state mechanisms with clear ownership:

- local React state for page/component behavior
- `next-themes` for marketing and app theme persistence
- React Context for tenant and runtime-scoped values
- TanStack Query for server-backed cache

The workspace already permits Zustand for shared client UI state, and `docs/STATE_MANAGEMENT.md` names it as the default option when colocated state is no longer enough. However, there is not yet a single implemented cross-cutting store contract for the current marketing runtime, and adding one now would mostly duplicate existing theme/session/query mechanisms.

This decision matters because future work may introduce shared shell preferences, marketing debug controls, coordinated overlays, or other UI state that spans multiple distant subtrees. We need a documented rule for when Zustand is the right tool, where it lives, and what it must not own.

## Decision

1. **Zustand is the approved client UI store pattern** for future cross-cutting browser-only UI state in `apps/web`.
2. **Do not implement a Zustand store by default.** Colocated React state, Context, `next-themes`, and TanStack Query remain the first choices until measured pressure exists.
3. **When introduced, Zustand stores live in `apps/web/src/share/client-store/`** and follow repo naming rules:
   - filenames use `*-store.ts`
   - exported subscriber hooks use `useXxxStore`
   - stores remain narrow and domain-specific, not a single monolithic app store
4. **Zustand must not mirror existing source-of-truth systems**:
   - do not copy TanStack Query server state into Zustand
   - do not mirror `next-themes` theme state into Zustand
   - do not replace route/session-derived values that already have a stable owner
5. **Initial intended use-cases** for later implementation are limited to shared UI runtime controls such as:
   - modal / drawer / command-palette visibility that spans distant branches
   - layout or chrome preferences not already owned by a component/provider
   - marketing preview/debug/runtime controls that must coordinate across multiple pages

## Alternatives considered

### Option A: Local state + Context only

- Pros:
  - zero extra abstraction
  - easy to reason about for small trees
- Cons:
  - awkward when unrelated branches need to coordinate the same UI runtime state
  - leads to provider sprawl or prop-drilling once the state stops being local

### Option B: Zustand as the default now

- Pros:
  - one consistent client-state pattern from the start
  - simple subscriber API for future cross-cutting UI interactions
- Cons:
  - premature global state
  - duplicates existing `next-themes`, Query, and route/session ownership
  - pushes the codebase toward “store-first” design without measured need

### Option C: Another global client-state library (Jotai / Recoil / Redux)

- Pros:
  - viable for specific patterns
  - some offer stronger atomization or ecosystem breadth
- Cons:
  - adds decision churn with no measured gap in Zustand
  - inconsistent with current workspace guidance in `docs/STATE_MANAGEMENT.md`

## Consequences

### Positive

- Future contributors have an explicit approved path for cross-cutting UI state.
- Reduces architecture churn when a shared UI store becomes necessary later.
- Preserves current “local first” discipline instead of normalizing global state too early.

### Negative

- No implementation is created by this ADR, so teams must still evaluate each new state need case by case.
- Some future work may temporarily continue using intermediate Context/provider patterns until trigger conditions are met.

## Trigger metrics (for revisit or migration)

Zustand implementation work should be opened only when at least one of these is true for a real feature or platform slice:

- Trigger 1: the same UI runtime state is coordinated across **3 or more distant component branches** and the current Context/provider approach causes repeated wiring churn over **2 consecutive iterations**
- Trigger 2: a shared UI behavior (for example command palette, overlay, marketing preview mode, shell preference) causes **2 or more defects or regressions** because ownership is split between unrelated components
- Trigger 3: a provider/context solution introduces measurable complexity:
  - nested provider sprawl in a route/layout boundary
  - repeated prop-threading through non-owning components
  - test setup repeatedly needing custom state harnesses for the same concern

## Rollout and rollback

### Rollout plan

- Step 1: keep current state ownership as-is; no store is added by this ADR
- Step 2: when a trigger is met, define one narrow store contract in `src/share/client-store/`
- Step 3: add tests for selectors/actions and document ownership boundaries before expanding usage

### Rollback/containment plan

- If a future Zustand store becomes too broad, split it into smaller stores or move state back to component/provider ownership.
- If a store duplicates Query, theme, or route/session state, remove the duplication and restore the original source of truth.

## Validation plan

- Current validation for this ADR is documentation alignment only: `docs/STATE_MANAGEMENT.md` and future implementations must not conflict.
- Future Zustand rollout validation must include:
  - typecheck
  - targeted unit tests for store actions/selectors
  - route/component tests for the consuming UI
  - review that no Query/theme/session state is being mirrored unnecessarily

## Follow-up actions

- [ ] Reassess whether any concrete `apps/web` feature now meets the trigger metrics (Platform / web, by 2026-10-01)
- [ ] If Zustand is introduced later, add `apps/web/src/share/client-store/RULES.md` references to the implementing feature PR (Platform / web, deferred)
- [ ] Keep `docs/STATE_MANAGEMENT.md` aligned with the final implemented store boundaries (Platform / web, deferred)

## References

- Related docs:
  - [docs/STATE_MANAGEMENT.md](../STATE_MANAGEMENT.md)
  - [docs/ARCHITECTURE_EVOLUTION.md](../ARCHITECTURE_EVOLUTION.md)
  - [docs/PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)
- Related issues/PRs:
  - none yet; implementation intentionally deferred
