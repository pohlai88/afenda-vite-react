/**
 * Interpolation, pluralization, and formatting correctness tests.
 *
 * Proves the i18n system correctly handles:
 *   - Variable interpolation ({{name}}, {{count}})
 *   - Plural forms (_one / _other)
 *   - Currency, number, date, and percent formatting across locales
 *   - XSS-safe rendering (escapeValue: false is intentional for React)
 */
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

import { i18n, initI18n } from '../config'
import {
  formatCurrency,
  formatCurrencyByBusinessRule,
  formatDate,
  formatNumber,
  formatPercent,
  getFormatLocale,
} from '../format'
import { SUPPORTED_LOCALES } from '../policy'

describe('interpolation and plurals', () => {
  beforeAll(async () => {
    await initI18n()
    await i18n.changeLanguage('en')
  })

  afterAll(async () => {
    await i18n.changeLanguage('en')
  })

  test('interpolation replaces {{name}} in welcome message', () => {
    const result = i18n.t('dashboard:header.welcome.message', {
      name: 'Alice',
    })
    expect(result).toBe('Welcome back, Alice!')
    expect(result).not.toContain('{{')
  })

  test('interpolation works in Malay locale', async () => {
    await i18n.changeLanguage('ms')
    const result = i18n.t('dashboard:header.welcome.message', {
      name: 'Ahmad',
    })
    expect(result).toBe('Selamat kembali, Ahmad!')
    expect(result).not.toContain('{{')
    await i18n.changeLanguage('en')
  })

  test('plural form _one resolves for count=1', () => {
    const result = i18n.t('dashboard:demo.priority_items', { count: 1 })
    expect(result).toBe('1 open task today')
  })

  test('plural form _other resolves for count > 1', () => {
    const result = i18n.t('dashboard:demo.priority_items', { count: 5 })
    expect(result).toBe('5 open tasks today')
  })

  test('plural form _other resolves for count=0', () => {
    const result = i18n.t('dashboard:demo.priority_items', { count: 0 })
    expect(result).toBe('0 open tasks today')
  })

  test('plurals work in Malay locale', async () => {
    await i18n.changeLanguage('ms')
    const one = i18n.t('dashboard:demo.priority_items', { count: 1 })
    const many = i18n.t('dashboard:demo.priority_items', { count: 7 })
    expect(one).toContain('1')
    expect(many).toContain('7')
    expect(one).toContain('tugasan')
    await i18n.changeLanguage('en')
  })

  test('HTML entities in interpolation values are not escaped (React handles it)', () => {
    const result = i18n.t('dashboard:header.welcome.message', {
      name: '<script>alert("xss")</script>',
    })
    expect(result).toContain('<script>')
    // This is correct: React's JSX rendering escapes output.
    // i18next escapeValue: false avoids double-escaping.
  })
})

describe('formatting across locales', () => {
  beforeAll(async () => {
    await initI18n()
  })

  afterAll(async () => {
    await i18n.changeLanguage('en')
  })

  test('getFormatLocale returns correct BCP 47 for each language', async () => {
    const expected: Record<string, string> = {
      en: 'en-US',
      ms: 'ms-MY',
      id: 'id-ID',
      vi: 'vi-VN',
    }

    for (const locale of SUPPORTED_LOCALES) {
      await i18n.changeLanguage(locale)
      expect(getFormatLocale()).toBe(expected[locale])
    }
  })

  test('currency formatting varies by locale', async () => {
    await i18n.changeLanguage('en')
    const enUsd = formatCurrency(1234.5, 'USD')
    expect(enUsd).toMatch(/\$/)
    expect(enUsd).toMatch(/1,234\.50/)

    await i18n.changeLanguage('ms')
    const msMyr = formatCurrency(1234.5, 'MYR')
    expect(msMyr).toMatch(/RM/)

    await i18n.changeLanguage('id')
    const idIdr = formatCurrency(50000, 'IDR')
    expect(idIdr).toMatch(/Rp/)

    await i18n.changeLanguage('vi')
    const viVnd = formatCurrency(50000, 'VND')
    expect(viVnd).toMatch(/₫/)
  })

  test('business rule VND has zero fraction digits', async () => {
    await i18n.changeLanguage('vi')
    const result = formatCurrencyByBusinessRule(1234.56, 'VND')
    // vi-VN uses . as thousands separator, so "1.235 ₫" is correct (no decimals)
    expect(result).toMatch(/1[.,]235/)
    expect(result).toContain('₫')
    // No decimal point with fractional digits — only the thousands separator
    expect(result).not.toMatch(/\d[.,]\d{2}\b/)
  })

  test('number formatting respects locale separators', async () => {
    await i18n.changeLanguage('en')
    expect(formatNumber(1000000.5)).toMatch(/1,000,000/)

    await i18n.changeLanguage('id')
    const idNum = formatNumber(1000000.5)
    expect(idNum).toMatch(/1[.,]000[.,]000/)
  })

  test('percent formatting works across locales', async () => {
    await i18n.changeLanguage('en')
    const result = formatPercent(0.257)
    expect(result).toContain('26')

    await i18n.changeLanguage('ms')
    const msResult = formatPercent(0.5)
    expect(msResult).toContain('50')
  })

  test('date formatting respects locale', async () => {
    const testDate = new Date('2026-04-06T12:00:00Z')

    await i18n.changeLanguage('en')
    const enDate = formatDate(testDate, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    expect(enDate).toContain('April')
    expect(enDate).toContain('2026')

    await i18n.changeLanguage('ms')
    const msDate = formatDate(testDate, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    expect(msDate).toContain('2026')
    // Malay uses "April" (same as English for this month) — just verify it formatted
    expect(msDate).toMatch(/\d/)

    // Use a month that differs between locales to prove locale-awareness
    const janDate = new Date('2026-01-15T12:00:00Z')
    await i18n.changeLanguage('vi')
    const viJan = formatDate(janDate, { month: 'long' })
    expect(viJan).not.toBe('January')
  })
})
