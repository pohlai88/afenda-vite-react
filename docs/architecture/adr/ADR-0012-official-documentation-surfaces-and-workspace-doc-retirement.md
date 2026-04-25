---
title: ADR-0012 official documentation surfaces and workspace doc retirement
description: Decision record for retiring the stale docs/workspace collection, restoring repo-root docs as the canonical operating surface, and binding official documentation to real working repository surfaces.
status: active
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
order: 27
---

# ADR-0012: Official documentation surfaces and workspace doc retirement

This document records a governed architecture decision.
Use it for narrative decision context, implementation posture, and evidence expectations.

- **Decision status:** Accepted
- **Implementation status:** Partial
- **Enforcement status:** Partial automation
- **Evidence status:** Partial
- **Date:** 2026-04-25
- **Owner:** Docs policy
- **Review by:** 2026-06-25
- **Scope:** Repo-wide
- **Decision type:** Adopt now
- **Operational posture:** Active contract
- **Related governance domains:** GOV-DOC-001, GOV-ARCH-001, GOV-FS-002
- **Related ATCs:** ATC-0010
- **Supersedes:** None
- **Superseded by:** None

## Context

Afenda's repo-level documentation drifted into an unstable split state:

- AGENTS and contributor-facing guidance expected canonical repo-wide docs at `docs/*.md`.
- The generator and governance bindings had been moved to a `docs/workspace/` collection.
- The `docs/workspace/` collection had become stale and no longer matched the real working repository shape closely enough to be trusted as the official operating surface.

That split created two problems:

1. contributor entrypoints pointed to paths that were no longer real or no longer authoritative
2. governance and generated indexes could still make the stale collection look canonical

Afenda needs one official documentation surface that matches the real repository now and does not force contributors to choose between duplicated doc trees.

## Decision summary

1. `docs/workspace/` is retired as a canonical documentation collection.
2. Repo-wide operating guidance lives at repo-root `docs/*.md`.
3. Doctrine remains under `docs/architecture/**`.
4. Dependency/library guidance remains under `docs/dependencies/**`.
5. Generated indexes remain derived surfaces only:
   - `docs/README.md`
   - `docs/OPERATING_MAP.md`
   - `docs/architecture/**/README.md`
6. Owner-local guidance may live under owner-local `docs/` surfaces when an app or package genuinely owns that guidance.
7. No repo-wide guidance may exist in both `docs/*.md` and `docs/workspace/*.md`.

## Delivery classification

### What is immediately true

- Afenda's official repo-wide guidance surface is repo-root `docs/*.md`.
- `docs/workspace/` is no longer an allowed canonical collection.
- Architecture doctrine remains in `docs/architecture/**`.
- Generated navigation surfaces must point to the root-doc model, not to `docs/workspace/`.

### What is not yet true

- This ADR does not claim every root doc is perfect or complete.
- This ADR does not claim every owner-local package/app doc surface has been rationalized.
- This ADR does not claim all historical references outside the official doc model were already cleaned in prior commits.

### How this ADR should be used

- Treat as **binding policy** for:
  repo-wide documentation placement, canonical vs derived classification, and migration away from stale duplicate collections
- Treat as **directional guidance** for:
  future owner-local docs, feature-local guidance, and package-level README strategy
- Do **not** use this ADR as proof that:
  every existing doc statement is current just because it lives under `docs/`

## Scope and boundaries

- In scope:
  repo-root docs placement, docs generator behavior, governance bindings, generated indexes, and contributor-facing doc entrypoints
- Out of scope:
  package-local implementation docs content, app-local tutorials, and non-doc analysis artifacts under `.artifacts/`
- Affected repos/apps/packages:
  `docs/`, `docs/architecture/**`, `docs/dependencies/**`, `scripts/docs/**`, `scripts/lib/doc-governance.ts`, `scripts/afenda.config.json`, and contributor entrypoint docs such as `AGENTS.md`
- Interfaces/contracts touched:
  generated docs README indexes, operating map links, governance bindings, and documentation entrypoint expectations

## Architecture contract

### Required

- Repo-wide operating guidance must live at repo-root `docs/*.md`.
- Repo-wide doctrine must live under `docs/architecture/**`.
- Generated doc indexes must point to the root-doc surface and current doctrine surfaces.
- Governance bindings must reference current official doc paths.
- Repo-wide documentation must not be duplicated in a retired `docs/workspace/` collection.

### Forbidden

- Restoring `docs/workspace/` as a second canonical documentation tree.
- Pointing AGENTS or generated indexes at stale repo-wide doc paths.
- Treating `.artifacts/reports/**` as canonical documentation.

### Allowed exceptions

- Owner-local docs under app/package `docs/` surfaces when that guidance is genuinely owner-bounded.
- Generated markdown indexes and navigation files that summarize canonical docs without replacing them.

## Alternatives considered

### Option A: Keep `docs/workspace/` and just patch links

- Pros:
  lower immediate migration effort
- Cons:
  preserves the stale duplicate collection and keeps the official surface ambiguous

### Option B: Delete `docs/workspace/` and keep only doctrine

- Pros:
  smallest doc footprint
- Cons:
  loses too much repo-wide operating guidance and leaves contributors without a practical entry surface

## Consequences

### Positive

- The official doc model matches the real repo again.
- AGENTS, governance bindings, and generated indexes can converge on one documentation surface.
- Drift is easier to detect because duplicate repo-wide doc collections are no longer allowed.

### Negative

- The migration touches many cross-links and generated indexes at once.
- Root `docs/` becomes denser, so generated indexes and naming quality matter more.

## Evidence and enforcement matrix

| Contract statement                                | Source of truth                        | Current evidence                                              | Enforcement mechanism                                  | Gap / follow-up                               |
| ------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| Root docs are official                            | repo-root `docs/*.md` + `ATC-0010`     | generated root docs index + contributor links                 | docs generation + doc governance + governance bindings | keep entrypoints aligned when adding new docs |
| `docs/workspace/` is retired                      | `ADR-0012` + `ATC-0010`                | directory removal + updated links                             | doc governance + code review + generator output        | prevent accidental recreation                 |
| Generated indexes point only to official surfaces | `scripts/docs/generate-docs-readme.ts` | `docs/README.md`, `docs/OPERATING_MAP.md`, collection READMEs | docs generation + governance review                    | keep new collection logic narrow              |
| Governance bindings reference real docs           | `scripts/afenda.config.json`           | governance bindings pass                                      | `script:check-governance-bindings`                     | keep future domain references current         |

## Implementation plan

### Completed now

- [ ] Add `ADR-0012`
- [ ] Add `ATC-0010`
- [ ] Move canonical repo-wide docs from `docs/workspace/` to repo-root `docs/*.md`
- [ ] Remove the retired `docs/workspace/` collection
- [ ] Refresh generated docs indexes and governance bindings

### Required follow-through

- [ ] Tighten AGENTS authoritative-reference table to only real maintained docs — Docs policy — 2026-05-05
- [ ] Continue pruning or rewriting stale root docs that still overstate implementation reality — Docs policy + owning teams — 2026-05-15
- [ ] Add owner-local docs only when a bounded owner truly needs them — Owning app/package teams — ongoing

### Exit criteria for “implemented”

- [ ] `docs/workspace/` no longer exists
- [ ] repo-root `docs/*.md` contains the official repo-wide operating docs
- [ ] generated docs indexes do not link to `docs/workspace/`
- [ ] governance bindings and documentation checks pass

## Validation plan

- Required checks:
  `pnpm run script:generate-docs-readme`, `pnpm run script:check-doc-governance`, `pnpm run script:check-architecture-contracts`, `pnpm run script:check-governance`
- Required manual QA:
  verify AGENTS, docs root README, operating map, and governance-linked docs all route to real current files
- Runtime/operational signals to watch:
  broken links, duplicated root-vs-workspace doc trees, and governance bindings pointing at removed files
- How success will be measured after rollout:
  contributors start from root docs and doctrine without needing to guess which doc tree is official

## Trigger metrics (for revisit, escalation, or migration)

- Trigger 1: a second repo-wide doc collection is proposed outside root `docs/*.md`
- Trigger 2: generated indexes or AGENTS drift to non-existent official-doc paths
- Trigger 3: more than three governance/domain references point at removed or stale documentation surfaces

## Rollout and rollback / containment

### Rollout plan

- Step 1: declare the official root-doc model in ADR + ATC
- Step 2: migrate canonical docs out of `docs/workspace/`
- Step 3: refresh generated indexes, bindings, and contributor entrypoints

### Rollback/containment plan

- If the root-doc surface becomes unmanageable, refine the official model through doctrine and selective subcollections rather than resurrecting `docs/workspace/`.

## References

- Related docs:
  `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/PROJECT_STRUCTURE.md`, `docs/REPO_ARTIFACT_POLICY.md`, `docs/architecture/governance/GOVERNANCE_CONSTITUTION.md`
- Related issues/PRs:
  none
- Related incidents/postmortems:
  stale `docs/workspace/` collection vs contributor-facing root-doc expectations
