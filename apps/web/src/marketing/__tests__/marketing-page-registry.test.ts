import { describe, expect, it, vi } from "vitest"

import {
  DEFAULT_MARKETING_LANDING_VARIANT_ID,
  MARKETING_LANDING_STORAGE_KEY,
  MARKETING_PAGE_HREFS,
  marketingCanonicalRedirectPaths,
  marketingCanonicalRedirects,
  getDefaultMarketingLandingVariant,
  isMarketingLandingVariantId,
  isMarketingLandingVariantSlug,
  isMarketingRoutablePagePath,
  marketingPageDirectoryNavigation,
  marketingLandingLegacyRedirects,
  marketingLandingLegacySlugRoutes,
  marketingLandingVariants,
  marketingLandingVariantIds,
  marketingLandingVariantSlugs,
  marketingRoutablePagePaths,
  marketingRoutablePages,
  marketingShellNavigation,
  pickRandomMarketingLandingVariantId,
  requireMarketingLandingVariantBySlug,
  requireMarketingRoutablePageByPath,
  resolveMarketingLandingVariantById,
  resolveMarketingLandingVariantBySlug,
  resolveMarketingLandingVariantId,
} from "../marketing-page-registry"

function createStorage(initialValue: string | null = null) {
  let value = initialValue

  return {
    getItem: vi.fn((_key: string) => value),
    setItem: vi.fn((_key: string, next: string) => {
      value = next
    }),
  }
}

describe("marketing page registry", () => {
  it("reuses a valid stored variant id", () => {
    const storage = createStorage("Polaris")

    const result = resolveMarketingLandingVariantId({
      storage,
      randomValue: 0.1,
    })

    expect(result).toBe("Polaris")
    expect(storage.getItem).toHaveBeenCalledWith(MARKETING_LANDING_STORAGE_KEY)
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it("replaces an invalid stored variant id with a valid random choice", () => {
    const storage = createStorage("Unknown")
    const expected = pickRandomMarketingLandingVariantId(0.999)

    const result = resolveMarketingLandingVariantId({
      storage,
      randomValue: 0.999,
    })

    expect(marketingLandingVariantIds).toContain(result)
    expect(result).toBe(expected)
    expect(storage.setItem).toHaveBeenCalledWith(
      MARKETING_LANDING_STORAGE_KEY,
      expected
    )
  })

  it("can resolve without storage in non-browser contexts", () => {
    const result = resolveMarketingLandingVariantId({
      persist: false,
      storage: null,
      randomValue: 0,
    })

    expect(result).toBe(pickRandomMarketingLandingVariantId(0))
  })

  it("can skip persistence when random home storage is disabled", () => {
    const storage = createStorage("Polaris")
    const expected = pickRandomMarketingLandingVariantId(0)

    const result = resolveMarketingLandingVariantId({
      persist: false,
      storage,
      randomValue: 0,
    })

    expect(result).toBe(expected)
    expect(storage.getItem).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it("keeps ids and slugs aligned", () => {
    expect(marketingLandingVariantIds.length).toBe(
      marketingLandingVariantSlugs.length
    )
    expect(marketingLandingVariantIds.length).toBeGreaterThan(0)
  })

  it("maps edge random values into valid variant ids", () => {
    expect(marketingLandingVariantIds).toContain(
      pickRandomMarketingLandingVariantId(0)
    )
    expect(marketingLandingVariantIds).toContain(
      pickRandomMarketingLandingVariantId(0.999999)
    )
  })

  it("returns the first variant for random value 0", () => {
    expect(pickRandomMarketingLandingVariantId(0)).toBe(
      marketingLandingVariantIds[0]
    )
  })

  it("returns the last variant for a value near 1", () => {
    expect(pickRandomMarketingLandingVariantId(0.999999)).toBe(
      marketingLandingVariantIds[marketingLandingVariantIds.length - 1]
    )
  })

  it("keeps variant ids unique", () => {
    expect(new Set(marketingLandingVariantIds).size).toBe(
      marketingLandingVariantIds.length
    )
  })

  it("keeps variant slugs unique", () => {
    expect(new Set(marketingLandingVariantSlugs).size).toBe(
      marketingLandingVariantSlugs.length
    )
  })

  it("keeps legacy slug routes aligned with registry slugs", () => {
    for (const { slug } of marketingLandingLegacySlugRoutes) {
      expect(marketingLandingVariantSlugs).toContain(slug)
    }
  })

  it("keeps legacy redirect paths unique", () => {
    expect(
      new Set(marketingLandingLegacyRedirects.map((r) => r.path)).size
    ).toBe(marketingLandingLegacyRedirects.length)
  })

  it("keeps routable marketing page paths unique", () => {
    expect(new Set(marketingRoutablePagePaths).size).toBe(
      marketingRoutablePagePaths.length
    )
  })

  it("keeps canonical redirect paths unique and disjoint from concrete page paths", () => {
    expect(new Set(marketingCanonicalRedirectPaths).size).toBe(
      marketingCanonicalRedirectPaths.length
    )

    for (const aliasPath of marketingCanonicalRedirectPaths) {
      expect(marketingRoutablePagePaths).not.toContain(
        aliasPath as (typeof marketingRoutablePagePaths)[number]
      )
      expect(marketingLandingVariantSlugs).not.toContain(
        aliasPath as (typeof marketingLandingVariantSlugs)[number]
      )
    }
  })

  it("resolves the default variant consistently", () => {
    expect(getDefaultMarketingLandingVariant().id).toBe(
      DEFAULT_MARKETING_LANDING_VARIANT_ID
    )
    expect(resolveMarketingLandingVariantById("unknown").id).toBe(
      DEFAULT_MARKETING_LANDING_VARIANT_ID
    )
    expect(resolveMarketingLandingVariantBySlug("unknown").id).toBe(
      DEFAULT_MARKETING_LANDING_VARIANT_ID
    )
  })

  it("requires a known slug for strict config-driven resolution", () => {
    expect(requireMarketingLandingVariantBySlug("polaris").slug).toBe("polaris")
    expect(() => requireMarketingLandingVariantBySlug("unknown")).toThrow(
      'Unknown marketing landing slug: "unknown"'
    )
  })

  it("classifies known variant ids and slugs", () => {
    expect(isMarketingLandingVariantId("Polaris")).toBe(true)
    expect(isMarketingLandingVariantId("Nope")).toBe(false)
    expect(isMarketingLandingVariantSlug("polaris")).toBe(true)
    expect(isMarketingLandingVariantSlug("nope")).toBe(false)
  })

  it("classifies known routable marketing page paths", () => {
    expect(isMarketingRoutablePagePath("campaigns/erp-benchmark")).toBe(true)
    expect(isMarketingRoutablePagePath("product/truth-engine")).toBe(true)
    expect(isMarketingRoutablePagePath("company/about")).toBe(true)
    expect(isMarketingRoutablePagePath("legal/nope")).toBe(false)
  })

  it("resolves concrete ids and slugs without falling back to defaults", () => {
    expect(resolveMarketingLandingVariantById("Polaris").id).toBe("Polaris")
    expect(resolveMarketingLandingVariantBySlug("polaris").slug).toBe("polaris")
  })

  it("requires a known routable marketing page path", () => {
    expect(requireMarketingRoutablePageByPath("legal/trust-center").id).toBe(
      "TrustCenter"
    )
    expect(requireMarketingRoutablePageByPath("legal/privacy-policy").id).toBe(
      "PrivacyPolicy"
    )
    expect(() => requireMarketingRoutablePageByPath("legal/unknown")).toThrow(
      'Unknown marketing page path: "legal/unknown"'
    )
  })

  it("keeps shell and footer navigation targets unique", () => {
    expect(new Set(marketingShellNavigation.map((item) => item.to)).size).toBe(
      marketingShellNavigation.length
    )
    expect(
      new Set(marketingPageDirectoryNavigation.map((item) => item.to)).size
    ).toBe(marketingPageDirectoryNavigation.length)
  })

  it("keeps canonical hrefs aligned with registered routable pages", () => {
    expect(marketingRoutablePagePaths).toContain("product/truth-engine")
    expect(marketingRoutablePagePaths).toContain("company/about")
    expect(marketingRoutablePagePaths).toContain("legal/privacy-policy")
    expect(marketingRoutablePagePaths).toContain("legal/pdpa")
    expect(marketingRoutablePagePaths).toContain("regional/asia-pacific")

    expect(MARKETING_PAGE_HREFS.truthEngine).toBe(
      "/marketing/product/truth-engine"
    )
    expect(MARKETING_PAGE_HREFS.benchmarkErp).toBe(
      "/marketing/campaigns/erp-benchmark"
    )
    expect(MARKETING_PAGE_HREFS.about).toBe("/marketing/company/about")
    expect(MARKETING_PAGE_HREFS.privacyPolicy).toBe(
      "/marketing/legal/privacy-policy"
    )
    expect(MARKETING_PAGE_HREFS.pdpa).toBe("/marketing/legal/pdpa")
    expect(MARKETING_PAGE_HREFS.asiaPacific).toBe(
      "/marketing/regional/asia-pacific"
    )
  })

  it("continues when persisting the random choice fails", () => {
    const storage = createStorage(null)
    storage.setItem.mockImplementation(() => {
      throw new Error("quota")
    })

    const result = resolveMarketingLandingVariantId({
      storage,
      randomValue: 0.2,
    })

    expect(marketingLandingVariantIds).toContain(result)
  })

  it("keeps registry variant loaders callable", () => {
    for (const variant of marketingLandingVariants) {
      expect(variant.load, `${variant.id} loader`).toBeTypeOf("function")
    }
  })

  it("keeps canonical redirects pointed at registered routable pages", () => {
    for (const redirect of marketingCanonicalRedirects) {
      expect(redirect.to.startsWith("/marketing/")).toBe(true)
      expect(
        marketingRoutablePages.some((page) => page.id === redirect.canonicalId)
      ).toBe(true)
    }
  })

  it.each([DEFAULT_MARKETING_LANDING_VARIANT_ID, "Polaris"] as const)(
    "loads the %s registry variant module with a default export",
    async (variantId) => {
      const variant = marketingLandingVariants.find(
        (candidate) => candidate.id === variantId
      )

      expect(variant, `${variantId} registry entry`).toBeDefined()

      const module = await variant!.load()
      expect(module.default, `${variantId} default export`).toBeTypeOf(
        "function"
      )
    },
    60000
  )

  it("loads every routable marketing page module with a default export", async () => {
    const modules = await Promise.all(
      marketingRoutablePages.map(async (page) => ({
        id: page.id,
        module: await page.load(),
      }))
    )

    for (const entry of modules) {
      expect(entry.module.default, `${entry.id} default export`).toBeTypeOf(
        "function"
      )
    }
  }, 180000)
})
