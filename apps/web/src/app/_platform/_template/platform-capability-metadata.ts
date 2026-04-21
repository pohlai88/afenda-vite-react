import {
  platformCapabilityIds,
  type PlatformCapabilityId,
  type PlatformCapabilityStatus,
} from "./types/platform-capability"

const platformCapabilityIdSet = new Set<string>(platformCapabilityIds)

export function isPlatformCapabilityId(
  value: string
): value is PlatformCapabilityId {
  return platformCapabilityIdSet.has(value)
}

export function assertPlatformCapabilityId(
  value: string
): PlatformCapabilityId {
  if (isPlatformCapabilityId(value)) {
    return value
  }

  throw new Error(`Unknown platform capability id: ${value}`)
}

export function formatPlatformCapabilityStatus(
  status: PlatformCapabilityStatus
): string {
  switch (status) {
    case "planned":
      return "Planned"
    case "active":
      return "Active"
    case "migrating":
      return "Migrating"
    case "deprecated":
      return "Deprecated"
  }
}
