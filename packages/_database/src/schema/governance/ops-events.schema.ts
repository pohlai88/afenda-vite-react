/**
 * Current ops-event projection. Truth records remain the authoritative mutation history.
 * Physical storage keeps the legacy `partner_id` column for migration stability.
 * Application/runtime layers map this domain outward as `counterpartyId`.
 */
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  text,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { tenants } from "../mdm/tenants.schema"
import {
  createdUpdatedVersionColumns,
  metadataColumn,
} from "../shared/columns.schema"
import { governance } from "./_schema"
import { opsPartners } from "./ops-partners.schema"

export const opsEvents = governance.table(
  "ops_events",
  {
    id: text("id").primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    partnerId: text("partner_id"),
    eventCode: varchar("event_code", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary").notNull(),
    priority: varchar("priority", { length: 20 }).notNull(),
    state: varchar("state", { length: 20 }).notNull(),
    ownerActorId: text("owner_actor_id"),
    ownerLabel: varchar("owner_label", { length: 200 }),
    sourceLabel: varchar("source_label", { length: 150 }).notNull(),
    slaLabel: varchar("sla_label", { length: 150 }).notNull(),
    ...metadataColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqOpsEventsTenantIdId: unique("uq_ops_events_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    uqOpsEventsTenantCode: uniqueIndex("uq_ops_events_tenant_code").on(
      table.tenantId,
      table.eventCode
    ),
    idxOpsEventsTenantState: index("idx_ops_events_tenant_state").on(
      table.tenantId,
      table.state
    ),
    idxOpsEventsTenantPriority: index("idx_ops_events_tenant_priority").on(
      table.tenantId,
      table.priority
    ),
    idxOpsEventsTenantUpdated: index("idx_ops_events_tenant_updated").on(
      table.tenantId,
      table.updatedAt
    ),
    fkOpsEventsPartner: foreignKey({
      columns: [table.tenantId, table.partnerId],
      foreignColumns: [opsPartners.tenantId, opsPartners.id],
      name: "fk_ops_events_partner",
    }).onDelete("set null"),
    ckOpsEventsPriority: check(
      "ck_ops_events_priority",
      sql`${table.priority} in ('critical', 'high', 'medium', 'low')`
    ),
    ckOpsEventsState: check(
      "ck_ops_events_state",
      sql`${table.state} in ('draft', 'assigned', 'in_progress', 'completed', 'closed')`
    ),
  })
)

export type OpsEvent = typeof opsEvents.$inferSelect
export type NewOpsEvent = typeof opsEvents.$inferInsert
