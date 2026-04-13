---
name: Shell chrome refactor
overview: Refactor shell presentation for styling governance while enforcing a single runtime contract — ShellMetadata (shell-metadata) — across every shell-related component that should reflect route chrome. Layout and navigation policy remain explicitly bounded.
todos:
  - id: metadata-alignment-matrix
    content: Enforce ShellMetadata-only access paths per component; add document title from titleKey; document sidebar/policy boundary.
    status: completed
  - id: discover-ui-vocabulary
    content: Locate where approved ui-* utilities are authored; add ui-shell-* in the same governance location.
    status: completed
  - id: dedupe-shell-breadcrumb
    content: Remove redundant BreadcrumbSeparator className in app-shell-breadcrumb.tsx.
    status: completed
  - id: semantic-shell-chrome
    content: Replace raw Tailwind chains in app-shell-header.tsx / app-shell-layout.tsx with semantic utilities.
    status: completed
  - id: sidebar-disabled-pattern
    content: Unify disabled nav styling via DS or one shared ui-* utility (policy-driven chrome, not ShellMetadata).
    status: completed
  - id: verify-ci
    content: Run lint, typecheck, and shell Vitest after changes.
    status: completed
isProject: false
---

# Shell chrome refactor — aligned to `ShellMetadata` (shell-metadata)

## Canonical contract

All **route-driven** shell chrome must derive from [`ShellMetadata`](apps/web/src/app/_platform/shell/contract/shell-metadata-contract.ts) (referred to here as **shell-metadata**):

- `titleKey` — primary shell title (translation key)
- `breadcrumbs` — ordered `ShellBreadcrumbDescriptor[]`
- `headerActions` — declarative `ShellHeaderActionDescriptor[]`

**Single integration point:** [`useShellMetadata()`](apps/web/src/app/_platform/shell/hooks/use-shell-metadata.ts) wraps `useShellRouteMeta()` + [`resolveShellMetadata`](apps/web/src/app/_platform/shell/services/resolve-shell-metadata.ts) (validation in dev). Specialized hooks **must** delegate to `useShellMetadata()` (or call the same services with that metadata) — never duplicate `useMatches` / raw `handle.shell` reads inside presentational components.

## Component ↔ shell-metadata alignment matrix

| Component / surface                                                                                 | Shell-metadata fields              | Approved hooks (today or after refactor)                                                                                        | Notes                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`AppShellBreadcrumb`](apps/web/src/app/_platform/shell/components/app-shell-breadcrumb.tsx)        | `breadcrumbs`                      | `useShellBreadcrumbs()` → `useShellMetadata()`                                                                                  | Presentation only; already aligned. Remove redundant DS `className` only.                                                                                                    |
| [`AppShellHeaderActions`](apps/web/src/app/_platform/shell/components/app-shell-header-actions.tsx) | `headerActions`                    | `useShellHeaderActions()` → `useShellMetadata()`                                                                                | Command execution uses `useShellCommandRunner` + resolution trace — keep.                                                                                                    |
| Browser `document.title` (missing today)                                                            | `titleKey`                         | `useShellTitle()` → `useShellMetadata()`                                                                                        | **Add** a single mount (e.g. `ShellDocumentTitle` under `AppShellLayout` or inside `AppShellHeader`) so tab title matches shell-metadata.                                    |
| Optional: visually hidden / sr-only route title in chrome                                           | `titleKey`                         | `useShellTitle()`                                                                                                               | Only if product wants header chrome to expose title beyond breadcrumbs; otherwise document title may suffice.                                                                |
| [`AppShellHeader`](apps/web/src/app/_platform/shell/components/app-shell-header.tsx)                | (orchestrates children)            | No direct metadata read if children own hooks                                                                                   | Stays structural; hosts breadcrumb + actions + slots; may host `ShellDocumentTitle` only.                                                                                    |
| [`AppShellLayout`](apps/web/src/app/_platform/shell/components/app-shell-layout.tsx)                | (orchestrates frame)               | Same                                                                                                                            | Mount point for document title sync + layout slots.                                                                                                                          |
| [`AppShellNotFound`](apps/web/src/app/_platform/shell/components/app-shell-not-found.tsx)           | Route `handle.shell` for `*` route | Should use `useShellMetadata()` if the not-found route defines shell-metadata; otherwise static i18n only                       | Align with [`shell-route-definitions`](apps/web/src/app/_platform/shell/routes/shell-route-definitions.ts) / catch-all handle so not-found is not a second truth.            |
| [`AppShellSidebar`](apps/web/src/app/_platform/shell/components/app-shell-sidebar.tsx)              | **Not** `ShellMetadata`            | `useShellNavigation()` → policy [`shell-navigation-policy`](apps/web/src/app/_platform/shell/policy/shell-navigation-policy.ts) | **Intentional boundary:** global nav is policy/config, not per-route `handle.shell`. Do not force sidebar labels through `ShellMetadata` unless an ADR extends the contract. |
| Command feedback / header command context                                                           | `routeId` from resolution trace    | `useShellRouteResolution()` inside `useShellCommandRunner`                                                                      | Complements shell-metadata; keeps commands tied to catalog route.                                                                                                            |

## Rules (anti-drift for metadata)

1. **No parallel metadata sources** in shell components: forbid `useMatches()` + `handle.shell` in `components/`; use `useShellMetadata()` or the listed derived hooks only.
2. **`useShellTitle` must be used** wherever `titleKey` should affect the UX surface (minimum: `document.title` inside `/app` shell).
3. **Extend `ShellMetadata` in `contract/`** if new chrome needs route-driven data (e.g. future `subtitleKey`); do not add ad hoc props on layout components fed from random route reads.
4. **Sidebar / slots / overlay** remain **policy and structure** (`shellSlotActivationV1`, navigation groups); they are out of shell-metadata unless the contract explicitly grows.

## Styling (secondary, non-conflicting)

- Same as prior plan: centralize shell chrome Tailwind in governed `ui-shell-*` (or equivalent) in **one** stylesheet per [COMPONENTS_AND_STYLING.md](docs/COMPONENTS_AND_STYLING.md); shell `components/` compose DS primitives + those utilities only.
- Remove duplicate `BreadcrumbSeparator` `className` where design-system already applies it.

## Verification

- Vitest: shell contract + resolver tests unchanged in behavior.
- [`validateShellMetadata`](apps/web/src/app/_platform/shell/services/assert-shell-metadata.ts) / route catalog scripts as today.
- Manual: navigate `/app/*` and confirm `document.title` tracks `titleKey` resolution; breadcrumbs and header actions still match deepest `handle.shell`.

## Out of scope

- Changing `ShellMetadata` shape without contract + governance test updates.
- Moving sidebar into shell-metadata without an explicit contract change.
