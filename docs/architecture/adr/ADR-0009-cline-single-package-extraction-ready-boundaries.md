---
title: ADR-0009 Cline single-package governed runtime boundaries
description: Decision record for keeping Cline as one governed operator runtime package with strict core, runtime, MCP transport, and Feature SDK truth-engine boundaries.
status: superseded
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 19
---

# ADR-0009: Cline single-package governed runtime boundaries

- **Decision status:** Accepted
- **Implementation status:** Implemented
- **Enforcement status:** Blocking automation + tests
- **Evidence status:** Active
- **Superseded by:** ADR-0016
- **Date:** 2026-04-24
- **Owner:** Governance toolchain
- **Review by:** 2026-07-24
- **Scope:** bounded subsystem
- **Decision type:** Adopt now
- **Operational posture:** Active contract
- **Related governance domains:** GOV-ARCH-001
- **Related ATCs:** ATC-0006

## Context

Afenda is building a governed Cline runtime for execution, verification, tool routing, and Feature SDK integration. An earlier planning direction proposed separate packages for `cline-core`, `cline-mcp-server`, and `cline-features-sdk-plugin`. That structure is architecturally sound, but it adds package-level ceremony before the boundary has been proven in real usage.

At the same time, the initial embedded prototype that began under `packages/features-sdk` proved valuable enough to keep, but its placement created ownership inversion:

- Cline behavior appeared to be owned by `@afenda/features-sdk`
- Sync-Pack-specific logic leaked into what should become reusable runtime surfaces
- extraction into standalone packages would be harder later if the embedded prototype kept growing

The repository now needs a stronger statement than the original migration-only baseline because the package has become a real governed runtime:

- `@afenda/features-sdk/sync-pack` is the execution truth for the 10 governed Sync-Pack workflows
- `packages/cline` wraps those workflows with mode gating, explanation, next-action guidance, and runtime protocol normalization
- `packages/cline/src/mcp-server` must remain transport-only and delegate only through the top-level runtime API
- the package boundary must be enforced by code, lint, repo-guard, build checks, and parity tests rather than review discipline alone

## Decision summary

1. Cline will start as a single workspace package at `packages/cline`.
2. `packages/cline` is the governed internal operator runtime, not a metadata shell or CLI wrapper.
3. `packages/cline` must invoke only public typed SDK APIs from `@afenda/features-sdk/sync-pack`; it may not import SDK source internals, reconstruct workflow logic, or shell out to CLI commands for execution.
4. `src/core` remains runtime-neutral and must not import Feature SDK, Sync-Pack, or repo-specific remediation logic.
5. `src/plugins/features-sdk` owns mode gating, safety policy, explanation, and runtime wrapping for Sync-Pack workflows, but not the workflow truth itself.
6. `src/mcp-server` remains transport-only and may depend only on the top-level runtime API exported from `src/runtime/index.ts`.
7. `RG-PKG-BOUNDARY-001`, `RG-EXEC-001`, and `ATC-CLINE-TOOLS-001` are blocking invariants for this package boundary.
8. Extraction into multiple packages is deferred until usage proves the need.

## Delivery classification

### What is immediately true

- `packages/cline` is the approved package boundary for the governed Cline runtime.
- The runtime executes all 10 governed Sync-Pack tools through the public workflow catalog.
- Internal dependency law is enforced by lint, repo-guard, tests, and build-time checks.

### What is not yet true

- This ADR does not claim `packages/cline` is already a feature-complete Cline platform.
- This ADR does not claim package extraction is required in Phase 1.
- This ADR does not claim package extraction is no longer useful in the future.
- This ADR does not claim MCP transport is a standalone external product surface.

### How this ADR should be used

- Treat as **binding policy** for package placement and internal ownership boundaries.
- Treat as **directional guidance** for later extraction into multiple packages.
- Do **not** use this ADR as proof that all core abstractions are already final or reusable across multiple plugins.

## Scope and boundaries

- In scope:
  `packages/cline`, the governed runtime protocol, mode law, MCP transport isolation, Feature SDK plugin boundary, and parity between declared tools and the public SDK workflow catalog.
- Out of scope:
  separate package publishing, second-plugin generalization, full planner/explainer architecture, and standalone MCP deployment maturity.
- Affected repos/apps/packages:
  `packages/cline`, `packages/features-sdk`, `docs/architecture/adr`, `docs/architecture/atc`.
- Interfaces/contracts touched:
  Cline core contracts, plugin manifest surface, MCP server wiring surface, Feature SDK plugin boundary, and architecture contract evidence.

## Architecture contract

### Required

- `packages/cline/src/core` must own runtime-neutral primitives only.
- `packages/cline/src/runtime` must own the top-level execution protocol, runtime factory, and governed tool resolution path.
- `packages/cline/src/plugins/features-sdk` must own Feature SDK-specific gating, explanation, and runtime wrapping while invoking the public SDK truth surface only through `@afenda/features-sdk/sync-pack`.
- `packages/cline/src/mcp-server` must own only request mapping, runtime delegation, and response serialization.
- The internal dependency law must remain `src/core <- src/runtime <- src/mcp-server` and `src/core <- src/plugins/features-sdk -> @afenda/features-sdk/sync-pack`.
- Declared governed tool names, the `cline` runtime registry, and the public SDK workflow catalog must stay identical in names and count.

### Forbidden

- `src/core -> src/plugins/features-sdk`
- `src/core -> @afenda/features-sdk`
- `src/plugins/features-sdk -> packages/features-sdk/src/**`
- `src/mcp-server -> src/core/**`, `src/mcp-server -> src/plugins/**`, or `src/mcp-server -> @afenda/features-sdk*`
- subprocess execution or `child_process` usage anywhere in `packages/cline/src/**`
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
- The package now has a real operator execution protocol instead of a policy shell.
- MCP transport stays narrow because execution truth and business logic live elsewhere.

### Negative

- The package now carries stronger doctrine and enforcement maintenance overhead.
- Runtime wiring still depends on one plugin, so future generalization must be deliberate rather than assumed.
- Multi-package extraction remains deferred, not disproven.

## Evidence and enforcement matrix

| Contract statement                                           | Source of truth                                                 | Current evidence                                                                 | Enforcement mechanism                                      | Gap / follow-up                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| Cline is the governed runtime package                        | this ADR, `packages/cline/**`                                   | runtime protocol, runtime factory, plugin execution, and MCP delegation surfaces | typecheck + tests + architecture doctrine                  | revisit only if package extraction becomes useful |
| Cline consumes Features SDK through public Sync-Pack only    | this ADR, `packages/cline/src/**`, `packages/features-sdk/**`   | `tools/index.ts`, `create-default-cline-runtime.ts`, public workflow catalog     | ESLint + repo-guard + build-output assertion               | none for the documented runtime slice             |
| MCP transport depends only on the top-level runtime API      | this ADR, `packages/cline/src/mcp-server/**`                    | MCP runtime wrapper imports `../runtime/index.js` only                           | ESLint + repo-guard + runtime delegation tests             | keep future transports on the same law            |
| Tool tuple, runtime registry, and SDK workflow catalog match | this ADR, runtime contracts, workflow catalog, tool parity test | canonical tuple, generated runtime registry, and SDK catalog stay in lockstep    | `ATC-CLINE-TOOLS-001` parity test + package test suite     | add extra evidence only if a second plugin lands  |
| Embedded prototype stays removed from the live export path   | this ADR, `packages/features-sdk/src/index.ts`                  | `@afenda/features-sdk` exports only the Sync-Pack surface                        | code review + typecheck + architecture contract validation | none                                              |

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
- [x] Add blocking automation for package boundary, tool parity, MCP isolation, and no-subprocess runtime law — governance-toolchain — current phase

### Exit criteria for “implemented”

- [x] `packages/cline` exists and typechecks
- [x] Feature SDK plugin behavior is exercised by tests from the new package
- [x] `@afenda/features-sdk` no longer exports a live `./cline` surface
- [x] blocking invariants prevent source imports, subprocess execution, MCP logic bleed, and tool drift
- [x] ADR + ATC pair remain current and pass architecture contract checks

## Validation plan

- Required checks:
  Superseded by ADR-0016. Current live validation uses `pnpm --filter @afenda/operator-kernel build`, `pnpm --filter @afenda/operator-kernel typecheck`, `pnpm --filter @afenda/operator-kernel test:run`, `pnpm --filter @afenda/features-sdk typecheck`, `pnpm run script:test-repo-guard`, `pnpm run script:check-architecture-contracts`.
- Required manual QA:
  review the runtime protocol and confirm mutating workflows remain gated to `architect_commander`
- Runtime/operational signals to watch:
  accidental core-to-plugin imports, reintroduction of `features-sdk` source reaches, subprocess execution in runtime code, or MCP transport importing internal surfaces
- How success will be measured after rollout:
  one authoritative Cline runtime package exists, Feature SDK execution truth remains functional, and future extraction remains optional rather than urgent

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

- [ATC-0006 Operator Kernel package boundaries and ownership](../atc/ATC-0006-cline-package-boundaries-and-ownership.md)
- [ADR template](./ADR_TEMPLATE.md)
- [Governance constitution](../governance/GOVERNANCE_CONSTITUTION.md)
