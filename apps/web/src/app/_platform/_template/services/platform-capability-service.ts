import { platformCapabilityTemplateContract } from "../policy/platform-capability-policy"
import type {
  PlatformCapabilityContract,
  PlatformCapabilityId,
} from "../types/platform-capability"

const platformCapabilityContracts = [
  platformCapabilityTemplateContract,
] as const satisfies readonly PlatformCapabilityContract[]

export function listPlatformCapabilityContracts(): readonly PlatformCapabilityContract[] {
  return platformCapabilityContracts
}

export function getPlatformCapabilityContract(
  id: PlatformCapabilityId
): PlatformCapabilityContract | undefined {
  return platformCapabilityContracts.find((contract) => contract.id === id)
}
