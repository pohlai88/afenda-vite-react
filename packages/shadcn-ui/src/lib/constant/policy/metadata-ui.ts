/**
 * GOVERNANCE POLICY — metadata-ui
 * Metadata-driven UI governance.
 * Scope: defines whether UI semantics may be driven by shell/domain/truth metadata,
 *   governs whether metadata can influence tone, density, state, and status rendering,
 *   and prevents feature code from inventing local metadata→style mappings.
 * Authority: policy is reviewed truth; product code must not fork metadata-to-UI bindings.
 * Consumption: CI, AST checkers, and semantic components read this policy.
 * Changes: adjust metadata governance deliberately; structural changes require migration planning.
 * Validation: schema-validated shape in validate-constants.
 * Purpose: keep metadata-to-UI binding disciplined, auditable, and centrally governed.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"

export const metadataSemanticSourceValues = defineTuple([
  "none",
  "shell",
  "domain",
  "truth",
  "shell-and-domain",
])

export const metadataSemanticSourceSchema = z.enum(metadataSemanticSourceValues)
export type MetadataSemanticSource = z.infer<
  typeof metadataSemanticSourceSchema
>

export const styleBindingModeValues = defineTuple([
  "none",
  "token",
  "semantic-token",
])

export const styleBindingModeSchema = z.enum(styleBindingModeValues)
export type StyleBindingMode = z.infer<typeof styleBindingModeSchema>

const metadataUiPolicySchema = z
  .object({
    defaultSemanticSource: metadataSemanticSourceSchema,
    defaultStyleBindingMode: styleBindingModeSchema,

    allowDomainToUiSemanticMapping: z.boolean(),
    allowTruthToUiSemanticMapping: z.boolean(),
    allowShellToUiDensityMapping: z.boolean(),
    allowShellToUiPriorityMapping: z.boolean(),

    allowFeatureLevelMetadataToStyleFork: z.boolean(),
    allowFeatureLevelDomainToneMap: z.boolean(),

    requireSemanticTokenBinding: z.boolean(),
    requireMetadataMappingToUseGovernedLayer: z.boolean(),
  })
  .strict()

export const metadataUiPolicy = defineConstMap(
  metadataUiPolicySchema.parse({
    defaultSemanticSource: "shell-and-domain",
    defaultStyleBindingMode: "semantic-token",

    allowDomainToUiSemanticMapping: true,
    allowTruthToUiSemanticMapping: true,
    allowShellToUiDensityMapping: true,
    allowShellToUiPriorityMapping: true,

    allowFeatureLevelMetadataToStyleFork: false,
    allowFeatureLevelDomainToneMap: false,

    requireSemanticTokenBinding: true,
    requireMetadataMappingToUseGovernedLayer: true,
  }),
)

export type MetadataUiPolicy = typeof metadataUiPolicy
