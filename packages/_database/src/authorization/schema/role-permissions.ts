import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"

import { permissions } from "./permissions"
import { rolePermissionEffectEnum } from "./membership-scope-enums"
import { roles } from "./roles"

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    effect: rolePermissionEffectEnum("effect").notNull().default("allow"),
  },
  (table) => [
    primaryKey({
      name: "role_permissions_pk",
      columns: [table.roleId, table.permissionId],
    }),
    index("role_permissions_permission_idx").on(table.permissionId),
  ]
)

export type RolePermission = typeof rolePermissions.$inferSelect
export type NewRolePermission = typeof rolePermissions.$inferInsert
