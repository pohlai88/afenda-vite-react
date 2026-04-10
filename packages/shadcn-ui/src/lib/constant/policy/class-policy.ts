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
 *
 * Migration (v2 vocabulary):
 * - New primitive gates (`allowAsChildOutsideUiPackage`, `allowSlotOutsideUiPackage`) align with
 *   Wave 1 ESLint rules; defaults are restrictive (false) outside `packages/shadcn-ui`.
 * - Semantic translation flags default false; pair with `componentPolicy` / shell contracts.
 * - `warnClassNameTokenCount` / `errorClassNameTokenCount` global defaults support scorecard + ESLint;
 *   `scopes` holds optional per-lane overrides (see `resolveClassGovernanceScope` in eslint-config).
 * - `radixPolicy.allowAsChild` governs Radix-level allowance; when false, this policy’s
 *   `allowAsChildOutsideUiPackage` must not be true (enforced in validate-constants).
 */
import { z } from "zod/v4"

import { defineConstMap } from "../schema/shared"

/** Per governance lane overrides; empty object means “use global numeric fields only.” */
const classPolicyScopeHintsSchema = z
  .object({
    maxRecommendedClassNameTokens: z.number().int().min(0).optional(),
    warnClassNameTokenCount: z.number().int().min(0).optional(),
    errorClassNameTokenCount: z.number().int().min(0).optional(),
  })
  .strict()

const classPolicyScopesSchema = z
  .object({
    uiPackage: classPolicyScopeHintsSchema.optional(),
    featureUi: classPolicyScopeHintsSchema.optional(),
    sharedAppUi: classPolicyScopeHintsSchema.optional(),
    appShell: classPolicyScopeHintsSchema.optional(),
    chartInterop: classPolicyScopeHintsSchema.optional(),
    richContent: classPolicyScopeHintsSchema.optional(),
  })
  .strict()

export const classPolicySchema = z
  .object({
    allowRawPaletteClasses: z.boolean(),
    allowArbitraryValuesInFeatures: z.boolean(),
    allowInlineStyleAttributeInProductUi: z.boolean(),
    allowHexRgbHslColorsInProductUi: z.boolean(),
    allowCvaOutsideUiPackage: z.boolean(),
    allowDirectRadixImportOutsideUiPackage: z.boolean(),
    allowDirectTokenUsageInFeatures: z.boolean(),
    /**
     * When false: `asChild` on Radix/shadcn-style components is not allowed outside the governed
     * UI package (`packages/shadcn-ui`). Complements `radixPolicy.allowAsChild`.
     */
    allowAsChildOutsideUiPackage: z.boolean(),
    /**
     * When false: `@radix-ui/react-slot` / `Slot` composition is not allowed outside the governed
     * UI package.
     */
    allowSlotOutsideUiPackage: z.boolean(),
    /**
     * When false: feature code must not define local maps from domain/UI keys to variant names
     * (duplicating design-system variant vocabulary).
     */
    allowFeatureLevelVariantMaps: z.boolean(),
    /**
     * When false: feature code must not map status/state strings to Tailwind class strings locally.
     */
    allowFeatureLevelStatusToClassMapping: z.boolean(),
    /**
     * When false: feature code must not recreate semantic color / tone → class policy locally.
     */
    allowFeatureLevelSemanticColorMapping: z.boolean(),
    /**
     * When false: feature code must not map truth/reconciliation/settlement domain state to badge,
     * alert, or icon variants outside governed adapters.
     */
    allowFeatureLevelTruthToVariantMapping: z.boolean(),
    /** When false: ungoverned `z-[n]` / arbitrary z-index utilities are disallowed in governed UI. */
    allowArbitraryZIndex: z.boolean(),
    /** When false: heavy absolute/fixed/offset layout utilities are flagged in governed UI. */
    allowPositioningUtilities: z.boolean(),
    /** When false: ad hoc `grid-template-*` / template-area overrides are disallowed in features. */
    allowGridTemplateOverrides: z.boolean(),
    /**
     * When false: wrappers may not forward raw `className` without governed composition contracts
     * (semantic/shell slots instead).
     */
    allowClassNamePassThrough: z.boolean(),
    /** When false: deeply nested or overly complex `cn()` composition is disallowed. */
    allowCnComposition: z.boolean(),
    /**
     * Global recommended maximum Tailwind token count in product UI paths (name retains “InFeatures”
     * for historical stability). Same field backs `scopes.*.maxRecommendedClassNameTokens` overrides;
     * see `resolveEffectiveClassPolicyTokenThresholds`.
     */
    maxRecommendedClassNameTokensInFeatures: z.number().int().min(0),
    /** Global warn threshold for class-token count (features/shared UI); scopes may override. */
    warnClassNameTokenCount: z.number().int().min(0),
    /** Global error threshold; must be >= `warnClassNameTokenCount`. */
    errorClassNameTokenCount: z.number().int().min(0),
    /** Optional per-lane numeric overrides; keys align with `resolveClassGovernanceScope`. */
    scopes: classPolicyScopesSchema,
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.errorClassNameTokenCount < v.warnClassNameTokenCount) {
      ctx.addIssue({
        code: "custom",
        message:
          "classPolicy.errorClassNameTokenCount must be >= warnClassNameTokenCount.",
        path: ["errorClassNameTokenCount"],
      })
    }

    const scopeKeys = [
      "uiPackage",
      "featureUi",
      "sharedAppUi",
      "appShell",
      "chartInterop",
      "richContent",
    ] as const

    for (const sk of scopeKeys) {
      const h = v.scopes[sk]
      if (h == null) continue
      const w = h.warnClassNameTokenCount
      const e = h.errorClassNameTokenCount
      if (w != null && e != null && e < w) {
        ctx.addIssue({
          code: "custom",
          message: `classPolicy.scopes.${sk}.errorClassNameTokenCount must be >= warnClassNameTokenCount when both are set.`,
          path: ["scopes", sk, "errorClassNameTokenCount"],
        })
      }
    }
  })

export const classPolicy = defineConstMap(
  classPolicySchema.parse({
    allowRawPaletteClasses: false,
    allowArbitraryValuesInFeatures: false,
    allowInlineStyleAttributeInProductUi: false,
    allowHexRgbHslColorsInProductUi: false,
    allowCvaOutsideUiPackage: false,
    allowDirectRadixImportOutsideUiPackage: false,
    allowDirectTokenUsageInFeatures: false,
    allowAsChildOutsideUiPackage: false,
    allowSlotOutsideUiPackage: false,
    allowFeatureLevelVariantMaps: false,
    allowFeatureLevelStatusToClassMapping: false,
    allowFeatureLevelSemanticColorMapping: false,
    allowFeatureLevelTruthToVariantMapping: false,
    allowArbitraryZIndex: false,
    allowPositioningUtilities: false,
    allowGridTemplateOverrides: false,
    allowClassNamePassThrough: false,
    allowCnComposition: false,
    maxRecommendedClassNameTokensInFeatures: 8,
    warnClassNameTokenCount: 8,
    errorClassNameTokenCount: 14,
    scopes: {},
  })
)

export type ClassPolicy = typeof classPolicy
export type ClassPolicyInput = z.input<typeof classPolicySchema>

export function parseClassPolicy(value: unknown): ClassPolicy {
  return classPolicySchema.parse(value)
}

export function assertClassPolicy(input: unknown): ClassPolicy {
  try {
    return classPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ClassPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseClassPolicy(
  input: unknown
): { success: true; data: ClassPolicy } | { success: false; error: string } {
  const result = classPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isClassPolicy(input: unknown): input is ClassPolicy {
  return classPolicySchema.safeParse(input).success
}

export const ClassPolicyUtils = Object.freeze({
  schema: classPolicySchema,
  assert: assertClassPolicy,
  is: isClassPolicy,
  parse: parseClassPolicy,
  safeParse: safeParseClassPolicy,
  defaults: classPolicy,
})
