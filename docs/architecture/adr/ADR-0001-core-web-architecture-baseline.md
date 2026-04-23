---
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
---

# ADR-0001: Core web architecture baseline

- **Decision status:** Accepted
- **Implementation status:** Substantially implemented
- **Enforcement status:** Partial automation
- **Evidence status:** Partial
- **Date:** 2026-04-06
- **Owner:** Web architecture maintainers
- **Review by:** 2026-07-01
- **Scope:** Repo-wide baseline for `apps/web` and adjacent shared packages
- **Decision type:** Record existing baseline
- **Operational posture:** Active contract
- **Related governance domains:** GOV-ARCH-001, GOV-DOC-001
- **Related ATCs:** ATC-0001

## Context

Afenda is a product monorepo with an ERP-focused web client in `apps/web`.
The team needs stable conventions for scaling features without frequent framework churn.

The current documented baseline includes:

- React + Vite SPA under `apps/web`.
- React Router route shells with progressive feature extraction.
- TanStack Query for server cache and optional Zustand for cross-cutting client state.
- API-first client/server boundary (no DB code in the web client).

This ADR existed to keep the team from treating the web architecture as undecided during early growth. The weakness in the original format was that “Accepted” could be read as “fully enforced,” even when the repo only had partial implementation and partial governance backing.

## Decision summary

Keep the current core web architecture baseline as the default path:

1. Preserve React Router route-shell model while feature modules evolve.
2. Keep client/server separation explicit and enforced in docs and implementation.
3. Prioritize incremental hardening over broad framework replacement.

## Delivery classification

### What is immediately true

- `apps/web` is the canonical React + Vite SPA surface.
- The repo is organized around a client/API separation rather than direct database access from the web client.
- Incremental hardening is the default posture for router, state, and tooling decisions.

### What is not yet true

- This ADR alone does not prove every package, route surface, or runtime boundary is fully enforced in code.
- This ADR does not claim that all architectural rules are encoded in CI or runtime guards.
- This ADR is not a migration-complete statement for every future router, state, or API-layer improvement.

### How this ADR should be used

- Treat as **binding policy** for the baseline stack and direction of travel.
- Treat as **directional guidance** for areas where follow-on ADRs or governance scripts provide the detailed rules.
- Do **not** use this ADR as proof that every enforcement mechanism already exists.

## Scope and boundaries

- In scope:
  `apps/web` SPA baseline, shared client architecture conventions, client/server boundary posture, and default change strategy.
- Out of scope:
  Detailed package-root governance, artifact handling, marketing topology, router migration criteria, and specific state-management exceptions.
- Affected repos/apps/packages:
  `apps/web`, `apps/api`, and shared packages that define frontend runtime contracts.
- Interfaces/contracts touched:
  route composition, API consumption boundaries, client-side data/state ownership, and repo architecture governance.

## Architecture contract

### Required

- The primary web client remains a React + Vite SPA under `apps/web`.
- Web features consume server capabilities through documented API/client boundaries, not direct database coupling.
- Architecture hardening should be incremental unless trigger-based evidence justifies a broader migration.

### Forbidden

- Treating the web architecture as framework-agnostic or undecided without a superseding ADR.
- Introducing direct database concerns into the web client as a shortcut around the API boundary.
- Using this ADR as blanket approval for major framework churn without trigger evidence and follow-on decision records.

### Allowed exceptions

- Tactical implementation changes are allowed when they do not violate the stack baseline or client/server boundary.
- Follow-on ADRs may narrow or supersede parts of this contract when they provide better-scoped evidence and enforcement.

## Consequences

### Positive

- Lower migration risk while ERP modules are still expanding.
- Better onboarding consistency across teams.
- Stable architecture for governance, CI, and documentation.

### Negative

- Some advanced typed-routing capabilities are deferred.
- Full-stack boilerplate parity is not an immediate objective.

## Evidence and enforcement matrix

| Contract statement                                      | Source of truth                                                                                        | Current evidence                                                    | Enforcement mechanism                                      | Gap / follow-up                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `apps/web` is the canonical SPA boundary                | `docs/ARCHITECTURE.md`, `docs/PROJECT_STRUCTURE.md`, workspace layout                                  | `apps/web/`, root workspace manifests, Vite config                  | Repo structure + config review + partial governance checks | Baseline is evident, but ADR-level adoption is inferred rather than explicitly audited |
| Client/server separation remains explicit               | `docs/API.md`, `docs/AUTHENTICATION.md`, package split between `apps/web` and server/database packages | separate app/package boundaries, auth/API client surfaces           | Partial CI/doc governance; review discipline               | Needs stronger automated guardrails for forbidden cross-boundary imports               |
| Incremental hardening is default over broad replacement | `docs/ARCHITECTURE_EVOLUTION.md`, later ADR chain                                                      | follow-on ADRs like ADR-0002 and implementation choices across repo | Human review + doctrine                                    | Not yet expressed as a formal decision-state lifecycle across all ADRs                 |

## Implementation plan

### Completed now

- The repo has a stable `apps/web` SPA baseline and uses follow-on docs/ADRs to elaborate the model.
- Later governance work already depends on this baseline rather than treating the architecture as greenfield.

### Required follow-through

- [ ] Add ADR maturity expectations to the ADR template and architecture-evolution policy — docs-policy — next docs governance pass
- [ ] Add stronger automated checks for client/server architectural boundary drift where practical — web/platform governance — next architecture review
- [ ] Reclassify older ADRs using explicit implementation/enforcement/evidence state so “Accepted” is not read as “fully done” — docs-policy — next ADR maintenance pass

### Exit criteria for “implemented”

- [ ] Core baseline statements are backed by named code/config/doc evidence, not only prose
- [ ] Critical architectural rules have either CI/runtime enforcement or an explicit declared gap
- [ ] Readers can tell whether this ADR is operational truth, transitional doctrine, or watcher-only guidance without inference

## Validation plan

- Required checks:
  docs review for consistency with `docs/ARCHITECTURE.md`, `docs/PROJECT_STRUCTURE.md`, and `docs/ARCHITECTURE_EVOLUTION.md`
- Required manual QA:
  architecture reviewer can answer “implemented, partially implemented, or watcher only?” from the ADR header and evidence matrix alone
- Runtime/operational signals to watch:
  repeated boundary drift, framework churn proposals without trigger evidence, or confusion over whether baseline rules are enforced
- How success will be measured after rollout:
  future ADRs and reviews stop conflating “accepted” with “fully implemented”

## Trigger metrics (for revisit, escalation, or migration)

Re-open this ADR if one or more persist across two iterations:

- Route-related defects or refactor regressions exceed team threshold.
- Feature delivery slows due to route and data-layer coupling.
- Team spends repeated effort undoing architecture drift.

## Rollout and rollback / containment

### Rollout plan

- Adopt the new ADR maturity format for new and revised decision records.
- Reclassify baseline ADRs so readers can distinguish doctrine from implementation and enforcement.
- Use follow-on ADRs or governance scripts to close explicit gaps recorded here.

### Rollback/containment plan

- If the maturity format proves too heavy, keep the decision and evidence sections but reduce the matrix granularity.
- Do not revert to “Status: Accepted” as the only operational signal; that was the ambiguity that caused the current problem.

## References

- [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`docs/ARCHITECTURE_EVOLUTION.md`](../ARCHITECTURE_EVOLUTION.md)
- [`docs/architecture/atc/ATC-0001-core-web-architecture-baseline.md`](../architecture/atc/ATC-0001-core-web-architecture-baseline.md)
- [`docs/PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md)
- [`docs/API.md`](../API.md)
- [`docs/architecture/adr/ADR-0002-trigger-based-upgrades.md`](./ADR-0002-trigger-based-upgrades.md)
