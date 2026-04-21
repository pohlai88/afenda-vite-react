# Filesystem Refactor Planning

## Goal

Refactor the repository toward a stable, anti-drift filesystem that reflects runtime boundaries, owner boundaries, and predictable import flow.

This plan is intentionally repo-shaped. It is not a generic cleanup list.

## Refactor Principles

- Functional first: put enforcement in place before widening scope.
- Ownership first: rename ambiguous files before creating new folders.
- Promote only after reuse is proven.
- Preserve import stability where possible; when not possible, move in narrow slices.
- Do not rename files just to hit a label count; every label must add meaning.

## Current Stable Baseline

Completed in the first governed rollout:

- filesystem governance policy, config, checker, and screening generator exist under `rules/` and `scripts/`
- `apps/web/src/marketing/pages` is under active governance
- `apps/web/src/app/_features` is under active governance
- `apps/web/src/app/_platform` is under active governance
- `apps/web/src/share`, `apps/web/src/routes`, and `apps/web/src/rpc` are under active governance
- `apps/api/src/modules`, `routes`, `middleware`, `contract`, and `lib` are under active governance
- the flagship marketing page has been normalized from generic page-local names into page-owned names
- the first web `utils/` cleanup wave is complete for current governed roots

Validation baseline:

- `pnpm run script:check-filesystem-governance`
- `pnpm run script:generate-filesystem-governance-report`
- `pnpm --filter @afenda/web typecheck`

## Program Structure

The repo should be refactored in waves, not by opportunistic renaming.

### Wave 1: Web Page and App Ownership

Status: complete

Targets:

- normalize page-owned naming under `apps/web/src/marketing/pages`
- remove generic `utils/` directories from governed `apps/web/src/app` areas
- prove the checker against a real production slice

### Wave 2: Web Promoted Layers and Route Surfaces

Status: active

Targets:

- govern `apps/web/src/share` as the only promoted shared layer inside the web app
- audit `apps/web/src/routes` so route files remain route-owned and do not accumulate feature logic
- screen `apps/web/src/rpc` for naming clarity and boundary ownership

Decision rule:

- code used by one route, page, or feature stays local
- code used across unrelated app owners may move into `apps/web/src/share`

### Wave 3: API Module Ownership

Status: active

Targets:

- govern `apps/api/src/modules` as the primary backend ownership boundary
- screen `apps/api/src/routes`, `middleware`, `contract`, and `lib` for vague naming and role drift
- prevent `lib/` from becoming a general-purpose dumping ground

Decision rule:

- business capability code belongs in `modules/`
- cross-cutting HTTP infrastructure belongs in `middleware/` or `routes/`
- true backend primitives may live in `lib/` only if they remain infrastructure-shaped

### Wave 4: Package Boundary Hardening

Status: next

Targets:

- `packages/design-system`
- `packages/_database`
- `packages/contracts`
- package-level public API surfaces and local helper folders

High-signal candidates already visible:

- `packages/design-system/utils`
- `packages/_database/src/queries/helpers`
- `packages/_database/src/schema/helpers`

Decision rule:

- if a package directory exports a real public contract, it may stay promoted
- if a local helper directory only supports one internal area, rename it to its responsibility or fold it into the owner

### Wave 5: Import Boundary Enforcement

Status: planned

Targets:

- block deep imports into feature and module internals
- block promoted shared layers from importing local feature code
- restrict editorial/content files to data-only concerns where applicable

Suggested tool path:

- ESLint boundaries or `no-restricted-imports`

### Wave 6: Root Topology and Archive Hygiene

Status: planned

Targets:

- align root topology rules with actual active repo roots
- decide how `.legacy/`, `archives/`, and migration material should be governed or excluded
- keep active workspace policy separate from archive policy

## Current Audit Backlog

Next concrete review areas:

- `packages/design-system/utils`
- `packages/_database/src/queries/helpers`
- `packages/_database/src/schema/helpers`
- root topology around `.legacy/` and `archives/`

## Refactor Workflow

1. Identify the owner boundary.
2. Screen the target area for generic names, excess depth, and promoted-layer misuse.
3. Rename files for ownership clarity.
4. Split only when the split adds a real boundary.
5. Run `pnpm run script:check-filesystem-governance`.
6. Regenerate `rules/filesystem-governance/repo-screening.md`.
7. Run zone-specific lint, typecheck, and tests.

## Done Criteria

A refactor slice is done when:

- the file names localize bugs clearly
- no new nested `shared/` or `share/` folders are introduced
- no denylisted generic names remain in the touched scope
- path depth stays within policy or has documented justification
- the screening report is clean for that governed rollout
