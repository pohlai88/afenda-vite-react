/**
 * Barrel for route modules and the root router.
 *
 * - Re-exports `router` / `browserRoutes` from `../router.tsx` (single `createBrowserRouter`).
 * - Re-exports `appShellRouteObject`, `marketingRouteObjects`, and `rootRouteObjects` alias for callers
 *   that need segments without importing each `route-*.tsx` file.
 * - Prefer importing `router` from `../router` in app entry code; use this barrel when a single import path helps tests or scripts.
 *
 * @see ./README.md — router usage definition, file roles, and governance.
 */
export { appShellRouteObject } from "./route-app-shell"
export { browserRoutes, router } from "../router"
export {
  marketingRouteObjects,
  marketingRouteObjects as rootRouteObjects,
} from "./route-marketing"
