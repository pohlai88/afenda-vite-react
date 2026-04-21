/**
 * Barrel for route modules and the root router.
 *
 * - Re-exports `router` / `browserRoutes` from `../router.tsx` (single `createBrowserRouter`).
 * - Re-exports `marketingRouteObjects`, `authRouteObjects`, `setupRouteObject`, `appShellRouteObject`, and
 *   `rootRouteObjects` alias for callers
 *   that need segments without importing each `route-*.tsx` file.
 * - Prefer importing `router` from `../router` in app entry code; use this barrel when a single import path helps tests or scripts.
 *
 * @see ./README.md — router usage definition, file roles, and governance.
 */
export {
  marketingRouteObjects,
  marketingRouteObjects as rootRouteObjects,
} from "../marketing/marketing-routes"
export { authRouteObjects, setupRouteObject } from "../app/_platform/auth"
export { browserRoutes, router } from "../router"
export { appShellRouteObject } from "./route-app-shell"
