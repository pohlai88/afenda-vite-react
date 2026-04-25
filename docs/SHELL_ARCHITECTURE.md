---
owner: web-runtime-shell
truthStatus: canonical
docClass: canonical-doc
relatedDomain: shell-governance
---

# Shell Architecture

## Purpose

This document defines the canonical shell architecture for the governed constant layer in `packages/shadcn-ui-deprecated`.

It translates shell guidance into the repository's current naming convention and module layout, so runtime and static governance stay aligned as the shell expands.

**Enterprise matrix source:** The full multi-tenant shell component matrix and phased build plan live in [`packages/shadcn-ui-deprecated/src/lib/constant/policy/shell/SHELL_COMPONENTS_GUARDRAILS.md`](../packages/shadcn-ui-deprecated/src/lib/constant/policy/shell/SHELL_COMPONENTS_GUARDRAILS.md). The active shell doctrine now lives in governed runtime docs under [`apps/web/src/app/_platform/shell/README.md`](../apps/web/src/app/_platform/shell/README.md) plus constant-layer docs, not in legacy root-level stubs.

## Scope Boundary

This document covers constant-layer shell governance only:

- policy truth
- metadata contract truth
- shell component participation contract
- shell registry and validation
- CI/reporting integration

It does not replace runtime app-shell behavior in `apps/web`; instead, it provides the reviewed doctrine consumed by scripts, validators, and shell-aware components.

## Enterprise shell matrix (conceptual model)

The mature shell plan is not “layout only”. Each shell-aware surface is evaluated along dimensions that match enterprise multi-tenant products:

| Dimension         | Role                                                                                                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Zone**          | Placement (`root`, `header`, `sidebar`, `content`, `panel`, `overlay`, `command`, `footer`) — from `shell-policy` / `shell-metadata-contract`.                                                                   |
| **Kind**          | Participation role (`platform`, `navigation`, `command`, `overlay`, `content`, `supporting`, and over time `identity`, `security`, `notification`, `governance` where the matrix calls for finer semantics).     |
| **Scope**         | Whose truth the surface represents: `platform`, `tenant`, `workspace`, `user`, `session`, `environment`.                                                                                                         |
| **Isolation**     | Boundary discipline: `tenant_strict`, `workspace_strict`, `session_bound`, `global_safe`.                                                                                                                        |
| **Priority tier** | Sequencing: **Implemented** (in registry/runtime), **Foundation** (shell is not real without it), **Enterprise Core**, **Operational Governance** (trust/compliance/ops), **Expansion** (depth after stability). |

**Enterprise state coverage** is explicit: unresolved tenant/workspace, access denied, offline/degraded, no-data, and similar surfaces are first-class (see Section F in the guardrails matrix). Omitting them produces a shell that looks complete but fails in production edge cases.

Today, the **TypeScript contract** (`shell-component-contract.ts`) encodes zone, kind, surface scope, isolation, priority tier, and participation modes against shell runtime dependencies. The **enterprise matrix** in the guardrails doc remains the rollout catalog for additional surfaces (Phases 2–4); each promoted component follows DoD-G1–G6 in the same change set (contract, registry, runtime, tests, governance report).

## Canonical Naming Convention

Repository-wide naming doctrine lives in [`docs/architecture/governance/NAMING_CONVENTION.md`](../architecture/governance/NAMING_CONVENTION.md).
This section records shell-local applications of that doctrine.

Use these file classes:

- `*.policy.ts` / `*-policy.ts`: doctrine and governance switches
- `*.contract.ts` / `*-contract.ts`: canonical schema/contract declarations
- `validate-*.ts`: explicit validator modules
- `use-*.ts`: governed hook surfaces
- runtime helper names remain explicit (`shell-provider.tsx`, `shell-selectors.ts`)

Current shell modules (see [`packages/shadcn-ui-deprecated/src/lib/constant/policy/shell/README.md`](../packages/shadcn-ui-deprecated/src/lib/constant/policy/shell/README.md) for the full list):

- **P0 doctrine:** `shell-slot-policy`, `shell-layout-policy`, `shell-metadata-policy`, `shell-tenant-context-policy`, `shell-workspace-context-policy`, `shell-state-policy`, `shell-overlay-policy`, `shell-search-policy`
- **P1 / P2 doctrine:** `shell-navigation-policy`, `shell-access-policy`, `shell-command-policy`, `shell-failure-policy`, `shell-responsiveness-policy`, `shell-observability-policy`
- **Core:** `shell-policy`, `shell-context-policy`, `shell-metadata-contract`, `shell-component-contract`, `shell-component-registry`
- **Validators:** `validate-shell-registry`, `validate-shell-policy-consistency`, `validate-shell-runtime-contracts`
- **Runtime:** `shell-provider.tsx`, `use-shell-metadata`, `shell-selectors`, `use-shell-selectors`, `index.ts`

## Architecture Layers

### 1) Policy Layer

- `shell-policy.ts` governs shell zones, required shell infrastructure, and anti-fork switches.
- `shell-context-policy.ts` governs scope and provider discipline (auth, tenant, locale, theme, operator separation).
- Additional policies govern slots, layout, tenant/workspace context, metadata ownership, search, overlays, shell UI state, navigation, access, commands, failure handling, responsiveness, and observability (see package README).

### 2) Contract Layer

- `shell-metadata-contract.ts` defines canonical runtime metadata (`zone`, `density`, `viewport`, navigation and command state).
- `shell-component-contract.ts` defines participation declarations for shell-aware components.

### 3) Registry Layer

- `shell-component-registry.ts` maps stable registry keys to reviewed contract entries.

### 4) Validation Layer

- `validate-shell-registry.ts` checks registry consistency, slot mapping, and singleton slot rules.
- `validate-shell-policy-consistency.ts` checks cross-policy alignment (e.g. layout regions vs slot zones).
- `validate-shell-runtime-contracts.ts` checks registry entries against search/overlay/metadata expectations.
- `validate-constants.ts` runs the full constant layer pipeline including the validators above.

### 5) Consumption Layer

- `shell-provider.tsx` is the canonical provider boundary.
- `use-shell-metadata.ts` and selectors/hook selectors are the preferred consumer path.

## Governance Flow

1. Define doctrine in policy/contract modules under the web app’s platform shell (`apps/web/src/app/_platform/shell/`).
2. Keep registry and navigation contracts aligned with [`apps/web/src/app/_platform/shell/README.md`](../apps/web/src/app/_platform/shell/README.md).
3. Run repo quality gates (`pnpm run lint`, `pnpm run typecheck`, `pnpm run test:run`) and any CI workflows that apply to `apps/web`.

## Phased delivery (aligned with enterprise matrix)

High-level sequencing (detail and full component lists: guardrails doc):

1. **Phase 1 — Foundation:** structural shell, overlay host, tenant/workspace switchers, primary search — makes the shell real. **Constant-layer Phase 1 doctrine** (slot, layout, tenant/workspace, metadata, state, overlay, search policies) is the governance complement so composition and multi-tenant behavior stay policy-led, not UI-led.
2. **Phase 2 — Enterprise Core:** breadcrumbs, account/org menus, command palette, policy + notification surfaces, delegated/impersonation banners — enterprise-capable. Ship each component via the guardrails PR checklist when the matrix row is promoted.
3. **Phase 3 — Operational Governance:** status, environment, audit entry, maintenance/incident, session/restricted-mode, sync/read-only, etc. — production-trustworthy.
4. **Phase 4 — Expansion:** panels, footer, quick actions, support/assistant, recents/saved views, etc. — depth after stability.

Phases 2–4 are **sequenced in the matrix**, not all implemented at once; each addition updates contract, registry, runtime, tests, and governance artifacts per DoD-G1–G6.

## CLI and reports

Legacy shell governance CLIs that produced JSON under `.artifacts/reports/shell-governance/` have been removed. Prefer shell module docs and tests under `apps/web/src/app/_platform/shell/` and the repo [artifact policy](./REPO_ARTIFACT_POLICY.md) if you reintroduce snapshot reports.

## Non-Negotiable Rules

- Do not introduce feature-local shell zone vocabularies.
- Do not fork shell metadata shapes locally.
- Do not bypass shell provider/hook selectors with ad hoc shell context usage.
- Do not ship shell-aware components without contract and registry declaration.
- Do not alter policy keys without coordinated validator and script updates.
- Treat **enterprise state surfaces** (unresolved tenant/workspace, access denied, offline/degraded) as part of shell completeness, not optional polish.

## Expansion Protocol

When adding a new shell-aware component:

1. Follow the contracts and patterns documented in [`apps/web/src/app/_platform/shell/README.md`](../apps/web/src/app/_platform/shell/README.md).
2. Add or update tests next to the shell module (`__tests__` where applicable).
3. Run `pnpm run lint` and `pnpm run typecheck` for `apps/web`.

## Decision Record Guidance

Treat changes in these areas as architecture-level changes:

- shell zone vocabulary
- shell metadata vocabulary
- shell provider requirements
- shell anti-fork switches
- shell contract field semantics
- promotion of matrix columns (scope, isolation, priority) into the enforced contract

When changed, update both docs and governance scripts in the same change set.

## Related

- [`apps/web/src/app/_platform/shell/README.md`](../apps/web/src/app/_platform/shell/README.md) — shell module layout and contracts in this repo.
- Runtime shell source: [`apps/web/src/app/_platform/shell/README.md`](../apps/web/src/app/_platform/shell/README.md)
