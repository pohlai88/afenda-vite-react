import { describe, expect, test } from "vitest"

import {
  COVERAGE_PRESETS,
  getAfendaVitestTestOptions,
  getAfendaVitestNodeTestOptions,
} from "../vitest/defaults"

describe("getAfendaVitestTestOptions", () => {
  test("returns jsdom defaults with include and globals", () => {
    const t = getAfendaVitestTestOptions()
    expect(t.globals).toBe(true)
    expect(t.environment).toBe("jsdom")
    expect(t.include).toEqual(
      expect.arrayContaining([
        "src/**/__test__/**/*.{test,spec}.{ts,tsx}",
        "**/__tests__/*.{test,spec}.{ts,tsx}",
        "**/__tests__/**/*.{test,spec}.{ts,tsx}",
      ])
    )
  })

  test("node preset omits browser setup by default", () => {
    const t = getAfendaVitestNodeTestOptions()
    expect(t.environment).toBe("node")
    expect(t.setupFiles).toEqual([])
  })
})

describe("COVERAGE_PRESETS", () => {
  test("exposes default and strict shapes", () => {
    expect(COVERAGE_PRESETS.default.lines).toBe(5)
    expect(COVERAGE_PRESETS.strict.lines).toBe(80)
  })
})
