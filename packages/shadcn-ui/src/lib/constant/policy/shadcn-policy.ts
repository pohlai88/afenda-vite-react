/**
 * GOVERNANCE POLICY — shadcn-policy
 * Canonical governance for shadcn/ui component consumption and structural discipline.
 * Scope: controls wrapper requirements, variant factory placement, CVA ownership, and cn() usage.
 * Authority: policy is reviewed truth; product code must not fork shadcn patterns ad hoc.
 * Severity: downstream AST checks enforce these flags to prevent component drift.
 * Design: prefer wrapped primitives consumed centrally; forbid feature-level reinvention.
 * Consumption: CI, AST checkers, and drift tooling read this instead of local ad hoc conventions.
 * Changes: adjust shadcn governance deliberately; structural changes require migration planning.
 * Constraints: boolean flags must be unambiguous and enforceable without subjective judgment.
 * Validation: schema-validated shape in validate-constants.
 * Purpose: keep shadcn/ui usage disciplined, auditable, and centrally governed.
 *
 * Layering (implicit; boundaries live in the named policies):
 * ownership-policy → path authority · import-policy → modules · radix-policy → primitives ·
 * this file → shadcn wrappers / CVA / cn · react-policy → render/state/effects.
 */
import { z } from "zod/v4"

import { defineConstMap } from "../schema/shared"

export const shadcnPolicySchema = z
  .object({
    /**
     * When true: product and feature code must consume Radix/shadcn primitives only through
     * components maintained under governed UI owner roots (`ownershipPolicy.uiOwnerRoots`), not
     * by importing primitives directly or re-wrapping them ad hoc in features.
     */
    requireWrappedPrimitiveConsumption: z.boolean(),
    /**
     * When true: components under UI owners follow the canonical shadcn/ui shape expected by this
     * repo — `React.forwardRef` (or equivalent) for leaf components, `className` merged via the
     * governed `cn()` helper, props spread onto the root primitive, and consistent file/component
     * conventions. Not a single filesystem layout rule; AST checks map to those concrete patterns.
     */
    requireDefaultShadcnStructure: z.boolean(),
    /**
     * When false: `cva()` / variant factory helpers must not be defined outside governed UI owner
     * paths; pairs with `importPolicy` for CVA import exemptions.
     */
    allowLocalVariantFactoryOutsideUiOwner: z.boolean(),
    /**
     * When false: `class-variance-authority` may not be imported outside UI owners except where
     * `importPolicy.cvaImportAllowedSourcePathPrefixes` explicitly allows.
     */
    allowCvaOutsideUiOwner: z.boolean(),
    /**
     * When true: `cn()` must be imported only from paths allowed by `importPolicy` (e.g.
     * `allowedCnImportPaths` / local exemptions). Feature code must not define alternate `cn`
     * helpers or re-export ad hoc merge utilities for component class composition.
     */
    requireGovernedCnHelper: z.boolean(),
    /**
     * When true: slot-based or compound shadcn-style components exposed from UI owners should
     * carry a `data-slot` (or governed equivalent) on the correct element for styling hooks,
     * testing selectors, and semantic mapping — not necessarily on every leaf component. Exact
     * AST scope follows shell/registry contracts where applicable.
     */
    requireDataSlotAttribute: z.boolean(),
    /**
     * When false: feature code must not maintain local maps from variant keys to Tailwind class
     * strings (e.g. duplicating badge/button variant tables) outside governed UI. Complements
     * `allowLocalVariantFactoryOutsideUiOwner` / CVA ownership and aligns with
     * `componentPolicy.allowFeatureLevelVariantDefinition` for semantic drift control.
     */
    allowFeatureLevelVariantMapping: z.boolean(),
  })
  .strict()

export const shadcnPolicy = defineConstMap(
  shadcnPolicySchema.parse({
    requireWrappedPrimitiveConsumption: true,
    requireDefaultShadcnStructure: true,
    allowLocalVariantFactoryOutsideUiOwner: false,
    allowCvaOutsideUiOwner: false,
    requireGovernedCnHelper: true,
    requireDataSlotAttribute: true,
    allowFeatureLevelVariantMapping: false,
  })
)

export type ShadcnPolicy = typeof shadcnPolicy
export type ShadcnPolicyInput = z.input<typeof shadcnPolicySchema>

export function parseShadcnPolicy(value: unknown): ShadcnPolicy {
  return shadcnPolicySchema.parse(value)
}

export function assertShadcnPolicy(input: unknown): ShadcnPolicy {
  try {
    return shadcnPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShadcnPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShadcnPolicy(
  input: unknown
): { success: true; data: ShadcnPolicy } | { success: false; error: string } {
  const result = shadcnPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShadcnPolicy(input: unknown): input is ShadcnPolicy {
  return shadcnPolicySchema.safeParse(input).success
}

export const ShadcnPolicyUtils = Object.freeze({
  schema: shadcnPolicySchema,
  assert: assertShadcnPolicy,
  is: isShadcnPolicy,
  parse: parseShadcnPolicy,
  safeParse: safeParseShadcnPolicy,
  defaults: shadcnPolicy,
})
