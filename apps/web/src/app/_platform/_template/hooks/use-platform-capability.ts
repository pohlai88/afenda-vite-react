import { useMemo } from "react"

import { createPlatformCapabilityAdapter } from "../adapters/platform-capability-adapter"
import { platformCapabilityTemplateContract } from "../policy/platform-capability-policy"
import type { PlatformCapabilityContract } from "../types/platform-capability"

export interface UsePlatformCapabilityResult {
  readonly contract: PlatformCapabilityContract
  readonly initialized: boolean
  readonly message: string
}

export function usePlatformCapability(
  contract: PlatformCapabilityContract = platformCapabilityTemplateContract
): UsePlatformCapabilityResult {
  return useMemo(() => {
    const adapter = createPlatformCapabilityAdapter(contract)
    const result = adapter.initialize()

    return {
      contract: result.contract,
      initialized: result.initialized,
      message: result.message,
    }
  }, [contract])
}
