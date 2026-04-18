/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **shared** — reusable Drizzle column fragments (`idColumn`, timestamps, audit, metadata, soft delete) for domain `*.schema.ts`. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/shared/columns.schema.ts` — column builders (001); `timestampColumns` / `optionalDeletedAtColumn` remain for current tables.
 * Zod mirrors for `pgEnum` value sets: `shared-boundary.schema.ts` (`zodFromPgEnum`).
 *
 * Doctrine (canonical groups):
 * - surrogate PK + scoped business key where applicable
 * - audit columns on mutable tenant-owned tables (`auditColumns` ≡ actors + version)
 * - JSONB is controlled extensibility, not relational laziness
 * - soft delete (`lifecycleColumns` / `softDeleteColumn`) for audit-safe ERP semantics
 */
import { sql } from "drizzle-orm"
import {
  boolean,
  char,
  date,
  integer,
  jsonb,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

export const idColumn = {
  id: uuid("id").primaryKey().defaultRandom(),
}

/**
 * Timestamps + optimistic version (no actor columns).
 * Tables that spread this (or {@link createdUpdatedVersionActorColumns}) into row DDL
 * must have `governance.set_updated_at` / `governance.bump_version_no` triggers in
 * `sql/hardening/patch_a_triggers.sql` after baseline migration.
 */
export const createdUpdatedVersionColumns = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  versionNo: integer("version_no").notNull().default(1),
}

/** Full mutable-table audit: version + optional actor UUIDs. */
export const createdUpdatedVersionActorColumns = {
  ...createdUpdatedVersionColumns,
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
}

/** Same object as {@link createdUpdatedVersionActorColumns} (existing table modules import `auditColumns`). */
export const auditColumns = createdUpdatedVersionActorColumns

export const lifecycleColumns = {
  isDeleted: boolean("is_deleted").notNull().default(false),
}

/** Alias of {@link lifecycleColumns} (spec name). */
export const softDeleteColumn = lifecycleColumns

export const effectiveDateColumns = {
  effectiveFrom: date("effective_from")
    .notNull()
    .default(sql`current_date`),
  effectiveTo: date("effective_to"),
}

export const metadataColumn = {
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
}

export const aliasesColumn = {
  aliases: text("aliases")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
}

export const tenantFkColumn = {
  tenantId: uuid("tenant_id").notNull(),
}

/** Alias of {@link tenantFkColumn} (spec name). */
export const tenantIdColumn = tenantFkColumn

export const currencyCodeColumn = (name: string) => char(name, { length: 3 })
export const countryCodeColumn = (name: string) => char(name, { length: 2 })
export const codeColumn = (name = "code", length = 50) =>
  varchar(name, { length }).notNull()
export const nameColumn = (name = "name", length = 255) =>
  varchar(name, { length }).notNull()

export function codeVarchar(name: string, length = 50) {
  return codeColumn(name, length)
}

export function nameVarchar(name: string, length = 255) {
  return nameColumn(name, length)
}

export const positiveAmountColumn = (name: string) =>
  numeric(name, { precision: 18, scale: 2 })

export const jsonbDefault = <T>() =>
  jsonb()
    .$type<T>()
    .notNull()
    .default(sql`'{}'::jsonb`)

/** Slim created/updated timestamps for existing iam/mdm tables (no createdBy/versionNo). */
export const timestampColumns = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
} as const

export const optionalDeletedAtColumn = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
} as const
