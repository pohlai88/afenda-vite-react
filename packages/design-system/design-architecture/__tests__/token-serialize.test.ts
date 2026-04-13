import { describe, expect, it } from "vitest"

import { bridgedThemeTokens } from "../src/tokenization/token-bridge"
import type { KeyframeBlock } from "../src/tokenization/token-types"
import {
  serializeKeyframesBlock,
  serializeThemeCss,
  serializeThemeStaticBlock,
  serializedThemeCss,
} from "../src/tokenization/token-serialize"

describe("token-serialize", () => {
  it("serializes all major css sections", () => {
    expect(serializedThemeCss.themeStaticBlock).toContain("@theme static")
    expect(serializedThemeCss.darkModeBlock).toContain(".dark")
    expect(serializedThemeCss.runtimeParameterBlock).toContain(":root")
    expect(serializedThemeCss.keyframesBlock).toContain("@keyframes fade-in")
  })

  it("builds combined output", () => {
    expect(serializedThemeCss.combined).toContain("--color-background")
    expect(serializedThemeCss.combined).toContain("--radius-md")
    expect(serializedThemeCss.combined).toContain("@keyframes dialog-in")
  })

  it("serializes deterministically", () => {
    expect(serializeThemeCss()).toEqual(serializeThemeCss())
  })

  it("omits selector blocks when declaration lists are empty", () => {
    expect(
      serializeThemeStaticBlock({
        ...bridgedThemeTokens,
        themeStaticDeclarations: [],
      }),
    ).toBe("")
  })

  it("drops keyframe steps with missing style records", () => {
    const block = {
      from: { opacity: "0" },
      to: undefined,
    } as unknown as KeyframeBlock

    const out = serializeKeyframesBlock({
      ...bridgedThemeTokens,
      keyframes: [["fade-in", block]],
    })
    expect(out).toContain("@keyframes fade-in")
    expect(out).toContain("from {")
    expect(out).not.toMatch(/to \{\s*\}/)
  })
})
