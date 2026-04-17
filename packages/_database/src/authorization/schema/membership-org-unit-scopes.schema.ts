import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core"

import { orgUnits } from "../../organization/schema/org-units.schema"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships.schema"
import { tenants } from "../../tenancy/schema/tenants.schema"

/**
 * @deprecated Prefer unified `membership_scopes` (`scope_type = 'org_unit'`).
 * Kept for backward compatibility until data is migrated off this table.
 */
export const membershipOrgUnitScopes = pgTable(
  "membership_org_unit_scopes",
  {
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    membershipId: uuid("membership_id").notNull(),
    orgUnitId: uuid("org_unit_id").notNull(),
  },
  (table) => [
    primaryKey({
      name: "membership_org_unit_scopes_pk",
      columns: [table.tenantId, table.membershipId, table.orgUnitId],
    }),
    index("membership_org_unit_scopes_org_unit_idx").on(
      table.tenantId,
      table.orgUnitId
    ),
    foreignKey({
      name: "membership_org_unit_scopes_membership_tenant_fk",
      columns: [table.membershipId, table.tenantId],
      foreignColumns: [tenantMemberships.id, tenantMemberships.tenantId],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "membership_org_unit_scopes_org_unit_tenant_fk",
      columns: [table.orgUnitId, table.tenantId],
      foreignColumns: [orgUnits.id, orgUnits.tenantId],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ]
)

export type MembershipOrgUnitScope = typeof membershipOrgUnitScopes.$inferSelect
export type NewMembershipOrgUnitScope =
  typeof membershipOrgUnitScopes.$inferInsert
