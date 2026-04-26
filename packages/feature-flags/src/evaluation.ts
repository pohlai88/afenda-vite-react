import type {
  FeatureDefinition,
  FeatureEvaluationContext,
  FeatureGuardResult,
  FeatureTier,
  TenantFeatureMetadata,
} from "./contracts"
import { FEATURE_REGISTRY, featureDefinitions } from "./catalog"
import { FeatureFlagError } from "./feature-flag-error"

const tierLevels: Record<FeatureTier, number> = {
  basic: 0,
  pro: 1,
  enterprise: 2,
}

function asStringArray(value: unknown): readonly string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : []
}

function isFeatureTier(value: unknown): value is FeatureTier {
  return value === "basic" || value === "pro" || value === "enterprise"
}

export function getFeatureDefinition(
  featureKey: string
): FeatureDefinition | undefined {
  return FEATURE_REGISTRY.get(featureKey)
}

export function resolveTierFromTenantMetadata(
  tenantMetadata?: TenantFeatureMetadata
): FeatureTier | undefined {
  const adminTier = tenantMetadata?.admin?.tier
  if (isFeatureTier(adminTier)) {
    return adminTier
  }

  const subscriptionTier = tenantMetadata?.subscriptionTier
  if (isFeatureTier(subscriptionTier)) {
    return subscriptionTier
  }

  return undefined
}

export function resolveEnabledModules(
  tenantMetadata?: TenantFeatureMetadata
): readonly string[] {
  const adminEnabled = asStringArray(tenantMetadata?.admin?.enabledModules)
  if (adminEnabled.length > 0) {
    return adminEnabled
  }

  return asStringArray(tenantMetadata?.enabledModules)
}

export function resolveDisabledModules(
  tenantMetadata?: TenantFeatureMetadata
): readonly string[] {
  const adminDisabled = asStringArray(tenantMetadata?.admin?.disabledModules)
  if (adminDisabled.length > 0) {
    return adminDisabled
  }

  return asStringArray(tenantMetadata?.disabledModules)
}

export function resolveFeatureTier(
  contextOrTier: FeatureEvaluationContext | FeatureTier
): FeatureTier {
  if (typeof contextOrTier === "string") {
    return contextOrTier
  }

  return (
    contextOrTier.tier ??
    resolveTierFromTenantMetadata(contextOrTier.tenantMetadata) ??
    "basic"
  )
}

export function isFeatureEnabled(
  featureKey: string,
  contextOrTier: FeatureEvaluationContext | FeatureTier
): boolean {
  const feature = FEATURE_REGISTRY.get(featureKey)
  if (!feature || !feature.isEnabled) {
    return false
  }

  const tier = resolveFeatureTier(contextOrTier)
  const tenantMetadata =
    typeof contextOrTier === "string" ? undefined : contextOrTier.tenantMetadata

  const enabledModules = resolveEnabledModules(tenantMetadata)
  if (enabledModules.length > 0) {
    return enabledModules.includes(featureKey)
  }

  const disabledModules = resolveDisabledModules(tenantMetadata)
  if (disabledModules.includes(featureKey)) {
    return false
  }

  return feature.enabledTiers.includes(tier)
}

export function requireTier(
  requiredTier: FeatureTier,
  currentTierOrContext: FeatureEvaluationContext | FeatureTier
): void {
  const currentTier = resolveFeatureTier(currentTierOrContext)
  if (tierLevels[currentTier] < tierLevels[requiredTier]) {
    throw new FeatureFlagError(
      `Feature requires ${requiredTier.toUpperCase()} tier. Current tier: ${currentTier.toUpperCase()}.`,
      requiredTier,
      currentTier
    )
  }
}

export function requireFeature(
  featureKey: string,
  currentTierOrContext: FeatureEvaluationContext | FeatureTier
): void {
  if (isFeatureEnabled(featureKey, currentTierOrContext)) {
    return
  }

  const feature = FEATURE_REGISTRY.get(featureKey)
  const currentTier = resolveFeatureTier(currentTierOrContext)
  const requiredTier = feature?.enabledTiers[0] ?? "enterprise"

  throw new FeatureFlagError(
    `Feature "${feature?.name ?? featureKey}" requires ${requiredTier.toUpperCase()} tier.`,
    requiredTier,
    currentTier
  )
}

export function getFeaturesForTier(tier: FeatureTier): FeatureDefinition[] {
  return featureDefinitions.filter((feature) => {
    return feature.isEnabled && feature.enabledTiers.includes(tier)
  })
}

export function getFeaturesByTier(): Record<FeatureTier, FeatureDefinition[]> {
  return {
    basic: featureDefinitions.filter((feature) =>
      feature.enabledTiers.includes("basic")
    ),
    pro: featureDefinitions.filter((feature) => {
      return (
        feature.enabledTiers.includes("pro") &&
        !feature.enabledTiers.includes("basic")
      )
    }),
    enterprise: featureDefinitions.filter((feature) => {
      return feature.enabledTiers[0] === "enterprise"
    }),
  }
}

export function isModuleAccessible(
  moduleName: string,
  contextOrTier: FeatureEvaluationContext | FeatureTier
): boolean {
  return featureDefinitions
    .filter((feature) => feature.module === moduleName)
    .some((feature) => isFeatureEnabled(feature.key, contextOrTier))
}

export function createFeatureGuard(
  featureKey: string,
  options: { readonly upgradeUrl?: string } = {}
) {
  return (
    contextOrTier: FeatureEvaluationContext | FeatureTier
  ): FeatureGuardResult => {
    if (isFeatureEnabled(featureKey, contextOrTier)) {
      return { allowed: true }
    }

    const feature = FEATURE_REGISTRY.get(featureKey)
    return {
      allowed: false,
      error: `Feature "${feature?.name ?? featureKey}" requires an upgraded plan.`,
      upgradeUrl: options.upgradeUrl ?? "/settings/billing?upgrade=true",
    }
  }
}
