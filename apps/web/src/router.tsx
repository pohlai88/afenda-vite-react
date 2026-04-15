/**
 * Root data router for the Afenda web SPA (single `createBrowserRouter` for the app).
 *
 * - Exports {@link router} for `<RouterProvider>` in `App.tsx` and {@link browserRoutes} for tests/tooling.
 * - Composes route modules from `./routes/` only; page components stay under `pages/` and `app/`.
 * - `basename` follows Vite `import.meta.env.BASE_URL` so deploys under a subpath stay aligned.
 * - Imports `shell-route-handle` once for typed `handle` / `RouteHandle` on matches.
 *
 * @see ./routes/README.md — full router usage table, naming, shell metadata, and how to add routes.
 */

import { createBrowserRouter, type RouteObject } from "react-router-dom"

import "./app/_platform/shell/types/shell-route-handle"

import { appShellRouteObject } from "./routes/route-app-shell"
import { marketingRouteObjects } from "./routes/route-marketing"

/** Align with Vite `base` / `import.meta.env.BASE_URL` for non-root deploys. */
function viteBaseToRouterBasename(): string | undefined {
  const base = import.meta.env.BASE_URL
  if (base === "/" || base === "") return undefined
  return base.endsWith("/") ? base.slice(0, -1) : base
}

const basename = viteBaseToRouterBasename()

/** Top-level route tree: marketing (`/`) + authenticated shell (`/app/*`). */
export const browserRoutes: RouteObject[] = [
  ...marketingRouteObjects,
  appShellRouteObject,
]

export const router = createBrowserRouter(browserRoutes, {
  ...(basename ? { basename } : {}),
})
