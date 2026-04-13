import { describe, expect, it } from "vitest"

import { bridgedThemeTokens } from "../src/tokenization/token-bridge"

describe("token-bridge", () => {
  it("produces theme static declarations", () => {
    expect(bridgedThemeTokens.themeStaticDeclarations.length).toBeGreaterThan(0)
    expect(
      bridgedThemeTokens.themeStaticDeclarations.some(
        (d) => d.name === "--color-background",
      ),
    ).toBe(true)
    expect(
      bridgedThemeTokens.themeStaticDeclarations.some(
        (d) => d.name === "--radius-md",
      ),
    ).toBe(true)
  })

  it("does not duplicate final theme static declaration names", () => {
    const names = bridgedThemeTokens.themeStaticDeclarations.map((d) => d.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it("produces dark mode declarations", () => {
    expect(bridgedThemeTokens.darkModeDeclarations.length).toBeGreaterThan(0)
    expect(
      bridgedThemeTokens.darkModeDeclarations.some(
        (d) => d.name === "--color-background",
      ),
    ).toBe(true)
  })

  it("separates runtime parameter declarations from theme-static typography and spacing", () => {
    const runtimeNames = bridgedThemeTokens.runtimeParameterDeclarations.map(
      (d) => d.name,
    )
    const staticNames = bridgedThemeTokens.themeStaticDeclarations.map(
      (d) => d.name,
    )

    expect(runtimeNames).toContain("--density-compact")
    expect(runtimeNames).toContain("--size-control-md")
    expect(staticNames).toContain("--text-ui-sm")
    expect(staticNames).toContain("--spacing-panel-padding")
    expect(runtimeNames).not.toContain("--text-ui-sm")
  })

  it("preserves keyframes for serialization", () => {
    expect(bridgedThemeTokens.keyframes.length).toBeGreaterThan(0)
    expect(bridgedThemeTokens.keyframes[0][0]).toBeDefined()
  })
})
