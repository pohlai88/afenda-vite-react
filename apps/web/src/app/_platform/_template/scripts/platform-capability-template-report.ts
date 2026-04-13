import { platformCapabilityPolicy } from "../policy/platform-capability-policy"
import { listPlatformCapabilityContracts } from "../services/platform-capability-service"

export interface PlatformCapabilityTemplateReport {
  readonly contractCount: number
  readonly requiredFolders: readonly string[]
  readonly featureInternalImportPattern: string
  readonly publicImportsOnly: boolean
}

export function createPlatformCapabilityTemplateReport(): PlatformCapabilityTemplateReport {
  const contracts = listPlatformCapabilityContracts()

  return {
    contractCount: contracts.length,
    requiredFolders: platformCapabilityPolicy.allowedPlatformFolders,
    featureInternalImportPattern:
      platformCapabilityPolicy.featureInternalImportPattern,
    publicImportsOnly: contracts.every(
      (contract) => contract.publicImportsOnly
    ),
  }
}
