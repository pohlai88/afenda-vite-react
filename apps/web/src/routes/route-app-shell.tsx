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

/**
 * Browser router subtree for `/app/*`: layout, index redirect, child feature routes, splat 404.
 * Route paths and `handle.shell` come from {@link shellAppChildRouteDefinitions} /
 * {@link shellAppLayoutRoute} in `shell-route-definitions.ts` (re-exported from `../app/_platform/shell`).
 * Theme is isolated from public marketing routes via {@link AppThemeProvider}.
 */
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
