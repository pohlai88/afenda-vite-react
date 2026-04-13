import { and, eq } from "drizzle-orm"

import { db, type DatabaseClient } from "../../client"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships"
import { requireTenantId } from "../../tenancy/policy/tenant-scope"
import { permissions } from "../schema/permissions"
import { rolePermissions } from "../schema/role-permissions"
import { roles } from "../schema/roles"
import { tenantMembershipRoles } from "../schema/tenant-membership-roles"

export class PermissionDeniedError extends Error {
  constructor(permissionKey: string) {
    super(`Missing required permission: ${permissionKey}`)
    this.name = "PermissionDeniedError"
  }
}

export interface PermissionKeyRow {
  readonly key: string
}

export function permissionRowsToKeys(
  rows: readonly PermissionKeyRow[]
): readonly string[] {
  return Array.from(new Set(rows.map((row) => row.key))).sort()
}

export function hasPermissionInKeys(
  keys: readonly string[],
  permissionKey: string
): boolean {
  return keys.includes(permissionKey)
}

export async function getEffectivePermissions(
  userId: string,
  tenantId: string,
  client: DatabaseClient = db
): Promise<readonly string[]> {
  const scopedTenantId = requireTenantId(tenantId)

  const rows = await client
    .selectDistinct({ key: permissions.key })
    .from(tenantMemberships)
    .innerJoin(
      tenantMembershipRoles,
      eq(tenantMembershipRoles.membershipId, tenantMemberships.id)
    )
    .innerJoin(roles, eq(roles.id, tenantMembershipRoles.roleId))
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(
      and(
        eq(tenantMemberships.userId, userId),
        eq(tenantMemberships.tenantId, scopedTenantId),
        eq(tenantMemberships.status, "active"),
        eq(tenantMembershipRoles.tenantId, scopedTenantId),
        eq(roles.tenantId, scopedTenantId)
      )
    )

  return permissionRowsToKeys(rows)
}

export async function hasPermission(
  userId: string,
  tenantId: string,
  permissionKey: string,
  client: DatabaseClient = db
): Promise<boolean> {
  return hasPermissionInKeys(
    await getEffectivePermissions(userId, tenantId, client),
    permissionKey
  )
}

export async function requirePermission(
  userId: string,
  tenantId: string,
  permissionKey: string,
  client: DatabaseClient = db
): Promise<void> {
  if (!(await hasPermission(userId, tenantId, permissionKey, client))) {
    throw new PermissionDeniedError(permissionKey)
  }
}
