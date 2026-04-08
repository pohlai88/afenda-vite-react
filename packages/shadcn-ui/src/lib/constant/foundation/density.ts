/**
 * SEMANTIC SYSTEM — density
 * Canonical governed system for density semantics and coordinated layout tokens.
 * Tier: Tier 2: governed system.
 * Authoring: tuple -> union -> typed definitions -> `as const satisfies`.
 * Runtime: exported Zod schemas are for boundary parsing or validation, not primary authoring.
 * Tokens: values must come from governed token vocabularies; no free-form strings.
 * Consumption: use `getDensityDefinition()` and exported defaults, not inline semantic literals.
 * Defaults: use `DEFAULT_DENSITY`; avoid scattered magic literals.
 * Changes: update this file first, then validate dependents and CI.
 * Purpose: prevent density drift and keep spacing behavior deterministic and reviewable.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"

export const densityValues = defineTuple(["compact", "default", "comfortable"])
export const densitySchema = z.enum(densityValues)
export type Density = (typeof densityValues)[number]

export const DEFAULT_DENSITY: Density = "default"

export const densityHeightTokenValues = defineTuple(["h-8", "h-9", "h-10"])
export const densityPaddingXTokenValues = defineTuple([
  "px-2.5",
  "px-3",
  "px-4",
])
export const densityPaddingYTokenValues = defineTuple([
  "py-1.5",
  "py-2",
  "py-2.5",
])
export const densityGapTokenValues = defineTuple(["gap-2", "gap-3", "gap-4"])
export const densityFontSizeTokenValues = defineTuple(["text-sm", "text-base"])
export const densityIconSizeTokenValues = defineTuple(["size-4", "size-5"])

export const densityHeightTokenSchema = z.enum(densityHeightTokenValues)
export const densityPaddingXTokenSchema = z.enum(densityPaddingXTokenValues)
export const densityPaddingYTokenSchema = z.enum(densityPaddingYTokenValues)
export const densityGapTokenSchema = z.enum(densityGapTokenValues)
export const densityFontSizeTokenSchema = z.enum(densityFontSizeTokenValues)
export const densityIconSizeTokenSchema = z.enum(densityIconSizeTokenValues)

export type DensityHeightToken = (typeof densityHeightTokenValues)[number]
export type DensityPaddingXToken = (typeof densityPaddingXTokenValues)[number]
export type DensityPaddingYToken = (typeof densityPaddingYTokenValues)[number]
export type DensityGapToken = (typeof densityGapTokenValues)[number]
export type DensityFontSizeToken = (typeof densityFontSizeTokenValues)[number]
export type DensityIconSizeToken = (typeof densityIconSizeTokenValues)[number]

export type DensityDefinition = {
  controlHeight: DensityHeightToken
  inputPaddingX: DensityPaddingXToken
  inputPaddingY: DensityPaddingYToken
  gap: DensityGapToken
  fontSize: DensityFontSizeToken
  iconSize: DensityIconSizeToken
}

export const densityDefinitionSchema = z
  .object({
    controlHeight: densityHeightTokenSchema,
    inputPaddingX: densityPaddingXTokenSchema,
    inputPaddingY: densityPaddingYTokenSchema,
    gap: densityGapTokenSchema,
    fontSize: densityFontSizeTokenSchema,
    iconSize: densityIconSizeTokenSchema,
  })
  .strict()

export const densityDefinitionsSchema = z.record(
  densitySchema,
  densityDefinitionSchema
)

const densityDefinitionsDefinition = {
  compact: {
    controlHeight: "h-8",
    inputPaddingX: "px-2.5",
    inputPaddingY: "py-1.5",
    gap: "gap-2",
    fontSize: "text-sm",
    iconSize: "size-4",
  },
  default: {
    controlHeight: "h-9",
    inputPaddingX: "px-3",
    inputPaddingY: "py-2",
    gap: "gap-3",
    fontSize: "text-sm",
    iconSize: "size-4",
  },
  comfortable: {
    controlHeight: "h-10",
    inputPaddingX: "px-4",
    inputPaddingY: "py-2.5",
    gap: "gap-4",
    fontSize: "text-base",
    iconSize: "size-5",
  },
} as const satisfies Record<Density, DensityDefinition>

export const densityDefinitions = defineConstMap(
  densityDefinitionsSchema.parse(densityDefinitionsDefinition)
)

export function getDensityDefinition(density: Density): DensityDefinition {
  return densityDefinitions[density]
}

const fieldGapTokenValues = defineTuple(["gap-1.5", "gap-2", "gap-2.5"])
const panelSectionSpacingTokenValues = defineTuple([
  "px-4 py-3",
  "px-4 py-3.5",
  "px-5 py-4",
])

const fieldGapTokenSchema = z.enum(fieldGapTokenValues)
const panelSectionSpacingTokenSchema = z.enum(panelSectionSpacingTokenValues)

type FieldGapToken = (typeof fieldGapTokenValues)[number]
type PanelSectionSpacingToken = (typeof panelSectionSpacingTokenValues)[number]

const fieldGapClassMapSchema = z.record(densitySchema, fieldGapTokenSchema)
const panelSectionSpacingClassMapSchema = z.record(
  densitySchema,
  panelSectionSpacingTokenSchema
)

const fieldGapClassMapDefinition = {
  compact: "gap-1.5",
  default: "gap-2",
  comfortable: "gap-2.5",
} as const satisfies Record<Density, FieldGapToken>

const panelSectionSpacingClassMapDefinition = {
  compact: "px-4 py-3",
  default: "px-4 py-3.5",
  comfortable: "px-5 py-4",
} as const satisfies Record<Density, PanelSectionSpacingToken>

export const fieldGapClassMap = defineConstMap(
  fieldGapClassMapSchema.parse(fieldGapClassMapDefinition)
)

export const panelSectionSpacingClassMap = defineConstMap(
  panelSectionSpacingClassMapSchema.parse(panelSectionSpacingClassMapDefinition)
)

export function getDensityGapClass(density: Density): DensityGapToken {
  return densityDefinitions[density].gap
}

export function getFieldGapClass(density: Density): FieldGapToken {
  return fieldGapClassMap[density]
}

export function getPanelSectionSpacingClass(
  density: Density
): PanelSectionSpacingToken {
  return panelSectionSpacingClassMap[density]
}
