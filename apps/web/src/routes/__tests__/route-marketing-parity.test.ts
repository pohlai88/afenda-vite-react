import { describe, expect, it } from "vitest"

import {
  marketingCanonicalRedirectPaths,
  marketingLandingVariantSlugs,
  marketingRoutablePagePaths,
} from "../../marketing/marketing-page-registry"
import { marketingRouteObjects } from "../../marketing/marketing-routes"

describe("route-marketing parity", () => {
  it("exposes routes for every marketing landing variant and every routable marketing page", () => {
    const rootRoute = marketingRouteObjects.find((route) => route.path === "/")
    const marketingRoute = rootRoute?.children?.find(
      (route) => route.path === "marketing"
    )

    const marketingChildPaths =
      marketingRoute?.children
        ?.filter((route) => typeof route.path === "string")
        .map((route) => route.path) ?? []

    const deepLinkSlugs = marketingChildPaths.filter(
      (path) => path !== "flagship"
    )

    expect(marketingChildPaths).toContain("flagship")
    expect(deepLinkSlugs).toEqual(
      expect.arrayContaining([...marketingLandingVariantSlugs])
    )
    expect(deepLinkSlugs).toEqual(
      expect.arrayContaining([...marketingRoutablePagePaths])
    )
    expect(deepLinkSlugs).toEqual(
      expect.arrayContaining([...marketingCanonicalRedirectPaths])
    )
    expect(deepLinkSlugs).toHaveLength(
      marketingLandingVariantSlugs.length +
        marketingRoutablePagePaths.length +
        marketingCanonicalRedirectPaths.length
    )
  })
})
