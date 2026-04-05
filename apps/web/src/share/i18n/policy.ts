/**
 * SEA i18n governance — frozen constraints (phase 0).
 * Canonical locale and namespaces are authoritative for CI and runtime.
 */

/** Active locales shipped in the bundle (structural, day 1). */
export const SUPPORTED_LOCALES = ['en', 'ms', 'id', 'vi'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/** Only `en` may introduce new keys or source meaning. */
export const CANONICAL_LOCALE: SupportedLocale = 'en'

export const FALLBACK_LOCALE: SupportedLocale = 'en'

/** i18next `defaultNS` and primary app chrome namespace. */
export const DEFAULT_NAMESPACE = 'shell'

/**
 * Namespaces approved for production completeness enforcement (release gate).
 * Initial set per SEA i18n plan.
 */
export const RELEASE_NAMESPACES = ['shell', 'auth', 'dashboard'] as const

export type ReleaseNamespace = (typeof RELEASE_NAMESPACES)[number]

/** All registered translation namespaces (domain-based, stable). */
export const ALL_NAMESPACES = [
  'shell',
  'auth',
  'dashboard',
  'invoice',
  'allocation',
  'settlement',
] as const

export type TranslationNamespace = (typeof ALL_NAMESPACES)[number]

/** localStorage key for user-selected locale (user override wins over browser). */
export const AFENDA_LOCALE_STORAGE_KEY = 'afenda.locale'

/**
 * Query string parameter for QA locale override (`?lng=vi`).
 * Enabled in development only (see `config.ts`).
 */
export const LOCALE_QUERY_PARAM = 'lng'

/**
 * Key naming convention (documentation + lint targets):
 * `<domain>.<subdomain>.<element>.<type>` as nested JSON under each namespace file.
 */

/** Key lifecycle states (documentation). */
export type KeyLifecycleState = 'active' | 'deprecated' | 'removed'

/** Non-en locales must be at least this complete vs English for release namespaces. */
export const NON_EN_APPROVED_RATIO_THRESHOLD = 0.95

/** Glossary: keys allowed to stay identical to English across locales (proper nouns, acronyms). */
export const GLOSSARY_IDENTICAL_OK_KEYS: readonly string[] = [
  'shell.marketing.landing.brand_name',
  'shell.marketing.landing.sentence_end',
  'dashboard.demo.separator',
]

/**
 * Key prefixes excluded from the non-`en` “must differ from English” ratio (e.g. autonyms
 * for the language picker are often repeated across locale files).
 */
export const IDENTICAL_RATIO_EXCLUDED_PREFIXES: readonly string[] = [
  'shell.language.',
]
