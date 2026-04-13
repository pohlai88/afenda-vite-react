import type { RouteObject } from "react-router-dom"

import "@/app/_platform/shell/types/shell-route-handle"

import AppLogin from "@/pages/AppLogin"
import Home from "@/pages/Home"

/**
 * Top-level routes outside the authenticated app shell: marketing and auth placeholder.
 * Composed into {@link browserRoutes} in `route-browser.tsx`.
 */
export const rootRouteObjects: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
    handle: { shell: null },
  },
  {
    path: "/app/login",
    element: <AppLogin />,
    handle: { shell: null },
  },
]
