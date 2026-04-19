/**
 * Public marketing routes.
 *
 * This tree mounts the public editorial surface only.
 * It does not mount the ERP `/app` shell.
 */

import { lazy, Suspense } from "react"
import type { RouteObject } from "react-router-dom"
import { Navigate } from "react-router-dom"

import { AppRouteErrorFallback } from "../app/_components"
import { PublicThemeProvider } from "../app/_platform/theme/public-theme-provider"
import { MarketingConfiguredHome } from "./marketing-configured-home"
import { MarketingLoadingFallback } from "./marketing-loading-fallback"
import {
  marketingLandingLegacyRedirects,
  marketingLandingLegacySlugRoutes,
  marketingLandingVariants,
  type MarketingLandingVariantSlug,
} from "./marketing-page-registry"
import { MarketingLayout } from "./marketing-layout"

const FlagshipPage = lazy(
  () => import("./pages/landing/flagship/afenda-flagship-page")
)

const marketingLandingPages = new Map<
  MarketingLandingVariantSlug,
  ReturnType<typeof lazy>
>(
  marketingLandingVariants.map(
    (variant) => [variant.slug, lazy(variant.load)] as const
  )
)

/** Resolves the lazy component for a registered landing slug (throws if the slug is missing from the route map). */
export function getMarketingLandingPage(slug: MarketingLandingVariantSlug) {
  const page = marketingLandingPages.get(slug)
  if (!page) {
    throw new Error(
      `Missing marketing landing page registration for "${slug}".`
    )
  }
  return page
}

function renderMarketingLandingPage(slug: MarketingLandingVariantSlug) {
  const Page = getMarketingLandingPage(slug)

  return (
    <Suspense fallback={<MarketingLoadingFallback />}>
      <Page />
    </Suspense>
  )
}

/** Public `/` tree: marketing pages only. */
export const marketingRouteObjects: RouteObject[] = [
  {
    path: "/",
    element: <MarketingLayout />,
    errorElement: (
      <PublicThemeProvider>
        <AppRouteErrorFallback homeHref="/" />
      </PublicThemeProvider>
    ),
    children: [
      {
        index: true,
        element: <MarketingConfiguredHome />,
        handle: { shell: null },
      },
      {
        path: "marketing",
        children: [
          {
            index: true,
            element: <MarketingConfiguredHome />,
            handle: { shell: null },
          },
          {
            path: "flagship",
            element: (
              <Suspense fallback={<MarketingLoadingFallback />}>
                <FlagshipPage />
              </Suspense>
            ),
            handle: { shell: null },
          },
          ...marketingLandingVariants.map((variant) => {
            return {
              path: variant.slug,
              element: renderMarketingLandingPage(variant.slug),
              handle: { shell: null },
            } satisfies RouteObject
          }),
        ],
      },
      ...marketingLandingLegacySlugRoutes.map(({ path, slug }) => {
        return {
          path,
          element: renderMarketingLandingPage(slug),
          handle: { shell: null },
        } satisfies RouteObject
      }),
      ...marketingLandingLegacyRedirects.map(({ path, to }) => ({
        path,
        element: <Navigate to={to} replace />,
        handle: { shell: null },
      })),
    ],
  },
]
