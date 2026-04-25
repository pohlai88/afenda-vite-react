---
title: ADR-0016 Operator Kernel governed runtime boundaries
description: Decision record for renaming the governed internal operator runtime from Cline to Operator Kernel while preserving the ADR-0009 package-boundary and Feature SDK truth-engine contracts.
status: active
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 26
---

# ADR-0016: Operator Kernel governed runtime boundaries

- **Decision status:** Accepted
- **Implementation status:** Implemented
- **Enforcement status:** Blocking automation + tests
- **Evidence status:** Active
- **Date:** 2026-04-25
- **Owner:** Governance toolchain
- **Review by:** 2026-07-25
- **Scope:** bounded subsystem
- **Decision type:** Adopt now
- **Operational posture:** Active contract
- **Related governance domains:** GOV-ARCH-001
- **Related ATCs:** ATC-0006
- **Supersedes:** ADR-0009

## Context

ADR-0009 correctly identified the subsystem as Afenda's governed internal operator runtime, but it used `Cline` in the package name and public API. That name creates avoidable collision risk with the external Cline tool and makes the internal runtime look like a product integration rather than Afenda-owned DevOps infrastructure.

The architecture remains correct:

- `@afenda/features-sdk/sync-pack` is the Sync-Pack workflow truth engine.
- The runtime package owns mode gating, tool routing, explanations, and normalized execution output.
- MCP and CLI surfaces are deferred adapters, not the runtime kernel itself.

This ADR supersedes ADR-0009 for naming and live enforcement paths only. It preserves the ADR-0009 boundary doctrine.

## Decision summary

1. The governed internal operator runtime package is named `@afenda/operator-kernel`.
2. The package lives at `packages/operator-kernel`.
3. Public runtime exports use `Operator` naming, not `Cline` naming.
4. `src/mcp-adapter` remains adapter-only and delegates through the top-level runtime API.
5. `packages/operator-kernel` must consume Feature SDK only through `@afenda/features-sdk/sync-pack`.
6. Runtime code must not import or execute subprocess APIs.
7. `ATC-OPERATOR-TOOLS-001` keeps the runtime tool tuple, registry, and SDK workflow catalog in parity.

## Delivery classification

### What is immediately true

- `packages/operator-kernel` is the active governed runtime package boundary.
- `@afenda/operator-kernel` is private internal DevOps infrastructure.
- The runtime exposes neutral Operator Kernel APIs.
- The adapter layer is not a standalone MCP server product.

### What is not yet true

- This ADR does not introduce a CLI facade.
- This ADR does not introduce MCP transport hosting.
- This ADR does not publish Operator Kernel as an external package.
- This ADR does not split the runtime into multiple packages.

### How this ADR should be used

- Treat as **binding policy** for package name, public runtime naming, and enforcement paths.
- Treat ADR-0009 as historical context for why this runtime exists as one package.
- Do **not** use `Cline` naming for new live package APIs or governance rules.

## Scope and boundaries

- In scope:
  `packages/operator-kernel`, runtime contracts, mode law, adapter isolation, Feature SDK plugin boundary, public surface checks, repo guard policy, and architecture contract evidence.
- Out of scope:
  standalone CLI, actual MCP transport server, public publication, Hercules, GritQL, coverage, package-surface tooling expansion, and supply-chain tooling.
- Affected repos/apps/packages:
  `packages/operator-kernel`, `packages/features-sdk`, `packages/eslint-config`, `scripts/repo-integrity`, `docs/architecture/adr`, `docs/architecture/atc`.
- Interfaces/contracts touched:
  Operator Kernel core contracts, runtime contracts, adapter wiring, Feature SDK plugin surface, repo-guard policy, ESLint package-boundary rules, and architecture contract evidence.

## Architecture contract

### Required

- `packages/operator-kernel/src/core` owns runtime-neutral primitives only.
- `packages/operator-kernel/src/runtime` owns the top-level execution protocol, runtime factory, input schemas, and governed tool resolution path.
- `packages/operator-kernel/src/plugins/features-sdk` owns Feature SDK-specific gating, explanation, and runtime wrapping while invoking only `@afenda/features-sdk/sync-pack`.
- `packages/operator-kernel/src/mcp-adapter` owns request mapping, runtime delegation, and response serialization only.
- Declared governed tool names, the Operator Kernel runtime registry, and the public SDK workflow catalog must stay identical in names and count.

### Forbidden

- `src/core -> src/plugins/features-sdk`
- `src/core -> @afenda/features-sdk`
- `src/plugins/features-sdk -> packages/features-sdk/src/**`
- `src/mcp-adapter -> src/core/**`, `src/mcp-adapter -> src/plugins/**`, or direct `@afenda/features-sdk*`
- subprocess execution or `child_process` usage anywhere in `packages/operator-kernel/src/**`
- live `Cline*` public exports from `@afenda/operator-kernel`

### Allowed exceptions

- Historical ADR-0009 references may retain Cline naming as audit history.
- Future MCP or CLI adapters may be added only through a separate ADR/ATC-backed slice.

## Alternatives considered

### Option A: Keep `@afenda/operator-kernel`

- Pros:
  avoids rename churn.
- Cons:
  keeps external naming collision risk and weakens ownership clarity.

### Option B: Rename to `@afenda/operator-kernel`

- Pros:
  matches ADR-0009's "governed internal operator runtime" language, avoids external tool collision, and clarifies that MCP/CLI are adapters.
- Cons:
  requires coordinated source, docs, lint, repo-guard, lockfile, and CI updates.

## Consequences

### Positive

- The runtime has an Afenda-owned internal name.
- Public APIs describe the role of the package instead of an external tool association.
- Governance rules, ADR/ATC docs, and repo paths align.

### Negative

- The rename creates a wider diff than a runtime-only hardening slice.
- Historical references need clear supersession markers to prevent confusion.

## Evidence and enforcement matrix

| Contract statement                                                  | Source of truth                                         | Current evidence                                                        | Enforcement mechanism                                     | Gap / follow-up                     |
| ------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------- |
| Operator Kernel is the governed runtime package                     | this ADR, `packages/operator-kernel/**`                 | runtime protocol, runtime factory, plugin execution, adapter delegation | typecheck + tests + build + surface check                 | none                                |
| Operator Kernel consumes Features SDK through public Sync-Pack only | this ADR, repo guard, ESLint rule                       | Feature SDK plugin imports `@afenda/features-sdk/sync-pack`             | ESLint + repo-guard + build-output assertion              | none                                |
| MCP adapter depends only on the top-level runtime API               | this ADR, `packages/operator-kernel/src/mcp-adapter/**` | adapter imports `../runtime/index.js` only                              | ESLint + repo-guard + runtime delegation tests            | future transport must keep this law |
| Tool tuple, runtime registry, and SDK workflow catalog match        | runtime contracts, workflow catalog, parity test        | `OPERATOR_TOOL_NAMES`, generated registry, SDK catalog                  | `ATC-OPERATOR-TOOLS-001` parity test + package test suite | none                                |
| Public package surface stays neutral                                | package exports and surface script                      | built `dist/index.js` import smoke                                      | `surface:check`                                           | none                                |

## Implementation plan

### Completed now

- `packages/operator-kernel` is renamed to `packages/operator-kernel`.
- `@afenda/operator-kernel` is renamed to `@afenda/operator-kernel`.
- Public exports use Operator Kernel names.
- Runtime input schemas are exported.
- Repo guard and ESLint boundary rules use `packages/operator-kernel` and `src/mcp-adapter`.
- ADR-0009 is superseded for live naming.

### Required follow-through

- [x] Add ADR-0016 and update ATC-0006 — governance-toolchain — current phase
- [x] Add package surface smoke check — governance-toolchain — current phase
- [x] Update package path/name in lockfile and workspace metadata — governance-toolchain — current phase
- [ ] Revisit MCP/CLI adapters only in later dedicated slices — governance-toolchain — future phase

### Exit criteria for “implemented”

- [x] `packages/operator-kernel` exists and typechecks
- [x] no live `@afenda/operator-kernel` package/API remains
- [x] repo-guard and ESLint block boundary drift on the new package path
- [x] built public surface exposes neutral Operator Kernel exports

## Validation plan

- Required checks:
  `pnpm install --frozen-lockfile`, `pnpm --filter @afenda/operator-kernel typecheck`, `pnpm --filter @afenda/operator-kernel lint`, `pnpm --filter @afenda/operator-kernel test:run`, `pnpm --filter @afenda/operator-kernel build`, `pnpm --filter @afenda/operator-kernel surface:check`, `pnpm --filter @afenda/features-sdk surface:check`, `pnpm run script:test-repo-guard`, `pnpm run script:check-architecture-contracts`, `pnpm run script:check-governance:fast`
- Required manual QA:
  review public exports and confirm no MCP transport or CLI facade was introduced
- Runtime/operational signals to watch:
  accidental `Cline*` API reintroduction, Feature SDK source reaches, subprocess execution, or adapter imports of internal surfaces
- How success will be measured after rollout:
  one authoritative Operator Kernel package exists, Feature SDK execution truth remains functional, and later adapters remain optional

## Trigger metrics (for revisit, escalation, or migration)

- Trigger 1: a real MCP transport host requires lifecycle or dependency ownership separate from the runtime.
- Trigger 2: a CLI facade needs user-facing commands over the runtime.
- Trigger 3: a second plugin needs the core runtime primitives.

## Rollout and rollback / containment

### Rollout plan

- Land ADR/ATC naming update.
- Rename package path, package name, source symbols, governance paths, and CI surface check.
- Validate through package, repo-guard, architecture, and governance checks.

### Rollback/containment plan

- If the rename creates unacceptable churn, revert the rename commit as a unit.
- Do not restore a live embedded runtime inside `@afenda/features-sdk`.

## References

- [ADR-0009 Cline single-package governed runtime boundaries](./ADR-0009-cline-single-package-extraction-ready-boundaries.md)
- [ATC-0006 Operator Kernel package boundaries and ownership](../atc/ATC-0006-cline-package-boundaries-and-ownership.md)
- [Governance constitution](../governance/GOVERNANCE_CONSTITUTION.md)
