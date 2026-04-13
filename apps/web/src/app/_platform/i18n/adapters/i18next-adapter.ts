import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import enAuth from "../locales/en/auth.json"
import enDashboard from "../locales/en/dashboard.json"
import enShell from "../locales/en/shell.json"
import idAuth from "../locales/id/auth.json"
import idDashboard from "../locales/id/dashboard.json"
import idShell from "../locales/id/shell.json"
import msAuth from "../locales/ms/auth.json"
import msDashboard from "../locales/ms/dashboard.json"
import msShell from "../locales/ms/shell.json"
import viAuth from "../locales/vi/auth.json"
import viDashboard from "../locales/vi/dashboard.json"
import viShell from "../locales/vi/shell.json"

import {
  AFENDA_LOCALE_STORAGE_KEY,
  ALL_NAMESPACES,
  DEFAULT_NAMESPACE,
  FALLBACK_LOCALE,
  LOCALE_QUERY_PARAM,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  type TranslationNamespace,
} from "../policy/i18n-policy"

const en = {
  shell: enShell,
  auth: enAuth,
  dashboard: enDashboard,
} as const

const ms = {
  shell: msShell,
  auth: msAuth,
  dashboard: msDashboard,
} as const

const id = {
  shell: idShell,
  auth: idAuth,
  dashboard: idDashboard,
} as const

const vi = {
  shell: viShell,
  auth: viAuth,
  dashboard: viDashboard,
} as const

const resources = {
  en,
  ms,
  id,
  vi,
} as const

type LocaleResource = Record<string, unknown>
type NamespaceResourceLoader = () => Promise<LocaleResource>

const namespaceResourceLoaders: Record<
  SupportedLocale,
  Record<TranslationNamespace, NamespaceResourceLoader>
> = {
  en: {
    shell: () => Promise.resolve(enShell),
    auth: () => Promise.resolve(enAuth),
    dashboard: () => Promise.resolve(enDashboard),
    invoice: () => import("../locales/en/invoice.json").then((m) => m.default),
    allocation: () =>
      import("../locales/en/allocation.json").then((m) => m.default),
    settlement: () =>
      import("../locales/en/settlement.json").then((m) => m.default),
    glossary: () =>
      import("../locales/en/glossary.json").then((m) => m.default),
  },
  ms: {
    shell: () => Promise.resolve(msShell),
    auth: () => Promise.resolve(msAuth),
    dashboard: () => Promise.resolve(msDashboard),
    invoice: () => import("../locales/ms/invoice.json").then((m) => m.default),
    allocation: () =>
      import("../locales/ms/allocation.json").then((m) => m.default),
    settlement: () =>
      import("../locales/ms/settlement.json").then((m) => m.default),
    glossary: () =>
      import("../locales/ms/glossary.json").then((m) => m.default),
  },
  id: {
    shell: () => Promise.resolve(idShell),
    auth: () => Promise.resolve(idAuth),
    dashboard: () => Promise.resolve(idDashboard),
    invoice: () => import("../locales/id/invoice.json").then((m) => m.default),
    allocation: () =>
      import("../locales/id/allocation.json").then((m) => m.default),
    settlement: () =>
      import("../locales/id/settlement.json").then((m) => m.default),
    glossary: () =>
      import("../locales/id/glossary.json").then((m) => m.default),
  },
  vi: {
    shell: () => Promise.resolve(viShell),
    auth: () => Promise.resolve(viAuth),
    dashboard: () => Promise.resolve(viDashboard),
    invoice: () => import("../locales/vi/invoice.json").then((m) => m.default),
    allocation: () =>
      import("../locales/vi/allocation.json").then((m) => m.default),
    settlement: () =>
      import("../locales/vi/settlement.json").then((m) => m.default),
    glossary: () =>
      import("../locales/vi/glossary.json").then((m) => m.default),
  },
}

let initPromise: Promise<typeof i18n> | null = null

function syncHtmlLang(language: string): void {
  if (typeof document === "undefined") {
    return
  }

  document.documentElement.lang = language
}

function normalizeLocale(language?: string): SupportedLocale {
  const normalized = language?.split("-")[0]

  return (
    SUPPORTED_LOCALES.find((locale) => locale === normalized) ?? FALLBACK_LOCALE
  )
}

export function getI18nDetectionOrder(isDevelopment = import.meta.env.DEV) {
  return isDevelopment
    ? (["querystring", "localStorage", "navigator", "htmlTag"] as const)
    : (["localStorage", "navigator", "htmlTag"] as const)
}

export function getActiveLocale(): SupportedLocale {
  return normalizeLocale(i18n.resolvedLanguage ?? i18n.language)
}

export async function loadI18nNamespace(
  locale: SupportedLocale,
  namespace: TranslationNamespace
): Promise<void> {
  if (!i18n.isInitialized) {
    await initI18n()
  }

  if (i18n.hasResourceBundle(locale, namespace)) {
    return
  }

  const loader = (
    namespaceResourceLoaders[locale] as Partial<
      Record<string, NamespaceResourceLoader>
    >
  )[namespace]

  if (!loader) {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] no lazy resource loader for ${locale}:${namespace}`)
    }
    return
  }

  const resource = await loader()
  i18n.addResourceBundle(locale, namespace, resource, true, true)
}

export async function preloadI18nNamespaces(
  namespaces: readonly TranslationNamespace[]
): Promise<void> {
  const activeLocale = getActiveLocale()
  const locales =
    activeLocale === FALLBACK_LOCALE
      ? ([activeLocale] as const)
      : ([activeLocale, FALLBACK_LOCALE] as const)

  await Promise.all(
    locales.flatMap((locale) =>
      namespaces.map((namespace) => loadI18nNamespace(locale, namespace))
    )
  )
}

export async function changeLocale(locale: SupportedLocale): Promise<void> {
  await initI18n()
  await i18n.changeLanguage(locale)
}

/**
 * Initializes i18next once. Call before rendering the React tree.
 */
export function initI18n(): Promise<typeof i18n> {
  if (initPromise) {
    return initPromise
  }

  initPromise = i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      supportedLngs: [...SUPPORTED_LOCALES],
      nonExplicitSupportedLngs: true,
      fallbackLng: FALLBACK_LOCALE,
      load: "languageOnly",
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
        order: [...getI18nDetectionOrder()],
        lookupLocalStorage: AFENDA_LOCALE_STORAGE_KEY,
        lookupQuerystring: LOCALE_QUERY_PARAM,
        caches: ["localStorage"],
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

      i18n.on("languageChanged", syncHtmlLang)

      return i18n
    })

  return initPromise
}

export { i18n }
