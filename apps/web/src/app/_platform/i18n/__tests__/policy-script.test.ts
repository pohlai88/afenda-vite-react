import { describe, expect, test } from "vitest"

import {
  createI18nPolicyReport,
  isAllowedUnusedKey,
} from "../scripts/check-i18n-policy"

describe("i18n policy script", () => {
  test("reports missing namespace files", () => {
    const report = createI18nPolicyReport({
      resources: {
        en: { shell: { "loaded.title": "Loaded" } },
      },
      lifecycle: { allowedUnusedKeys: [], allowedUnusedKeyPrefixes: [] },
    })

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Missing locale namespace file: ms/shell.json"),
      ])
    )
  })

  test("reports interpolation token drift", () => {
    const report = createI18nPolicyReport({
      resources: {
        en: { shell: { "welcome.message": "Welcome {{name}}" } },
        ms: { shell: { "welcome.message": "Selamat datang {{user}}" } },
      },
      lifecycle: { allowedUnusedKeys: [], allowedUnusedKeyPrefixes: [] },
    })

    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("interpolation tokens differ from English"),
      ])
    )
  })

  test("allows planned unused keys and rejects unknown unused keys", () => {
    expect(
      isAllowedUnusedKey("shell.nav.dashboard", {
        allowedUnusedKeys: [],
        allowedUnusedKeyPrefixes: ["shell.nav."],
      })
    ).toBe(true)

    const report = createI18nPolicyReport({
      resources: {
        en: {
          shell: {
            "nav.dashboard": "Dashboard",
            "unknown.future": "Future",
          },
        },
      },
      lifecycle: {
        allowedUnusedKeys: [],
        allowedUnusedKeyPrefixes: ["shell.nav."],
      },
      usedKeys: new Set(),
    })

    expect(report.warnings).toEqual(
      expect.arrayContaining(["Allowed unused key: shell.nav.dashboard"])
    )
    expect(report.errors).toEqual(
      expect.arrayContaining(["Unknown unused key: shell.unknown.future"])
    )
  })
})
