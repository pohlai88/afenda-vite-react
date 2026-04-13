export const platformCapabilityIds = [
  "shell",
  "route",
  "i18n",
  "client-store",
  "server-state",
  "permissions",
  "providers",
] as const

export type PlatformCapabilityId = (typeof platformCapabilityIds)[number]

export const platformCapabilityStatuses = [
  "planned",
  "active",
  "migrating",
  "deprecated",
] as const

export type PlatformCapabilityStatus =
  (typeof platformCapabilityStatuses)[number]

export type PlatformCapabilityOwner =
  | "app-runtime"
  | "routing"
  | "localization"
  | "state"
  | "security"

export interface PlatformCapabilityContract {
  readonly id: PlatformCapabilityId
  readonly title: string
  readonly status: PlatformCapabilityStatus
  readonly owner: PlatformCapabilityOwner
  readonly summary: string
  readonly publicImportsOnly: boolean
  readonly mayImportFeatureRoots: boolean
  readonly mayImportFeatureInternals: boolean
}
