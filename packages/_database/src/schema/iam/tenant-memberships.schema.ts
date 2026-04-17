import {
  index,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { tenants } from "../mdm/tenants.schema"
import { timestampColumns } from "../shared/columns.schema"
import {
  tenantMembershipStatus,
  tenantMembershipTypeEnum,
} from "../mdm/tenant-status.schema"
import { iam } from "./_schema"
import { userAccounts } from "./user-accounts.schema"

export const tenantMemberships = iam.table(
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
      .references(() => userAccounts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    membershipType: tenantMembershipTypeEnum("membership_type")
      .notNull()
      .default("internal"),
    status: tenantMembershipStatus("status").default("invited").notNull(),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    joinedAt: timestamp("joined_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("uq_iam_tenant_memberships_tenant_user").on(
      table.tenantId,
      table.userId
    ),
    unique("uq_iam_tenant_memberships_tenant_id_id").on(
      table.id,
      table.tenantId
    ),
    index("idx_iam_tenant_memberships_tenant_status").on(
      table.tenantId,
      table.status
    ),
    index("idx_iam_tenant_memberships_user").on(table.userId),
  ]
)

export type TenantMembership = typeof tenantMemberships.$inferSelect
export type NewTenantMembership = typeof tenantMemberships.$inferInsert
