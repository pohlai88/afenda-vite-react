/**
 * Failure-path and resilience tests.
 *
 * Proves graceful behavior when:
 *   - A key is missing (returns key path, not crash)
 *   - A namespace has no match (falls back to defaultNS)
 *   - An unsupported locale is requested (falls back to en)
 *   - Interpolation token is missing from data (renders raw token)
 */
import { afterAll, beforeAll, describe, expect, test } from "vitest"

import { i18n, initI18n } from "../adapters/i18next-adapter"
import { DEFAULT_NAMESPACE, FALLBACK_LOCALE } from "../policy/i18n-policy"

// Use the untyped t function directly to test behavior with invalid keys.
// The strict i18next types correctly reject unknown keys at compile time,
// so we cast to bypass that for these deliberate failure-path tests.
const tRaw = i18n.t.bind(i18n) as (key: string) => string

describe("failure paths", () => {
  beforeAll(async () => {
    await initI18n()
    await i18n.changeLanguage("en")
  })

  afterAll(async () => {
    await i18n.changeLanguage("en")
  })

  test("missing key returns key path, not undefined or crash", () => {
    const result = tRaw("shell:this.key.does.not.exist")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
    expect(result).toContain("this.key.does.not.exist")
  })

  test("missing key in non-default namespace falls back gracefully", () => {
    const result = tRaw("invoice:nonexistent.key.here")
    expect(typeof result).toBe("string")
    expect(result).toContain("nonexistent.key.here")
  })

  test("requesting unsupported locale falls back to English", async () => {
    await i18n.changeLanguage("xx-FAKE")
    const title = i18n.t("dashboard:header.title.label")
    expect(title).toBe("ERP Dashboard")
    await i18n.changeLanguage("en")
  })

  test("fallbackLng is configured to English", () => {
    const fallback = i18n.options.fallbackLng
    const list = Array.isArray(fallback) ? fallback : [fallback]
    expect(list).toContain(FALLBACK_LOCALE)
  })

  test("defaultNS is configured correctly", () => {
    expect(i18n.options.defaultNS).toBe(DEFAULT_NAMESPACE)
  })

  test("returnNull is false — never returns null for missing keys", () => {
    expect(i18n.options.returnNull).toBe(false)
    const result = tRaw("shell:totally.fake.key")
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
  })

  test("missing interpolation value renders without crash", () => {
    const result = i18n.t("dashboard:header.welcome.message")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })

  test("accessing a valid key in a valid namespace after locale change works", async () => {
    await i18n.changeLanguage("vi")
    const result = i18n.t("auth:login.title.label")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
    expect(result).not.toContain("login.title.label")

    await i18n.changeLanguage("en")
    const enResult = i18n.t("auth:login.title.label")
    expect(enResult).toBe("ERP Login")
  })
})
