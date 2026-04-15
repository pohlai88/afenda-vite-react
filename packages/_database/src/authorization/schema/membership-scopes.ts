import {
  foreignKey,
  index,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "../../identity/schema/users"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships"
import { tenants } from "../../tenancy/schema/tenants"
import {
  membershipScopeAccessModeEnum,
  membershipScopeTypeEnum,
} from "./membership-scope-enums"

/**
 * Unified membership scope rows (ADR target: replace split `membership_*_scopes` over time).
 * `scope_id` is polymorphic; enforce tenant + type + id in application/invariant checks.
 *
 * Coexists with legacy `membership_legal_entity_scopes` / `membership_org_unit_scopes` until migrated.
 */
export const membershipScopes = pgTable(
  "membership_scopes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    membershipId: uuid("membership_id").notNull(),
    scopeType: membershipScopeTypeEnum("scope_type").notNull(),
    scopeId: uuid("scope_id").notNull(),
    accessMode: membershipScopeAccessModeEnum("access_mode").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => [
    foreignKey({
      name: "membership_scopes_membership_tenant_fk",
      columns: [table.membershipId, table.tenantId],
      foreignColumns: [tenantMemberships.id, tenantMemberships.tenantId],
    })
      .onDelete("cascade")
      .onUpdate("cascade"),
    uniqueIndex("membership_scopes_membership_scope_unique").on(
      table.membershipId,
      table.scopeType,
      table.scopeId,
      table.accessMode
    ),
    index("membership_scopes_tenant_membership_idx").on(
      table.tenantId,
      table.membershipId
    ),
    index("membership_scopes_scope_type_idx").on(
      table.membershipId,
      table.scopeType
    ),
  ]
)

export type MembershipScope = typeof membershipScopes.$inferSelect
export type NewMembershipScope = typeof membershipScopes.$inferInsert
