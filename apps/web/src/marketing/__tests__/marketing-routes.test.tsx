import { render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

const routeMocks = vi.hoisted(() => ({
  isRandomHomeEnabled: false,
  flagshipPage: vi.fn(() => (
    <div data-testid="marketing-flagship-page">flagship-page</div>
  )),
  randomHome: vi.fn(() => (
    <div data-testid="marketing-random-home">random-home</div>
  )),
}))

vi.mock("../marketing-theme-provider", () => ({
  MarketingThemeProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="marketing-theme-provider">{children}</div>
  ),
}))

vi.mock("@afenda/design-system/ui-primitives", () => ({
  Toaster: () => <div data-testid="marketing-toaster" />,
}))

vi.mock("../marketing-random-home", () => ({
  default: () => routeMocks.randomHome(),
}))

vi.mock("../marketing.config", () => ({
  isRandomHomeEnabled: () => routeMocks.isRandomHomeEnabled,
}))

vi.mock("../pages/landing/flagship/afenda-flagship-page", () => ({
  default: () => routeMocks.flagshipPage(),
}))

vi.mock("../marketing-loading-fallback", () => ({
  MarketingLoadingFallback: () => (
    <div data-testid="marketing-loading-fallback" />
  ),
}))

vi.mock("../marketing-page-registry", () => ({
  loadMarketingFlagshipPage: () =>
    Promise.resolve({
      default: () => routeMocks.flagshipPage(),
    }),
  marketingLandingVariants: [
    {
      id: "Surface",
      slug: "surface",
      load: () =>
        Promise.resolve({
          default: () => (
            <div data-testid="marketing-surface-page">surface-page</div>
          ),
        }),
    },
    {
      id: "Topology",
      slug: "topology",
      load: () =>
        Promise.resolve({
          default: () => (
            <div data-testid="marketing-topology-page">topology-page</div>
          ),
        }),
    },
  ],
  marketingLandingLegacySlugRoutes: [
    { path: "infinite-topology", slug: "topology" },
  ],
  marketingLandingLegacyRedirects: [
    { path: "infinitetopology", to: "/infinite-topology" },
  ],
  marketingRoutablePages: [
    {
      id: "ErpBenchmarkCampaign",
      path: "campaigns/erp-benchmark",
      load: () =>
        Promise.resolve({
          default: () => (
            <div data-testid="marketing-erp-benchmark-page">
              erp-benchmark-page
            </div>
          ),
        }),
    },
    {
      id: "TruthEngine",
      path: "product/truth-engine",
      load: () =>
        Promise.resolve({
          default: () => (
            <div data-testid="marketing-truth-engine-page">
              truth-engine-page
            </div>
          ),
        }),
    },
    {
      id: "About",
      path: "company/about",
      load: () =>
        Promise.resolve({
          default: () => (
            <div data-testid="marketing-about-page">about-page</div>
          ),
        }),
    },
    {
      id: "TrustCenter",
      path: "legal/trust-center",
      load: () =>
        Promise.resolve({
          default: () => (
            <div data-testid="marketing-trust-center-page">
              trust-center-page
            </div>
          ),
        }),
    },
    {
      id: "PrivacyPolicy",
      path: "legal/privacy-policy",
      load: () =>
        Promise.resolve({
          default: () => (
            <div data-testid="marketing-privacy-policy-page">
              privacy-policy-page
            </div>
          ),
        }),
    },
    {
      id: "Pdpa",
      path: "legal/pdpa",
      load: () =>
        Promise.resolve({
          default: () => <div data-testid="marketing-pdpa-page">pdpa-page</div>,
        }),
    },
    {
      id: "AsiaPacific",
      path: "regional/asia-pacific",
      load: () =>
        Promise.resolve({
          default: () => (
            <div data-testid="marketing-asia-pacific-page">
              asia-pacific-page
            </div>
          ),
        }),
    },
  ],
  requireMarketingLandingVariantBySlug: (slug: string) => {
    throw new Error(
      `Route test should not resolve flagship variants by slug: "${slug}"`
    )
  },
}))

import type {
  MarketingLandingVariantSlug,
  MarketingRoutablePagePath,
} from "../marketing-page-registry"
import {
  getMarketingLandingPage,
  getMarketingRoutablePage,
  marketingRouteObjects,
} from "../marketing-routes"

describe("marketingRouteObjects", () => {
  beforeEach(() => {
    routeMocks.isRandomHomeEnabled = false
    routeMocks.flagshipPage.mockClear()
    routeMocks.randomHome.mockClear()
  })

  it("renders the configured flagship page at the public home", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/"],
    })

    render(<RouterProvider router={router} />)

    expect(screen.getByTestId("marketing-theme-provider")).toBeInTheDocument()
    expect(screen.getByTestId("marketing-toaster")).toBeInTheDocument()
    expect(screen.getByTestId("marketing-loading-fallback")).toBeInTheDocument()
    expect(
      await screen.findByTestId("marketing-flagship-page")
    ).toBeInTheDocument()
    expect(routeMocks.randomHome).not.toHaveBeenCalled()
    expect(routeMocks.flagshipPage).toHaveBeenCalledTimes(1)
  })

  it("renders the random home when random mode is enabled", () => {
    routeMocks.isRandomHomeEnabled = true

    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/"],
    })

    render(<RouterProvider router={router} />)

    expect(screen.getByTestId("marketing-random-home")).toBeInTheDocument()
    expect(routeMocks.randomHome).toHaveBeenCalledTimes(1)
  })

  it("applies the same home policy to /marketing", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/marketing"],
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByTestId("marketing-flagship-page")
    ).toBeInTheDocument()
  })

  it("serves the dedicated marketing flagship route", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/marketing/flagship"],
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByTestId("marketing-flagship-page")
    ).toBeInTheDocument()
  })

  it("renders deep-link marketing variants through the route catalog", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/marketing/surface"],
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByTestId("marketing-surface-page")
    ).toBeInTheDocument()
  })

  it("throws when getMarketingLandingPage is asked for an unregistered slug", () => {
    expect(() =>
      getMarketingLandingPage("moire" as MarketingLandingVariantSlug)
    ).toThrow(/Missing marketing landing page registration/)
  })

  it("throws when getMarketingRoutablePage is asked for an unregistered path", () => {
    expect(() =>
      getMarketingRoutablePage("company/unknown" as MarketingRoutablePagePath)
    ).toThrow(/Missing marketing page registration/)
  })

  it("serves legacy root paths that alias marketing slugs", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/infinite-topology"],
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByTestId("marketing-topology-page")
    ).toBeInTheDocument()
  })

  it("redirects typo legacy URLs to the canonical public landing route", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/infinitetopology"],
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByTestId("marketing-topology-page")
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/infinite-topology")
    })
  })

  it("renders routed campaign pages through the marketing catalog", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/marketing/campaigns/erp-benchmark"],
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByTestId("marketing-erp-benchmark-page")
    ).toBeInTheDocument()
  })

  it("renders routed legal pages through the marketing catalog", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/marketing/legal/trust-center"],
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByTestId("marketing-trust-center-page")
    ).toBeInTheDocument()
  })

  it("renders routed product pages through the marketing catalog", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/marketing/product/truth-engine"],
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByTestId("marketing-truth-engine-page")
    ).toBeInTheDocument()
  })

  it("renders routed company pages through the marketing catalog", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/marketing/company/about"],
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByTestId("marketing-about-page")
    ).toBeInTheDocument()
  })

  it("renders routed legal policy pages through the marketing catalog", async () => {
    const privacyRouter = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/marketing/legal/privacy-policy"],
    })

    render(<RouterProvider router={privacyRouter} />)

    expect(
      await screen.findByTestId("marketing-privacy-policy-page")
    ).toBeInTheDocument()

    const pdpaRouter = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/marketing/legal/pdpa"],
    })

    render(<RouterProvider router={pdpaRouter} />)

    expect(await screen.findByTestId("marketing-pdpa-page")).toBeInTheDocument()
  })

  it("renders routed regional pages through the marketing catalog", async () => {
    const router = createMemoryRouter(marketingRouteObjects, {
      initialEntries: ["/marketing/regional/asia-pacific"],
    })

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByTestId("marketing-asia-pacific-page")
    ).toBeInTheDocument()
  })
})
