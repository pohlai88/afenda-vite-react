# Shell Architecture

## Purpose

This document defines the canonical shell architecture for the governed constant layer in `packages/shadcn-ui`.

It translates shell guidance into the repository's current naming convention and module layout, so runtime and static governance stay aligned as the shell expands.

**Enterprise matrix source:** The full multi-tenant shell component matrix and phased build plan live in [`packages/shadcn-ui/src/lib/constant/policy/shell/SHELL_COMPONENTS_GUARDRAILS.md`](../packages/shadcn-ui/src/lib/constant/policy/shell/SHELL_COMPONENTS_GUARDRAILS.md). Normative exploration and churn for that matrix may also appear in [`docs/__idea__/working_ref.md`](./__idea__/working_ref.md) before it is promoted into the guardrails doc.

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

| Dimension | Role |
| --- | --- |
| **Zone** | Placement (`root`, `header`, `sidebar`, `content`, `panel`, `overlay`, `command`, `footer`) — from `shell-policy` / `shell-metadata-contract`. |
| **Kind** | Participation role (`platform`, `navigation`, `command`, `overlay`, `content`, `supporting`, and over time `identity`, `security`, `notification`, `governance` where the matrix calls for finer semantics). |
| **Scope** | Whose truth the surface represents: `platform`, `tenant`, `workspace`, `user`, `session`, `environment`. |
| **Isolation** | Boundary discipline: `tenant_strict`, `workspace_strict`, `session_bound`, `global_safe`. |
| **Priority tier** | Sequencing: **Implemented** (in registry/runtime), **Foundation** (shell is not real without it), **Enterprise Core**, **Operational Governance** (trust/compliance/ops), **Expansion** (depth after stability). |

**Enterprise state coverage** is explicit: unresolved tenant/workspace, access denied, offline/degraded, no-data, and similar surfaces are first-class (see Section F in the guardrails matrix). Omitting them produces a shell that looks complete but fails in production edge cases.

Today, the **TypeScript contract** (`shell-component-contract.ts`) encodes zone, kind, surface scope, isolation, priority tier, and participation modes against shell runtime dependencies. The **enterprise matrix** in the guardrails doc remains the rollout catalog for additional surfaces (Phases 2–4); each promoted component follows DoD-G1–G6 in the same change set (contract, registry, runtime, tests, governance report).

## Canonical Naming Convention

Use these file classes:

- `*-policy.ts`: doctrine and governance switches
- `*-contract.ts`: canonical schema/contract declarations
- `validate-*.ts`: explicit validator modules
- `use-*.ts`: governed hook surfaces
- runtime helper names remain explicit (`shell-provider.tsx`, `shell-selectors.ts`)

Current shell modules (see [`packages/shadcn-ui/src/lib/constant/policy/shell/README.md`](../packages/shadcn-ui/src/lib/constant/policy/shell/README.md) for the full list):

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

1. Define doctrine in policy/contract modules.
2. Register shell-aware components in `shell-component-registry.ts`.
3. Validate with `validate-shell-registry.ts` and `validate-constants.ts`.
4. Run governance scripts for static/runtime evidence.
5. Persist CI JSON reports for audit history.
6. Refresh the guardrails matrix “Current Status” table after registry changes (`pnpm run script:generate-shell-components-guardrails`).

## Phased delivery (aligned with enterprise matrix)

High-level sequencing (detail and full component lists: guardrails doc):

1. **Phase 1 — Foundation:** structural shell, overlay host, tenant/workspace switchers, primary search — makes the shell real. **Constant-layer Phase 1 doctrine** (slot, layout, tenant/workspace, metadata, state, overlay, search policies) is the governance complement so composition and multi-tenant behavior stay policy-led, not UI-led.
2. **Phase 2 — Enterprise Core:** breadcrumbs, account/org menus, command palette, policy + notification surfaces, delegated/impersonation banners — enterprise-capable. Ship each component via the guardrails PR checklist when the matrix row is promoted.
3. **Phase 3 — Operational Governance:** status, environment, audit entry, maintenance/incident, session/restricted-mode, sync/read-only, etc. — production-trustworthy.
4. **Phase 4 — Expansion:** panels, footer, quick actions, support/assistant, recents/saved views, etc. — depth after stability.

Phases 2–4 are **sequenced in the matrix**, not all implemented at once; each addition updates contract, registry, runtime, tests, and governance artifacts per DoD-G1–G6.

## CLI and Report Workflow

Primary command:

- `pnpm run script:check-shell-governance-report`

JSON mode for CI:

- `pnpm run script:check-shell-governance-report -- --format=json`

Integrated governance command:

- `pnpm run script:ui-drift-governance`

Generated artifacts:

- `reports/shell-governance/shell-governance-report.vNNNN.json`
- `reports/shell-governance/shell-governance-report.latest.json`

Versioning is incremental (`v0001`, `v0002`, ...), enabling governance snapshots across builds.

## Non-Negotiable Rules

- Do not introduce feature-local shell zone vocabularies.
- Do not fork shell metadata shapes locally.
- Do not bypass shell provider/hook selectors with ad hoc shell context usage.
- Do not ship shell-aware components without contract and registry declaration.
- Do not alter policy keys without coordinated validator and script updates.
- Treat **enterprise state surfaces** (unresolved tenant/workspace, access denied, offline/degraded) as part of shell completeness, not optional polish.

## Expansion Protocol

When adding a new shell-aware component:

1. Add contract key and contract entry in `shell-component-contract.ts`.
2. Register it in `shell-component-registry.ts`.
3. Ensure validator pass in `validate-shell-registry.ts`.
4. Run `pnpm run script:check-shell-governance-report -- --format=json`.
5. Confirm report has no missing registrations and no stale entries.
6. Run `pnpm run script:generate-shell-components-guardrails` and align the enterprise matrix row if the component was planned there.

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

- [`packages/shadcn-ui/src/lib/constant/policy/shell/SHELL_COMPONENTS_GUARDRAILS.md`](../packages/shadcn-ui/src/lib/constant/policy/shell/SHELL_COMPONENTS_GUARDRAILS.md) — live enterprise matrix, phased plan, DoD, auto-generated Current Status.
- Stub pointer: [`docs/SHELL_COMPONENTS_GUARDRAILS.md`](./SHELL_COMPONENTS_GUARDRAILS.md) (redirects to the package-local doc).
- [`docs/__idea__/working_ref.md`](./__idea__/working_ref.md) — idea-stage matrix churn; promote into guardrails when stable.
- Refresh the guardrails “Current Status” table from registry truth: `pnpm run script:generate-shell-components-guardrails`.
