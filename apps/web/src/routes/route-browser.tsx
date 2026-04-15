import type { RouteObject } from "react-router-dom"

import { marketingRouteObjects } from "../pages/route/route-marketing"

import { appShellRouteObject } from "./route-app-shell"

/** App route tree: marketing (`/`) then authenticated shell (`/app/*`). */
export const browserRoutes: RouteObject[] = [
  ...marketingRouteObjects,
  appShellRouteObject,
]
