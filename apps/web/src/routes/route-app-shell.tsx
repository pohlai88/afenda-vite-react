import { Navigate, type RouteObject } from "react-router-dom"

import { FeatureTemplateView } from "@/app/_features/_template"
import {
  AppShellLayout,
  AppShellNotFound,
  shellAppChildRouteDefinitions,
  shellAppDefaultChildSegment,
  shellAppLayoutRoute,
  shellAppNotFoundRoute,
} from "@/app/_platform/shell"

/**
 * Browser router subtree for `/app/*`: layout, index redirect, child feature routes, splat 404.
 * Route paths and `handle.shell` come from {@link shellAppChildRouteDefinitions} /
 * {@link shellAppLayoutRoute} in `shell-route-definitions.ts` (re-exported from `@/app/_platform/shell`).
 */
export const appShellRouteObject: RouteObject = {
  path: "/app",
  element: <AppShellLayout />,
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
