import type { RouteObject } from "react-router-dom"

import { appShellRouteObject } from "./route-app-shell"
import { rootRouteObjects } from "./route-root"

/**
 * Single exported route tree for `createBrowserRouter` — order is significant for matching.
 * - {@link rootRouteObjects}: `/` (marketing landing)
 * - {@link appShellRouteObject}: `/app/*` (shell + features)
 */
export const browserRoutes: RouteObject[] = [
  ...rootRouteObjects,
  appShellRouteObject,
]
