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
 * Constraints: `allowedArbitraryValueFragments` entries are exact substring fragments for scanners
 *   (prefix-like, suffix-like, or full bracket tokens such as `[inherit]`) — not regex patterns.
 * Validation: schema-validated shape in validate-constants.
 * Purpose: keep Tailwind v4 usage aligned with semantic token architecture and prevent visual drift.
 *
 * Utility domain levels (`allowedUtilityDomains`):
 * - `true` — domain utilities are allowed without the constrained string modes below (still subject to
 *   other policy flags such as raw palette bans).
 * - `"token-only"` / `"semantic-only"` — constrained modes for radius, shadows, color, etc.
 * A future vocabulary could replace boolean `true` with an explicit `"allowed"` string; callers
 * should use `UtilityDomainLevel` and `utilityDomainLevelConstrainedModeValues` for the string modes.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple, nonEmptyStringSchema } from "../schema/shared"

const utilityDomainLevelSchema = z.union([
  z.literal(true),
  z.literal("token-only"),
  z.literal("semantic-only"),
])
export type UtilityDomainLevel = z.infer<typeof utilityDomainLevelSchema>

/**
 * String modes for constrained utility domains. Does **not** include boolean `true` (unrestricted
 * within domain); see `UtilityDomainLevel` and `utilityDomainLevelSchema`.
 */
export const utilityDomainLevelConstrainedModeValues = defineTuple([
  "token-only",
  "semantic-only",
])

export const tailwindPolicySchema = z
  .object({
    requireThemeVariables: z.boolean(),
    requireSemanticColorTokens: z.boolean(),
    requireThemeInlineMapping: z.boolean(),
    allowRawPaletteClasses: z.boolean(),
    allowHardcodedHexRgbHslColorsInProductUi: z.boolean(),
    allowArbitraryValuesInFeatures: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
    /**
     * When false: `@apply` is disallowed in product styles so utilities stay visible, reviewable,
     * and governed by utility-domain policy — hidden abstraction layers would bypass token and
     * domain rules.
     */
    allowApplyDirective: z.boolean(),
    /**
     * When false: do not use Tailwind `dark:` variants on semantic color utilities to fork
     * light/dark appearance in feature code. Dark/light mapping is owned by theme / semantic
     * tokens and global CSS — not per-component `dark:text-*` overrides on semantic classes.
     */
    allowDarkVariantForSemanticColors: z.boolean(),
    /**
     * Exact substring fragments that may appear inside arbitrary-value brackets `-[…]` when
     * `allowArbitraryValuesInFeatures` gates are applied. May be prefix-like (`[var(`), suffix-like
     * (`rem]`), or whole-token forms (`[inherit]`); scanners match containment, not “prefix only.”
     */
    allowedArbitraryValueFragments: z.array(nonEmptyStringSchema).min(1).readonly(),
    /**
     * Substring fragments allowed in variant/state selector segments of class names (e.g.
     * `data-[state=open]:…`, `aria-invalid:…`) for governed styling — not a general selector
     * allowlist for arbitrary CSS.
     */
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
export type TailwindPolicyInput = z.input<typeof tailwindPolicySchema>

export function parseTailwindPolicy(value: unknown): TailwindPolicy {
  return tailwindPolicySchema.parse(value)
}

export function assertTailwindPolicy(input: unknown): TailwindPolicy {
  try {
    return tailwindPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid TailwindPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseTailwindPolicy(
  input: unknown
): { success: true; data: TailwindPolicy } | { success: false; error: string } {
  const result = tailwindPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isTailwindPolicy(input: unknown): input is TailwindPolicy {
  return tailwindPolicySchema.safeParse(input).success
}

export const TailwindPolicyUtils = Object.freeze({
  schema: tailwindPolicySchema,
  assert: assertTailwindPolicy,
  is: isTailwindPolicy,
  parse: parseTailwindPolicy,
  safeParse: safeParseTailwindPolicy,
  defaults: tailwindPolicy,
})
