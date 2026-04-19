import { describe, expect, it } from "vitest"

import { marketingLandingVariantSlugs } from "../../marketing/marketing-page-registry"
import { marketingRouteObjects } from "../../marketing/marketing-routes"

describe("route-marketing parity", () => {
  it("exposes a deep-link route for every marketing landing variant", () => {
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
    expect(deepLinkSlugs).toHaveLength(marketingLandingVariantSlugs.length)
  })
})
