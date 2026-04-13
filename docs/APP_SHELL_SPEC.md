# ERP App Shell Specification

Architecture specification for the authenticated ERP shell in `apps/web`.

This document defines the app-shell structure and behavioral rules. Styling law stays in `docs/COMPONENTS_AND_STYLING.md`; migration sequencing stays in `docs/TAILWIND_SHADCN_MIGRATION_PLAN.md`.

## Scope

- Covers authenticated ERP routes under `/app/*`.
- Does not cover marketing/public pages (`/`).
- Does not define backend authorization policy; shell navigation filtering is **advisory UX only**.

## Ownership (normative)

| Concern                                             | Owner                                                                            |
| --------------------------------------------------- | -------------------------------------------------------------------------------- |
| Runtime frame (sidebar, header, breadcrumbs, slots) | [`apps/web/src/app/_platform/shell/`](../apps/web/src/app/_platform/shell/)      |
| Navigation **shape** (types, IDs)                   | `shell/contract/`, `shell/constants/`                                            |
| Navigation **config** (items, groups)               | `shell/policy/`                                                                  |
| Pure visibility filtering                           | `shell/services/` (`filterShellNavigationItems`)                                 |
| Authoritative authorization                         | Server / API / features — **not** the shell                                      |
| UI primitives                                       | [`@afenda/design-system`](../packages/design-system/) (`ui-primitives`, `icons`) |

## Current baseline

- **Router:** [`apps/web/src/router.tsx`](../apps/web/src/router.tsx) calls `createBrowserRouter` with [`browserRoutes` from `src/routes/route-browser.tsx`](../apps/web/src/routes/route-browser.tsx) — marketing at `/`, authenticated shell at `/app/*`, transitional **`/app/login`** **outside** the shell layout.
- **Shell layout:** `AppShellLayout` from `_platform/shell` composes `SidebarProvider`, sidebar, header, `Outlet`.
- **Features:** Route targets use **public** feature exports only (e.g. `@/app/_features/_template`); shell does not import feature internals.

## Route architecture

### Mandatory

- Parent layout route for `/app/*` with `Outlet`.
- **`/app/login`** stays **outside** `AppShellLayout` until a formal auth runtime replaces the transitional placeholder.
- Child routes under `/app` use relative paths (`events`, `audit`, `partners`, …).
- Route **`handle.shell`** carries [`ShellMetadata`](../apps/web/src/app/_platform/shell/contract/shell-metadata-contract.ts) (from [`ShellRouteMetadata`](../apps/web/src/app/_platform/shell/contract/shell-route-metadata-contract.ts) in route definitions — see [`shell-route-definitions.ts`](../apps/web/src/app/_platform/shell/routes/shell-route-definitions.ts)).

### Reference shape (illustrative)

The live router is the source of truth; it follows this structure:

```tsx
// Illustrative — see apps/web/src/routes/route-browser.tsx
;[
  { path: "/", element: <Home /> },
  { path: "/app/login", element: <AppLogin /> },
  {
    path: "/app",
    element: <AppShellLayout />,
    handle: {
      shell: {
        /* ShellMetadata */
      },
    },
    children: [
      { index: true, element: <Navigate to="events" replace /> },
      {
        path: "events",
        element: <FeatureTemplateView slug="events" />,
        handle: {
          shell: {
            /* … */
          },
        },
      },
      { path: "*", element: <AppShellNotFound /> },
    ],
  },
]
```

## Provider hierarchy

- **`SidebarProvider`** is scoped to the `/app` layout route only (not app-wide `App.tsx`).
- **`App.tsx`** remains minimal: `Suspense` + `RouterProvider` (add theme/query providers when adopted).

## Design system consumption

- Shell chrome is built from **`@afenda/design-system/ui-primitives`** (e.g. `Sidebar*`, `Breadcrumb*`, `Button`, `Separator`) and **`@afenda/design-system/icons`** via a small shell icon map.
- Do **not** import `packages/design-system/.idea/*` or `@afenda/design-system/lib/newyork-v4/*` from app code.

## Sidebar / header / breadcrumb

- **Sidebar:** Data-driven from `shellNavigationItems` in `shell/policy/`; advisory filtering via `filterShellNavigationItems`.
- **Header:** `SidebarTrigger`, `AppShellBreadcrumb`, `LanguageSwitcher` (`_platform/i18n`), optional slot placeholders.
- **Breadcrumbs:** `ShellRouteMetadata` / `handle.shell` (`ShellMetadata.breadcrumbs`) → `resolveShellBreadcrumbs` → `useShellBreadcrumbs` → `AppShellBreadcrumb` (see `shell/README.md`, `shell/routes/shell-route-definitions.ts`).

## Permission gating

Per `docs/ROLES_AND_PERMISSIONS.md`:

- Hide sidebar entries when optional `permissionKeys` are not satisfied (shell service) — **UX only**.
- Server/API authorization remains authoritative.

## i18n

- Shell chrome strings live in the **`shell`** namespace: [`apps/web/src/app/_platform/i18n/locales/*/shell.json`](../apps/web/src/app/_platform/i18n/locales/en/shell.json).
- Keys such as `nav.groups.*`, `nav.items.*`, `breadcrumb.*` are used by route metadata and navigation policy.

## File topology (current)

```text
apps/web/src/app/_platform/shell/
├── components/       # AppShellLayout, AppShellSidebar, AppShellHeader, AppShellBreadcrumb
├── contract/         # ShellRouteMetadata, ShellMetadata, navigation contracts, slot IDs
├── constants/        # Group/item IDs, lifecycle, icon names
├── hooks/            # useShellNavigation, useShellBreadcrumbs, …
├── policy/           # shellNavigationItems, slot flags
├── services/         # Pure filter + breadcrumb resolution
├── types/            # Route handle augmentation, i18n key unions
├── __tests__/
├── README.md
└── index.ts          # Public API
```

## Related documents

- `docs/COMPONENTS_AND_STYLING.md`
- `docs/TAILWIND_SHADCN_MIGRATION_PLAN.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/ROLES_AND_PERMISSIONS.md`
- `docs/PROJECT_STRUCTURE.md`
- [`apps/web/src/app/_platform/shell/README.md`](../apps/web/src/app/_platform/shell/README.md)
