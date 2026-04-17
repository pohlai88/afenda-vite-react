import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core"

import { tenantMemberships } from "../../tenancy/schema/tenant-memberships.schema"
import { tenants } from "../../tenancy/schema/tenants.schema"
import { roles } from "./roles.schema"

export const tenantMembershipRoles = pgTable(
  "tenant_membership_roles",
  {
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    membershipId: uuid("membership_id").notNull(),
    roleId: uuid("role_id").notNull(),
  },
  (table) => [
    primaryKey({
      name: "tenant_membership_roles_pk",
      columns: [table.tenantId, table.membershipId, table.roleId],
    }),
    index("tenant_membership_roles_role_idx").on(table.tenantId, table.roleId),
    foreignKey({
      name: "tenant_membership_roles_membership_tenant_fk",
      columns: [table.membershipId, table.tenantId],
      foreignColumns: [tenantMemberships.id, tenantMemberships.tenantId],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "tenant_membership_roles_role_tenant_fk",
      columns: [table.roleId, table.tenantId],
      foreignColumns: [roles.id, roles.tenantId],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ]
)

export type TenantMembershipRole = typeof tenantMembershipRoles.$inferSelect
export type NewTenantMembershipRole = typeof tenantMembershipRoles.$inferInsert
