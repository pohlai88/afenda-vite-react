/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **mdm** schema (`pgSchema("mdm")`) — tenant master data, parties, items, org graph, policies, sequences. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/mdm/custom-field-values.schema.ts` — EAV values per `(tenant, entity_name, entity_id)`; typed columns + `value_json` for select/structured payloads (distinct from row `metadata`).
 */

import { sql } from "drizzle-orm"
import {
  boolean,
  date,
  foreignKey,
  index,
  jsonb,
  numeric,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  idColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { mdm } from "./_schema"
import { customFieldDefinitions } from "./custom-field-definitions.schema"
import { tenants } from "./tenants.schema"

export const customFieldValues = mdm.table(
  "custom_field_values",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    entityName: varchar("entity_name", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),
    customFieldDefinitionId: uuid("custom_field_definition_id").notNull(),
    valueText: text("value_text"),
    valueNumber: numeric("value_number", { precision: 18, scale: 6 }),
    valueBoolean: boolean("value_boolean"),
    valueDate: date("value_date"),
    valueJson: jsonb("value_json")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`),
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantEntityFieldValue: uniqueIndex("uq_custom_field_values").on(
      table.tenantId,
      table.entityName,
      table.entityId,
      table.customFieldDefinitionId
    ),
    idxLookup: index("idx_custom_field_values_lookup").on(
      table.tenantId,
      table.entityName,
      table.entityId
    ),
    fkDefinition: foreignKey({
      columns: [table.tenantId, table.customFieldDefinitionId],
      foreignColumns: [
        customFieldDefinitions.tenantId,
        customFieldDefinitions.id,
      ],
      name: "fk_custom_field_values_definition",
    }),
  })
)

export type CustomFieldValue = typeof customFieldValues.$inferSelect
export type NewCustomFieldValue = typeof customFieldValues.$inferInsert
