# `_platform/shell`

Authenticated **runtime frame** for `/app/*`: sidebar, header, breadcrumbs, and declared chrome slots. This is **platform infrastructure**, not a feature domain and not a dashboard.

**Layout:** `apps/web/src/app/_platform/shell/` — `contract/`, `services/`, `hooks/`, `components/`, `routes/`, `docs/`, `__tests__/`, governed entry surfaces (`index.ts`, `shell-*-surface.ts`), and shell-local support modules.

## Doctrine

- Shell **renders** platform chrome and **composes** routes via `Outlet`. It does **not** own business logic, authoritative authorization, or feature-internal modules.
- Shell consumes **`@afenda/design-system`** public APIs only (`ui-primitives`, `icons`). External UI examples are **non-authoritative** inspiration.
- **Navigation visibility** filtering in the shell is **advisory only**. API/server authorization remains authoritative.
- Shell **must not** import `packages/design-system/.idea/*`, `@afenda/database`, `drizzle-orm`, `pg`, feature internals, or feature domain services. Compose features **only** through public package roots or explicit route adapters.

## `contract/` vs `policy/`

| Layer           | Purpose                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| **`contract/`** | Structural types: navigation shape, `ShellRouteMetadata`, `ShellMetadata`, slot IDs, breadcrumb contracts. |
| **`policy/`**   | Runtime config: `shellNavigationItems`, slot activation flags for v1, capability metadata.                 |

## Ownership (summary)

| Concern                                | Owner                               |
| -------------------------------------- | ----------------------------------- |
| Chrome rendering                       | `_platform/shell` components        |
| Navigation **shape**                   | `contract/` + `constants/`          |
| Navigation **data**                    | `policy/`                           |
| Pure filtering / breadcrumb derivation | `services/`                         |
| Authorization truth                    | Server / API / features — not shell |

## Services

Shell `services/` are **pure** (deterministic, side-effect free): navigation filtering, breadcrumb segments from route `handle`, `resolveShellBreadcrumbs`, etc. No domain orchestration or API calls in v1.

**Metadata governance:** `validateShellMetadata` is the **field** validator; **invariant** truth (catalog + router scope) is expressed as `ShellInvariantIssue` with stable `SHELL_INV_*` codes in `contract/shell-invariant-codes.ts`. `collectShellRouteCatalogIssues` maps field/system checks into those codes; `assertShellRouteCatalog` fails CI on breach. `pnpm --filter @afenda/web shell:validation-report` writes a `ShellValidationReport` JSON under `.artifacts/reports/shell-governance/` (see repo `docs/REPO_ARTIFACT_POLICY.md`): `version` (`SHELL_VALIDATION_REPORT_SCHEMA_VERSION`), `status`, `generatedAt`, `routeCount`, `issueCount`, deterministically sorted `issues`, `summary`, optional `resolutionTrace` / `traceSamples`, and embedded **`doctrine`** (resolution mode and coverage semantics — self-contained for reviewers). Runtime hooks log field validation issues in development only; production relies on CI.

**Diff-aware governance (first wave):** `diffShellValidationReports` produces a deterministic `ShellValidationReportDiff` with `hasBreakingChanges` (schema/doctrine drift, `ok → error`, new issue codes, trace resolution changes, removed required samples, added negative controls). `formatShellValidationReportDiff` prints a short CI-friendly summary (title reflects breaking vs non-breaking). Set `SHELL_GOVERNANCE_BASELINE_PATH` to a baseline JSON when running `shell:validation-report` to emit `shell-metadata-validation-report.diff.json` and fail the process when `hasBreakingChanges` is true (human summary + raw JSON on stderr). Use `shell:validation-report:compare` with two file paths for ad-hoc comparisons.

### Shell command execution (runtime map)

| Path                                                                                        | Scope                                    | Use when                                                                                                                                                |
| ------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`shellCommandActivityStore`**, **`useShellCommandActivity`**, **`useShellCommandRunner`** | App-wide, one active run per `commandId` | Context-bar actions and any surface that must stay in sync across components.                                                                           |
| **`useShellCommandInteraction`**                                                            | Per hook instance (local `Set`)          | Modals or feature areas that should not share global activity.                                                                                          |
| **`useShellCommandExecutor`** / **`createShellCommandExecutor`**                            | No activity / feedback orchestration     | Low-level execution only; prefer **`useShellCommandRunner`** for UI.                                                                                    |
| **`createShellCommandDispatcher`**                                                          | Throws on failure                        | Tests (`shell-command-dispatcher.test.ts`) or callers that want throw semantics — there is **no** `useShellCommandDispatcher` hook (removed as unused). |
| **`createShellCommandInteractionController`**                                               | Imperative, new `Set` per factory call   | Tests; not wired to the global activity store.                                                                                                          |

`useShellCommandRunner` forwards **`routeId`** from `useShellRouteResolution().trace.registeredRouteId` (catalog match for the current pathname) into `executor.execute`, unless the call supplies **`routeId`** on the context. Optional **`tenantId`** / **`actorUserId`** on the context are passed through when your auth layer sets them.

### Shell coverage invariant

Resolution trace validation uses `buildShellValidationTraceSamples`, which emits **`ShellTraceExpectation`** rows: each **required** sample states `expectedMode` (`direct` or `fallback`) and `expectedResolvedRouteId` (route family owner). Concrete catalog paths are direct samples; `coverage.descendantSamplePaths` on a route declares fallback samples for that family. **Negative controls** expect `none` / `null`. Mismatches are `SHELL_INV_COVERAGE_001` (**critical**) for required samples or missing trace rows, and `SHELL_INV_COVERAGE_002` (**high**) when a negative control resolves. The report embeds full `traceSamples` expectations; it does not claim universal URL enumeration.

### Metadata pipeline (runtime)

Stable order of responsibilities:

1. Router matches expose `handle.shell` (`ShellMetadata` or omitted).
2. `useShellRouteMeta()` / `resolveShellRouteResolution()` pick the deepest governed shell payload.
3. `resolveShellMetadata()` normalizes `undefined` → shared empty sentinel and optionally runs `validateShellMetadata` (dev logging via `useShellMetadata`).
4. Consumers (`useShellBreadcrumbs`, `useShellTitle`) read **`useShellMetadata()`** only — no parallel metadata sources.

`translate-shell-namespace-key.ts` is the single cast point for passing runtime `labelKey` strings into `useTranslation("shell")`’s `t()`.

## Tailwind v4 and global styling

The shell does **not** define the app theme. Shared layout tokens, `@source` scanning, plugins, and base rules live in **`apps/web/src/index.css`** (Tailwind v4 CSS-first entry, plus generated theme from `packages/design-system`). Chrome uses **`@afenda/design-system`** primitives (`ui-primitives`, `icons`).

When something looks wrong **globally** (colors, dark mode, focus rings, body background), inspect **`index.css`** and the design-system generated theme—not `policy/` or shell contracts. When only **sidebar/header** layout breaks, check shell components **and** the underlying primitive implementations (for example flex children may need `min-w-0` for truncation).

**Doctrine:** Shell contracts and governance tests are **not** “over-engineered noise”—they keep route-driven chrome consistent at ERP scale. If the frame feels unfinished, that is usually **missing product polish** (global theme wiring, document title, semantic chrome utilities), not a reason to flatten metadata or bypass hooks.

## Debugging

**1. Classify the boundary**

| If the bug is in…                   | Look here first                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Sidebar, header, breadcrumbs, slots | `_platform/shell/components/` and wrapped design-system primitives                                     |
| Page body inside the frame          | Feature routes rendered by `<Outlet />` (`apps/web/src/app/_features/*`, etc.)—not shell authorization |
| Theme, spacing, or focus everywhere | `apps/web/src/index.css` + design-system generated CSS                                                 |

**2. Navigation or breadcrumbs look wrong**

- Ensure each matched route under `/app/*` defines **`handle.shell`** (`ShellMetadata` from `ShellRouteMetadata.shell`)—see `routes/shell-route-definitions.ts` and `apps/web/src/routes/` (e.g. `route-app-shell.tsx`).
- Confirm **`shellNavigationItems`** / groups in `policy/shell-navigation-policy.ts` match `shellNavId` and `href` values from contracts.
- Follow **Platform Shell Breadcrumb** below (contract → match resolver → policy resolver → hooks → UI).

For broader governance narrative (constant layer, phased matrix), see `docs/SHELL_ARCHITECTURE.md`. Day-to-day shell behavior is defined here and in `apps/web/src/routes/`.

---

## Platform Shell Breadcrumb

Canonical breadcrumb architecture for the authenticated platform shell.

### Purpose

This module provides a governed breadcrumb system for shell navigation that is:

- metadata-driven
- translation-aware
- router-aware
- testable in isolation
- resistant to UI drift

It separates breadcrumb behavior into distinct layers so routing, translation, resolution, and rendering do not collapse into a single component.

### Module structure (breadcrumb)

| Area                                                           | Role                                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `contract/shell-breadcrumb-contract.ts`                        | `ShellBreadcrumbDescriptor`, `ShellBreadcrumbResolvedItem`, `ResolveShellBreadcrumbsOptions` |
| `contract/shell-metadata-contract.ts`                          | `ShellMetadata` (`useShellMetadata` return type)                                             |
| `routes/shell-route-definitions.ts`                            | Canonical `ShellRouteMetadata`; breadcrumb descriptors live on `ShellMetadata.breadcrumbs`   |
| `services/resolve-shell-breadcrumbs.ts`                        | Pure policy: descriptors → `ShellBreadcrumbResolvedItem[]`                                   |
| `hooks/use-shell-metadata.ts`                                  | Deepest match → `resolveShellMetadata()` → `ShellMetadata`                                   |
| `hooks/use-shell-breadcrumbs.ts`                               | Pathname + `shell` i18n + resolver (render-ready items)                                      |
| `components/shell-top-nav-block/shell-top-nav-breadcrumbs.tsx` | Presentation only                                                                            |
| `__tests__/resolve-shell-breadcrumbs.test.ts`                  | Resolver-first Vitest                                                                        |

### Architecture

#### 1. Descriptor layer

Shell metadata producers emit `ShellBreadcrumbDescriptor[]`.

Descriptor rules:

- `id` must be stable (e.g. `UIMatch.id` from the match resolver)
- `labelKey` must be an i18n key in the `shell` namespace, not display text
- `to` is optional
- producers must not emit translated labels

Example:

```ts
const breadcrumbs: ShellBreadcrumbDescriptor[] = [
  { id: "dashboard", labelKey: "nav.dashboard", to: "/dashboard" },
  { id: "settings", labelKey: "nav.settings", to: "/dashboard/settings" },
  { id: "profile", labelKey: "nav.profile", to: "/dashboard/settings/profile" },
]
```

#### 2. Resolution layer

`resolveShellBreadcrumbs()` converts descriptors into render-ready items.

Resolution rules:

- empty input resolves to `[]`
- final segment always resolves as `kind: "page"`
- only non-terminal segments with a valid normalized `to` may resolve as `kind: "link"`
- a segment targeting the current pathname must not resolve as a link
- path comparison uses normalized path values

#### 3. Hook layer

`useShellBreadcrumbs()` wires runtime dependencies: `useLocation()`, `useTranslation("shell")`, and shell metadata via `useShellMetadata()`. Structural policy stays in the resolver.

#### 4. Component layer

`ShellTopNavBreadcrumbs` is presentational only inside the top-nav block.

Component rules:

- render the shell root fallback label when the resolved list is empty
- render resolved breadcrumb items only; do not re-run breadcrumb policy in JSX
- keep pathname comparison and translation out of the component
- do not invent breadcrumb ids or targets in JSX

### Non-goals

This module does not own:

- route registration
- page title policy
- authorization policy
- domain breadcrumb generation rules
- shell metadata sourcing strategy beyond match-derived descriptors

Those belong to upstream shell metadata and route systems.

### Governance rules

1. **Stable ids are required** — renderers must not invent breadcrumb identity.
2. **Resolvers own structural decision logic** — no inline `isLast` / `showLink` policy in the component.
3. **Hooks own runtime integration only** — router, translation, metadata lookup.
4. **Components stay dumb** — presentation only.
5. **Translation happens at resolution time** — descriptors keep `labelKey`; resolved items carry `label`.
6. **No non-null assertions for navigation targets** — navigation proof must be structural (`item.kind === "link" && item.to`).

### Testing strategy

**Primary:** `resolveShellBreadcrumbs()` with Vitest — that is the correctness surface for policy.

**Secondary:** hook or component tests only when an integration regression is worth guarding; do not duplicate resolver coverage in JSX.

### Drift signals

Refactor immediately if any of the following appears:

- component translates inline
- component compares pathname inline
- component generates fallback ids
- hook returns raw descriptors while the component resolves policy
- breadcrumb rendering relies on `to!`

### Desired outcome

The shell breadcrumb system should remain deterministic, testable, metadata-driven, presentational at the UI edge, and easy to evolve without mixing shell policy into JSX.

### Long-term

Route modules declare **`ShellRouteMetadata`** (`routes/shell-route-definitions.ts`); the router attaches **`shell`** to `handle` only.

---

## Title Consumer

Shell title is derived from the governed `titleKey` field on `ShellMetadata`.

Architecture:

- route emits `shell.titleKey`
- `useShellMetadata()` returns normalized shell metadata
- `resolveShellTitle()` converts `titleKey` into translated display text
- `useShellTitle()` provides the runtime consumer hook

Rules:

- title resolution must not happen ad hoc in page components
- title translation must be sourced from the `shell` namespace
- missing or blank `titleKey` resolves to no title
- title uses the same metadata ownership chain as breadcrumbs

---

## Header Actions

Shell header actions are route-owned shell metadata descriptors that drive interactive shell chrome without placing callbacks or render logic into route definitions.

Pipeline:

1. Route declares `shell.headerActions`.
2. `useShellMetadata()` returns normalized shell metadata.
3. `validateShellMetadata()` enforces descriptor correctness (including `commandId` vs `to` by `kind`).
4. `resolveShellHeaderActions()` converts descriptors into render-ready items (labels translated, paths normalized).
5. Presentation consumers resolve and render items only; `commandId` stays a **command intent token**, not a command bus in metadata.

There is intentionally **no dedicated `useShellHeaderActions()` hook** right now. Header-action metadata remains governed and validated, but a shared runtime hook should only exist when there is a real multi-consumer presentation surface for it.

Rules:

- action ids must be stable within the route metadata
- labels are translation keys in the `shell` namespace
- link actions require a non-empty `to`
- command actions require a non-empty `commandId` and must not set `to`
- metadata must not contain runtime handlers or JSX
- action policy must not be reimplemented ad hoc in presentation components

---

## Sidebar state (v1)

`SidebarProvider` from the design system owns collapse/open state. No cross-capability shell store in v1. If shell state must sync with command palette, persisted layout, or tenant chrome later, introduce an explicit platform client-store **after** documenting the need.

## `/app/login`

**Transitional** route outside the authenticated shell layout. Replace when a formal auth runtime (guards, session boundary) lands.

## Slots (v1)

Slot IDs are typed in `contract/shell-slot-contract.ts`. Most slots are **empty** in v1; the doctrine prevents ad hoc prop drilling when extensions arrive.

### Public surfaces

The shell no longer uses one catch-all public barrel for every concern.

- [`index.ts`](./index.ts): compatibility/governance root surface for frame primitives (`AppShellLayout`, `AppShellSidebar`, `ShellLeftSidebar`, `ShellLeftSidebarLayout`, `ShellScopeLineageBar`, `ShellTopNav`, `AppShellAccessDenied`, `AppShellNotFound`) plus the stable child-route segment list already used by tests/governance.
- [`shell-layout-surface.ts`](./shell-layout-surface.ts): curated layout-composition surface (`AppShellLayout`, `AppShellSidebar`, `ShellLeftSidebar`, `ShellLeftSidebarLayout`, `ShellScopeLineageBar`, `ShellTopNav`, `AppShellAccessDenied`, `AppShellNotFound`).
- [`shell-route-surface.ts`](./shell-route-surface.ts): curated route-composition surface for `/app/*` route wiring.
- [`shell-command-surface.ts`](./shell-command-surface.ts): command-runner public surface.
- [`shell-validation-surface.ts`](./shell-validation-surface.ts): curated validation/reporting surface for shell metadata, catalog invariants, resolution traces, and report diffing.

Breadcrumb internals (`resolveShellBreadcrumbs`, `useShellBreadcrumbs`, `ShellTopNavBreadcrumbs`) remain shell-internal today. Route consumers own breadcrumb descriptors through `ShellRouteMetadata.shell.breadcrumbs`; top-nav presentation stays inside `_platform/shell`.
