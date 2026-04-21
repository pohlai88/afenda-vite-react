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

import { Navigate, type RouteObject } from "react-router-dom"

import { AppRouteErrorFallback } from "../app/_components"
import { AfendaAuthUiProvider } from "../app/_platform/auth/better-auth-ui/afenda-auth-ui-provider"
import { BetterAuthSettingsView } from "../app/_features/better-auth-settings/better-auth-settings-view"
import { DbStudioPage } from "../app/_features/db-studio"
import { FeatureTemplateView } from "../app/_features/_template"
import { RequireAppReady, RequireAuth } from "../app/_platform/auth"
import { TenantScopeProvider } from "../app/_platform/tenant"
import {
  AppShellNotFound,
  shellAppChildRouteDefinitions,
  shellAppDefaultChildSegment,
  shellAppLayoutRoute,
  shellAppNotFoundRoute,
  shellAppSettingsAccountRoute,
  shellAppSettingsSecurityRoute,
  shellAppSettingsAccountPath,
  ShellLeftSidebarLayout,
} from "../app/_platform/shell"
import { AppThemeProvider } from "../app/_platform/theme/app-theme-provider"
import { Toaster } from "@afenda/design-system/ui-primitives"

/** `/app/*` route object: layout, index redirect, feature children, splat 404. Paths and `handle.shell` from shell definitions. */
export const appShellRouteObject: RouteObject = {
  path: "/app",
  element: (
    <AppThemeProvider>
      <AfendaAuthUiProvider>
        <RequireAuth>
          <RequireAppReady>
            <TenantScopeProvider>
              <ShellLeftSidebarLayout />
            </TenantScopeProvider>
          </RequireAppReady>
        </RequireAuth>
        <Toaster />
      </AfendaAuthUiProvider>
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
      element: <Navigate replace to={shellAppDefaultChildSegment} />,
    },
    ...shellAppChildRouteDefinitions.map(({ pathSegment, metadata }) => ({
      path: pathSegment,
      element:
        pathSegment === "account" ? (
          <Navigate replace to={shellAppSettingsAccountPath} />
        ) : pathSegment === "db-studio" ? (
          <DbStudioPage />
        ) : (
          <FeatureTemplateView slug={pathSegment} />
        ),
      handle: { shell: metadata.shell },
    })),
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
