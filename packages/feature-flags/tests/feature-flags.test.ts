import { describe, expect, it } from "vitest"

import {
  FeatureFlagError,
  createFeatureGuard,
  getFeaturesByTier,
  getFeaturesForTier,
  isFeatureEnabled,
  isModuleAccessible,
  requireFeature,
  requireTier,
  resolveFeatureTier,
} from "../src"

describe("@afenda/feature-flags", () => {
  it("evaluates features by tier", () => {
    expect(isFeatureEnabled("pm", "basic")).toBe(true)
    expect(isFeatureEnabled("mrp", "basic")).toBe(false)
    expect(isFeatureEnabled("mrp", "pro")).toBe(true)
  })

  it("reads tier from tenant metadata", () => {
    expect(
      resolveFeatureTier({
        tenantMetadata: {
          admin: {
            tier: "enterprise",
          },
        },
      })
    ).toBe("enterprise")
  })

  it("honors explicit enabled modules from tenant metadata", () => {
    const context = {
      tenantMetadata: {
        admin: {
          tier: "basic",
          enabledModules: ["custom-sdk"],
        },
      },
    } as const

    expect(isFeatureEnabled("custom-sdk", context)).toBe(true)
    expect(isFeatureEnabled("mrp", context)).toBe(false)
  })

  it("honors disabled modules from tenant metadata", () => {
    const context = {
      tier: "enterprise" as const,
      tenantMetadata: {
        admin: {
          disabledModules: ["ai-copilot"],
        },
      },
    }

    expect(isFeatureEnabled("ai-copilot", context)).toBe(false)
  })

  it("throws shared feature flag errors for insufficient tier", () => {
    expect(() => requireTier("enterprise", "basic")).toThrow(FeatureFlagError)
    expect(() => requireFeature("custom-sdk", "pro")).toThrow(FeatureFlagError)
  })

  it("returns grouped features by tier", () => {
    const grouped = getFeaturesByTier()
    expect(grouped.basic.some((feature) => feature.key === "pm")).toBe(true)
    expect(
      grouped.enterprise.some((feature) => feature.key === "custom-sdk")
    ).toBe(true)
  })

  it("reports module accessibility", () => {
    expect(isModuleAccessible("MRP", "basic")).toBe(false)
    expect(isModuleAccessible("MRP", "pro")).toBe(true)
  })

  it("creates a reusable feature guard", () => {
    const guard = createFeatureGuard("ai-copilot")
    expect(guard("enterprise")).toEqual({ allowed: true })
    expect(guard("basic")).toEqual({
      allowed: false,
      error: 'Feature "AI Copilot" requires an upgraded plan.',
      upgradeUrl: "/settings/billing?upgrade=true",
    })
  })

  it("returns tier feature lists", () => {
    expect(
      getFeaturesForTier("basic").some((feature) => feature.key === "pm")
    ).toBe(true)
    expect(
      getFeaturesForTier("enterprise").some(
        (feature) => feature.key === "accounting-ifrs"
      )
    ).toBe(true)
  })
})
