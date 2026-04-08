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
 */
import { z } from "zod/v4"

import { defineConstMap } from "../schema/shared"

const shadcnPolicySchema = z
  .object({
    requireWrappedPrimitiveConsumption: z.boolean(),
    requireDefaultShadcnStructure: z.boolean(),
    allowLocalVariantFactoryOutsideUiOwner: z.boolean(),
    allowCvaOutsideUiOwner: z.boolean(),
    requireGovernedCnHelper: z.boolean(),
    requireDataSlotAttribute: z.boolean(),
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
  })
)

export type ShadcnPolicy = typeof shadcnPolicy
