import { apiCapabilityContract, apiPlatformPolicy } from "../policy/api-policy"

export interface ApiCapabilityReport {
  readonly contract: typeof apiCapabilityContract
  readonly requiredFolders: readonly string[]
  readonly featureInternalImportPattern: string
}

export function createApiCapabilityReport(): ApiCapabilityReport {
  return {
    contract: apiCapabilityContract,
    requiredFolders: apiPlatformPolicy.allowedPlatformFolders,
    featureInternalImportPattern:
      apiPlatformPolicy.featureInternalImportPattern,
  }
}
