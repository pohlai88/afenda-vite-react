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

import { defineConstMap } from "../schema/shared"

const componentPolicySchema = z
  .object({
    allowFeatureLevelVariantDefinition: z.boolean(),
    allowFeatureLevelSemanticMaps: z.boolean(),
    requireSemanticMappingForDomainStatuses: z.boolean(),
    requireSharedEmptyStatePattern: z.boolean(),
    requireSharedLoadingStatePattern: z.boolean(),
    requireSingleGovernedPrimitivePerComponentType: z.boolean(),
    requireGovernedComponentsInFeatures: z.boolean(),
    requireTruthMappingFromGovernedSource: z.boolean(),
  })
  .strict()

export const componentPolicy = defineConstMap(
  componentPolicySchema.parse({
    allowFeatureLevelVariantDefinition: false,
    allowFeatureLevelSemanticMaps: false,
    requireSemanticMappingForDomainStatuses: true,
    requireSharedEmptyStatePattern: true,
    requireSharedLoadingStatePattern: true,
    requireSingleGovernedPrimitivePerComponentType: true,
    requireGovernedComponentsInFeatures: true,
    requireTruthMappingFromGovernedSource: true,
  })
)

export type ComponentPolicy = typeof componentPolicy
