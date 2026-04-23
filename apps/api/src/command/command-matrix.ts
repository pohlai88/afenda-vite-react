export const opsCommandMatrix = [
  {
    type: "ops.event.claim",
    permission: "ops:event:claim",
    label: "Claim ops event",
  },
  {
    type: "ops.event.advance",
    permission: "ops:event:advance",
    label: "Advance ops event",
  },
] as const

export type OpsCommandType = (typeof opsCommandMatrix)[number]["type"]

export const defaultOpsPermissionKeys = [
  "ops:event:view",
  "ops:event:claim",
  "ops:event:advance",
  "ops:audit:view",
  "admin:workspace:manage",
] as const

export type OpsPermissionKey = (typeof defaultOpsPermissionKeys)[number]

export const rolePermissionCatalog: Readonly<
  Record<string, readonly string[]>
> = {
  workspace_admin: defaultOpsPermissionKeys,
  ops_operator: [
    "ops:event:view",
    "ops:event:claim",
    "ops:event:advance",
    "ops:audit:view",
  ],
  ops_viewer: ["ops:event:view", "ops:audit:view"],
} as const

export function permissionForCommand(type: OpsCommandType): OpsPermissionKey {
  const match = opsCommandMatrix.find((item) => item.type === type)
  if (!match) {
    throw new Error(`Unknown command type: ${type}`)
  }
  return match.permission
}
