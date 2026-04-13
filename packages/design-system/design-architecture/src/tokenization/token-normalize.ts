/**
 * TOKEN NORMALIZE
 *
 * Deterministic normalization for the tokenization pipeline.
 *
 * Rules:
 * - consume a validated {@link ThemeTokenSource} only
 * - follow canonical family and mode order from `token-constants`
 * - emit arrays/tuples for stable bridge and serialization
 * - do not invent tokens or emit CSS text
 *
 * Purpose: remove object-iteration drift; stabilize traversal for Tailwind v4, Figma, and
 * snapshots; keep primitive colors, derived colors, runtime parameters, and motion explicit.
 */

import {
  type AnimationToken,
  type BreakpointToken,
  type ColorToken,
  type ComponentSpacingToken,
  type ContainerToken,
  type ControlSizeToken,
  type DensityToken,
  type FontToken,
  type KeyframeToken,
  type RadiusToken,
  type TextSizeToken,
  type ThemeMode,
  animationTokenValues,
  breakpointTokenValues,
  colorTokenValues,
  componentSpacingTokenValues,
  containerTokenValues,
  controlSizeTokenValues,
  densityTokenValues,
  fontTokenValues,
  keyframeTokenValues,
  radiusTokenValues,
  textSizeTokenValues,
  themeModeValues,
} from './token-constants'
import { themeTokenSource } from './token-source'
import type {
  KeyframeBlock,
  KeyframeEntry,
  NormalizedThemeTokenSource,
  ThemeTokenSource,
  TokenEntries,
} from './token-types'

// =============================================================================
// Generic order helpers
// =============================================================================

function normalizeStringRecord<K extends string>(
  keys: readonly K[],
  record: Readonly<Record<K, string>>,
): TokenEntries<K> {
  return keys.map((key) => [key, record[key]] as const)
}

function normalizeModeStringRecord<K extends string>(
  modes: readonly ThemeMode[],
  keys: readonly K[],
  record: Readonly<Record<ThemeMode, Readonly<Record<K, string>>>>,
): ReadonlyArray<readonly [ThemeMode, TokenEntries<K>]> {
  return modes.map(
    (mode) => [mode, normalizeStringRecord(keys, record[mode])] as const,
  )
}

function normalizeKeyframeRecord(
  keys: readonly KeyframeToken[],
  record: Readonly<Record<KeyframeToken, KeyframeBlock>>,
): ReadonlyArray<KeyframeEntry> {
  return keys.map((key) => [key, record[key]] as const)
}

// =============================================================================
// Family normalizers
// =============================================================================

export function normalizePrimitiveColors(
  source: ThemeTokenSource,
): ReadonlyArray<readonly [ThemeMode, TokenEntries<ColorToken>]> {
  return normalizeModeStringRecord<ColorToken>(
    themeModeValues,
    colorTokenValues,
    source.colors.primitive,
  )
}

export function normalizeDerivedColors(
  source: ThemeTokenSource,
): ReadonlyArray<readonly [ThemeMode, TokenEntries<ColorToken>]> {
  return normalizeModeStringRecord<ColorToken>(
    themeModeValues,
    colorTokenValues,
    source.colors.derived,
  )
}

export function normalizeRadius(
  source: ThemeTokenSource,
): TokenEntries<RadiusToken> {
  return normalizeStringRecord<RadiusToken>(radiusTokenValues, source.radius)
}

export function normalizeContainers(
  source: ThemeTokenSource,
): TokenEntries<ContainerToken> {
  return normalizeStringRecord<ContainerToken>(
    containerTokenValues,
    source.containers,
  )
}

export function normalizeBreakpoints(
  source: ThemeTokenSource,
): TokenEntries<BreakpointToken> {
  return normalizeStringRecord<BreakpointToken>(
    breakpointTokenValues,
    source.breakpoints,
  )
}

export function normalizeFonts(
  source: ThemeTokenSource,
): TokenEntries<FontToken> {
  return normalizeStringRecord<FontToken>(fontTokenValues, source.fonts)
}

export function normalizeDensity(
  source: ThemeTokenSource,
): TokenEntries<DensityToken> {
  return normalizeStringRecord<DensityToken>(
    densityTokenValues,
    source.runtime.density,
  )
}

export function normalizeControlSizes(
  source: ThemeTokenSource,
): TokenEntries<ControlSizeToken> {
  return normalizeStringRecord<ControlSizeToken>(
    controlSizeTokenValues,
    source.runtime.controlSizes,
  )
}

export function normalizeComponentSpacing(
  source: ThemeTokenSource,
): TokenEntries<ComponentSpacingToken> {
  return normalizeStringRecord<ComponentSpacingToken>(
    componentSpacingTokenValues,
    source.runtime.componentSpacing,
  )
}

export function normalizeTextSizes(
  source: ThemeTokenSource,
): TokenEntries<TextSizeToken> {
  return normalizeStringRecord<TextSizeToken>(
    textSizeTokenValues,
    source.runtime.textSizes,
  )
}

export function normalizeAnimations(
  source: ThemeTokenSource,
): TokenEntries<AnimationToken> {
  return normalizeStringRecord<AnimationToken>(
    animationTokenValues,
    source.animations,
  )
}

export function normalizeKeyframes(
  source: ThemeTokenSource,
): ReadonlyArray<KeyframeEntry> {
  return normalizeKeyframeRecord(keyframeTokenValues, source.keyframes)
}

// =============================================================================
// Root normalizer
// =============================================================================

export function normalizeThemeTokenSource(
  source: ThemeTokenSource,
): NormalizedThemeTokenSource {
  return {
    modes: themeModeValues,
    primitiveColors: normalizePrimitiveColors(source),
    derivedColors: normalizeDerivedColors(source),
    radius: normalizeRadius(source),
    containers: normalizeContainers(source),
    breakpoints: normalizeBreakpoints(source),
    fonts: normalizeFonts(source),
    density: normalizeDensity(source),
    controlSizes: normalizeControlSizes(source),
    componentSpacing: normalizeComponentSpacing(source),
    textSizes: normalizeTextSizes(source),
    animations: normalizeAnimations(source),
    keyframes: normalizeKeyframes(source),
  }
}

// =============================================================================
// Canonical normalized export (default validated source)
// =============================================================================

export const normalizedThemeTokenSource =
  normalizeThemeTokenSource(themeTokenSource)
