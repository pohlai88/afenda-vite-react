import { describe, expect, it } from "vitest"

import {
  animationCssVarName,
  animationTokenValues,
  breakpointCssVarName,
  colorCssVarName,
  colorTokenValues,
  containerCssVarName,
  containerTokenValues,
  controlSizeCssVarName,
  controlSizeTokenValues,
  densityCssVarName,
  densityTokenValues,
  fontCssVarName,
  fontTokenValues,
  isChartColorToken,
  isEnterpriseUiColorToken,
  isSemanticColorToken,
  isSidebarColorToken,
  radiusCssVarName,
  radiusTokenValues,
  textSizeCssVarName,
  textSizeTokenValues,
  tokenFamilyMembers,
  tokenFamilyValues,
  breakpointTokenValues,
} from "../src/tokenization/token-constants"

describe("token-constants", () => {
  it("has no duplicates in canonical token families", () => {
    const families: ReadonlyArray<readonly [string, readonly string[]]> = [
      ["colorTokenValues", colorTokenValues],
      ["radiusTokenValues", radiusTokenValues],
      ["breakpointTokenValues", breakpointTokenValues],
      ["containerTokenValues", containerTokenValues],
      ["densityTokenValues", densityTokenValues],
      ["controlSizeTokenValues", controlSizeTokenValues],
      ["fontTokenValues", fontTokenValues],
      ["textSizeTokenValues", textSizeTokenValues],
      ["animationTokenValues", animationTokenValues],
    ]
    for (const [label, values] of families) {
      expect(new Set(values).size, `${label} duplicate-free`).toBe(values.length)
    }
  })

  it("maps family registry keys exactly to tokenFamilyValues", () => {
    expect(Object.keys(tokenFamilyMembers)).toEqual([...tokenFamilyValues])
  })

  it("builds canonical css variable names correctly", () => {
    expect(colorCssVarName("background")).toBe("--color-background")
    expect(radiusCssVarName("md")).toBe("--radius-md")
    expect(containerCssVarName("lg")).toBe("--container-lg")
    expect(densityCssVarName("comfortable")).toBe("--density-comfortable")
    expect(controlSizeCssVarName("control-md")).toBe("--size-control-md")
    expect(fontCssVarName("sans")).toBe("--font-sans")
    expect(breakpointCssVarName("3xl")).toBe("--breakpoint-3xl")
    expect(textSizeCssVarName("ui-sm")).toBe("--text-ui-sm")
    expect(animationCssVarName("fade-in")).toBe("--animate-fade-in")
  })

  it("classifies color token subsets via type guards", () => {
    expect(isSemanticColorToken("background")).toBe(true)
    expect(isSemanticColorToken("primary-50")).toBe(true)
    expect(isSemanticColorToken("chart-1")).toBe(false)

    expect(isChartColorToken("chart-1")).toBe(true)
    expect(isChartColorToken("background")).toBe(false)

    expect(isSidebarColorToken("sidebar")).toBe(true)
    expect(isSidebarColorToken("chart-1")).toBe(false)

    expect(isEnterpriseUiColorToken("surface-hover")).toBe(true)
    expect(isEnterpriseUiColorToken("background")).toBe(false)
  })
})
