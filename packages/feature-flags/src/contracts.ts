export type FeatureTier = "basic" | "pro" | "enterprise"

export type FeatureModule =
  | "HRM"
  | "CRM"
  | "PM"
  | "ExcelAI"
  | "MRP"
  | "OTB"
  | "ACC"
  | "TPM"
  | "AI"
  | "ECOM"
  | "SDK"
  | "INFRA"

export type FeatureDefinition = {
  readonly key: string
  readonly name: string
  readonly description: string
  readonly enabledTiers: readonly FeatureTier[]
  readonly module?: FeatureModule
  readonly isEnabled: boolean
}

export type FeatureGuardResult = {
  readonly allowed: boolean
  readonly error?: string
  readonly upgradeUrl?: string
}

export type TenantFeatureMetadata = {
  readonly admin?: {
    readonly tier?: FeatureTier
    readonly enabledModules?: readonly string[]
    readonly disabledModules?: readonly string[]
  }
  readonly subscriptionTier?: FeatureTier
  readonly enabledModules?: readonly string[]
  readonly disabledModules?: readonly string[]
} & Record<string, unknown>

export type FeatureEvaluationContext = {
  readonly tier?: FeatureTier
  readonly tenantMetadata?: TenantFeatureMetadata
}
