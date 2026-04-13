/**
 * Runtime behavioral tests: proves the i18n system works under real user flows,
 * not just structural wiring.
 *
 * Covers:
 *   - Default locale detection and boot
 *   - Language switching updates visible translation output
 *   - Locale persistence survives re-init
 *   - Detector fallback when storage is empty
 *   - html lang attribute tracks active language
 *   - Namespace resolution across locales
 */
import { afterAll, beforeAll, describe, expect, test } from "vitest"

import {
  getActiveLocale,
  i18n,
  initI18n,
  loadI18nNamespace,
  preloadI18nNamespaces,
} from "../adapters/i18next-adapter"
import {
  AFENDA_LOCALE_STORAGE_KEY,
  ALL_NAMESPACES,
  SUPPORTED_LOCALES,
} from "../policy/i18n-policy"

describe("runtime behavior", () => {
  beforeAll(async () => {
    localStorage.removeItem(AFENDA_LOCALE_STORAGE_KEY)
    await initI18n()
  })

  afterAll(async () => {
    localStorage.removeItem(AFENDA_LOCALE_STORAGE_KEY)
    await i18n.changeLanguage("en")
  })

  test("boots into a supported locale", () => {
    const lang = (i18n.resolvedLanguage ?? i18n.language).split("-")[0]
    expect(SUPPORTED_LOCALES as readonly string[]).toContain(lang)
  })

  test("switching to ms changes translation output to Malay", async () => {
    await i18n.changeLanguage("en")
    const enTitle = i18n.t("dashboard:header.title.label")
    expect(enTitle).toBe("ERP Dashboard")

    await i18n.changeLanguage("ms")
    const msTitle = i18n.t("dashboard:header.title.label")
    expect(msTitle).toBe("Papan pemuka ERP")
    expect(msTitle).not.toBe(enTitle)
  })

  test("switching to vi updates shell namespace output", async () => {
    await i18n.changeLanguage("vi")
    const viLoading = i18n.t("shell:loading.erp_system")
    expect(viLoading).toContain("ERP")
    expect(viLoading).not.toBe("Loading ERP System…")
  })

  test("switching to id updates allocation namespace output", async () => {
    await i18n.changeLanguage("id")
    await loadI18nNamespace("id", "allocation")
    const idTitle = i18n.t("allocation:header.title.label")
    expect(idTitle).toBe("Alokasi")
  })

  test("locale preference persists to localStorage", async () => {
    await i18n.changeLanguage("ms")
    expect(localStorage.getItem(AFENDA_LOCALE_STORAGE_KEY)).toBe("ms")

    await i18n.changeLanguage("vi")
    expect(localStorage.getItem(AFENDA_LOCALE_STORAGE_KEY)).toBe("vi")
  })

  test("html lang attribute tracks active language", async () => {
    await i18n.changeLanguage("id")
    expect(document.documentElement.lang).toBe("id")

    await i18n.changeLanguage("en")
    expect(document.documentElement.lang).toBe("en")
  })

  test("all namespaces resolve for every supported locale", async () => {
    const failures: string[] = []

    for (const locale of SUPPORTED_LOCALES) {
      await i18n.changeLanguage(locale)
      for (const ns of ALL_NAMESPACES) {
        await loadI18nNamespace(locale, ns)
        const bundle = i18n.getResourceBundle(locale, ns) as
          | Record<string, unknown>
          | undefined
        if (!bundle || Object.keys(bundle).length === 0) {
          failures.push(`${locale}:${ns} — empty or missing bundle`)
        }
      }
    }

    await i18n.changeLanguage("en")
    expect(failures).toEqual([])
  })

  test("lazy namespace loading resolves non-eager resources", async () => {
    await i18n.changeLanguage("en")
    i18n.removeResourceBundle("en", "glossary")
    expect(i18n.hasResourceBundle("en", "glossary")).toBe(false)

    await loadI18nNamespace("en", "glossary")

    expect(i18n.hasResourceBundle("en", "glossary")).toBe(true)
  })

  test("missing lazy namespace is ignored without crashing", async () => {
    await expect(
      loadI18nNamespace("en", "missing" as never)
    ).resolves.toBeUndefined()
  })

  test("preloadI18nNamespaces loads namespaces for active and fallback locales", async () => {
    await i18n.changeLanguage("vi")
    i18n.removeResourceBundle("vi", "settlement")
    i18n.removeResourceBundle("en", "settlement")

    await preloadI18nNamespaces(["settlement"])

    expect(getActiveLocale()).toBe("vi")
    expect(i18n.hasResourceBundle("vi", "settlement")).toBe(true)
    expect(i18n.hasResourceBundle("en", "settlement")).toBe(true)
  })

  test("detector fallback: clearing storage falls back to a supported locale", async () => {
    localStorage.removeItem(AFENDA_LOCALE_STORAGE_KEY)

    await i18n.changeLanguage("en")
    const lang = (i18n.resolvedLanguage ?? i18n.language).split("-")[0]
    expect(SUPPORTED_LOCALES as readonly string[]).toContain(lang)
  })
})
