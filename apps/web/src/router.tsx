/**
 * Root data router for the Afenda web SPA.
 *
 * Owns:
 * - top-level route composition only
 * - router basename normalization for Vite subpath deploys
 * - single `createBrowserRouter` export for the application
 *
 * Must not own:
 * - domain route definitions
 * - shell policy decisions beyond composition
 * - feature/UI logic
 *
 * Route domains:
 * - marketing: standalone editorial/public landing surface (`/`, `/marketing/*`, legacy landing URLs)
 * - auth: standalone authentication surface (`/auth/*` plus short-path redirects)
 * - app: authenticated ERP shell (`/app/*`)
 */

import { createBrowserRouter, type RouteObject } from "react-router-dom"

import "./app/_platform/shell/types/shell-route-handle"

import { marketingRouteObjects } from "./marketing/marketing-routes"
import { authRouteObjects, setupRouteObject } from "./app/_platform/auth"
import { appShellRouteObject } from "./routes/route-app-shell"

/** Align with Vite `base` / `import.meta.env.BASE_URL` for non-root deploys. */
function viteBaseToRouterBasename(): string | undefined {
  const base = import.meta.env.BASE_URL
  if (base === "/" || base === "") return undefined
  return base.endsWith("/") ? base.slice(0, -1) : base
}

const basename = viteBaseToRouterBasename()

/** Top-level route tree: standalone marketing, standalone auth, and ERP app shell. */
export const browserRoutes: RouteObject[] = [
  ...marketingRouteObjects,
  ...authRouteObjects,
  setupRouteObject,
  appShellRouteObject,
]

export const router = createBrowserRouter(browserRoutes, {
  ...(basename ? { basename } : {}),
})
