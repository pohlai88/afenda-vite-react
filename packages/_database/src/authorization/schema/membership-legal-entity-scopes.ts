import {
  foreignKey,
  index,
  pgTable,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core"

import { legalEntities } from "../../organization/schema/legal-entities"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships"
import { tenants } from "../../tenancy/schema/tenants"

export const membershipLegalEntityScopes = pgTable(
  "membership_legal_entity_scopes",
  {
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    membershipId: uuid("membership_id").notNull(),
    legalEntityId: uuid("legal_entity_id").notNull(),
  },
  (table) => [
    primaryKey({
      name: "membership_legal_entity_scopes_pk",
      columns: [table.tenantId, table.membershipId, table.legalEntityId],
    }),
    index("membership_legal_entity_scopes_legal_entity_idx").on(
      table.tenantId,
      table.legalEntityId
    ),
    foreignKey({
      name: "membership_legal_entity_scopes_membership_tenant_fk",
      columns: [table.membershipId, table.tenantId],
      foreignColumns: [tenantMemberships.id, tenantMemberships.tenantId],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    foreignKey({
      name: "membership_legal_entity_scopes_entity_tenant_fk",
      columns: [table.legalEntityId, table.tenantId],
      foreignColumns: [legalEntities.id, legalEntities.tenantId],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
  ]
)

export type MembershipLegalEntityScope =
  typeof membershipLegalEntityScopes.$inferSelect
export type NewMembershipLegalEntityScope =
  typeof membershipLegalEntityScopes.$inferInsert
