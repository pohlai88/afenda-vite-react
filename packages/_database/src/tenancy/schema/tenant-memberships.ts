import {
  index,
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "../../identity/schema/users"
import { timestampColumns } from "../../helpers/columns"
import { tenantMembershipStatus } from "./tenant-status"
import { tenants } from "./tenants"

export const tenantMemberships = pgTable(
  "tenant_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    status: tenantMembershipStatus("status").default("invited").notNull(),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("tenant_memberships_tenant_user_unique").on(
      table.tenantId,
      table.userId
    ),
    unique("tenant_memberships_id_tenant_unique").on(table.id, table.tenantId),
    index("tenant_memberships_tenant_status_idx").on(
      table.tenantId,
      table.status
    ),
    index("tenant_memberships_user_idx").on(table.userId),
  ]
)

export type TenantMembership = typeof tenantMemberships.$inferSelect
export type NewTenantMembership = typeof tenantMemberships.$inferInsert
