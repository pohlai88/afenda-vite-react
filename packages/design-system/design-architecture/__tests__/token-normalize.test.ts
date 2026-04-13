import { describe, expect, it } from "vitest"

import {
  normalizeThemeTokenSource,
  normalizedThemeTokenSource,
} from "../src/tokenization/token-normalize"
import { themeTokenSource } from "../src/tokenization/token-source"

describe("token-normalize", () => {
  it("preserves canonical mode order", () => {
    expect(normalizedThemeTokenSource.modes).toEqual(["light", "dark"])
  })

  it("normalizes primitive and derived colors separately", () => {
    expect(normalizedThemeTokenSource.primitiveColors.length).toBe(2)
    expect(normalizedThemeTokenSource.derivedColors.length).toBe(2)
    expect(normalizedThemeTokenSource.primitiveColors[0][0]).toBe("light")
    expect(normalizedThemeTokenSource.derivedColors[1][0]).toBe("dark")
  })

  it("preserves stable family ordering", () => {
    expect(normalizedThemeTokenSource.radius[0][0]).toBe("sm")
    expect(normalizedThemeTokenSource.containers[0][0]).toBe("xs")
    expect(normalizedThemeTokenSource.fonts[0][0]).toBe("sans")
  })

  it("is idempotent", () => {
    expect(normalizeThemeTokenSource(themeTokenSource)).toEqual(
      normalizeThemeTokenSource(themeTokenSource),
    )
  })
})
