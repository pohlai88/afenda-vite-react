# ERP App Shell Specification

Architecture specification for the authenticated ERP shell in `apps/web`.

This document defines the app-shell structure and behavioral rules. Styling law stays in `docs/COMPONENTS_AND_STYLING.md`; migration sequencing stays in `docs/TAILWIND_SHADCN_MIGRATION_PLAN.md`.

## Scope

- Covers authenticated ERP routes under `/app/*`.
- Does not cover marketing/public pages.
- Does not define backend authorization policy; it only defines UI navigation behavior.

## Current Baseline

- `apps/web/src/App.tsx` currently mounts providers and `RouterProvider`.
- `apps/web/src/share/routing/feature-routes.tsx` is currently a flat route list.
- `apps/web/src/share/state/use-app-shell-store.ts` already has shell-ready state:
  - `sidebarOpen`
  - `theme`
  - `language`
  - `currentUser.permissions`

## Shell Geometry (Normative)

From `docs/DESIGN_SYSTEM.md`:

- Sticky app header around `56px` (`h-14` baseline).
- Sidebar supports expanded and collapsed modes.
- Main content uses consistent padding around `24px` (`p-6` baseline).

## Route Architecture

### Mandatory

- Use a parent layout route for `/app/*` and render children through `Outlet`.
- Keep `/app/login` outside the shell layout.
- Use relative child paths inside the `/app` route node.

### Approved Initial Implementation

```tsx
export const featureRoutes: RouteObject[] = [
  { path: '/app/login', element: <LoginView /> },
  {
    path: '/app',
    element: <ErpLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardView /> },
      { path: 'inventory', element: <InventoryView /> },
      { path: 'sales', element: <SalesView /> },
      { path: 'customers', element: <CustomersView /> },
      { path: 'employees', element: <EmployeesView /> },
      { path: 'finance', element: <FinanceView /> },
      { path: 'invoices', element: <InvoiceView /> },
      { path: 'allocations', element: <AllocationView /> },
      { path: 'settlements', element: <SettlementView /> },
      { path: 'reports', element: <ReportsView /> },
      { path: 'settings', element: <SettingsView /> },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]
```

## Provider Hierarchy

### Mandatory

- `SidebarProvider` must be scoped to ERP layout routes, not app-wide.
- Theme and data providers remain app-level.

### Approved Initial Implementation

`App.tsx` (app-level):

- `ThemeProvider`
- `QueryProvider`
- `RouterProvider`
- `Toaster`

`ErpLayout.tsx` (ERP-only):

- `SidebarProvider`
- `AppSidebar`
- `SidebarInset`
- `AppHeader`
- `Outlet`

## Sidebar Architecture

Use shadcn Sidebar primitives:

- `Sidebar`
- `SidebarHeader`
- `SidebarContent`
- `SidebarGroup`
- `SidebarFooter`
- `SidebarRail`
- `SidebarTrigger`

### Mandatory

- Sidebar uses controlled `open` state from `useAppShellStore`.
- Active route state is reflected via `isActive`.
- Use `Link` from `react-router-dom` with `asChild` composition.
- Permission-gate menu visibility by user permissions.

### Approved Initial Navigation Groups

- Main: Dashboard, Inventory, Sales, Customers
- Finance: Finance, Invoices, Allocations, Settlements
- Management: Employees, Reports, Settings

### Permission Gating

Per `docs/ROLES_AND_PERMISSIONS.md` section on UI navigation:

- Hide sidebar entries if the user lacks required permission keys.
- Treat this as UX mirroring only; server authorization remains authoritative.

## Header Architecture

### Mandatory

- Sticky header in shell inset area.
- Include sidebar toggle trigger.
- Include breadcrumb context for route depth.

### Approved Initial Composition

- `SidebarTrigger`
- Vertical `Separator`
- `AppBreadcrumb`
- Right controls: `LanguageSwitcher`, `ThemeToggle`, `UserMenu`

## Breadcrumb Behavior

### Mandatory

- Breadcrumb labels are route-aware and i18n-backed.
- Use breadcrumb context for deeper navigation paths.

### Approved Initial Behavior

- Derive segments from router location/matches.
- Map route keys to `shell` namespace labels.
- Use shadcn `Breadcrumb` primitives.

## i18n Requirements

### Mandatory

Extend `shell.json` in all supported locales (`en`, `ms`, `id`, `vi`) with:

- `nav.*` labels for sidebar groups and links
- user-menu action labels
- breadcrumb root labels where needed

## File Topology

Expected component structure across two workspaces:

```text
packages/ui/src/
  components/ui/
    sidebar.tsx          # shadcn primitive
    breadcrumb.tsx       # shadcn primitive
    avatar.tsx           # shadcn primitive
    dropdown-menu.tsx    # shadcn primitive
    collapsible.tsx      # shadcn primitive
    sheet.tsx            # shadcn primitive
    tooltip.tsx          # shadcn primitive
    skeleton.tsx         # shadcn primitive
    button.tsx           # shadcn primitive
    separator.tsx        # shadcn primitive
    badge.tsx            # shadcn primitive
  lib/
    utils.ts             # cn() helper
  hooks/
  styles/
    globals.css

apps/web/src/share/components/
  layout/
    ErpLayout.tsx        # app shell layout (app-specific)
    AppSidebar.tsx       # composed sidebar (app-specific)
    AppHeader.tsx        # composed header (app-specific)
    AppBreadcrumb.tsx    # composed breadcrumb (app-specific)
    ThemeToggle.tsx      # theme toggle (app-specific)
    UserMenu.tsx         # user menu (app-specific)
    nav-data.ts          # navigation config (app-specific)
    index.ts
```

## Decision Classification

### Mandatory (stable)

- Parent `/app` layout route with `Outlet`
- Login route outside shell layout
- Sidebar state controlled by shell store
- Permission-filtered nav rendering
- i18n-backed nav labels in all locales

### Approved Initial Implementation (can evolve)

- Current group taxonomy (Main/Finance/Management)
- Specific icon mapping per route
- Exact header control order
- Use of collapsed icon sidebar mode
- Specific breadcrumb label strategy

### Can Evolve with ADR

- Server-driven nav configuration
- Multi-tenant nav personalization model
- Advanced shell responsiveness and mobile patterns
- Cross-module breadcrumb metadata system

## Required Component Dependencies

Required shadcn components for shell:

- `sidebar`
- `breadcrumb`
- `dropdown-menu`
- `avatar`
- `collapsible`
- `sheet`
- `tooltip`
- `skeleton`

## Acceptance Criteria

1. Every `/app/*` route (except `/app/login`) renders inside `ErpLayout`.
2. Sidebar collapse state persists across reload.
3. Sidebar entries hide when permission keys are missing.
4. Header remains sticky and includes toggle + breadcrumb + controls.
5. Shell i18n labels resolve in all supported locales.
6. Layout code lives under `share/components/layout` and UI primitives under `packages/ui/src/components/ui`.

## Related Documents

- `docs/COMPONENTS_AND_STYLING.md`
- `docs/TAILWIND_SHADCN_MIGRATION_PLAN.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/BRAND_GUIDELINES.md`
- `docs/ROLES_AND_PERMISSIONS.md`
- `docs/PROJECT_STRUCTURE.md`
