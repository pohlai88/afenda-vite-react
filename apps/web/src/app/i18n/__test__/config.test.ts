import { describe, expect, test, beforeAll, afterAll } from 'vitest'

import {
  AFENDA_LOCALE_STORAGE_KEY,
  DEFAULT_NAMESPACE,
  SUPPORTED_LOCALES,
} from '../policy'

import { i18n, initI18n } from '../config'

describe('initI18n', () => {
  beforeAll(async () => {
    await initI18n()
  })

  afterAll(async () => {
    localStorage.removeItem(AFENDA_LOCALE_STORAGE_KEY)
    await i18n.changeLanguage('en')
  })

  test('supports locked locales and falls back to English', () => {
    expect(i18n.options.supportedLngs).toEqual(
      expect.arrayContaining([...SUPPORTED_LOCALES]),
    )
    expect(i18n.options.nonExplicitSupportedLngs).toBe(true)
    const fallback = i18n.options.fallbackLng
    const fallbackList = Array.isArray(fallback) ? fallback : [fallback]
    expect(fallbackList).toContain('en')
    expect(i18n.options.defaultNS).toBe(DEFAULT_NAMESPACE)
    const fallbackNamespace = i18n.options.fallbackNS
    const fallbackNamespaceList = Array.isArray(fallbackNamespace)
      ? fallbackNamespace
      : [fallbackNamespace]
    expect(fallbackNamespaceList).toContain(DEFAULT_NAMESPACE)
    expect(i18n.options.cleanCode).toBe(true)
  })

  test('disables null translation returns by policy', () => {
    expect(i18n.options.returnNull).toBe(false)
    expect(i18n.options.saveMissing).toBe(import.meta.env.DEV)
  })

  test('persists user language selection to localStorage', async () => {
    await i18n.changeLanguage('vi')
    expect(localStorage.getItem(AFENDA_LOCALE_STORAGE_KEY)).toBe('vi')
    await i18n.changeLanguage('en')
    expect(localStorage.getItem(AFENDA_LOCALE_STORAGE_KEY)).toBe('en')
  })

  test('syncs html lang attribute with active i18n language', async () => {
    const initialLanguage = i18n.resolvedLanguage ?? i18n.language
    expect(document.documentElement.lang).toBe(initialLanguage)

    await i18n.changeLanguage('vi')
    expect(document.documentElement.lang).toBe('vi')

    await i18n.changeLanguage('en')
    expect(document.documentElement.lang).toBe('en')
  })
})
