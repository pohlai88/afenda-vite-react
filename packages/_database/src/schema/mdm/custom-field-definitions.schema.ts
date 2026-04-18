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
 * This module: `src/schema/mdm/custom-field-definitions.schema.ts` — tenant-scoped EAV-style field metadata (`entity_name` + `field_key`); values live elsewhere.
 */

import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  jsonb,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionActorColumns,
  idColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { customFieldDataTypeEnum, statusEnum } from "../shared/enums.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

export const customFieldDefinitions = mdm.table(
  "custom_field_definitions",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    entityName: varchar("entity_name", { length: 50 }).notNull(),
    fieldKey: varchar("field_key", { length: 100 }).notNull(),
    fieldLabel: varchar("field_label", { length: 200 }).notNull(),
    dataType: customFieldDataTypeEnum("data_type").notNull(),
    isRequired: boolean("is_required").notNull().default(false),
    isUnique: boolean("is_unique").notNull().default(false),
    validationRule: jsonb("validation_rule")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    optionsJson: jsonb("options_json")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    status: statusEnum("status").notNull().default("active"),
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantIdId: unique("uq_custom_field_definitions_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    uqTenantEntityFieldKey: uniqueIndex("uq_custom_field_definitions").on(
      table.tenantId,
      table.entityName,
      table.fieldKey
    ),
    idxLookup: index("idx_custom_field_definitions_lookup").on(
      table.tenantId,
      table.entityName,
      table.status
    ),
  })
)

export type CustomFieldDefinition = typeof customFieldDefinitions.$inferSelect
export type NewCustomFieldDefinition = typeof customFieldDefinitions.$inferInsert
