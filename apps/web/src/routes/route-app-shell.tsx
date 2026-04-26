/* eslint-disable react-refresh/only-export-components -- Route module exports a RouteObject plus colocated gate components used only by this subtree. */
/**
 * Authenticated ERP shell route subtree under `/app/*`.
 *
 * - Layout and `handle.shell` are driven by `shell-route-definitions` / `_platform/shell`—keep parity with Vitest shell tests.
 * - Wraps shell UI in `AppThemeProvider`; theme is intentionally separate from public marketing routes.
 * - Exports a single `RouteObject` consumed by `browserRoutes` in `../router.tsx` (no extra `createBrowserRouter`).
 * - Uses `errorElement` with `AppRouteErrorFallback` for loader/render errors in this subtree.
 *
 * @see ./README.md — router usage, shell metadata, governance, and how to add `/app` child routes.
 */

import { lazy, type ReactElement } from "react"
import { Navigate, type RouteObject } from "react-router-dom"

import { AppRouteErrorFallback } from "../app/_components"
import { RequireAppReady, RequireAuth } from "../app/_platform/auth"
import {
  erpModuleCatalog,
  getEnabledErpModulePermissionKeysByPathSegment,
} from "../app/_platform/erp-catalog"
import { TenantScopeProvider, useTenantScope } from "../app/_platform/tenant"
import {
  ShellLeftSidebarLayout,
  AppShellAccessDenied,
  AppShellNotFound,
} from "../app/_platform/shell/shell-layout-surface"
import {
  shellAppChildRouteDefinitions,
  shellAppLayoutRoute,
  shellAppNotFoundRoute,
  shellAppSettingsAccountRoute,
  shellAppSettingsSecurityRoute,
  shellAppSettingsAccountPath,
} from "../app/_platform/shell/shell-route-surface"
import { resolveShellHomeHref } from "../app/_platform/shell/services/resolve-shell-home-href"
import { AppThemeProvider } from "../app/_platform/theme"
import { Toaster } from "@afenda/design-system/ui-primitives"

const BetterAuthSettingsView = lazy(() =>
  import("../app/_features/better-auth-settings").then((module) => ({
    default: module.BetterAuthSettingsView,
  }))
)

const DbStudioPage = lazy(() =>
  import("../app/_features/db-studio").then((module) => ({
    default: module.DbStudioPage,
  }))
)

const EventsOpsPage = lazy(() =>
  import("../app/_features/events-workspace").then((module) => ({
    default: module.EventsOpsPage,
  }))
)

const AuditTrailPage = lazy(() =>
  import("../app/_features/events-workspace").then((module) => ({
    default: module.AuditTrailPage,
  }))
)

const DashboardPage = lazy(() =>
  import("../app/_features/dashboard").then((module) => ({
    default: module.DashboardPage,
  }))
)

const FinancePage = lazy(() =>
  import("../app/_features/finance").then((module) => ({
    default: module.FinancePage,
  }))
)

const InvoicesPage = lazy(() =>
  import("../app/_features/finance").then((module) => ({
    default: module.InvoicesPage,
  }))
)

const AllocationsPage = lazy(() =>
  import("../app/_features/finance").then((module) => ({
    default: module.AllocationsPage,
  }))
)

const SettlementsPage = lazy(() =>
  import("../app/_features/finance").then((module) => ({
    default: module.SettlementsPage,
  }))
)

const CounterpartyRosterPage = lazy(() =>
  import("../app/_features/events-workspace").then((module) => ({
    default: module.CounterpartyRosterPage,
  }))
)

const shellRoutePermissionKeysByPathSegment =
  getEnabledErpModulePermissionKeysByPathSegment(erpModuleCatalog)

function AppShellIndexRedirect() {
  const scope = useTenantScope()

  if (scope.status !== "ready") {
    return <AppShellAccessDenied />
  }

  const homeHref =
    resolveShellHomeHref(scope.me.actor?.permissions ?? []) ?? null

  return homeHref ? (
    <Navigate replace to={homeHref} />
  ) : (
    <AppShellAccessDenied />
  )
}

function RequireShellRoutePermission(props: {
  readonly children: ReactElement
  readonly permissionKeys?: readonly string[]
}) {
  const { children, permissionKeys } = props
  const scope = useTenantScope()

  if (!permissionKeys?.length) {
    return children
  }

  if (scope.status !== "ready") {
    return <AppShellAccessDenied />
  }

  const granted = new Set(scope.me.actor?.permissions ?? [])

  return permissionKeys.every((key) => granted.has(key)) ? (
    children
  ) : (
    <AppShellAccessDenied />
  )
}

/** `/app/*` route object: layout, index redirect, feature children, splat 404. Paths and `handle.shell` from shell definitions. */
export const appShellRouteObject: RouteObject = {
  path: "/app",
  element: (
    <AppThemeProvider>
      <RequireAuth>
        <TenantScopeProvider>
          <RequireAppReady>
            <ShellLeftSidebarLayout />
          </RequireAppReady>
        </TenantScopeProvider>
      </RequireAuth>
      <Toaster />
    </AppThemeProvider>
  ),
  errorElement: (
    <AppThemeProvider>
      <AppRouteErrorFallback />
    </AppThemeProvider>
  ),
  handle: { shell: shellAppLayoutRoute.shell },
  children: [
    {
      index: true,
      element: <AppShellIndexRedirect />,
    },
    ...shellAppChildRouteDefinitions.map(({ pathSegment, metadata }) => ({
      path: pathSegment,
      element:
        pathSegment === "account" ? (
          <Navigate replace to={shellAppSettingsAccountPath} />
        ) : pathSegment === "db-studio" ? (
          <RequireShellRoutePermission
            permissionKeys={shellRoutePermissionKeysByPathSegment[pathSegment]}
          >
            <DbStudioPage />
          </RequireShellRoutePermission>
        ) : pathSegment === "events" ? (
          <RequireShellRoutePermission
            permissionKeys={shellRoutePermissionKeysByPathSegment[pathSegment]}
          >
            <EventsOpsPage />
          </RequireShellRoutePermission>
        ) : pathSegment === "audit" ? (
          <RequireShellRoutePermission
            permissionKeys={shellRoutePermissionKeysByPathSegment[pathSegment]}
          >
            <AuditTrailPage />
          </RequireShellRoutePermission>
        ) : pathSegment === "dashboard" ? (
          <RequireShellRoutePermission
            permissionKeys={shellRoutePermissionKeysByPathSegment[pathSegment]}
          >
            <DashboardPage />
          </RequireShellRoutePermission>
        ) : pathSegment === "finance" ? (
          <RequireShellRoutePermission
            permissionKeys={shellRoutePermissionKeysByPathSegment[pathSegment]}
          >
            <FinancePage />
          </RequireShellRoutePermission>
        ) : pathSegment === "invoices" ? (
          <RequireShellRoutePermission
            permissionKeys={shellRoutePermissionKeysByPathSegment[pathSegment]}
          >
            <InvoicesPage />
          </RequireShellRoutePermission>
        ) : pathSegment === "allocations" ? (
          <RequireShellRoutePermission
            permissionKeys={shellRoutePermissionKeysByPathSegment[pathSegment]}
          >
            <AllocationsPage />
          </RequireShellRoutePermission>
        ) : pathSegment === "settlements" ? (
          <RequireShellRoutePermission
            permissionKeys={shellRoutePermissionKeysByPathSegment[pathSegment]}
          >
            <SettlementsPage />
          </RequireShellRoutePermission>
        ) : pathSegment === "counterparties" ? (
          <RequireShellRoutePermission
            permissionKeys={shellRoutePermissionKeysByPathSegment[pathSegment]}
          >
            <CounterpartyRosterPage />
          </RequireShellRoutePermission>
        ) : (
          <AppShellNotFound />
        ),
      handle: { shell: metadata.shell },
    })),
    {
      path: "partners",
      element: <Navigate replace to="/app/counterparties" />,
      handle: { shell: shellAppNotFoundRoute.shell },
    },
    {
      path: "settings/account",
      element: <BetterAuthSettingsView view="account" />,
      handle: { shell: shellAppSettingsAccountRoute.shell },
    },
    {
      path: "settings/security",
      element: <BetterAuthSettingsView view="security" />,
      handle: { shell: shellAppSettingsSecurityRoute.shell },
    },
    {
      path: "*",
      element: <AppShellNotFound />,
      handle: { shell: shellAppNotFoundRoute.shell },
    },
  ],
}
