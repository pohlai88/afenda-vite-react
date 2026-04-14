/**
 * Central route definitions for the Vite SPA. `router.tsx` imports {@link browserRoutes} from `./route-browser`.
 */
export { appShellRouteObject } from "./route-app-shell"
export { browserRoutes } from "./route-browser"
export {
  marketingRouteObjects,
  marketingRouteObjects as rootRouteObjects,
} from "../pages/route/route-marketing"
