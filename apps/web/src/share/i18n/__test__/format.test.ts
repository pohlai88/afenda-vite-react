import { describe, expect, test, beforeAll } from 'vitest'

import { initI18n } from '../config'
import {
  formatCurrency,
  formatCurrencyByBusinessRule,
  formatDate,
  formatNumber,
  formatPercent,
  getFormatLocale,
} from '../format'

describe('i18n format helpers', () => {
  beforeAll(async () => {
    await initI18n()
  })

  test('getFormatLocale maps active language to BCP 47', async () => {
    const { i18n } = await import('../config')
    await i18n.changeLanguage('en')
    expect(getFormatLocale()).toBe('en-US')
    await i18n.changeLanguage('id')
    expect(getFormatLocale()).toBe('id-ID')
    await i18n.changeLanguage('en')
  })

  test('formatCurrency uses Intl for active locale', async () => {
    const { i18n } = await import('../config')
    await i18n.changeLanguage('en')
    expect(formatCurrency(1234.5, 'USD')).toMatch(/1,234\.50/)
    expect(formatCurrency(1234.5, ' usd ')).toMatch(/1,234\.50/)
    await i18n.changeLanguage('vi')
    const viOut = formatCurrency(1234.5, 'VND')
    expect(viOut).toContain('1.235')
    await i18n.changeLanguage('en')
  })

  test('formatCurrencyByBusinessRule enforces business fraction policy', async () => {
    const { i18n } = await import('../config')
    await i18n.changeLanguage('en')
    const vndOut = formatCurrencyByBusinessRule(1234.56, 'VND')
    expect(vndOut).toMatch(/1,235/)
  })

  test('formatNumber respects locale', async () => {
    const { i18n } = await import('../config')
    await i18n.changeLanguage('id')
    expect(formatNumber(1000.2)).toMatch(/1(\.|,)000/)
    await i18n.changeLanguage('en')
  })

  test('formatPercent formats ratio values', async () => {
    const { i18n } = await import('../config')
    await i18n.changeLanguage('en')
    expect(formatPercent(0.15)).toContain('15')
  })

  test('formatDate throws on invalid input', () => {
    expect(() => formatDate('not-a-date')).toThrow(
      /Invalid date passed to formatDate/,
    )
  })

  test('currency formatting is strict for invalid currency codes', () => {
    expect(() => formatCurrency(100, 'INVALID')).toThrow()
    expect(() => formatCurrencyByBusinessRule(100, 'INVALID')).toThrow()
  })
})
