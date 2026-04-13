import { describe, expect, it } from "vitest"

import {
  appendTailwindAdapter,
  buildTailwindAdapterBlocks,
} from "../src/tokenization/token-tailwind-adapter"
import { serializedThemeCss } from "../src/tokenization/token-serialize"

describe("token-tailwind-adapter", () => {
  it("emits required aliases into both root and dark blocks", () => {
    const adapter = buildTailwindAdapterBlocks()

    expect(adapter.rootRequiredAliasBlock).toContain(":root")
    expect(adapter.rootRequiredAliasBlock).toContain(
      "--background: var(--color-background);",
    )
    expect(adapter.rootRequiredAliasBlock).toContain(
      "--ring-offset: var(--color-ring-offset);",
    )

    expect(adapter.darkRequiredAliasBlock).toContain(".dark")
    expect(adapter.darkRequiredAliasBlock).toContain(
      "--background: var(--color-background);",
    )
    expect(adapter.darkRequiredAliasBlock).toContain(
      "--ring-offset: var(--color-ring-offset);",
    )
  })

  it("can disable extra runtime and special aliases independently", () => {
    const adapter = buildTailwindAdapterBlocks({
      includeExtraRuntimeAliases: false,
      includeSpecialAliases: false,
    })

    expect(adapter.rootRequiredAliasBlock).toContain(
      "--background: var(--color-background);",
    )
    expect(adapter.darkRequiredAliasBlock).toContain(
      "--background: var(--color-background);",
    )

    expect(adapter.rootExtraRuntimeAliasBlock).toBe("")
    expect(adapter.darkExtraRuntimeAliasBlock).toBe("")
    expect(adapter.rootSpecialAliasBlock).toBe("")
    expect(adapter.darkSpecialAliasBlock).toBe("")
  })

  it("appends adapter css after serialized core output", () => {
    const adapted = appendTailwindAdapter(serializedThemeCss)

    expect(adapted.startsWith(serializedThemeCss.combined)).toBe(true)
    expect(adapted).toContain("@theme static")
    expect(adapted).toContain(".dark")
    expect(adapted).toContain(
      "/* shadcn required parity aliases (root) */",
    )
    expect(adapted).toContain("--background: var(--color-background);")
  })
})
