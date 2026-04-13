/**
 * GOVERNANCE — import allowlist
 *
 * Canonical import boundary metadata for `@afenda/design-system/*` public surfaces.
 *
 * Purpose:
 * - make allowed design-system subpath usage explicit per consumer surface
 * - support lint rules, tests, CI checks, and migration docs
 * - prevent accidental drift into deprecated or non-canonical imports
 *
 * Rules:
 * - this file is declarative metadata only
 * - it does not enforce imports by itself
 * - allowed subpaths refer to public `package.json` export roots, not deep file paths
 * - deprecated or legacy integration surfaces are documented in `deprecated-surface.ts`
 *
 * Matching:
 * - module specifiers match an allowed subpath if it is equal or extends it with `/` (except
 *   the package root `@afenda/design-system`, which matches only itself — so `…/scripts` is not
 *   implied by the root entry)
 * - style specifiers are matched exactly
 */

/** TypeScript / JS module specifiers (used as allowed subpath roots). */
export const DESIGN_SYSTEM_MODULE_PREFIXES = {
  root: '@afenda/design-system',
  utils: '@afenda/design-system/utils',
  uiPrimitives: '@afenda/design-system/ui-primitives',
  icons: '@afenda/design-system/icons',
  governance: '@afenda/design-system/governance',
  tokenization: '@afenda/design-system/tokenization',
  scripts: '@afenda/design-system/scripts',
  /** Registry blocks/charts/examples/internal (`package.json` exports `./lib/newyork-v4/*`). */
  libNewyorkV4: '@afenda/design-system/lib/newyork-v4',
} as const

/**
 * CSS entry points from `package.json` `exports` (full specifier strings).
 */
export const DESIGN_SYSTEM_STYLE_IMPORT_SPECIFIERS = [
  '@afenda/design-system/design-architecture/local.css',
] as const

export interface ConsumerImportAllowlistEntry {
  readonly consumer: DesignSystemImportAllowlistConsumerId
  /**
   * Public subpath roots (e.g. `@afenda/design-system/utils`). Deep imports such as
   * `@afenda/design-system/utils/cn` are allowed when they extend a listed root with `/`.
   */
  readonly allowedSubpaths: readonly string[]
  /**
   * When set (including `[]`), only those style specifiers are allowed. When omitted, no style imports.
   */
  readonly allowedStyleSpecifiers?: readonly string[]
  readonly note?: string
}

export type DesignSystemImportAllowlistConsumerId =
  | 'packages/design-system'
  | 'scripts'
  | 'tests'

/**
 * Per-surface policy. `consumer` is a stable repo-relative id (not necessarily a package name).
 */
export const DESIGN_SYSTEM_IMPORT_ALLOWLIST = [
  {
    consumer: 'packages/design-system',
    allowedSubpaths: [
      DESIGN_SYSTEM_MODULE_PREFIXES.root,
      DESIGN_SYSTEM_MODULE_PREFIXES.utils,
      DESIGN_SYSTEM_MODULE_PREFIXES.uiPrimitives,
      DESIGN_SYSTEM_MODULE_PREFIXES.icons,
      DESIGN_SYSTEM_MODULE_PREFIXES.governance,
      DESIGN_SYSTEM_MODULE_PREFIXES.tokenization,
      DESIGN_SYSTEM_MODULE_PREFIXES.scripts,
      DESIGN_SYSTEM_MODULE_PREFIXES.libNewyorkV4,
    ],
    allowedStyleSpecifiers: DESIGN_SYSTEM_STYLE_IMPORT_SPECIFIERS,
    note: 'Package-internal and adjacent tooling may use all public export surfaces including `scripts`.',
  },
  {
    consumer: 'scripts',
    allowedSubpaths: [
      DESIGN_SYSTEM_MODULE_PREFIXES.tokenization,
      DESIGN_SYSTEM_MODULE_PREFIXES.governance,
    ],
    allowedStyleSpecifiers: [],
    note: 'Build and maintenance scripts may consume tokenization and governance metadata for generation, checks, and reporting.',
  },
  {
    consumer: 'tests',
    allowedSubpaths: [
      DESIGN_SYSTEM_MODULE_PREFIXES.tokenization,
      DESIGN_SYSTEM_MODULE_PREFIXES.governance,
    ],
    allowedStyleSpecifiers: [],
    note: 'Tests may consume public tokenization and governance surfaces for architectural verification.',
  },
] as const satisfies readonly ConsumerImportAllowlistEntry[]

export const DESIGN_SYSTEM_IMPORT_ALLOWLIST_MAP = Object.fromEntries(
  DESIGN_SYSTEM_IMPORT_ALLOWLIST.map((entry) => [entry.consumer, entry]),
) as unknown as Readonly<
  Record<DesignSystemImportAllowlistConsumerId, ConsumerImportAllowlistEntry>
>

/**
 * Map `package.json` `"name"` → allowlist `consumer` id (when not using path-style ids directly).
 */
export const PACKAGE_NAME_TO_IMPORT_ALLOWLIST_CONSUMER: Readonly<
  Partial<Record<string, DesignSystemImportAllowlistConsumerId>>
> = {}

export function resolveImportAllowlistConsumerId(
  consumerOrPackageName: string,
): DesignSystemImportAllowlistConsumerId | undefined {
  if (consumerOrPackageName in DESIGN_SYSTEM_IMPORT_ALLOWLIST_MAP) {
    return consumerOrPackageName as DesignSystemImportAllowlistConsumerId
  }
  return PACKAGE_NAME_TO_IMPORT_ALLOWLIST_CONSUMER[consumerOrPackageName]
}

function moduleSpecifierMatchesPrefix(
  importSource: string,
  prefix: string,
): boolean {
  return importSource === prefix || importSource.startsWith(`${prefix}/`)
}

/** Root entry matches only itself (not every `…/foo` subpath). */
function moduleSpecifierMatchesAllowedSubpath(
  importSource: string,
  subpath: string,
): boolean {
  if (subpath === DESIGN_SYSTEM_MODULE_PREFIXES.root) {
    return importSource === subpath
  }
  return moduleSpecifierMatchesPrefix(importSource, subpath)
}

function getEntryForConsumer(
  consumerOrPackageName: string,
): ConsumerImportAllowlistEntry | undefined {
  const id = resolveImportAllowlistConsumerId(consumerOrPackageName)
  if (!id) {
    return undefined
  }
  return DESIGN_SYSTEM_IMPORT_ALLOWLIST_MAP[id]
}

/**
 * Module subpath roots allowed for this consumer (e.g. `@afenda/design-system/utils`).
 * Does not include style specifiers; see the entry’s `allowedStyleSpecifiers`.
 */
export function getAllowedDesignSystemSubpathsForConsumer(
  consumer: string,
): readonly string[] {
  return getEntryForConsumer(consumer)?.allowedSubpaths ?? []
}

export function getConsumerImportAllowlistEntry(
  consumer: string,
): ConsumerImportAllowlistEntry | undefined {
  return getEntryForConsumer(consumer)
}

/**
 * True if `subpath` is listed exactly in the consumer’s `allowedSubpaths` (no prefix extension).
 */
export function isAllowedDesignSystemSubpathForConsumer(
  consumer: string,
  subpath: string,
): boolean {
  const allowed = getAllowedDesignSystemSubpathsForConsumer(consumer)
  return allowed.includes(subpath)
}

/**
 * True if `importSource` is allowed for this consumer (prefix rules for modules; exact for styles).
 */
export function isAllowedDesignSystemImport(
  consumer: string,
  importSource: string,
): boolean {
  const entry = getEntryForConsumer(consumer)
  if (!entry) {
    return false
  }

  const styles = entry.allowedStyleSpecifiers
  if (styles !== undefined && styles.includes(importSource)) {
    return true
  }

  return entry.allowedSubpaths.some((subpath) =>
    moduleSpecifierMatchesAllowedSubpath(importSource, subpath),
  )
}
