/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **governance** schema (`pgSchema("governance")`) — data lineage and governance support tables (7W1H audit re-exported via `governance/index.ts`). Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/governance/data-sources.schema.ts` — `governance.data_sources` integration/lineage catalog (priority rank, authoritative flag); aligns with `docs/guideline/` data-source intent.
 */
import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  index,
  integer,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import {
  auditColumns,
  idColumn,
  lifecycleColumns,
  metadataColumn,
} from "../shared/columns.schema"
import { sourceTypeEnum, statusEnum } from "../shared/enums.schema"
import { governance } from "./_schema"

export const dataSources = governance.table(
  "data_sources",
  {
    ...idColumn,
    sourceCode: varchar("source_code", { length: 50 }).notNull(),
    sourceName: varchar("source_name", { length: 200 }).notNull(),
    sourceType: sourceTypeEnum("source_type").notNull(),
    priorityRank: integer("priority_rank").notNull().default(100),
    isAuthoritative: boolean("is_authoritative").notNull().default(false),
    status: statusEnum("status").notNull().default("active"),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    sourceCodeUq: uniqueIndex("uq_data_sources_source_code").on(t.sourceCode),
    priorityCheck: check(
      "ck_data_sources_priority_rank",
      sql`${t.priorityRank} > 0`
    ),
    statusIdx: index("idx_data_sources_status").on(t.status),
    sourceTypeIdx: index("idx_data_sources_source_type").on(t.sourceType),
  })
)

export type DataSource = typeof dataSources.$inferSelect
export type NewDataSource = typeof dataSources.$inferInsert
