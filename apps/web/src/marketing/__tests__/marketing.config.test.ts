import { describe, expect, it } from "vitest"

import {
  MARKETING_CONFIG,
  MARKETING_ENABLE_RANDOM_HOME,
  MARKETING_HOME_MODE,
  MARKETING_PAGE_DOMAINS,
  MARKETING_ROUTE_PATHS,
  isRandomHomeEnabled,
  isRandomPersistenceEnabled,
} from "../marketing.config"

describe("marketing.config", () => {
  it("exposes a coherent homepage strategy", () => {
    expect(MARKETING_CONFIG.homeMode).toBe(MARKETING_HOME_MODE)
    expect(isRandomHomeEnabled()).toBe(MARKETING_CONFIG.homeMode === "random")
    expect(MARKETING_ENABLE_RANDOM_HOME).toBe(isRandomHomeEnabled())
    expect(isRandomPersistenceEnabled()).toBe(
      MARKETING_CONFIG.enableRandomPersistence
    )
  })

  it("defines stable public route path constants", () => {
    expect(MARKETING_ROUTE_PATHS.home).toBe("/")
    expect(MARKETING_ROUTE_PATHS.marketingRoot).toBe("/marketing")
  })

  it("documents page domain buckets for the marketing tree", () => {
    expect(MARKETING_PAGE_DOMAINS).toContain("landing")
    expect(new Set(MARKETING_PAGE_DOMAINS).size).toBe(
      MARKETING_PAGE_DOMAINS.length
    )
  })
})
