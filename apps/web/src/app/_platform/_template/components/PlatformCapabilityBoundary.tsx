import type { ReactNode } from "react"

import { usePlatformCapability } from "../hooks/use-platform-capability"
import { platformCapabilityTemplateContract } from "../policy/platform-capability-policy"
import type { PlatformCapabilityContract } from "../types/platform-capability"
import { formatPlatformCapabilityStatus } from "../utils/platform-capability-utils"

export interface PlatformCapabilityBoundaryProps {
  readonly contract?: PlatformCapabilityContract
  readonly children: ReactNode
}

export function PlatformCapabilityBoundary({
  children,
  contract = platformCapabilityTemplateContract,
}: PlatformCapabilityBoundaryProps) {
  const capability = usePlatformCapability(contract)

  if (!capability.initialized) {
    return (
      <section
        aria-live="polite"
        className="rounded-md border border-border p-4"
      >
        <h2 className="text-base font-semibold">{capability.contract.title}</h2>
        <p className="text-sm text-muted-foreground">{capability.message}</p>
      </section>
    )
  }

  return (
    <section
      aria-label={capability.contract.title}
      className="rounded-md border border-border p-4"
      data-platform-capability={capability.contract.id}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{capability.contract.title}</h2>
        <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
          {formatPlatformCapabilityStatus(capability.contract.status)}
        </span>
      </div>
      {children}
    </section>
  )
}
