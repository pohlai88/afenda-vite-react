/**
 * GOVERNANCE POLICY — component-policy
 * Canonical policy definition for component-level semantic governance.
 * Scope: controls which component behaviors and feature-level patterns are allowed.
 * Authority: policy is reviewed truth; feature code must not override it locally.
 * Severity: downstream lint and AST rules may rely on this policy as configuration truth.
 * Design: rules must stay deterministic, explainable, and actionable.
 * Consumption: CI and drift checks use this file instead of scattered conventions.
 * Changes: adjust policy intentionally and document why rule changes are safe.
 * Constraints: no vague heuristics for critical enforcement paths.
 * Validation: keep policy shape schema-checkable and reviewable.
 * Purpose: keep component-level governance stable, scalable, and enforceable.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple, nonEmptyStringSchema } from "../schema/shared"

export const componentPolicyEnforcementValues = defineTuple([
  "none",
  "phase-2-objective",
  "phase-3-semantic",
])
export const componentPolicyEnforcementSchema = z.enum(
  componentPolicyEnforcementValues
)
export type ComponentPolicyEnforcement = z.infer<
  typeof componentPolicyEnforcementSchema
>

export const componentPolicyScopeValues = defineTuple([
  "feature",
  "shared-component",
  "ui-package",
  "global",
])
export const componentPolicyScopeSchema = z.enum(componentPolicyScopeValues)
export type ComponentPolicyScope = z.infer<typeof componentPolicyScopeSchema>

const componentPolicyFieldSchema = z
  .object({
    allowed: z.boolean(),
    enforcement: componentPolicyEnforcementSchema,
    scope: componentPolicyScopeSchema,
    rationale: nonEmptyStringSchema,
  })
  .strict()

export const componentPolicyContractSchema = z
  .object({
    featureLevelVariantDefinition: componentPolicyFieldSchema,
    featureLevelSemanticMaps: componentPolicyFieldSchema,
    semanticMappingForDomainStatuses: componentPolicyFieldSchema,
    sharedEmptyStatePattern: componentPolicyFieldSchema,
    sharedLoadingStatePattern: componentPolicyFieldSchema,
    singleGovernedPrimitivePerComponentType: componentPolicyFieldSchema,
    governedComponentsInFeatures: componentPolicyFieldSchema,
    governedDomainToUiMapping: componentPolicyFieldSchema,
    noLocalDomainToUiMapping: componentPolicyFieldSchema,
  })
  .strict()

export const componentPolicyContract = defineConstMap(
  componentPolicyContractSchema.parse({
    featureLevelVariantDefinition: {
      allowed: false,
      enforcement: "phase-2-objective",
      scope: "feature",
      rationale:
        "Variants must be defined in the governed UI layer to prevent feature-level drift.",
    },
    featureLevelSemanticMaps: {
      allowed: false,
      enforcement: "phase-3-semantic",
      scope: "feature",
      rationale:
        "Domain-to-UI semantic maps must not be rebuilt in feature code.",
    },
    semanticMappingForDomainStatuses: {
      allowed: true,
      enforcement: "phase-3-semantic",
      scope: "feature",
      rationale:
        "Domain statuses must resolve through governed semantic adapters for consistent UI intent.",
    },
    sharedEmptyStatePattern: {
      allowed: true,
      enforcement: "phase-2-objective",
      scope: "feature",
      rationale:
        "Empty states should use shared governed patterns to preserve UX consistency.",
    },
    sharedLoadingStatePattern: {
      allowed: true,
      enforcement: "phase-2-objective",
      scope: "feature",
      rationale:
        "Loading states should use shared governed patterns to avoid local spinner/skeleton drift.",
    },
    singleGovernedPrimitivePerComponentType: {
      allowed: true,
      enforcement: "phase-2-objective",
      scope: "ui-package",
      rationale:
        "Each component type must resolve to one canonical primitive owner in the UI package.",
    },
    governedComponentsInFeatures: {
      allowed: true,
      enforcement: "phase-2-objective",
      scope: "feature",
      rationale:
        "Feature code composes governed components instead of bypassing primitive boundaries.",
    },
    governedDomainToUiMapping: {
      allowed: true,
      enforcement: "phase-2-objective",
      scope: "feature",
      rationale:
        "Domain-to-UI mapping must come from governed constants/adapters, not local feature shims.",
    },
    noLocalDomainToUiMapping: {
      allowed: false,
      enforcement: "phase-3-semantic",
      scope: "feature",
      rationale:
        "Disallow ad-hoc domain-to-UI translation in features; use governed semantic adapters.",
    },
  })
)

export const componentPolicySchema = z
  .object({
    allowFeatureLevelVariantDefinition: z.boolean(),
    allowFeatureLevelSemanticMaps: z.boolean(),
    requireSemanticMappingForDomainStatuses: z.boolean(),
    requireSharedEmptyStatePattern: z.boolean(),
    requireSharedLoadingStatePattern: z.boolean(),
    requireSingleGovernedPrimitivePerComponentType: z.boolean(),
    requireGovernedComponentsInFeatures: z.boolean(),
    requireGovernedDomainToUiMapping: z.boolean(),
  })
  .strict()

export const componentPolicy = defineConstMap(
  componentPolicySchema.parse({
    allowFeatureLevelVariantDefinition:
      componentPolicyContract.featureLevelVariantDefinition.allowed,
    allowFeatureLevelSemanticMaps:
      componentPolicyContract.featureLevelSemanticMaps.allowed,
    requireSemanticMappingForDomainStatuses:
      componentPolicyContract.semanticMappingForDomainStatuses.allowed,
    requireSharedEmptyStatePattern:
      componentPolicyContract.sharedEmptyStatePattern.allowed,
    requireSharedLoadingStatePattern:
      componentPolicyContract.sharedLoadingStatePattern.allowed,
    requireSingleGovernedPrimitivePerComponentType:
      componentPolicyContract.singleGovernedPrimitivePerComponentType.allowed,
    requireGovernedComponentsInFeatures:
      componentPolicyContract.governedComponentsInFeatures.allowed,
    requireGovernedDomainToUiMapping:
      componentPolicyContract.governedDomainToUiMapping.allowed,
  })
)

export type ComponentPolicy = typeof componentPolicy
export type ComponentPolicyContract = typeof componentPolicyContract
export type ComponentPolicyInput = z.input<typeof componentPolicySchema>

export function parseComponentPolicy(value: unknown): ComponentPolicy {
  return componentPolicySchema.parse(value)
}

export function assertComponentPolicy(input: unknown): ComponentPolicy {
  try {
    return componentPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ComponentPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseComponentPolicy(
  input: unknown
): { success: true; data: ComponentPolicy } | { success: false; error: string } {
  const result = componentPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isComponentPolicy(input: unknown): input is ComponentPolicy {
  return componentPolicySchema.safeParse(input).success
}

export const ComponentPolicyUtils = Object.freeze({
  schema: componentPolicySchema,
  assert: assertComponentPolicy,
  is: isComponentPolicy,
  parse: parseComponentPolicy,
  safeParse: safeParseComponentPolicy,
  defaults: componentPolicy,
})
