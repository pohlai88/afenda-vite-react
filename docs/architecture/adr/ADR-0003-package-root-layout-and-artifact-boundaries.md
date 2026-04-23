---
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
---

# ADR-0003: Package root layout and artifact boundaries

- **Decision status:** Accepted
- **Implementation status:** Substantially implemented
- **Enforcement status:** Enforced in CI/runtime
- **Evidence status:** Current
- **Date:** 2026-04-19
- **Owner:** Platform / web
- **Review by:** 2026-10-01
- **Scope:** Repo-wide package-root layout, generated artifact placement, and deploy-output boundaries
- **Decision type:** Record existing baseline
- **Operational posture:** Active contract
- **Related governance domains:** GOV-FS-001, GOV-FS-002, GOV-GEN-001

## Context

Monorepo packages accumulate three different classes of files at the same directory level:

1. product code,
2. deploy/build contract outputs,
3. regenerable noise such as coverage, reports, caches, and scratch files.

When those classes share one package root without clear boundaries, the tree becomes hard to reason about.
Reviews slow down, generated files become easy to normalize by accident, and contributors cannot tell what is durable versus disposable.

The repo also needs a consistent answer to two recurring questions:

- where deploy outputs belong,
- where disposable artifacts and caches belong.

## Decision summary

1. Package roots must keep product code, deploy outputs, configuration entrypoints, and regenerable artifacts as distinct categories.
2. Deploy outputs that hosts expect, such as `dist/`, remain package-local contract outputs and are not treated as disposable artifact noise.
3. Regenerable reports, coverage, caches, and scratch output belong under `.artifacts/` at repo scope or package scope, never as loose root clutter.
4. Package roots remain shallow and governed by explicit allowlists validated in CI.

## Delivery classification

### What is immediately true

- Repo and package artifact policy is already active.
- Generated evidence is already routed into `.artifacts/` for governance and related cross-cutting outputs.
- Workspace/package topology checks already enforce root layout expectations.

### What is not yet true

- This ADR does not claim every possible tool in the repo has been normalized forever; new tools can still introduce drift if not wired correctly.
- This ADR does not create a single ATC today because the contract spans multiple governance domains rather than one clean binding surface.

### How this ADR should be used

- Treat as **binding policy** for where generated artifacts and deploy outputs belong.
- Treat as **directional guidance** when onboarding new tools or package layouts.
- Do **not** use this ADR as permission to create new root-level exhaust outside `.artifacts/`.

## Scope and boundaries

- In scope:
  package-root layout, `.artifacts/` placement, build-output boundaries, top-level package allowlists, and generated artifact policy.
- Out of scope:
  the internal folder architecture of `apps/web/src`, state-management policy, and route-specific runtime behavior.
- Affected repos/apps/packages:
  repo root, `apps/*`, `packages/*`, and governance/report tooling.
- Interfaces/contracts touched:
  package root topology, artifact paths, cache placement, deploy-output paths, and CI validation.

## Architecture contract

### Required

- Deploy outputs remain where deployment and build tooling expect them.
- Regenerable non-deploy outputs are routed into `.artifacts/`.
- Package roots are governed by explicit allowed file and directory sets.

### Forbidden

- Treating deploy outputs such as `dist/` as disposable artifact trash.
- Writing loose cache/report directories at repo root or package root when `.artifacts/` is the governed bucket.
- Expanding package roots with ad hoc top-level directories outside the governed profile.

### Allowed exceptions

- Tool-internal caches may remain under places explicitly governed by tool policy, such as `node_modules/.tmp`, when documented.
- A new deploy-output path is allowed only when every host, tool, and companion doc is updated as one change.

## Alternatives considered

### Option A: Treat every generated file as equivalent noise

- Pros:
  simple mental model.
- Cons:
  erases the distinction between deploy contract outputs and disposable debug artifacts.

### Option B: Push all outputs, including deploy outputs, under `.artifacts/`

- Pros:
  one physical bucket for everything generated.
- Cons:
  breaks or confuses deploy tooling, documentation, and consumer expectations.

## Consequences

### Positive

- Clear distinction between deploy output, product code, and disposable noise.
- Easier cleanup of local artifacts without threatening real build contracts.
- Package-root governance becomes machine-checkable.

### Negative

- Tooling must be wired deliberately when new generators or caches are introduced.
- Some layout concerns are enforced across multiple domains rather than a single contract today.

## Evidence and enforcement matrix

| Contract statement                             | Source of truth                                                 | Current evidence                                                       | Enforcement mechanism                                        | Gap / follow-up                                                         |
| ---------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Regenerable outputs belong under `.artifacts/` | `docs/REPO_ARTIFACT_POLICY.md`, package configs, script outputs | governance reports already emit under `.artifacts/reports/governance/` | generated artifact governance and bindings checks            | new tooling still needs explicit adoption when introduced               |
| Package roots remain shallow and governed      | `scripts/afenda.config.json`, package-root profiles             | package topology and root-governance checks                            | `pnpm run script:check-afenda-config`, filesystem governance | older packages may still need occasional cleanup when new drift appears |
| Deploy outputs remain package-local contracts  | package config, Vite/build outputs, artifact policy doc         | `apps/web/dist`, package-local `dist/` usage, repo artifact policy     | package profile governance + review discipline               | future host changes must update docs and config together                |

## Implementation plan

### Completed now

- Repo-level governance evidence is emitted under `.artifacts/`.
- Package-root profiles explicitly allow `.artifacts/`, `dist/`, and governed top-level entries.
- Legacy stray cache and coverage locations have already been reduced in earlier cleanup passes.

### Required follow-through

- [ ] Continue normalizing new tool outputs into `.artifacts/` when new generators are added — platform / web — ongoing
- [ ] Revisit whether this multi-domain contract should eventually split into one or more ATCs with clearer single-domain bindings — governance-toolchain — future governance pass

### Exit criteria for “implemented”

- [ ] New package or repo-level generators no longer write loose exhaust outside governed artifact buckets
- [ ] Package-root checks remain authoritative for allowed root layout
- [ ] Deploy-output paths stay explicit and documented rather than inferred

## Validation plan

- Required checks:
  `pnpm run script:check-afenda-config`, `pnpm run script:check-generated-artifact-governance`, and `pnpm run script:check-filesystem-governance`
- Required manual QA:
  verify new tooling writes only to `.artifacts/` or declared deploy-output paths
- Runtime/operational signals to watch:
  reappearance of root `coverage/`, loose report trees, root `.tmp/`, or package-root caches outside `.artifacts/`
- How success will be measured after rollout:
  package roots remain readable, and generated exhaust is consistently disposable without guesswork

## Trigger metrics (for revisit, escalation, or migration)

Re-open this ADR if one or more persist across two review cycles:

- new classes of generated files repeatedly appear outside `.artifacts/`,
- deploy tooling starts requiring a different package-output contract,
- package-root allowlists begin producing repeated drift exceptions because the current model is too coarse.

## Rollout and rollback / containment

### Rollout plan

- Keep package-root and artifact governance aligned with this ADR.
- Update package profiles and tool config together when a new artifact class appears.
- Keep companion policy docs as operational guides rather than second decision records.

### Rollback/containment plan

- If a tool cannot adopt `.artifacts/` cleanly, document the exception explicitly and keep it narrowly scoped.
- Do not collapse deploy outputs and disposable artifacts into one category just to reduce path count.

## References

- [`docs/REPO_ARTIFACT_POLICY.md`](../REPO_ARTIFACT_POLICY.md)
- [`scripts/afenda.config.json`](../../scripts/afenda.config.json)
- [`docs/architecture/adr/ADR_TEMPLATE.md`](./ADR_TEMPLATE.md)
