import type { PlatformCapabilityContract } from "../types/platform-capability"

export interface PlatformCapabilityAdapterResult {
  readonly contract: PlatformCapabilityContract
  readonly initialized: boolean
  readonly message: string
}

export interface PlatformCapabilityAdapter {
  readonly initialize: () => PlatformCapabilityAdapterResult
}

export function createPlatformCapabilityAdapter(
  contract: PlatformCapabilityContract
): PlatformCapabilityAdapter {
  return {
    initialize: () => ({
      contract,
      initialized: contract.status !== "deprecated",
      message:
        contract.status === "deprecated"
          ? `${contract.title} is deprecated and should not be initialized.`
          : `${contract.title} is ready for platform composition.`,
    }),
  }
}
