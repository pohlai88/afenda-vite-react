import { describe, expect, it } from "vitest"

import { colorTokenValues } from "../src/tokenization/token-constants"
import { fullColorRecord, themeTokenSource } from "../src/tokenization/token-source"

describe("token-source", () => {
  it("contains primitive and derived mode-aware color sources", () => {
    expect(themeTokenSource.colors.primitive.light.background).toBeDefined()
    expect(themeTokenSource.colors.primitive.dark.background).toBeDefined()
    expect(themeTokenSource.colors.derived.light["surface-hover"]).toBeDefined()
    expect(themeTokenSource.colors.derived.dark["surface-hover"]).toBeDefined()
  })

  it("contains global runtime parameter families", () => {
    expect(themeTokenSource.runtime.density.compact).toBeDefined()
    expect(themeTokenSource.runtime.controlSizes["table-row-height"]).toBeDefined()
    expect(themeTokenSource.runtime.textSizes.table).toBeDefined()
  })

  it("contains motion families", () => {
    expect(themeTokenSource.animations["fade-in"]).toContain("fade-in")
    expect(themeTokenSource.keyframes["fade-in"].from?.opacity).toBe("0")
  })

  it("rejects when a color key is missing from both partial and merged layers", () => {
    const missingKey = colorTokenValues[0]
    const merged = Object.fromEntries(
      colorTokenValues
        .filter((k) => k !== missingKey)
        .map((k) => [k, "oklch(0.5 0 0)"] as const),
    ) as Record<string, string>

    expect(() => fullColorRecord({}, merged)).toThrow(
      new RegExp(`Missing color token: ${String(missingKey)}`),
    )
  })
})
