/**
 * SHADCN REGISTRY
 *
 * Compatibility registry for shadcn-aligned token names and optional aliases.
 *
 * Purpose:
 * - keep shadcn-facing token group knowledge as small, declarative data
 * - support docs, manifests, adapter generation, and compatibility checks
 * - avoid reintroducing a second bridge/compiler architecture
 *
 * Direction note:
 * Official shadcn examples often show `--color-*` deriving from unprefixed semantic vars
 * in `@theme inline` (e.g. `--color-background: var(--background)`). This registry keeps
 * the token pipeline's `--color-*` names as canonical and models unprefixed shadcn names as
 * compatibility aliases. Adapters may emit either direction as long as the canonical
 * source of truth remains the pipeline's `--color-*` and related variables.
 *
 * Rules:
 * - this file is DATA, not compiler logic
 * - canonical runtime naming remains the token pipeline's `--color-*`, `--radius-*`, etc.
 * - aliases here are compatibility metadata only, not a second naming authority
 * - required parity aliases and extra runtime aliases are separated deliberately
 */

import {
  colorTokenValues,
  fontTokenValues,
  radiusTokenValues,
  textSizeTokenValues,
  type ColorToken,
  type ColorCssVarName,
  type FontCssVarName,
  type FontToken,
  type RadiusToken,
  type TextSizeToken,
} from './token-constants'

//
// REGISTRY COLOR KEYS
//

export const shadcnRegistrySemanticColorTokenValues = [
  'accent',
  'accent-foreground',
  'background',
  'border',
  'card',
  'card-foreground',
  'destructive',
  'destructive-foreground',
  'foreground',
  'input',
  'muted',
  'muted-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'ring',
  'ring-offset',
  'secondary',
  'secondary-foreground',
] as const satisfies readonly ColorToken[]

export const shadcnRegistryChartColorTokenValues = [
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const satisfies readonly ColorToken[]

export const shadcnRegistrySidebarColorTokenValues = [
  'sidebar',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-ring',
] as const satisfies readonly ColorToken[]

export const shadcnRegistryColorTokenValues = [
  ...shadcnRegistrySemanticColorTokenValues,
  ...shadcnRegistryChartColorTokenValues,
  ...shadcnRegistrySidebarColorTokenValues,
] as const satisfies readonly ColorToken[]

//
// REGISTRY RADIUS / FONT / TEXT / SHADOW SURFACES
//

export const shadcnRegistryRadiusTokenValues = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
] as const satisfies readonly RadiusToken[]

export const shadcnRegistryFontTokenValues = [
  'sans',
  'mono',
  'heading',
  'serif',
] as const satisfies readonly FontToken[]

export const shadcnRegistryTextSizeTokenValues = [
  'ui-xs',
  'ui-sm',
  'ui-md',
  'ui-lg',
  'label',
  'helper',
  'table',
  'section-title',
  'metric',
] as const satisfies readonly TextSizeToken[]

/** Registry-facing shadow names only; not canonical until vocabulary + emit exist. */
export const shadcnRegistryShadowTokenValues = [
  'shadow-none',
  'shadow-inner',
  'shadow-xs',
  'shadow-sm',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-2xl',
] as const

//
// ALIAS METADATA
//

export type ShadcnRegistryAliasEmitKind = 'direct' | 'wrapped' | 'runtime-only'

export type ShadcnRegistryAliasCanonicalName =
  | ColorCssVarName
  | FontCssVarName
  | `--${string}`

export interface ShadcnRegistryAliasRow {
  readonly alias: `--${string}`
  readonly canonical: ShadcnRegistryAliasCanonicalName
  readonly token?: ColorToken
  readonly emitKind: ShadcnRegistryAliasEmitKind
}

//
// REQUIRED PARITY ALIASES
//

export const shadcnRegistryRequiredColorAliasRows =
  shadcnRegistryColorTokenValues.map((token) => ({
    alias: `--${token}`,
    canonical: `--color-${token}`,
    token,
    emitKind: 'direct',
  })) satisfies readonly ShadcnRegistryAliasRow[]

//
// EXTRA RUNTIME ALIASES
//

export const shadcnRegistryExtraRuntimeAliasRows = [
  {
    alias: '--surface',
    canonical: '--color-background',
    emitKind: 'runtime-only',
  },
  {
    alias: '--surface-foreground',
    canonical: '--color-foreground',
    emitKind: 'runtime-only',
  },
  {
    alias: '--font-family-sans',
    canonical: '--font-sans',
    emitKind: 'runtime-only',
  },
  {
    alias: '--font-family-mono',
    canonical: '--font-mono',
    emitKind: 'runtime-only',
  },
] as const satisfies readonly ShadcnRegistryAliasRow[]

//
// OPTIONAL WRAPPED ALIASES
//

export const shadcnRegistryWrappedAliasRows = [
  {
    alias: '--selection-bg',
    canonical: '--color-primary-100',
    emitKind: 'wrapped',
  },
  {
    alias: '--selection-foreground',
    canonical: '--color-primary-foreground',
    emitKind: 'wrapped',
  },
] as const satisfies readonly ShadcnRegistryAliasRow[]

//
// COMPOSED ALIAS SURFACES
//

export const shadcnRegistryAllAliasRows = [
  ...shadcnRegistryRequiredColorAliasRows,
  ...shadcnRegistryExtraRuntimeAliasRows,
  ...shadcnRegistryWrappedAliasRows,
] as const satisfies readonly ShadcnRegistryAliasRow[]

//
// SUMMARY OBJECT
//

export const shadcnRegistry = {
  colors: shadcnRegistryColorTokenValues,
  semanticColors: shadcnRegistrySemanticColorTokenValues,
  chartColors: shadcnRegistryChartColorTokenValues,
  sidebarColors: shadcnRegistrySidebarColorTokenValues,
  radius: shadcnRegistryRadiusTokenValues,
  fonts: shadcnRegistryFontTokenValues,
  textSizes: shadcnRegistryTextSizeTokenValues,
  shadows: shadcnRegistryShadowTokenValues,
  requiredColorAliases: shadcnRegistryRequiredColorAliasRows,
  extraRuntimeAliases: shadcnRegistryExtraRuntimeAliasRows,
  wrappedAliases: shadcnRegistryWrappedAliasRows,
  allAliases: shadcnRegistryAllAliasRows,
} as const

//
// HELPERS
//

const shadcnRegistryColorTokenSet = new Set<string>(
  shadcnRegistryColorTokenValues,
)

export function isShadcnRegistryColorToken(
  token: string,
): token is (typeof shadcnRegistryColorTokenValues)[number] {
  return shadcnRegistryColorTokenSet.has(token)
}

export function getShadcnRequiredColorAlias(
  token: ColorToken,
): ShadcnRegistryAliasRow | undefined {
  return shadcnRegistryRequiredColorAliasRows.find((row) => row.token === token)
}

export function hasShadcnRequiredColorAlias(token: ColorToken): boolean {
  return getShadcnRequiredColorAlias(token) !== undefined
}

export function getAllShadcnAliasesForCanonical(
  canonical: ShadcnRegistryAliasCanonicalName,
): ReadonlyArray<ShadcnRegistryAliasRow> {
  return shadcnRegistryAllAliasRows.filter((row) => row.canonical === canonical)
}

//
// LIGHTWEIGHT INTEGRITY CHECKS
//

function assertKnownTokens<T extends string>(
  label: string,
  tokens: readonly T[],
  canonicalTokens: readonly string[],
): void {
  const canonicalSet = new Set(canonicalTokens)

  for (const token of tokens) {
    if (!canonicalSet.has(token)) {
      throw new Error(
        `shadcn-registry: unknown ${label} token "${token}" is not canonical`,
      )
    }
  }
}

function assertUniqueAliasRows(rows: readonly ShadcnRegistryAliasRow[]): void {
  const seenAliases = new Set<string>()

  for (const row of rows) {
    if (seenAliases.has(row.alias)) {
      throw new Error(`shadcn-registry: duplicate alias row for "${row.alias}"`)
    }

    seenAliases.add(row.alias)
  }
}

assertKnownTokens('color', shadcnRegistryColorTokenValues, colorTokenValues)
assertKnownTokens('radius', shadcnRegistryRadiusTokenValues, radiusTokenValues)
assertKnownTokens('font', shadcnRegistryFontTokenValues, fontTokenValues)
assertKnownTokens(
  'text-size',
  shadcnRegistryTextSizeTokenValues,
  textSizeTokenValues,
)
assertUniqueAliasRows(shadcnRegistryAllAliasRows)

const requiredAliasCountByToken = new Map<ColorToken, number>()

for (const row of shadcnRegistryRequiredColorAliasRows) {
  requiredAliasCountByToken.set(
    row.token,
    (requiredAliasCountByToken.get(row.token) ?? 0) + 1,
  )
}

for (const token of shadcnRegistryColorTokenValues) {
  const count = requiredAliasCountByToken.get(token) ?? 0

  if (count !== 1) {
    throw new Error(
      `shadcn-registry: expected exactly one required alias row for "${token}", received ${count}`,
    )
  }
}
