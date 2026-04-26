import {
  stackScaffoldManifestSchema,
  type StackScaffoldManifest,
} from "../schema/stack-contract.schema.js"

export const syncPackScaffoldManifestContractId =
  "FSDK-SYNC-SCAFFOLD-001" as const

export const syncPackScaffoldManifestContractSchema =
  stackScaffoldManifestSchema

export type SyncPackScaffoldManifest = StackScaffoldManifest
