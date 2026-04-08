/**
 * GOVERNANCE POLICY — tailwind-policy
 * Canonical governance for Tailwind CSS v4 usage, token discipline, and anti-drift enforcement.
 * Scope: controls theme variable requirements, raw palette bans, arbitrary value gates, and
 *   utility domain restrictions aligned with the @theme inline / CSS variable architecture.
 * Authority: policy is reviewed truth; product code must not bypass token governance locally.
 * Severity: downstream AST checks and class-string scanners use these flags as hard gates.
 * Design: prefer semantic-only color tokens, token-only radius and shadows, and no raw palette drift.
 * Consumption: CI, AST checkers, class-string drift scanners, and lint tooling read this for truth.
 * Changes: adjust token governance deliberately; new arbitrary-value escape hatches require review.
 * Constraints: allowedArbitraryValueFragments must be exact prefix strings, not regex patterns.
 * Validation: schema-validated shape in validate-constants.
 * Purpose: keep Tailwind v4 usage aligned with semantic token architecture and prevent visual drift.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple, nonEmptyStringSchema } from "../schema/shared"

const utilityDomainLevelSchema = z.union([
  z.literal(true),
  z.literal("token-only"),
  z.literal("semantic-only"),
])
export type UtilityDomainLevel = z.infer<typeof utilityDomainLevelSchema>

const tailwindPolicySchema = z
  .object({
    requireThemeVariables: z.boolean(),
    requireSemanticColorTokens: z.boolean(),
    requireThemeInlineMapping: z.boolean(),
    allowRawPaletteClasses: z.boolean(),
    allowHardcodedHexRgbHslColorsInProductUi: z.boolean(),
    allowArbitraryValuesInFeatures: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
    allowApplyDirective: z.boolean(),
    allowDarkVariantForSemanticColors: z.boolean(),
    allowedArbitraryValueFragments: z.array(nonEmptyStringSchema).min(1).readonly(),
    allowedSelectorFragments: z.array(nonEmptyStringSchema).min(1).readonly(),
    allowedUtilityDomains: z
      .object({
        layout: utilityDomainLevelSchema,
        spacing: utilityDomainLevelSchema,
        typography: utilityDomainLevelSchema,
        motion: utilityDomainLevelSchema,
        borders: utilityDomainLevelSchema,
        radius: utilityDomainLevelSchema,
        shadows: utilityDomainLevelSchema,
        color: utilityDomainLevelSchema,
      })
      .strict(),
  })
  .strict()

export const tailwindPolicy = defineConstMap(
  tailwindPolicySchema.parse({
    requireThemeVariables: true,
    requireSemanticColorTokens: true,
    requireThemeInlineMapping: true,
    allowRawPaletteClasses: false,
    allowHardcodedHexRgbHslColorsInProductUi: false,
    allowArbitraryValuesInFeatures: false,
    allowInlineVisualStyleProps: false,
    allowApplyDirective: false,
    allowDarkVariantForSemanticColors: false,
    allowedArbitraryValueFragments: [
      "[var(",
      "[calc(",
      "[--",
      "[length:",
      "[min(",
      "rem]",
      "px]",
      "[inherit]",
      "[unset]",
      "[initial]",
      "[revert]",
      "[revert-layer]",
      "[currentColor]",
    ],
    allowedSelectorFragments: [
      "data-[state=",
      "data-[side=",
      "data-[disabled",
      "data-[orientation=",
      "data-[slot=",
      "aria-",
    ],
    allowedUtilityDomains: {
      layout: true,
      spacing: true,
      typography: true,
      motion: true,
      borders: true,
      radius: "token-only",
      shadows: "token-only",
      color: "semantic-only",
    },
  })
)

export type TailwindPolicy = typeof tailwindPolicy

export const utilityDomainLevelValues = defineTuple([
  "true",
  "token-only",
  "semantic-only",
])
