/**
 * GOVERNANCE POLICY — style-binding
 * Global token/style binding governance.
 * Scope: declares canonical global token owners, defines whether global style/token
 *   layers are required, prevents feature-level forks of globals.css / index.css
 *   semantics, and ensures components consume governed token outputs instead of
 *   local visual invention.
 * Authority: policy is reviewed truth; product code must not fork global style layers.
 * Consumption: CI, AST checkers, and styling infrastructure read this policy.
 * Changes: adjust style-binding governance deliberately; structural changes require migration planning.
 * Validation: schema-validated shape in validate-constants.
 * Purpose: keep global token/style ownership disciplined, auditable, and centrally governed.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"

export const globalStyleOwnerValues = defineTuple([
  "apps/web/src/index.css",
  "apps/web/src/globals.css",
])

export const globalStyleOwnerSchema = z.enum(globalStyleOwnerValues)
export type GlobalStyleOwner = z.infer<typeof globalStyleOwnerSchema>

const styleBindingPolicySchema = z
  .object({
    primaryGlobalStyleOwner: globalStyleOwnerSchema,

    requireGlobalTokenLayer: z.boolean(),
    requireSemanticColorSlots: z.boolean(),
    requireShellVariableLayer: z.boolean(),
    requireDensityVariableLayer: z.boolean(),

    allowComponentLocalSemanticColorDefinition: z.boolean(),
    allowFeatureLevelGlobalStyleFork: z.boolean(),
    allowFeatureLevelTokenAliasFork: z.boolean(),

    requireComponentsToConsumeTokenOutputs: z.boolean(),
    requireMetadataBoundStylesToUseGlobalLayer: z.boolean(),
  })
  .strict()

export const styleBindingPolicy = defineConstMap(
  styleBindingPolicySchema.parse({
    primaryGlobalStyleOwner: "apps/web/src/index.css",

    requireGlobalTokenLayer: true,
    requireSemanticColorSlots: true,
    requireShellVariableLayer: true,
    requireDensityVariableLayer: true,

    allowComponentLocalSemanticColorDefinition: false,
    allowFeatureLevelGlobalStyleFork: false,
    allowFeatureLevelTokenAliasFork: false,

    requireComponentsToConsumeTokenOutputs: true,
    requireMetadataBoundStylesToUseGlobalLayer: true,
  }),
)

export type StyleBindingPolicy = typeof styleBindingPolicy
