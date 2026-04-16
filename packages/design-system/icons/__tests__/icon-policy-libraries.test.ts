import { describe, expect, it } from "vitest"

import { iconLibraries } from "../libraries"
import { iconPolicy } from "../icon-policy"

describe("iconPolicy", () => {
  it("exports governance flags and path fragments", () => {
    expect(iconPolicy.allowDynamicIconsInProductUI).toBe(false)
    expect(iconPolicy.requireStaticImports).toBe(true)
    expect(iconPolicy.allowedDynamicPathFragments).toContain("/cms/")
  })
})

describe("iconLibraries", () => {
  it("defines all supported libraries", () => {
    expect(Object.keys(iconLibraries).sort()).toEqual([
      "hugeicons",
      "lucide",
      "phosphor",
      "remixicon",
      "tabler",
    ])
  })

  it("each library has required metadata", () => {
    for (const lib of Object.values(iconLibraries)) {
      expect(lib.name).toBeTruthy()
      expect(lib.title).toBeTruthy()
      expect(lib.packages?.length).toBeGreaterThan(0)
      expect(lib.export).toBeTruthy()
    }
  })
})
