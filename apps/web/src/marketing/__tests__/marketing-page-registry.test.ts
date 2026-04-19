import { describe, expect, it, vi } from "vitest"

import {
  DEFAULT_MARKETING_LANDING_VARIANT_ID,
  MARKETING_LANDING_STORAGE_KEY,
  getDefaultMarketingLandingVariant,
  isMarketingLandingVariantId,
  isMarketingLandingVariantSlug,
  marketingLandingLegacyRedirects,
  marketingLandingLegacySlugRoutes,
  marketingLandingVariants,
  marketingLandingVariantIds,
  marketingLandingVariantSlugs,
  pickRandomMarketingLandingVariantId,
  requireMarketingLandingVariantBySlug,
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

  it("resolves concrete ids and slugs without falling back to defaults", () => {
    expect(resolveMarketingLandingVariantById("Polaris").id).toBe("Polaris")
    expect(resolveMarketingLandingVariantBySlug("polaris").slug).toBe("polaris")
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

  it("loads every registry variant module with a default export", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    try {
      const modules = await Promise.all(
        marketingLandingVariants.map(async (variant) => ({
          id: variant.id,
          module: await variant.load(),
        }))
      )

      for (const entry of modules) {
        expect(entry.module.default, `${entry.id} default export`).toBeTypeOf(
          "function"
        )
      }
    } finally {
      warn.mockRestore()
    }
  })
})
