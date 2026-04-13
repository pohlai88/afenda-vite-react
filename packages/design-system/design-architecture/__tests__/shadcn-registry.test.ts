import { describe, expect, it } from "vitest"

import {
  getAllShadcnAliasesForCanonical,
  getShadcnRequiredColorAlias,
  hasShadcnRequiredColorAlias,
  isShadcnRegistryColorToken,
  shadcnRegistry,
  shadcnRegistryColorTokenValues,
  shadcnRegistryRequiredColorAliasRows,
  shadcnRegistrySemanticColorTokenValues,
} from "../src/tokenization/shadcn-registry"

describe("shadcn-registry", () => {
  it("includes ring-offset in semantic registry colors", () => {
    expect(shadcnRegistrySemanticColorTokenValues).toContain("ring-offset")
    expect(shadcnRegistry.colors).toContain("ring-offset")
  })

  it("provides exactly one required alias for every registry color token", () => {
    for (const token of shadcnRegistryColorTokenValues) {
      const matchingRows = shadcnRegistryRequiredColorAliasRows.filter(
        (row) => row.token === token,
      )

      expect(matchingRows).toHaveLength(1)
      expect(matchingRows[0]?.canonical).toBe(`--color-${token}`)
    }
  })

  it("supports required alias lookups and reverse canonical lookups", () => {
    expect(isShadcnRegistryColorToken("background")).toBe(true)
    expect(hasShadcnRequiredColorAlias("background")).toBe(true)

    const backgroundAlias = getShadcnRequiredColorAlias("background")
    expect(backgroundAlias?.alias).toBe("--background")
    expect(backgroundAlias?.canonical).toBe("--color-background")

    const reverse = getAllShadcnAliasesForCanonical("--color-background")
    expect(reverse.some((row) => row.alias === "--background")).toBe(true)
  })
})
