/**
 * TOKEN BRIDGE
 *
 * Maps normalized token data into CSS-facing declaration structures.
 *
 * Rules:
 * - consume normalized data only
 * - do not invent tokens
 * - do not emit final CSS text
 * - preserve stable declaration order
 * - emit one final declaration per CSS variable
 *
 * Architecture:
 * - primitive colors provide source-owned values
 * - derived colors provide derived-only semantic projections
 * - bridge emits one full final color declaration list per mode
 * - density and control sizes remain on `:root`; text sizes and component spacing are
 *   theme-static so Tailwind can emit matching utilities from `@theme`.
 */

import {
  animationCssVarName,
  breakpointCssVarName,
  colorCssVarName,
  colorTokenValues,
  componentSpacingCssVarName,
  containerCssVarName,
  controlSizeCssVarName,
  densityCssVarName,
  fontCssVarName,
  radiusCssVarName,
  textSizeCssVarName,
  type ColorCssVarName,
  type ThemeMode,
} from './token-constants'
import { normalizedThemeTokenSource } from './token-normalize'
import type {
  BridgedThemeTokens,
  CssDeclaration,
  CssDeclarationList,
  KeyframeEntry,
  NormalizedThemeTokenSource,
  RuntimeParameterDeclarationName,
  ThemeStaticDeclarationName,
} from './token-types'

// =============================================================================
// Generic helpers
// =============================================================================

function mapEntriesToDeclarations<
  K extends string,
  TName extends `--${string}`,
>(
  entries: ReadonlyArray<readonly [K, string]>,
  getName: (key: K) => TName,
): CssDeclarationList<TName> {
  return entries.map(([key, value]) => ({
    name: getName(key),
    value,
  }))
}

function findModeEntries<K extends string>(
  modes: ReadonlyArray<
    readonly [ThemeMode, ReadonlyArray<readonly [K, string]>]
  >,
  targetMode: ThemeMode,
): ReadonlyArray<readonly [K, string]> {
  const found = modes.find(([mode]) => mode === targetMode)

  if (!found) {
    throw new Error(`Missing normalized mode: ${targetMode}`)
  }

  return found[1]
}

// =============================================================================
// Ownership guards
// =============================================================================

const DERIVED_OVERRIDE_FORBIDDEN_TOKENS = new Set<string>([
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'ring-offset',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'info',
  'info-foreground',
])

function assertNoForbiddenDerivedOverrides<K extends string>(
  overrideEntries: ReadonlyArray<readonly [K, string]>,
): void {
  for (const [key] of overrideEntries) {
    if (DERIVED_OVERRIDE_FORBIDDEN_TOKENS.has(key)) {
      throw new Error(
        `Illegal derived override for primitive-owned token: ${key}`,
      )
    }
  }
}

// =============================================================================
// Color bridging
// =============================================================================

function buildEntryMap<K extends string>(
  entries: ReadonlyArray<readonly [K, string]>,
): ReadonlyMap<string, string> {
  const map = new Map<string, string>()

  for (const [key, value] of entries) {
    if (map.has(key)) {
      throw new Error(`Duplicate normalized token entry: ${key}`)
    }

    map.set(key, value)
  }

  return map
}

function bridgeMergedModeColorDeclarations(
  source: NormalizedThemeTokenSource,
  mode: ThemeMode,
): CssDeclarationList<ColorCssVarName> {
  const primitiveEntries = findModeEntries(source.primitiveColors, mode)
  const derivedEntries = findModeEntries(source.derivedColors, mode)

  assertNoForbiddenDerivedOverrides(derivedEntries)

  const primitiveMap = buildEntryMap(primitiveEntries)
  const derivedMap = buildEntryMap(derivedEntries)

  const mergedEntries = colorTokenValues.map((token) => {
    const value = derivedMap.get(token) ?? primitiveMap.get(token)

    if (value === undefined) {
      throw new Error(`Missing merged color token for mode ${mode}: ${token}`)
    }

    return [token, value] as const
  })

  return mapEntriesToDeclarations(mergedEntries, colorCssVarName)
}

export function bridgeLightThemeColorDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<ColorCssVarName> {
  return bridgeMergedModeColorDeclarations(source, 'light')
}

export function bridgeDarkModeColorDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<ColorCssVarName> {
  return bridgeMergedModeColorDeclarations(source, 'dark')
}

// =============================================================================
// Theme-static family bridging
// =============================================================================

export function bridgeRadiusDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<ThemeStaticDeclarationName> {
  return mapEntriesToDeclarations(source.radius, radiusCssVarName)
}

export function bridgeContainerDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<ThemeStaticDeclarationName> {
  return mapEntriesToDeclarations(source.containers, containerCssVarName)
}

export function bridgeBreakpointDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<ThemeStaticDeclarationName> {
  return mapEntriesToDeclarations(source.breakpoints, breakpointCssVarName)
}

export function bridgeFontDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<ThemeStaticDeclarationName> {
  return mapEntriesToDeclarations(source.fonts, fontCssVarName)
}

export function bridgeTextSizeDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<ThemeStaticDeclarationName> {
  return mapEntriesToDeclarations(source.textSizes, textSizeCssVarName)
}

export function bridgeComponentSpacingDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<ThemeStaticDeclarationName> {
  return mapEntriesToDeclarations(
    source.componentSpacing,
    componentSpacingCssVarName,
  )
}

export function bridgeAnimationDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<ThemeStaticDeclarationName> {
  return mapEntriesToDeclarations(source.animations, animationCssVarName)
}

// =============================================================================
// Runtime parameter bridging (`:root` only)
// =============================================================================

export function bridgeDensityDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<RuntimeParameterDeclarationName> {
  return mapEntriesToDeclarations(source.density, densityCssVarName)
}

export function bridgeControlSizeDeclarations(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): CssDeclarationList<RuntimeParameterDeclarationName> {
  return mapEntriesToDeclarations(source.controlSizes, controlSizeCssVarName)
}

// =============================================================================
// Keyframe bridging
// =============================================================================

export function bridgeKeyframes(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): ReadonlyArray<KeyframeEntry> {
  return source.keyframes
}

// =============================================================================
// Root bridge
// =============================================================================

export function bridgeThemeTokens(
  source: NormalizedThemeTokenSource = normalizedThemeTokenSource,
): BridgedThemeTokens {
  const themeStaticDeclarations: CssDeclaration<ThemeStaticDeclarationName>[] =
    [
      ...bridgeLightThemeColorDeclarations(source),
      ...bridgeRadiusDeclarations(source),
      ...bridgeContainerDeclarations(source),
      ...bridgeBreakpointDeclarations(source),
      ...bridgeFontDeclarations(source),
      ...bridgeTextSizeDeclarations(source),
      ...bridgeComponentSpacingDeclarations(source),
      ...bridgeAnimationDeclarations(source),
    ]

  const darkModeDeclarations: CssDeclaration<ColorCssVarName>[] = [
    ...bridgeDarkModeColorDeclarations(source),
  ]

  const runtimeParameterDeclarations: CssDeclaration<RuntimeParameterDeclarationName>[] =
    [
      ...bridgeDensityDeclarations(source),
      ...bridgeControlSizeDeclarations(source),
    ]

  return {
    themeStaticDeclarations,
    darkModeDeclarations,
    runtimeParameterDeclarations,
    keyframes: bridgeKeyframes(source),
  }
}

export const bridgedThemeTokens = bridgeThemeTokens()
