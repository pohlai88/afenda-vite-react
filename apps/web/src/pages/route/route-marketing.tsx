import type { RouteObject } from "react-router-dom"

import "../../app/_platform/shell/types/shell-route-handle"

import MarketingLandingPage from "../components/marketing-landing-page"
import { MarketingLayout } from "../provider/marketing-layout"

/**
 * Public marketing/landing routes — pathless layout + index; never wraps `/app/*`.
 * Composed into `browserRoutes` in `src/routes/route-browser.tsx`.
 */
export const marketingRouteObjects: RouteObject[] = [
  {
    element: <MarketingLayout />,
    children: [
      {
        index: true,
        element: <MarketingLandingPage />,
        handle: { shell: null },
      },
    ],
  },
]
