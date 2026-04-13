import { describe, expect, it } from "vitest"

import { bridgedThemeTokens } from "../src/tokenization/token-bridge"
import { buildEmittedThemeCssContent } from "../src/tokenization/token-emit"
import { normalizedThemeTokenSource } from "../src/tokenization/token-normalize"
import { serializedThemeCss } from "../src/tokenization/token-serialize"

describe("token-pipeline integration", () => {
  it("keeps the full token pipeline coherent end-to-end", () => {
    expect(normalizedThemeTokenSource.primitiveColors.length).toBeGreaterThan(0)
    expect(normalizedThemeTokenSource.derivedColors.length).toBeGreaterThan(0)

    expect(bridgedThemeTokens.themeStaticDeclarations.length).toBeGreaterThan(0)
    expect(bridgedThemeTokens.darkModeDeclarations.length).toBeGreaterThan(0)

    expect(serializedThemeCss.combined).toContain("--color-background")
    expect(serializedThemeCss.combined).toContain("@theme static")

    expect(buildEmittedThemeCssContent()).toContain(
      "AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY",
    )
  })
})
