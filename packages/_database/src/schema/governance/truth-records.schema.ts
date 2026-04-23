/**
 * Immutable truth records for business-domain mutations.
 * These are the primary source of business audit for MVP command execution.
 * Database-level append-only enforcement is applied in
 * `sql/hardening/patch_o_truth_records_append_only.sql`.
 */
import { sql } from "drizzle-orm"
import {
  index,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { tenants } from "../mdm/tenants.schema"
import { governance } from "./_schema"

export const truthRecords = governance.table(
  "truth_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: text("entity_id").notNull(),
    commandType: varchar("command_type", { length: 120 }).notNull(),
    actorId: text("actor_id").notNull(),
    timestamp: timestamp("timestamp", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    beforeState: jsonb("before_state").$type<Record<string, unknown> | null>(),
    afterState: jsonb("after_state").$type<Record<string, unknown> | null>(),
    doctrineRef: text("doctrine_ref"),
    invariantRefs: text("invariant_refs")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    hash: varchar("hash", { length: 64 }).notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
  },
  (table) => ({
    idxTruthRecordsTenantTimestamp: index(
      "idx_truth_records_tenant_timestamp"
    ).on(table.tenantId, table.timestamp),
    idxTruthRecordsEntityTimestamp: index(
      "idx_truth_records_entity_timestamp"
    ).on(table.tenantId, table.entityType, table.entityId, table.timestamp),
    idxTruthRecordsCommandTimestamp: index(
      "idx_truth_records_command_timestamp"
    ).on(table.tenantId, table.commandType, table.timestamp),
  })
)

export type TruthRecord = typeof truthRecords.$inferSelect
export type NewTruthRecord = typeof truthRecords.$inferInsert
