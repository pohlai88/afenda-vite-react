/**
 * TOKEN TYPES
 *
 * Derived structural types for the tokenization pipeline.
 *
 * Rules:
 * - derive from `token-constants` only
 * - no manual canonical string unions
 * - no values, validation, or CSS serialization in this module
 *
 * Purpose: stable shapes for source, normalization, bridging, and serialization; predictable
 * Tailwind v4 emission; explicit Figma / Tailwind / shadcn family boundaries.
 */

import type {
  AnimationCssVarName,
  AnimationToken,
  BreakpointCssVarName,
  BreakpointToken,
  ColorCssVarName,
  ColorToken,
  ComponentSpacingCssVarName,
  ComponentSpacingToken,
  ContainerCssVarName,
  ContainerToken,
  ControlSizeCssVarName,
  ControlSizeToken,
  DensityCssVarName,
  DensityToken,
  FontCssVarName,
  FontToken,
  KeyframeToken,
  RadiusCssVarName,
  RadiusToken,
  TextSizeCssVarName,
  TextSizeToken,
  ThemeMode,
  TokenFamily,
  TokenFamilyMember,
} from './token-constants'

// =============================================================================
// Generic helpers
// =============================================================================

export type ThemeModeRecord<T> = Readonly<Record<ThemeMode, T>>

export type TokenEntry<K extends string, V = string> = readonly [K, V]

export type TokenEntries<K extends string, V = string> = ReadonlyArray<
  TokenEntry<K, V>
>

export type KeyframeStepRecord = Readonly<Record<string, string>>

export type KeyframeBlock = Readonly<Record<string, KeyframeStepRecord>>

export type KeyframeEntry = readonly [KeyframeToken, KeyframeBlock]

// =============================================================================
// Family records
// =============================================================================

/**
 * Full canonical color map per mode (see `colorTokenValues`).
 * Primitive and derived layers each carry the full vocabulary; values differ by layer.
 */
export type ColorTokenRecord = Readonly<Record<ColorToken, string>>

export type RadiusTokenRecord = Readonly<Record<RadiusToken, string>>

export type ContainerTokenRecord = Readonly<Record<ContainerToken, string>>

export type BreakpointTokenRecord = Readonly<Record<BreakpointToken, string>>

export type FontTokenRecord = Readonly<Record<FontToken, string>>

export type DensityTokenRecord = Readonly<Record<DensityToken, string>>

export type ControlSizeTokenRecord = Readonly<Record<ControlSizeToken, string>>

export type ComponentSpacingTokenRecord = Readonly<
  Record<ComponentSpacingToken, string>
>

export type TextSizeTokenRecord = Readonly<Record<TextSizeToken, string>>

export type AnimationTokenRecord = Readonly<Record<AnimationToken, string>>

export type KeyframeTokenRecord = Readonly<Record<KeyframeToken, KeyframeBlock>>

// =============================================================================
// Source shape
// =============================================================================

export interface ThemeColorSource {
  readonly primitive: ThemeModeRecord<ColorTokenRecord>
  readonly derived: ThemeModeRecord<ColorTokenRecord>
}

export interface ThemeRuntimeParameterSource {
  readonly density: DensityTokenRecord
  readonly controlSizes: ControlSizeTokenRecord
  readonly componentSpacing: ComponentSpacingTokenRecord
  readonly textSizes: TextSizeTokenRecord
}

export interface ThemeTokenSource {
  readonly colors: ThemeColorSource
  readonly radius: RadiusTokenRecord
  readonly containers: ContainerTokenRecord
  readonly breakpoints: BreakpointTokenRecord
  readonly fonts: FontTokenRecord
  readonly runtime: ThemeRuntimeParameterSource
  readonly animations: AnimationTokenRecord
  readonly keyframes: KeyframeTokenRecord
}

// =============================================================================
// Normalized shape
// =============================================================================

export type NormalizedColorTokenEntries = readonly [
  ThemeMode,
  TokenEntries<ColorToken>,
]

export interface NormalizedThemeTokenSource {
  readonly modes: readonly ThemeMode[]
  readonly primitiveColors: ReadonlyArray<NormalizedColorTokenEntries>
  readonly derivedColors: ReadonlyArray<NormalizedColorTokenEntries>
  readonly radius: TokenEntries<RadiusToken>
  readonly containers: TokenEntries<ContainerToken>
  readonly breakpoints: TokenEntries<BreakpointToken>
  readonly fonts: TokenEntries<FontToken>
  readonly density: TokenEntries<DensityToken>
  readonly controlSizes: TokenEntries<ControlSizeToken>
  readonly componentSpacing: TokenEntries<ComponentSpacingToken>
  readonly textSizes: TokenEntries<TextSizeToken>
  readonly animations: TokenEntries<AnimationToken>
  readonly keyframes: ReadonlyArray<KeyframeEntry>
}

// =============================================================================
// Bridge shape
// =============================================================================

export type ThemeStaticDeclarationName =
  | ColorCssVarName
  | RadiusCssVarName
  | ContainerCssVarName
  | BreakpointCssVarName
  | FontCssVarName
  | TextSizeCssVarName
  | ComponentSpacingCssVarName
  | AnimationCssVarName

export type DarkModeDeclarationName = ColorCssVarName

/** Density and control sizes stay on `:root`; text/spacing live in `@theme static` for Tailwind utilities. */
export type RuntimeParameterDeclarationName =
  | DensityCssVarName
  | ControlSizeCssVarName

export type ThemeCssDeclarationName =
  | ThemeStaticDeclarationName
  | DarkModeDeclarationName
  | RuntimeParameterDeclarationName

export interface CssDeclaration<
  TName extends `--${string}` = ThemeCssDeclarationName,
> {
  readonly name: TName
  readonly value: string
}

export type CssDeclarationList<
  TName extends `--${string}` = ThemeCssDeclarationName,
> = ReadonlyArray<CssDeclaration<TName>>

export interface BridgedThemeTokens {
  readonly themeStaticDeclarations: CssDeclarationList<ThemeStaticDeclarationName>
  readonly darkModeDeclarations: CssDeclarationList<DarkModeDeclarationName>
  readonly runtimeParameterDeclarations: CssDeclarationList<RuntimeParameterDeclarationName>
  readonly keyframes: ReadonlyArray<KeyframeEntry>
}

// =============================================================================
// Family groups
// =============================================================================

/**
 * Per-family token name lists for diagnostics, completeness checks, and family-aware tooling.
 * Keys and member literals are tied to {@link tokenFamilyMembers} via {@link TokenFamilyMember}.
 */
export type ThemeTokenFamilyMap = {
  readonly [K in TokenFamily]: ReadonlyArray<TokenFamilyMember<K>>
}

export type ThemeTokenFamilyName = TokenFamily

// =============================================================================
// Serialization shape
// =============================================================================

export interface SerializedThemeCss {
  readonly themeStaticBlock: string
  readonly darkModeBlock: string
  readonly runtimeParameterBlock: string
  readonly keyframesBlock: string
  readonly combined: string
}
