/**
 * GOVERNANCE POLICY — class-policy
 * Canonical policy definition for class-string and visual-style drift prevention.
 * Scope: controls which class and style patterns are allowed across governed UI.
 * Authority: policy is reviewed truth; feature code must not override it locally.
 * Severity: downstream lint and AST rules may rely on this policy as configuration truth.
 * Design: rules must stay deterministic, explainable, and actionable.
 * Consumption: CI and drift checks use this file instead of scattered conventions.
 * Changes: adjust policy intentionally and document why rule changes are safe.
 * Constraints: no vague heuristics for critical enforcement paths.
 * Validation: keep policy shape schema-checkable and reviewable.
 * Purpose: keep class-level governance stable, scalable, and enforceable.
 */
import { z } from "zod/v4"

import { defineConstMap } from "../schema/shared"

const classPolicySchema = z
  .object({
    allowRawPaletteClasses: z.boolean(),
    allowArbitraryValuesInFeatures: z.boolean(),
    allowInlineStyleAttributeInProductUi: z.boolean(),
    allowHexRgbHslColorsInProductUi: z.boolean(),
    allowCvaOutsideUiPackage: z.boolean(),
    allowDirectRadixImportOutsideUiPackage: z.boolean(),
    allowDirectTokenUsageInFeatures: z.boolean(),
    maxRecommendedClassNameTokensInFeatures: z.number().int().min(0),
  })
  .strict()

export const classPolicy = defineConstMap(
  classPolicySchema.parse({
    allowRawPaletteClasses: false,
    allowArbitraryValuesInFeatures: false,
    allowInlineStyleAttributeInProductUi: false,
    allowHexRgbHslColorsInProductUi: false,
    allowCvaOutsideUiPackage: false,
    allowDirectRadixImportOutsideUiPackage: false,
    allowDirectTokenUsageInFeatures: false,
    maxRecommendedClassNameTokensInFeatures: 8,
  })
)

export type ClassPolicy = typeof classPolicy
