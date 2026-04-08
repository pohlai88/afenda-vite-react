/**
 * SEMANTIC SYSTEM — typography
 * Canonical governed system for text-style semantics and typography doctrine.
 * Tier: Tier 2: governed system.
 * Authoring: tuple -> union -> typed maps and policy -> `as const satisfies`.
 * Runtime: exported Zod enums support boundary reuse, not primary authoring.
 * Policy: this file restricts feature-level typography factories and raw utility drift.
 * Consumption: use `getTextStyleClass()` and exported defaults; do not recreate styles inline.
 * Tone: a text style may include inseparable presentation tone when the reviewed style requires it.
 * Changes: update here first, then validate dependent usage and CI expectations.
 * Purpose: prevent typography drift and keep text behavior deterministic and reviewable.
 */
import { z } from "zod/v4"

import {
  booleanFlagSchema,
  classNameSchema,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const textStyleValues = defineTuple([
  "display",
  "h1",
  "h2",
  "h3",
  "title",
  "body",
  "body-sm",
  "label",
  "caption",
  "mono",
])
export const textStyleSchema = z.enum(textStyleValues)
export type TextStyle = (typeof textStyleValues)[number]

export const DEFAULT_TEXT_STYLE: TextStyle = "body"

export const textStyleClassMapSchema = z.record(
  textStyleSchema,
  classNameSchema
)

const textStyleClassMapDefinition = {
  display: "text-4xl font-semibold tracking-tight",
  h1: "text-3xl font-semibold tracking-tight",
  h2: "text-2xl font-semibold tracking-tight",
  h3: "text-xl font-semibold tracking-tight",
  title: "text-lg font-medium tracking-tight",
  body: "text-base leading-6",
  "body-sm": "text-sm leading-5",
  label: "text-sm font-medium leading-none",
  caption: "text-xs text-muted-foreground leading-4",
  mono: "font-mono text-xs",
} as const satisfies Record<TextStyle, string>

export const textStyleClassMap = defineConstMap(
  textStyleClassMapSchema.parse(textStyleClassMapDefinition)
)

export type TypographyPolicy = {
  allowFeatureLevelTypographyClassFactories: boolean
  allowRawFontSizeUtilitiesInFeatures: boolean
  allowRawTrackingUtilitiesInFeatures: boolean
}

export const typographyPolicySchema = z
  .object({
    allowFeatureLevelTypographyClassFactories: booleanFlagSchema,
    allowRawFontSizeUtilitiesInFeatures: booleanFlagSchema,
    allowRawTrackingUtilitiesInFeatures: booleanFlagSchema,
  })
  .strict()

const typographyPolicyDefinition = {
  allowFeatureLevelTypographyClassFactories: false,
  allowRawFontSizeUtilitiesInFeatures: false,
  allowRawTrackingUtilitiesInFeatures: false,
} as const satisfies TypographyPolicy

export const typographyPolicy = defineConstMap(
  typographyPolicySchema.parse(typographyPolicyDefinition)
)

export function getTextStyleClass(textStyle: TextStyle): string {
  return textStyleClassMap[textStyle]
}
