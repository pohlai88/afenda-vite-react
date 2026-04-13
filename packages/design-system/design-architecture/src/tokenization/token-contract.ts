/**
 * TOKEN CONTRACT
 *
 * Runtime validation contract for the tokenization pipeline.
 *
 * Architecture:
 * - colors are split into primitive and derived mode-aware records
 * - runtime parameters are split from theme-facing token families
 * - keyframes remain structural objects
 *
 * Rules:
 * - derive required keys from `token-constants`
 * - enforce exact record coverage; reject unknown keys
 * - reject partial mode coverage
 * - preserve Tailwind v4 + Figma-friendly family separation
 */

import { z } from 'zod/v4'

import {
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
import type { ThemeTokenSource } from './token-types'

// =============================================================================
// Generic helpers
// =============================================================================

type NonEmptyTuple<T extends string> = readonly [T, ...T[]]

function createExactStringRecordSchema<const T extends NonEmptyTuple<string>>(
  keys: T,
) {
  return z
    .strictObject(
      Object.fromEntries(keys.map((key) => [key, z.string()])) as Record<
        T[number],
        z.ZodString
      >,
    )
    .readonly()
}

function createExactObjectRecordSchema<
  const T extends NonEmptyTuple<string>,
  S extends z.ZodTypeAny,
>(keys: T, valueSchema: S) {
  return z
    .strictObject(
      Object.fromEntries(keys.map((key) => [key, valueSchema])) as Record<
        T[number],
        S
      >,
    )
    .readonly()
}

function createModeRecordSchema<S extends z.ZodTypeAny>(valueSchema: S) {
  return z
    .strictObject(
      Object.fromEntries(
        themeModeValues.map((mode) => [mode, valueSchema]),
      ) as Record<(typeof themeModeValues)[number], S>,
    )
    .readonly()
}

// =============================================================================
// Leaf schemas
// =============================================================================

export const keyframeStepSchema = z.record(z.string(), z.string()).readonly()

export const keyframeBlockSchema = z
  .record(z.string(), keyframeStepSchema)
  .readonly()

// =============================================================================
// Family record schemas
// =============================================================================

export const colorTokenRecordSchema =
  createExactStringRecordSchema(colorTokenValues)

export const radiusTokenRecordSchema =
  createExactStringRecordSchema(radiusTokenValues)

export const containerTokenRecordSchema =
  createExactStringRecordSchema(containerTokenValues)

export const breakpointTokenRecordSchema = createExactStringRecordSchema(
  breakpointTokenValues,
)

export const densityTokenRecordSchema =
  createExactStringRecordSchema(densityTokenValues)

export const controlSizeTokenRecordSchema = createExactStringRecordSchema(
  controlSizeTokenValues,
)

export const componentSpacingTokenRecordSchema = createExactStringRecordSchema(
  componentSpacingTokenValues,
)

export const fontTokenRecordSchema =
  createExactStringRecordSchema(fontTokenValues)

export const textSizeTokenRecordSchema =
  createExactStringRecordSchema(textSizeTokenValues)

export const animationTokenRecordSchema =
  createExactStringRecordSchema(animationTokenValues)

export const keyframeTokenRecordSchema = createExactObjectRecordSchema(
  keyframeTokenValues,
  keyframeBlockSchema,
)

// =============================================================================
// Mode-aware color schemas
// =============================================================================

export const primitiveColorModesSchema = createModeRecordSchema(
  colorTokenRecordSchema,
)

export const derivedColorModesSchema = createModeRecordSchema(
  colorTokenRecordSchema,
)

export const themeColorSourceSchema = z
  .strictObject({
    primitive: primitiveColorModesSchema,
    derived: derivedColorModesSchema,
  })
  .readonly()

// =============================================================================
// Runtime parameter schemas
// =============================================================================

export const themeRuntimeParameterSourceSchema = z
  .strictObject({
    density: densityTokenRecordSchema,
    controlSizes: controlSizeTokenRecordSchema,
    componentSpacing: componentSpacingTokenRecordSchema,
    textSizes: textSizeTokenRecordSchema,
  })
  .readonly()

// =============================================================================
// Root source contract
// =============================================================================

export const themeTokenSourceSchema = z
  .strictObject({
    colors: themeColorSourceSchema,
    radius: radiusTokenRecordSchema,
    containers: containerTokenRecordSchema,
    breakpoints: breakpointTokenRecordSchema,
    fonts: fontTokenRecordSchema,
    runtime: themeRuntimeParameterSourceSchema,
    animations: animationTokenRecordSchema,
    keyframes: keyframeTokenRecordSchema,
  })
  .readonly()

// =============================================================================
// Inferred contract types
// =============================================================================

export type KeyframeStepContract = z.infer<typeof keyframeStepSchema>
export type KeyframeBlockContract = z.infer<typeof keyframeBlockSchema>

export type ColorTokenRecordContract = z.infer<typeof colorTokenRecordSchema>
export type RadiusTokenRecordContract = z.infer<typeof radiusTokenRecordSchema>
export type ContainerTokenRecordContract = z.infer<
  typeof containerTokenRecordSchema
>
export type BreakpointTokenRecordContract = z.infer<
  typeof breakpointTokenRecordSchema
>
export type DensityTokenRecordContract = z.infer<
  typeof densityTokenRecordSchema
>
export type ControlSizeTokenRecordContract = z.infer<
  typeof controlSizeTokenRecordSchema
>
export type ComponentSpacingTokenRecordContract = z.infer<
  typeof componentSpacingTokenRecordSchema
>
export type FontTokenRecordContract = z.infer<typeof fontTokenRecordSchema>
export type TextSizeTokenRecordContract = z.infer<
  typeof textSizeTokenRecordSchema
>
export type AnimationTokenRecordContract = z.infer<
  typeof animationTokenRecordSchema
>
export type KeyframeTokenRecordContract = z.infer<
  typeof keyframeTokenRecordSchema
>

export type PrimitiveColorModesContract = z.infer<
  typeof primitiveColorModesSchema
>
export type DerivedColorModesContract = z.infer<typeof derivedColorModesSchema>
export type ThemeColorSourceContract = z.infer<typeof themeColorSourceSchema>
export type ThemeRuntimeParameterSourceContract = z.infer<
  typeof themeRuntimeParameterSourceSchema
>
export type ThemeTokenSourceContract = z.infer<typeof themeTokenSourceSchema>

// =============================================================================
// Compile-time contract guard
// =============================================================================

type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? (<T>() => T extends Y ? 1 : 2) extends <T>() => T extends X ? 1 : 2
      ? true
      : false
    : false

type Expect<T extends true> = T

/** Compile-time guard: Zod output must match `ThemeTokenSource`. */
export type ThemeTokenSourceContractMatchesThemeTokenSource = Expect<
  Equal<ThemeTokenSource, ThemeTokenSourceContract>
>

// =============================================================================
// Parse entrypoint
// =============================================================================

/**
 * Canonical parser for token-source.ts.
 *
 * Keep one obvious parse boundary for the source stage.
 */
export function parseThemeTokenSource(input: unknown): ThemeTokenSource {
  return themeTokenSourceSchema.parse(input)
}
