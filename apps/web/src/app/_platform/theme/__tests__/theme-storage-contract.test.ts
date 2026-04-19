import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

import {
  AFENDA_THEME_BOOT_HTML_TOKENS,
  AFENDA_THEME_STORAGE_KEYS,
  AFENDA_UI_STORAGE_KEYS,
} from "../theme-storage-contract"

const indexHtml = readFileSync(resolve(process.cwd(), "index.html"), "utf8")

describe("theme storage boot contract", () => {
  it("keeps index.html parameterized with injected storage-key tokens", () => {
    expect(indexHtml).toContain(AFENDA_THEME_BOOT_HTML_TOKENS.viteBase)
    expect(indexHtml).toContain(
      AFENDA_THEME_BOOT_HTML_TOKENS.appThemeStorageKey
    )
    expect(indexHtml).toContain(
      AFENDA_THEME_BOOT_HTML_TOKENS.marketingThemeStorageKey
    )
    expect(indexHtml).toContain(AFENDA_THEME_BOOT_HTML_TOKENS.densityStorageKey)
    expect(indexHtml).toContain(AFENDA_THEME_BOOT_HTML_TOKENS.motionStorageKey)
  })

  it("does not hardcode runtime storage keys in index.html anymore", () => {
    expect(indexHtml).not.toContain(AFENDA_THEME_STORAGE_KEYS.app)
    expect(indexHtml).not.toContain(AFENDA_THEME_STORAGE_KEYS.marketing)
    expect(indexHtml).not.toContain(AFENDA_UI_STORAGE_KEYS.density)
    expect(indexHtml).not.toContain(AFENDA_UI_STORAGE_KEYS.motion)
  })
})
