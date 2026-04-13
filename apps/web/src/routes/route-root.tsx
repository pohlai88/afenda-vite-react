import type { RouteObject } from "react-router-dom"

import "@/app/_platform/shell/types/shell-route-handle"

import Landing from "@/pages/Landing"

/**
 * Top-level routes outside the app shell: marketing landing only.
 * Composed into {@link browserRoutes} in `route-browser.tsx`.
 */
export const rootRouteObjects: RouteObject[] = [
  {
    path: "/",
    element: <Landing />,
    handle: { shell: null },
  },
]
