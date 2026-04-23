---
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
---

# ADR-0004: Web `src/` architecture — RPC, runtime, features, marketing

- **Decision status:** Accepted
- **Implementation status:** Substantially implemented
- **Enforcement status:** Partial automation
- **Evidence status:** Current
- **Date:** 2026-04-19
- **Owner:** Platform / web
- **Review by:** 2026-10-01
- **Scope:** `apps/web/src` topology, vocabulary, and ownership boundaries
- **Decision type:** Record existing baseline
- **Operational posture:** Active contract
- **Related governance domains:** GOV-FS-002, GOV-ARCH-001
- **Related ATCs:** ATC-0004

## Context

`apps/web/src` had accumulated overlapping vocabulary and competing roots:

- feature code at more than one logical level,
- overloaded `api-client` naming,
- vague `pages/` and marketing ownership,
- optional top-level routing and style buckets,
- weak boundaries between RPC, platform runtime, product features, and shared code.

That shape made the codebase harder to navigate and encouraged new global buckets whenever a concern did not obviously fit.

The repo now has a more explicit topology centered around:

- `src/app/_features/`
- `src/app/_platform/`
- `src/marketing/`
- `src/rpc/`
- `src/share/`

This ADR exists to make that topology explicit as a durable architecture decision rather than an accidental current state.

## Decision summary

1. `apps/web/src` uses explicit ownership boundaries for `app/_features`, `app/_platform`, `marketing`, `rpc`, and `share`.
2. Product feature code lives under `src/app/_features/`; platform/runtime concerns live under `src/app/_platform/`.
3. `src/rpc/` is reserved for typed Hono RPC client contracts; runtime fetch/platform concerns do not use the old `api-client` vocabulary.
4. Marketing remains a standalone feature boundary under `src/marketing/`, not a generic `pages/` bucket.
5. New top-level buckets or renamed ownership layers require a follow-on ADR rather than incremental drift.

## Delivery classification

### What is immediately true

- The live repo already uses the `app/_features`, `app/_platform`, `marketing`, `rpc`, and `share` vocabulary.
- `script:check-afenda-config` already validates the governed web topology and related path declarations.
- Marketing and feature ownership are no longer expected to share one vague root.

### What is not yet true

- This ADR does not claim every sub-boundary inside `app/_features` or `app/_platform` is fully enforced by dedicated architecture checks.
- This ADR does not claim route, shell, or marketing detail rules are all encoded in one place.
- This ADR does not claim the old companion docs were already fully cleaned when the topology changed.

### How this ADR should be used

- Treat as **binding policy** for the named `apps/web/src` ownership layers and vocabulary.
- Treat as **directional guidance** for where new client concerns belong.
- Do **not** use this ADR as permission to introduce fresh top-level roots or revive the old naming model.

## Scope and boundaries

- In scope:
  `apps/web/src` top-level structure, ownership vocabulary, RPC/runtime separation, feature/platform split, and marketing as a standalone boundary.
- Out of scope:
  package-root artifact policy, Zustand adoption timing, and detailed marketing page governance beyond topology.
- Affected repos/apps/packages:
  `apps/web`, related routing/runtime docs, and workspace topology checks.
- Interfaces/contracts touched:
  path ownership, naming conventions, feature/runtime placement, and cross-document structure guidance.

## Architecture contract

### Required

- Product feature code belongs under `src/app/_features/`.
- Platform and runtime concerns belong under `src/app/_platform/`.
- `src/rpc/` is the typed RPC client boundary.
- `src/marketing/` is the public marketing boundary.
- `src/share/` remains the cross-cutting shared surface.

### Forbidden

- Reintroducing a second root feature topology such as a new global `src/features/` ownership model.
- Using `api-client` as the umbrella name for both RPC contracts and general runtime behavior.
- Adding new top-level `src/` roots without an explicit superseding or follow-on ADR.

### Allowed exceptions

- Transitional compatibility files are allowed only when they preserve the current ownership model and are being retired deliberately.
- Local route/helper folders are allowed inside owning boundaries without creating a new global root.

## Alternatives considered

### Option A: Keep the older mixed vocabulary and evolve incrementally

- Pros:
  less immediate doc churn.
- Cons:
  preserves ambiguous ownership and encourages further root sprawl.

### Option B: Enforce the explicit feature/platform/rpc/marketing/share split

- Pros:
  clearer ownership, less naming ambiguity, better long-term scalability.
- Cons:
  requires doc cleanup and occasional migration work.

## Consequences

### Positive

- Clearer ownership vocabulary for contributors and reviewers.
- Less chance of duplicate roots and renamed-but-equivalent buckets.
- Better alignment between the live repo and architecture governance.

### Negative

- Existing docs and imports occasionally need cleanup when the topology is tightened.
- Some detail rules still rely on companion guides and tests rather than one dedicated architecture gate.

## Evidence and enforcement matrix

| Contract statement                                            | Source of truth                                        | Current evidence                                                                  | Enforcement mechanism                 | Gap / follow-up                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `apps/web/src` has governed ownership roots                   | `scripts/afenda.config.json`, live `apps/web/src` tree | current repo layout and workspace-topology evidence                               | `pnpm run script:check-afenda-config` | deeper boundary rules are still spread across companion docs/tests |
| RPC/runtime/feature/marketing/share vocabulary is intentional | this ADR, companion docs, live folder structure        | `src/app/_features`, `src/app/_platform`, `src/rpc`, `src/marketing`, `src/share` | partial CI/docs enforcement           | older guide content required cleanup to match the decision         |
| New global roots require explicit governance                  | this ADR, workspace governance config                  | path allowlists and topology checks                                               | config governance + review discipline | some sub-boundary rules are still manual                           |

## Implementation plan

### Completed now

- The live `apps/web/src` tree already reflects the current ownership model.
- Workspace topology checks already cover the governed path model.
- Companion docs are being cleaned to align with this decision.

### Required follow-through

- [ ] Keep companion docs aligned with the live topology rather than legacy `features/pages/share` language — docs-policy — ongoing
- [ ] Strengthen domain-specific boundary checks if the current topology starts drifting in practice — platform / web — future governance pass

### Exit criteria for “implemented”

- [ ] Primary companion docs describe the live topology rather than legacy roots
- [ ] Contributors can place new client code without guessing between duplicate ownership layers
- [ ] Topology drift is detected before merge through config or companion checks

## Validation plan

- Required checks:
  `pnpm run script:check-afenda-config`, `pnpm run script:check-architecture-contracts`, and docs governance checks
- Required manual QA:
  confirm the documented root model matches the live `apps/web/src` tree
- Runtime/operational signals to watch:
  repeated proposals for new top-level roots, revived `api-client` ambiguity, or code landing outside the named ownership surfaces
- How success will be measured after rollout:
  `apps/web/src` continues to evolve without new parallel root systems

## Trigger metrics (for revisit, escalation, or migration)

Re-open this ADR if one or more persist across two review cycles:

- repeated topology exceptions are needed to land legitimate work,
- contributors repeatedly introduce new root buckets because the current model is insufficient,
- RPC/runtime/feature/marketing boundaries no longer match delivery needs in practice.

## Rollout and rollback / containment

### Rollout plan

- Keep the current path model as the canonical baseline.
- Use companion docs as operating guides, not as competing decision records.
- Promote more specific topology rules into dedicated checks only when the need becomes concrete.

### Rollback/containment plan

- If a boundary needs to change, record the change explicitly in a follow-on ADR rather than drifting through opportunistic folder additions.
- Do not reintroduce legacy naming models just to ease short-term migration work.

## References

- [`docs/PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md)
- [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`docs/architecture/atc/ATC-0004-web-src-topology-and-ownership.md`](../architecture/atc/ATC-0004-web-src-topology-and-ownership.md)
- [`scripts/afenda.config.json`](../../scripts/afenda.config.json)
