import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "../../identity/schema/users.schema"
import { timestampColumns } from "../../helpers/columns"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships.schema"
import { tenants } from "../../tenancy/schema/tenants.schema"

export const tenantInvitations = pgTable(
  "tenant_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    email: text("email").notNull(),
    status: text("status").default("pending").notNull(),
    invitedByUserId: uuid("invited_by_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    acceptedMembershipId: uuid("accepted_membership_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    index("tenant_invitations_tenant_status_idx").on(
      table.tenantId,
      table.status
    ),
    index("tenant_invitations_email_idx").on(table.email),
    foreignKey({
      name: "tenant_invitations_accepted_membership_tenant_fk",
      columns: [table.acceptedMembershipId, table.tenantId],
      foreignColumns: [tenantMemberships.id, tenantMemberships.tenantId],
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ]
)

export type TenantInvitation = typeof tenantInvitations.$inferSelect
export type NewTenantInvitation = typeof tenantInvitations.$inferInsert
