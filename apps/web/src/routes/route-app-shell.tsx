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
import { FeatureTemplateView } from "../app/_features/_template"
import {
  AppShellNotFound,
  shellAppChildRouteDefinitions,
  shellAppDefaultChildSegment,
  shellAppLayoutRoute,
  shellAppNotFoundRoute,
  ShellLeftSidebarLayout,
} from "../app/_platform/shell"
import { AppThemeProvider } from "../app/_platform/theme/app-theme-provider"

/** `/app/*` route object: layout, index redirect, feature children, splat 404. Paths and `handle.shell` from shell definitions. */
export const appShellRouteObject: RouteObject = {
  path: "/app",
  element: (
    <AppThemeProvider>
      <ShellLeftSidebarLayout />
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
      element: <FeatureTemplateView slug={pathSegment} />,
      handle: { shell: metadata.shell },
    })),
    {
      path: "*",
      element: <AppShellNotFound />,
      handle: { shell: shellAppNotFoundRoute.shell },
    },
  ],
}
