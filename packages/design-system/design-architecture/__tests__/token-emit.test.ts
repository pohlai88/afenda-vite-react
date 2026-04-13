import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  buildEmittedThemeCssContent,
  createGeneratedFileHeader,
  emitThemeCss,
  ensureParentDirectoryExists,
  hasEmittedThemeCssChanged,
  readExistingEmittedThemeCssFile,
  writeEmittedThemeCssFile,
} from "../src/tokenization/token-emit"
import { serializedThemeCss } from "../src/tokenization/token-serialize"

describe("token-emit", () => {
  it("prepends the generator-owned file header", () => {
    const content = buildEmittedThemeCssContent()
    expect(content.startsWith(createGeneratedFileHeader())).toBe(true)
  })

  it("contains serialized theme output", () => {
    const content = buildEmittedThemeCssContent()
    expect(content).toContain("@theme static")
    expect(content).toContain(".dark")
    expect(content).toContain(":root")
    expect(content).toContain("@keyframes fade-in")
  })

  it("uses explicit serialized theme when provided", () => {
    const withDefault = buildEmittedThemeCssContent()
    const withExplicit = buildEmittedThemeCssContent(serializedThemeCss)
    expect(withExplicit).toBe(withDefault)
  })

  it("writes to a path, detects change vs prior, and reads back", () => {
    const dir = mkdtempSync(join(tmpdir(), "afenda-token-emit-"))
    const outPath = join(dir, "nested", "generated-theme.css")

    try {
      expect(readExistingEmittedThemeCssFile(outPath)).toBe(null)
      expect(hasEmittedThemeCssChanged(outPath)).toBe(true)

      ensureParentDirectoryExists(outPath)
      const writtenPath = writeEmittedThemeCssFile(outPath)
      expect(writtenPath).toBe(outPath)
      expect(readFileSync(outPath, "utf8")).toBe(buildEmittedThemeCssContent())

      expect(hasEmittedThemeCssChanged(outPath)).toBe(false)

      const result = emitThemeCss(outPath)
      expect(result.outputPath).toBe(outPath)
      expect(result.content).toBe(buildEmittedThemeCssContent())
      expect(result.changed).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("emitThemeCss reports changed when file was missing or stale", () => {
    const dir = mkdtempSync(join(tmpdir(), "afenda-token-emit-chg-"))
    const outPath = join(dir, "out.css")

    try {
      const first = emitThemeCss(outPath)
      expect(first.changed).toBe(true)

      const second = emitThemeCss(outPath)
      expect(second.changed).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
