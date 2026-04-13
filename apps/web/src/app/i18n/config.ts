import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enAllocation from './locales/en/allocation.json'
import enAuth from './locales/en/auth.json'
import enDashboard from './locales/en/dashboard.json'
import enGlossary from './locales/en/glossary.json'
import enInvoice from './locales/en/invoice.json'
import enSettlement from './locales/en/settlement.json'
import enShell from './locales/en/shell.json'
import idAllocation from './locales/id/allocation.json'
import idAuth from './locales/id/auth.json'
import idDashboard from './locales/id/dashboard.json'
import idGlossary from './locales/id/glossary.json'
import idInvoice from './locales/id/invoice.json'
import idSettlement from './locales/id/settlement.json'
import idShell from './locales/id/shell.json'
import msAllocation from './locales/ms/allocation.json'
import msAuth from './locales/ms/auth.json'
import msDashboard from './locales/ms/dashboard.json'
import msGlossary from './locales/ms/glossary.json'
import msInvoice from './locales/ms/invoice.json'
import msSettlement from './locales/ms/settlement.json'
import msShell from './locales/ms/shell.json'
import viAllocation from './locales/vi/allocation.json'
import viAuth from './locales/vi/auth.json'
import viDashboard from './locales/vi/dashboard.json'
import viGlossary from './locales/vi/glossary.json'
import viInvoice from './locales/vi/invoice.json'
import viSettlement from './locales/vi/settlement.json'
import viShell from './locales/vi/shell.json'

import {
  AFENDA_LOCALE_STORAGE_KEY,
  ALL_NAMESPACES,
  DEFAULT_NAMESPACE,
  FALLBACK_LOCALE,
  LOCALE_QUERY_PARAM,
  SUPPORTED_LOCALES,
} from './policy'

const en = {
  shell: enShell,
  auth: enAuth,
  dashboard: enDashboard,
  invoice: enInvoice,
  allocation: enAllocation,
  settlement: enSettlement,
  glossary: enGlossary,
} as const

const ms = {
  shell: msShell,
  auth: msAuth,
  dashboard: msDashboard,
  invoice: msInvoice,
  allocation: msAllocation,
  settlement: msSettlement,
  glossary: msGlossary,
} as const

const id = {
  shell: idShell,
  auth: idAuth,
  dashboard: idDashboard,
  invoice: idInvoice,
  allocation: idAllocation,
  settlement: idSettlement,
  glossary: idGlossary,
} as const

const vi = {
  shell: viShell,
  auth: viAuth,
  dashboard: viDashboard,
  invoice: viInvoice,
  allocation: viAllocation,
  settlement: viSettlement,
  glossary: viGlossary,
} as const

const resources = {
  en,
  ms,
  id,
  vi,
} as const

let initPromise: Promise<typeof i18n> | null = null

function syncHtmlLang(language: string): void {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.lang = language
}

/**
 * Initializes i18next once. Call before rendering the React tree.
 */
export function initI18n(): Promise<typeof i18n> {
  if (initPromise) {
    return initPromise
  }

  const detectionOrder = import.meta.env.DEV
    ? (['localStorage', 'querystring', 'navigator', 'htmlTag'] as const)
    : (['localStorage', 'navigator', 'htmlTag'] as const)

  initPromise = i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      supportedLngs: [...SUPPORTED_LOCALES],
      nonExplicitSupportedLngs: true,
      fallbackLng: FALLBACK_LOCALE,
      load: 'languageOnly',
      cleanCode: true,
      defaultNS: DEFAULT_NAMESPACE,
      fallbackNS: DEFAULT_NAMESPACE,
      returnNull: false,
      ns: [...ALL_NAMESPACES],
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
      debug: import.meta.env.DEV,
      saveMissing: import.meta.env.DEV,
      detection: {
        order: [...detectionOrder],
        lookupLocalStorage: AFENDA_LOCALE_STORAGE_KEY,
        lookupQuerystring: LOCALE_QUERY_PARAM,
        caches: ['localStorage'],
      },
      missingKeyHandler: (lngs, ns, key) => {
        if (import.meta.env.DEV) {
          // Dev-only observability for missing keys (no user-facing leakage in prod).
          console.warn(`[i18n] missing key "${key}" in ns "${ns}" for`, lngs)
        }
      },
    })
    .then(() => {
      const activeLanguage = i18n.resolvedLanguage ?? i18n.language

      if (activeLanguage) {
        syncHtmlLang(activeLanguage)
      }

      i18n.on('languageChanged', syncHtmlLang)

      return i18n
    })

  return initPromise
}

export { i18n }
