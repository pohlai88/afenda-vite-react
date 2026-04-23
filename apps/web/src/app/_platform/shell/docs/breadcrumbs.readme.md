# Platform Shell Breadcrumb

Canonical breadcrumb architecture for the authenticated platform shell.

**Scope:** `apps/web/src/app/_platform/shell/` — contracts, services, hooks, components, and tests described below. Broader shell doctrine (sidebar, slots, import boundaries) lives in [`../README.md`](../README.md).

---

## Purpose

This module provides a governed breadcrumb system that is:

- metadata-driven
- translation-aware
- router-aware
- testable in isolation
- resistant to JSX policy drift

The design separates contract ownership, structural resolution, runtime wiring, and rendering so shell behavior remains deterministic and maintainable.

---

## Module structure

| Area                                                           | Role                                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `contract/shell-breadcrumb-contract.ts`                        | `ShellBreadcrumbDescriptor`, `ShellBreadcrumbResolvedItem`, `ResolveShellBreadcrumbsOptions` |
| `contract/shell-metadata-contract.ts`                          | `ShellMetadata` (`titleKey`, `breadcrumbs`)                                                  |
| `contract/shell-route-metadata-contract.ts`                    | `ShellRouteMetadata` (route modules: `routeId`, `path`, `shell`)                             |
| `routes/shell-route-definitions.ts`                            | Canonical `ShellRouteMetadata` for `/app/*`; router uses `handle: { shell: … }`              |
| `services/resolve-shell-breadcrumbs.ts`                        | Policy resolver: descriptors → render-ready items (`kind`, `label`, path rules)              |
| `hooks/use-shell-metadata.ts`                                  | `useMatches()` → `ShellMetadata`                                                             |
| `hooks/use-shell-breadcrumbs.ts`                               | Pathname + `useTranslation("shell")` + metadata → resolved items                             |
| `components/shell-top-nav-block/shell-top-nav-breadcrumbs.tsx` | Presentation only                                                                            |
| `__tests__/resolve-shell-breadcrumbs.test.ts`                  | Resolver-first tests                                                                         |
| [`shell-layout-surface.ts`](../shell-layout-surface.ts)        | Frame-level public layout surface (`ShellTopNav` is exposed here)                            |

---

## Architecture

### 1. Descriptor layer

Route modules emit **`ShellRouteMetadata`**; **`handle.shell`** supplies `ShellMetadata` with `breadcrumbs: ShellBreadcrumbDescriptor[]` (see `shell-route-definitions.ts`).

**Descriptor rules**

- `id` must be stable (e.g. `UIMatch.id` from the match resolver).
- `labelKey` must be a translation key in the `shell` namespace, not display text.
- `to` is optional.
- Descriptors must not contain translated display labels.

**Example**

```ts
const breadcrumbs: ShellBreadcrumbDescriptor[] = [
  { id: "dashboard", labelKey: "nav.dashboard", to: "/dashboard" },
  { id: "settings", labelKey: "nav.settings", to: "/dashboard/settings" },
  { id: "profile", labelKey: "nav.profile", to: "/dashboard/settings/profile" },
]
```

### 2. Resolution layer

`resolveShellBreadcrumbs()` converts descriptors into render-ready `ShellBreadcrumbResolvedItem[]`.

**Resolution rules**

- Empty input resolves to `[]`.
- The final segment always resolves as `kind: "page"`.
- Only non-terminal segments with a valid normalized target may resolve as `kind: "link"`.
- A segment whose target equals the current pathname must not resolve as a link.
- Path comparison uses normalized path values (shared with the match layer via `normalizeShellBreadcrumbPath`).

### 3. Hook layer

`useShellBreadcrumbs()` wires runtime dependencies:

- `useLocation()` (pathname)
- `useTranslation("shell")`
- Shell metadata via `useShellMetadata()` → typed `ShellMetadata` (`breadcrumbs?`)

The hook must not own structural breadcrumb policy. Structural policy belongs in the resolver.

### 4. Component layer

`ShellTopNavBreadcrumbs` is presentational only.

**Component rules**

- Render the shell root fallback label when the resolved list is empty.
- Render resolved breadcrumb items only; do not re-run breadcrumb policy in JSX.
- Keep pathname comparison and translation out of the component.
- Do not invent breadcrumb ids or targets in JSX.

---

## Governance rules

1. **Stable ids are required** — renderers must not invent breadcrumb identity; production descriptors must carry `id` from the metadata producer (do not relax except in an explicit migration).
2. **The resolver owns structural breadcrumb decisions** — no JSX-time `isLast` / `showLink` policy.
3. **The hook owns runtime integration only** — router, translation, metadata lookup.
4. **The component stays presentational** — rendering only.
5. **Translation resolves during resolution** — descriptors keep `labelKey`; resolved items carry the final `label`.
6. **Navigation proof must be structural** — no `to!` non-null assertions in render logic; use `item.kind === "link" && item.to`.

---

## Testing strategy

### Primary

Test `resolveShellBreadcrumbs()` with Vitest. That is the behavior contract for policy.

**Required coverage**

- empty segments
- terminal segment becomes `page`
- missing `to` behaves as `page` where applicable
- same-path target does not become a link
- trailing slash normalization
- translated label resolution
- stable source `id` retained on resolved items

### Secondary

Add component or hook integration tests only when UI rendering behavior itself needs proof.

---

## Drift signals

Refactor immediately if any of the following appears:

- component translates labels inline
- component compares pathname inline
- component invents fallback ids
- hook returns raw descriptors and the component re-resolves policy
- breadcrumb rendering relies on `to!`

---

## Non-goals

This module does not own:

- route registration
- route authorization
- page-title policy
- domain breadcrumb generation rules
- shell metadata sourcing strategy beyond match-derived descriptors today

Those belong to upstream shell metadata and route systems.

---

## Desired outcome

The shell breadcrumb system should remain:

- deterministic
- contract-driven
- metadata-aware
- testable (resolver-first)
- presentation-only at the UI edge

---

## Public surface status

Breadcrumb internals are intentionally **not** part of the current public shell composition surfaces.

- Route modules participate through `ShellRouteMetadata.shell.breadcrumbs`.
- Layout consumers compose the frame through [`shell-layout-surface.ts`](../shell-layout-surface.ts), which exposes `ShellTopNav`.
- `ShellTopNavBreadcrumbs`, `useShellBreadcrumbs`, and `resolveShellBreadcrumbs` remain shell-internal implementation details for now.

---

## Final architecture verdict

| Layer         | Owns                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Contract**  | Breadcrumb shape + options in `shell-breadcrumb-contract`; shell hook boundary in `shell-metadata-contract` (`ShellMetadata`) |
| **Resolver**  | `resolveShellBreadcrumbs` (descriptor → render items); route-level trail comes from `ShellMetadata.breadcrumbs`               |
| **Hook**      | Runtime integration (router, i18n, metadata)                                                                                  |
| **Component** | Rendering only                                                                                                                |
| **Tests**     | Behavior proof — resolver first                                                                                               |

That is the separation to target in a serious shell system.
