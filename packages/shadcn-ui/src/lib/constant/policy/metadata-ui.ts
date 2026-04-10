/**
 * GOVERNANCE POLICY — metadata-ui
 * Metadata-driven UI governance.
 * Scope: defines which governed metadata sources may influence UI semantics,
 *   style binding, visibility, affordance, severity, evidence presentation,
 *   remediation UI, interaction mode, layout mode, action availability,
 *   and disclosure mode.
 * Authority: policy is reviewed truth; product code must not fork metadata-to-UI bindings.
 * Consumption: CI, AST checkers, semantic adapters, shell metadata providers,
 *   and semantic components read this policy.
 * Changes: adjust metadata governance deliberately; structural changes require migration planning.
 * Validation: Zod schema + superRefine in this module; validate-constants repeats checks at the aggregate boundary.
 * Purpose: keep metadata-to-UI binding disciplined, auditable, and centrally governed.
 */
import { z } from "zod/v4"

import {
  defineConstMap,
  defineTuple,
} from "../schema/shared"

function hasDuplicateSemanticSources(values: readonly string[]): boolean {
  return new Set(values).size !== values.length
}

export const metadataSemanticSourceValues = defineTuple(["shell", "domain"])

export const metadataSemanticSourceSchema = z.enum(metadataSemanticSourceValues)
export type MetadataSemanticSource = z.infer<
  typeof metadataSemanticSourceSchema
>

export const metadataSemanticSourceSetSchema = z
  .array(metadataSemanticSourceSchema)
  .min(1)
  .readonly()

/**
 * `"none"` remains available for migration or explicitly non-semantic UI paths; if nothing
 * needs it long term, prefer tightening policy by removing it from this tuple.
 */
export const styleBindingModeValues = defineTuple([
  "none",
  "token",
  "semantic-token",
])

export const styleBindingModeSchema = z.enum(styleBindingModeValues)
export type StyleBindingMode = z.infer<typeof styleBindingModeSchema>

export const metadataUiPolicySchema = z
  .object({
    /**
     * Canonical source envelope for metadata-driven UI semantics (set-like: no duplicates).
     * Defines which metadata sources are permitted repo-wide.
     */
    allowedSemanticSources: metadataSemanticSourceSetSchema,

    /**
     * Repo baseline semantic envelope when consumers do not narrow further (set-like: no duplicates).
     * This is the intentional default “semantic window” for the repo, not merely a non-empty list that
     * passes validation. Must be a subset of `allowedSemanticSources`.
     */
    defaultSemanticSources: metadataSemanticSourceSetSchema,

    /**
     * Default style-binding discipline for metadata-driven rendering.
     */
    defaultStyleBindingMode: styleBindingModeSchema,

    /**
     * **Compatibility fields (transitional):** Phase 1 source-specific toggles for rollout.
     * They are not the canonical long-term direction—prefer `allowMetadataDriven*` plus
     * `allowedSemanticSources` / `defaultSemanticSources`. Treat as review-only until migrated;
     * plan manifest lifecycle (e.g. deprecated) rather than expanding new semantics on these four.
     */
    allowDomainToUiSemanticMapping: z.boolean(),
    allowInvariantToUiSemanticMapping: z.boolean(),
    allowShellToUiDensityMapping: z.boolean(),
    allowShellToUiPriorityMapping: z.boolean(),

    /**
     * Source-agnostic metadata-driven UI surface.
     * These govern what metadata may influence at the rendered UI boundary.
     */
    allowMetadataDrivenVisibility: z.boolean(),
    allowMetadataDrivenAffordance: z.boolean(),
    allowMetadataDrivenSeverity: z.boolean(),
    allowMetadataDrivenEvidencePresentation: z.boolean(),
    allowMetadataDrivenRemediationUi: z.boolean(),
    allowMetadataDrivenInteractionMode: z.boolean(),
    allowMetadataDrivenLayoutMode: z.boolean(),
    allowMetadataDrivenActionAvailability: z.boolean(),
    allowMetadataDrivenDisclosureMode: z.boolean(),

    /**
     * Feature-level anti-drift controls.
     */
    allowFeatureLevelMetadataToStyleFork: z.boolean(),
    allowFeatureLevelDomainToneMap: z.boolean(),
    allowInlineMetadataToTokenMappingInFeatures: z.boolean(),

    /**
     * Metadata-to-UI pipeline controls.
     */
    requireSemanticTokenBinding: z.boolean(),

    /**
     * Governed layer means one of the approved metadata-to-UI control surfaces:
     * (1) semantic adapter functions in the constant/policy layer,
     * (2) constant registries and mappings in packages/shadcn-ui/src/lib/constant/,
     * (3) governed component contracts,
     * (4) shell-level metadata providers.
     * Raw metadata must not jump directly to token, class, tone, or style decisions
     * without passing through one of these governed layers.
     */
    requireMetadataMappingToUseGovernedLayer: z.boolean(),

    /**
     * Raw metadata must be normalized before rendering decisions are made.
     */
    requireMetadataNormalizationBeforeRendering: z.boolean(),

    /**
     * When metadata from different semantic domains is combined,
     * the binding must pass through a governed adapter boundary.
     */
    requireMetadataAdaptersForCrossDomainBindings: z.boolean(),
  })
  .strict()
  .superRefine((policy, ctx) => {
    if (hasDuplicateSemanticSources(policy.allowedSemanticSources)) {
      ctx.addIssue({
        code: "custom",
        message:
          "allowedSemanticSources must not contain duplicate entries (govern as a set, not a bag)",
        path: ["allowedSemanticSources"],
      })
    }

    if (hasDuplicateSemanticSources(policy.defaultSemanticSources)) {
      ctx.addIssue({
        code: "custom",
        message:
          "defaultSemanticSources must not contain duplicate entries (govern as a set, not a bag)",
        path: ["defaultSemanticSources"],
      })
    }

    const allowedSources = new Set(policy.allowedSemanticSources)

    for (const source of policy.defaultSemanticSources) {
      if (!allowedSources.has(source)) {
        ctx.addIssue({
          code: "custom",
          message: `defaultSemanticSources contains "${source}" which is not present in allowedSemanticSources`,
          path: ["defaultSemanticSources"],
        })
      }
    }

    if (
      policy.requireMetadataNormalizationBeforeRendering &&
      !policy.requireMetadataMappingToUseGovernedLayer
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "requireMetadataNormalizationBeforeRendering cannot be true when requireMetadataMappingToUseGovernedLayer is false",
        path: ["requireMetadataNormalizationBeforeRendering"],
      })
    }

    if (
      policy.requireMetadataAdaptersForCrossDomainBindings &&
      !policy.requireMetadataMappingToUseGovernedLayer
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "requireMetadataAdaptersForCrossDomainBindings cannot be true when requireMetadataMappingToUseGovernedLayer is false",
        path: ["requireMetadataAdaptersForCrossDomainBindings"],
      })
    }

    if (
      policy.requireMetadataAdaptersForCrossDomainBindings &&
      !policy.requireMetadataNormalizationBeforeRendering
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "requireMetadataAdaptersForCrossDomainBindings cannot be true when requireMetadataNormalizationBeforeRendering is false",
        path: ["requireMetadataAdaptersForCrossDomainBindings"],
      })
    }

    if (
      policy.requireSemanticTokenBinding &&
      policy.defaultStyleBindingMode === "none"
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          'defaultStyleBindingMode cannot be "none" when requireSemanticTokenBinding is true',
        path: ["defaultStyleBindingMode"],
      })
    }

    if (
      policy.allowInlineMetadataToTokenMappingInFeatures &&
      policy.requireMetadataMappingToUseGovernedLayer
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "allowInlineMetadataToTokenMappingInFeatures cannot be true when requireMetadataMappingToUseGovernedLayer is true",
        path: ["allowInlineMetadataToTokenMappingInFeatures"],
      })
    }
  })

export const metadataUiPolicy = defineConstMap(
  metadataUiPolicySchema.parse({
    allowedSemanticSources: ["shell", "domain"],
    defaultSemanticSources: ["shell", "domain"],

    defaultStyleBindingMode: "semantic-token",

    // Phase 1 compatibility flags (transitional; see schema comments)
    allowDomainToUiSemanticMapping: true,
    allowInvariantToUiSemanticMapping: true,
    allowShellToUiDensityMapping: true,
    allowShellToUiPriorityMapping: true,

    // Metadata-driven UI surface
    allowMetadataDrivenVisibility: true,
    allowMetadataDrivenAffordance: true,
    allowMetadataDrivenSeverity: true,
    allowMetadataDrivenEvidencePresentation: true,
    allowMetadataDrivenRemediationUi: true,
    allowMetadataDrivenInteractionMode: true,
    allowMetadataDrivenLayoutMode: true,
    allowMetadataDrivenActionAvailability: true,
    allowMetadataDrivenDisclosureMode: true,

    // Anti-drift controls
    allowFeatureLevelMetadataToStyleFork: false,
    allowFeatureLevelDomainToneMap: false,
    allowInlineMetadataToTokenMappingInFeatures: false,

    // Pipeline controls
    requireSemanticTokenBinding: true,
    requireMetadataMappingToUseGovernedLayer: true,
    requireMetadataNormalizationBeforeRendering: true,
    requireMetadataAdaptersForCrossDomainBindings: true,
  }),
)

export type MetadataUiPolicy = typeof metadataUiPolicy
export type MetadataUiPolicyInput = z.input<typeof metadataUiPolicySchema>

export function parseMetadataUiPolicy(value: unknown): MetadataUiPolicy {
  return metadataUiPolicySchema.parse(value)
}

export function assertMetadataUiPolicy(input: unknown): MetadataUiPolicy {
  try {
    return metadataUiPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid MetadataUiPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseMetadataUiPolicy(
  input: unknown
): { success: true; data: MetadataUiPolicy } | { success: false; error: string } {
  const result = metadataUiPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isMetadataUiPolicy(input: unknown): input is MetadataUiPolicy {
  return metadataUiPolicySchema.safeParse(input).success
}

export const MetadataUiPolicyUtils = Object.freeze({
  schema: metadataUiPolicySchema,
  assert: assertMetadataUiPolicy,
  is: isMetadataUiPolicy,
  parse: parseMetadataUiPolicy,
  safeParse: safeParseMetadataUiPolicy,
  defaults: metadataUiPolicy,
})
