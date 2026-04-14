import type { RouteObject } from "react-router-dom"

import { marketingRouteObjects } from "../pages/route/route-marketing"

import { appShellRouteObject } from "./route-app-shell"

/**
 * Single exported route tree for `createBrowserRouter` — order is significant for matching.
 * - {@link marketingRouteObjects}: `/` (`marketing-landing-page`; layout + theme in `src/pages/provider`)
 * - {@link appShellRouteObject}: `/app/*` (AppThemeProvider + shell + features)
 */
export const browserRoutes: RouteObject[] = [
  ...marketingRouteObjects,
  appShellRouteObject,
]
