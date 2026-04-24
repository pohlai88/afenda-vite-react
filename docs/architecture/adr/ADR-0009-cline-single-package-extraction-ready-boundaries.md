---
title: ADR-0009 Cline single-package extraction-ready boundaries
description: Decision record for starting Cline as one package with strict internal boundaries for core, MCP hosting, and Feature SDK plugin ownership.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 19
---

# ADR-0009: Cline single-package extraction-ready boundaries

- **Decision status:** Accepted
- **Implementation status:** Partial
- **Enforcement status:** Manual
- **Evidence status:** Planned
- **Date:** 2026-04-24
- **Owner:** Governance toolchain
- **Review by:** 2026-07-24
- **Scope:** bounded subsystem
- **Decision type:** Adopt now
- **Operational posture:** Transitional contract
- **Related governance domains:** GOV-ARCH-001
- **Related ATCs:** ATC-0006

## Context

Afenda is building a governed Cline runtime for execution, verification, tool routing, and Feature SDK integration. An earlier planning direction proposed separate packages for `cline-core`, `cline-mcp-server`, and `cline-features-sdk-plugin`. That structure is architecturally sound, but it adds package-level ceremony before the boundary has been proven in real usage.

At the same time, the initial embedded prototype that began under `packages/features-sdk` proved valuable enough to keep, but its placement created ownership inversion:

- Cline behavior appeared to be owned by `@afenda/features-sdk`
- Sync-Pack-specific logic leaked into what should become reusable runtime surfaces
- extraction into standalone packages would be harder later if the embedded prototype kept growing

The repository needs a transitional decision that keeps implementation fast while preserving the long-term dependency law and avoiding fake-generic abstractions in the core.

## Decision summary

1. Cline will start as a single workspace package at `packages/cline`.
2. `packages/cline` must enforce strict internal ownership boundaries across `src/core`, `src/mcp-server`, and `src/plugins/features-sdk`.
3. `src/core` remains runtime-neutral and must not import Feature SDK, Sync-Pack, or repo-specific remediation logic.
4. `src/plugins/features-sdk` owns Feature SDK and Sync-Pack specific logic, including migrated code from the embedded prototype.
5. `src/mcp-server` remains transport-only and may not own business logic or domain remediation behavior.
6. The earlier embedded prototype in `packages/features-sdk` is treated as a migration source, not a permanent home.
7. Extraction into multiple packages is deferred until usage proves the need.

## Delivery classification

### What is immediately true

- `packages/cline` is the approved package boundary for the governed Cline runtime.
- Internal dependency law is binding even before package extraction.
- The existing embedded prototype should be migrated rather than expanded in place.

### What is not yet true

- This ADR does not claim `packages/cline` is already a feature-complete Cline platform.
- This ADR does not claim package extraction is required in Phase 1.
- This ADR does not claim rich planning, explainers, or readiness evaluation belong in core today.

### How this ADR should be used

- Treat as **binding policy** for package placement and internal ownership boundaries.
- Treat as **directional guidance** for later extraction into multiple packages.
- Do **not** use this ADR as proof that all core abstractions are already final or reusable across multiple plugins.

## Scope and boundaries

- In scope:
  `packages/cline`, migration of the embedded Cline prototype, internal dependency law, and the initial Feature SDK plugin boundary.
- Out of scope:
  separate package publishing, second-plugin generalization, full planner/explainer architecture, and standalone MCP deployment maturity.
- Affected repos/apps/packages:
  `packages/cline`, `packages/features-sdk`, `docs/architecture/adr`, `docs/architecture/atc`.
- Interfaces/contracts touched:
  Cline core contracts, plugin manifest surface, MCP server wiring surface, Feature SDK plugin boundary, and architecture contract evidence.

## Architecture contract

### Required

- `packages/cline/src/core` must own runtime-neutral primitives only.
- `packages/cline/src/plugins/features-sdk` must own Feature SDK and Sync-Pack-specific reasoning.
- `packages/cline/src/mcp-server` must own only boot, registration, routing, config loading, and runtime wiring.
- The internal dependency law must remain `src/core <- src/mcp-server` and `src/core <- src/plugins/features-sdk -> @afenda/features-sdk`.
- Existing embedded Cline code must remain removed from the live `@afenda/features-sdk` export surface; it may not return as an actively exported parallel runtime surface.

### Forbidden

- `src/core -> src/plugins/features-sdk`
- `src/core -> @afenda/features-sdk`
- `src/mcp-server` owning domain remediation, governance scoring, or Sync-Pack business logic
- keeping a live exported Cline surface inside `@afenda/features-sdk` after migration

### Allowed exceptions

- Transitional migration shims are allowed only long enough to complete the move into `packages/cline`.
- Package extraction into `cline-core`, `cline-mcp-server`, or `cline-features-sdk-plugin` is allowed only when usage proves the boundary.

## Alternatives considered

### Option A: Keep Cline embedded in `packages/features-sdk`

- Pros:
  fastest short-term path, low initial ceremony
- Cons:
  wrong ownership boundary, harder extraction, and rising dependency inversion risk

### Option B: Split immediately into multiple standalone packages

- Pros:
  architecturally pure package topology from day one
- Cons:
  adds package ceremony before abstractions are proven and increases Phase 1 delivery cost

### Option C: Single `packages/cline` package with extraction-ready internal boundaries

- Pros:
  keeps implementation fast, preserves the future dependency law, and forces internal boundary discipline
- Cons:
  boundaries rely on folder rules, imports, and review discipline before package extraction hardens them physically

## Consequences

### Positive

- Implementation can proceed without premature package splitting.
- The Cline runtime is no longer conceptually owned by `@afenda/features-sdk`.
- Migration from the embedded prototype preserves working behavior while improving future extractability.

### Negative

- Internal boundaries must be enforced socially and structurally before package extraction exists.
- Some code may still feel Sync-Pack-shaped during Phase 1 while the plugin boundary is being proven.
- Additional cleanup is required to remove the embedded export surface from `@afenda/features-sdk`.

## Evidence and enforcement matrix

| Contract statement                                        | Source of truth                                        | Current evidence                                            | Enforcement mechanism              | Gap / follow-up                                     |
| --------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------- | --------------------------------------------------- |
| Cline starts as one package with internal boundaries      | this ADR, `packages/cline/**`                          | package tree and migrated source under `packages/cline/src` | review discipline + typecheck      | stronger import-boundary enforcement can come later |
| Core stays domain-agnostic                                | this ADR, `packages/cline/src/core/**`                 | core contracts and engine do not import Feature SDK         | review discipline + lint/typecheck | add automated boundary guard later if needed        |
| Feature SDK plugin owns domain reasoning                  | this ADR, `packages/cline/src/plugins/features-sdk/**` | migrated mode/guards/tools/explain code                     | review discipline + tests          | deepen plugin functionality in Phase 2              |
| Embedded prototype is not kept as the live export surface | this ADR, `packages/features-sdk/src/index.ts`         | `@afenda/features-sdk` exports only the Sync-Pack surface   | code review + typecheck            | stronger automated boundary checks can come later   |

## Implementation plan

### Completed now

- The single-package decision and internal dependency law are defined.
- `packages/cline` exists with `src/core`, `src/mcp-server`, and `src/plugins/features-sdk` boundaries.
- `@afenda/features-sdk` exports only the Sync-Pack surface from `src/index.ts`.
- The earlier embedded prototype is no longer the live runtime surface.

### Required follow-through

- [x] Create `packages/cline` with minimal core, MCP server skeleton, and Feature SDK plugin boundary — governance-toolchain — current phase
- [x] Migrate the existing embedded prototype into `packages/cline/src/plugins/features-sdk` — governance-toolchain — current phase
- [x] Remove exported embedded Cline surface from `@afenda/features-sdk` — governance-toolchain — current phase
- [x] Add the companion ATC and keep it current as evidence improves — governance-toolchain — current phase
- [ ] Add stronger automated boundary enforcement for `packages/cline` internal import law — governance-toolchain — next phase

### Exit criteria for “implemented”

- [x] `packages/cline` exists and typechecks
- [ ] Feature SDK plugin behavior is exercised by tests from the new package
- [x] `@afenda/features-sdk` no longer exports a live `./cline` surface
- [x] ADR + ATC pair remain current and pass architecture contract checks

## Validation plan

- Required checks:
  `pnpm --filter @afenda/cline typecheck`, `pnpm --filter @afenda/cline test:run`, `pnpm --filter @afenda/features-sdk typecheck`, `pnpm run script:check-architecture-contracts`
- Required manual QA:
  review the new package tree and confirm no domain-specific imports exist in `src/core`
- Runtime/operational signals to watch:
  accidental core-to-plugin imports, reintroduction of `features-sdk` exported Cline surfaces, and duplicated behavior across old and new locations
- How success will be measured after rollout:
  one authoritative Cline package exists, Feature SDK integration remains functional, and future extraction remains optional rather than urgent

## Trigger metrics (for revisit, escalation, or migration)

- Trigger 1: a second plugin needs to consume `src/core` primitives
- Trigger 2: MCP server lifecycle or dependency pressure diverges from core needs
- Trigger 3: Feature SDK plugin dependencies start polluting core or causing repeated boundary review friction
- Trigger 4: separate publishing/versioning or external consumption becomes necessary

## Rollout and rollback / containment

### Rollout plan

- Land ADR + ATC pair.
- Create `packages/cline` and migrate the existing prototype.
- Keep the embedded `features-sdk` export surface removed.
- Validate package behavior and architecture contract integrity.

### Rollback/containment plan

- If migration causes unacceptable churn, keep the single `packages/cline` package boundary but temporarily narrow migrated functionality to the proven subset.
- Do not restore an embedded Cline runtime inside `packages/features-sdk` as the long-term home unless this ADR is superseded.

## References

- [ATC-0006 Cline package boundaries and ownership](../atc/ATC-0006-cline-package-boundaries-and-ownership.md)
- [ADR template](./ADR_TEMPLATE.md)
- [Governance constitution](../governance/GOVERNANCE_CONSTITUTION.md)
