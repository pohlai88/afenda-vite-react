import i18n from 'i18next'

/** BCP 47 tags aligned with active `supportedLngs` (language-only codes). */
const LANGUAGE_TO_LOCALE = {
  en: 'en-US',
  ms: 'ms-MY',
  id: 'id-ID',
  vi: 'vi-VN',
} as const

type SupportedLanguage = keyof typeof LANGUAGE_TO_LOCALE

function getActiveLanguage(): SupportedLanguage {
  const raw = i18n.resolvedLanguage ?? i18n.language ?? 'en'
  const normalized = raw.split('-')[0] as SupportedLanguage

  return normalized in LANGUAGE_TO_LOCALE ? normalized : 'en'
}

/**
 * Resolves the locale tag for `Intl` formatters from the current i18n language.
 */
export function getFormatLocale(): string {
  return LANGUAGE_TO_LOCALE[getActiveLanguage()]
}

export type FormatCurrencyOptions = Omit<
  Intl.NumberFormatOptions,
  'style' | 'currency'
>

/**
 * Business-level overrides for ISO-derived currency precision.
 * Keep this map small and explicit to avoid hidden product behavior.
 */
const BUSINESS_CURRENCY_FRACTION_OVERRIDES = {
  VND: 0,
} as const satisfies Partial<Record<string, number>>

const businessCurrencyFractionOverrides: Readonly<Record<string, number>> =
  BUSINESS_CURRENCY_FRACTION_OVERRIDES

function normalizeCurrencyCode(currencyCode: string): string {
  return currencyCode.trim().toUpperCase()
}

/**
 * Resolves currency fraction digits from ISO defaults, then applies business overrides.
 */
function getCurrencyFractionDigits(currencyCode: string): number {
  const normalizedCurrency = normalizeCurrencyCode(currencyCode)
  const overrideDigits = businessCurrencyFractionOverrides[normalizedCurrency]

  if (overrideDigits !== undefined) {
    return overrideDigits
  }

  return (
    new Intl.NumberFormat('en', {
      style: 'currency',
      currency: normalizedCurrency,
    }).resolvedOptions().maximumFractionDigits ?? 2
  )
}

/**
 * Low-level locale-aware currency formatting.
 * Prefer `formatCurrencyByBusinessRule` in product features.
 */
export function formatCurrency(
  amount: number,
  currencyCode: string,
  options?: FormatCurrencyOptions,
): string {
  const normalizedCurrency = normalizeCurrencyCode(currencyCode)

  return new Intl.NumberFormat(getFormatLocale(), {
    style: 'currency',
    currency: normalizedCurrency,
    ...options,
  }).format(amount)
}

export type FormatCurrencyByBusinessRuleOptions = Omit<
  FormatCurrencyOptions,
  'minimumFractionDigits' | 'maximumFractionDigits'
>

/**
 * Currency formatting with governed fraction digits (ISO default + business overrides).
 */
export function formatCurrencyByBusinessRule(
  amount: number,
  currencyCode: string,
  options?: FormatCurrencyByBusinessRuleOptions,
): string {
  const digits = getCurrencyFractionDigits(currencyCode)

  return formatCurrency(amount, currencyCode, {
    ...options,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export type FormatNumberOptions = Intl.NumberFormatOptions

/**
 * Locale-aware number formatting.
 */
export function formatNumber(
  value: number,
  options?: FormatNumberOptions,
): string {
  return new Intl.NumberFormat(getFormatLocale(), options).format(value)
}

export type FormatPercentOptions = Omit<Intl.NumberFormatOptions, 'style'>

/**
 * Locale-aware percent formatting.
 * `value` should be ratio-form (e.g. `0.15` renders as `15%`).
 */
export function formatPercent(
  value: number,
  options?: FormatPercentOptions,
): string {
  return new Intl.NumberFormat(getFormatLocale(), {
    style: 'percent',
    ...options,
  }).format(value)
}

export type FormatDateOptions = Intl.DateTimeFormatOptions

/**
 * Locale-aware date/time formatting.
 */
export function formatDate(
  date: Date | number | string,
  options?: FormatDateOptions,
): string {
  const resolvedDate = date instanceof Date ? date : new Date(date)

  if (Number.isNaN(resolvedDate.getTime())) {
    throw new Error(`Invalid date passed to formatDate: ${String(date)}`)
  }

  return new Intl.DateTimeFormat(getFormatLocale(), options).format(
    resolvedDate,
  )
}
