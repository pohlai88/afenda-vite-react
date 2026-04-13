import {
  apiClientCapabilityContract,
  apiClientPlatformPolicy,
} from "../policy/api-client-policy"

export interface ApiClientCapabilityReport {
  readonly contract: typeof apiClientCapabilityContract
  readonly requiredFolders: readonly string[]
  readonly featureInternalImportPattern: string
}

export function createApiClientCapabilityReport(): ApiClientCapabilityReport {
  return {
    contract: apiClientCapabilityContract,
    requiredFolders: apiClientPlatformPolicy.allowedPlatformFolders,
    featureInternalImportPattern:
      apiClientPlatformPolicy.featureInternalImportPattern,
  }
}
