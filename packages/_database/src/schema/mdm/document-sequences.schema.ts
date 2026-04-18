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
 * This module: `src/schema/mdm/document-sequences.schema.ts` — tenant- (and optionally legal-entity-) scoped numbering config; allocation mechanics may live in SQL (`patch_j_allocate_document_number.sql`).
 */

import { sql } from "drizzle-orm"
import {
  bigint,
  boolean,
  check,
  foreignKey,
  index,
  integer,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { sequenceResetRuleEnum, statusEnum } from "../shared/enums.schema"
import { mdm } from "./_schema"
import { legalEntities } from "./legal-entities.schema"
import { tenants } from "./tenants.schema"

export const documentSequences = mdm.table(
  "document_sequences",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    legalEntityId: uuid("legal_entity_id"),
    documentType: varchar("document_type", { length: 50 }).notNull(),
    sequenceCode: varchar("sequence_code", { length: 50 }).notNull(),
    prefixPattern: varchar("prefix_pattern", { length: 100 }).notNull(),
    suffixPattern: varchar("suffix_pattern", { length: 100 }),
    nextNumber: bigint("next_number", { mode: "bigint" })
      .notNull()
      .default(sql`1`),
    paddingLength: integer("padding_length").notNull().default(6),
    resetRule: sequenceResetRuleEnum("reset_rule").notNull().default("never"),
    isDefault: boolean("is_default").notNull().default(false),
    status: statusEnum("status").notNull().default("active"),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqRawScope: uniqueIndex("uq_document_sequences_scope_raw").on(
      table.tenantId,
      table.legalEntityId,
      table.documentType,
      table.sequenceCode
    ),
    idxLookup: index("idx_document_sequences_lookup").on(
      table.tenantId,
      table.legalEntityId,
      table.documentType,
      table.sequenceCode
    ),
    fkLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_document_sequences_legal_entity",
    }),
    ckNextNumber: check(
      "ck_document_sequences_next_number",
      sql`${table.nextNumber} > 0`
    ),
    ckPaddingLength: check(
      "ck_document_sequences_padding_length",
      sql`${table.paddingLength} between 1 and 20`
    ),
  })
)

export type DocumentSequence = typeof documentSequences.$inferSelect
export type NewDocumentSequence = typeof documentSequences.$inferInsert
