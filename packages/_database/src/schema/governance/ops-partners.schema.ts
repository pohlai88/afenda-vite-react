/**
 * Current projection of external counterparties affecting ops workflows.
 * Physical storage keeps the legacy `ops_partners` / `partner_*` identifiers for now.
 * Application/runtime layers expose this domain outward as `counterparty*`.
 */
import { sql } from "drizzle-orm"
import {
  check,
  index,
  unique,
  uniqueIndex,
  uuid,
  varchar,
  text,
} from "drizzle-orm/pg-core"

import { tenants } from "../mdm/tenants.schema"
import {
  createdUpdatedVersionColumns,
  metadataColumn,
} from "../shared/columns.schema"
import { governance } from "./_schema"

export const opsPartners = governance.table(
  "ops_partners",
  {
    id: text("id").primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    partnerCode: varchar("partner_code", { length: 50 }).notNull(),
    partnerName: varchar("partner_name", { length: 200 }).notNull(),
    regionLabel: varchar("region_label", { length: 120 }).notNull(),
    ownerLabel: varchar("owner_label", { length: 200 }).notNull(),
    channelLabel: varchar("channel_label", { length: 200 }).notNull(),
    responseLabel: varchar("response_label", { length: 200 }).notNull(),
    health: varchar("health", { length: 20 }).notNull(),
    ...metadataColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqOpsPartnersTenantIdId: unique("uq_ops_partners_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    uqOpsPartnersTenantCode: uniqueIndex("uq_ops_partners_tenant_code").on(
      table.tenantId,
      table.partnerCode
    ),
    idxOpsPartnersTenantHealth: index("idx_ops_partners_tenant_health").on(
      table.tenantId,
      table.health
    ),
    ckOpsPartnersHealth: check(
      "ck_ops_partners_health",
      sql`${table.health} in ('healthy', 'attention', 'blocked')`
    ),
  })
)

export type OpsPartner = typeof opsPartners.$inferSelect
export type NewOpsPartner = typeof opsPartners.$inferInsert
