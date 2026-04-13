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
 * - derived colors override / finalize semantic aliases
 * - bridge emits merged final color declarations per mode
 * - density and control sizes remain on `:root`; text sizes and component spacing are
 *   theme-static so Tailwind can emit matching utilities from `@theme`.
 */

import {
  animationCssVarName,
  breakpointCssVarName,
  colorCssVarName,
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

/**
 * Merge two ordered token-entry lists into one ordered final list.
 *
 * Rules:
 * - preserve the order of the base list
 * - only override values for existing keys
 * - do not add ad hoc keys
 *
 * Assumption:
 * normalize stage already guarantees the same canonical token coverage/order.
 */
function mergeOrderedEntries<K extends string>(
  baseEntries: ReadonlyArray<readonly [K, string]>,
  overrideEntries: ReadonlyArray<readonly [K, string]>,
): ReadonlyArray<readonly [K, string]> {
  const baseKeys = new Set(baseEntries.map(([key]) => key))
  const overrideMap = new Map<K, string>()

  for (const [key, value] of overrideEntries) {
    if (!baseKeys.has(key)) {
      throw new Error(`Unexpected override token: ${key}`)
    }

    overrideMap.set(key, value)
  }

  return baseEntries.map(([key, baseValue]) => {
    const overrideValue = overrideMap.get(key)
    return [key, overrideValue ?? baseValue] as const
  })
}

// =============================================================================
// Color bridging
// =============================================================================

function bridgeMergedModeColorDeclarations(
  source: NormalizedThemeTokenSource,
  mode: ThemeMode,
): CssDeclarationList<ColorCssVarName> {
  const primitiveEntries = findModeEntries(source.primitiveColors, mode)
  const derivedEntries = findModeEntries(source.derivedColors, mode)
  const mergedEntries = mergeOrderedEntries(primitiveEntries, derivedEntries)

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

// =============================================================================
// Canonical bridged export
// =============================================================================

export const bridgedThemeTokens = bridgeThemeTokens()
