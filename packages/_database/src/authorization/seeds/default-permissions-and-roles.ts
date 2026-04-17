import { inArray } from "drizzle-orm"

import { db, type DatabaseClient } from "../../client"
import { permissions } from "../schema/permissions.schema"
import { rolePermissions } from "../schema/role-permissions.schema"
import { roles } from "../schema/roles.schema"

export const defaultPermissions = [
  {
    key: "core:dashboard:view",
    category: "core",
    description: "View the tenant dashboard.",
  },
  {
    key: "finance:gl:read",
    category: "finance",
    description: "Read general ledger records.",
  },
  {
    key: "finance:journal:draft",
    category: "finance",
    description: "Draft journal entries.",
  },
  {
    key: "finance:journal:post",
    category: "finance",
    description: "Post approved journal entries.",
  },
  {
    key: "inventory:stock:read",
    category: "inventory",
    description: "Read stock positions.",
  },
  {
    key: "inventory:stock:adjust",
    category: "inventory",
    description: "Adjust stock positions.",
  },
  {
    key: "reports:financial:run",
    category: "reports",
    description: "Run financial reports.",
  },
  {
    key: "admin:tenant:settings",
    category: "admin",
    description: "Manage tenant settings.",
  },
  {
    key: "admin:roles:manage",
    category: "admin",
    description: "Manage tenant roles and permissions.",
  },
] as const

export const defaultRolePermissionKeys = {
  viewer: [
    "core:dashboard:view",
    "finance:gl:read",
    "inventory:stock:read",
    "reports:financial:run",
  ],
  operator: [
    "core:dashboard:view",
    "finance:gl:read",
    "finance:journal:draft",
    "inventory:stock:read",
    "inventory:stock:adjust",
    "reports:financial:run",
  ],
  manager: [
    "core:dashboard:view",
    "finance:gl:read",
    "finance:journal:draft",
    "finance:journal:post",
    "inventory:stock:read",
    "inventory:stock:adjust",
    "reports:financial:run",
  ],
  admin: defaultPermissions.map((permission) => permission.key),
} as const

export type DefaultRoleSlug = keyof typeof defaultRolePermissionKeys

const defaultRoleNames: Record<DefaultRoleSlug, string> = {
  admin: "Admin",
  manager: "Manager",
  operator: "Operator",
  viewer: "Viewer",
}

export async function seedPermissionsAndRoles(
  tenantId: string,
  client: DatabaseClient = db
): Promise<void> {
  await client
    .insert(permissions)
    .values([...defaultPermissions])
    .onConflictDoNothing()

  const roleValues = Object.keys(defaultRolePermissionKeys).map((slug) => ({
    tenantId,
    slug,
    name: defaultRoleNames[slug as DefaultRoleSlug],
    isSystem: true,
  }))

  await client.insert(roles).values(roleValues).onConflictDoNothing()

  const permissionRows = await client
    .select({ id: permissions.id, key: permissions.key })
    .from(permissions)
    .where(
      inArray(
        permissions.key,
        defaultPermissions.map((permission) => permission.key)
      )
    )

  const roleRows = await client
    .select({ id: roles.id, slug: roles.slug })
    .from(roles)
    .where(inArray(roles.slug, Object.keys(defaultRolePermissionKeys)))

  const permissionIdByKey = new Map(
    permissionRows.map((permission) => [permission.key, permission.id])
  )
  const roleIdBySlug = new Map(roleRows.map((role) => [role.slug, role.id]))

  const rolePermissionValues = Object.entries(
    defaultRolePermissionKeys
  ).flatMap(([roleSlug, permissionKeys]) => {
    const roleId = roleIdBySlug.get(roleSlug)
    if (!roleId) {
      return []
    }
    return permissionKeys.flatMap((permissionKey) => {
      const permissionId = permissionIdByKey.get(permissionKey)
      return permissionId ? [{ roleId, permissionId }] : []
    })
  })

  if (rolePermissionValues.length > 0) {
    await client
      .insert(rolePermissions)
      .values(rolePermissionValues)
      .onConflictDoNothing()
  }
}
