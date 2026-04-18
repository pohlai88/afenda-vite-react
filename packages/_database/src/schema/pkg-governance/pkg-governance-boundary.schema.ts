/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Pkg-governance Zod boundary** (not Drizzle DDL): validates `DatabaseConcept` strings, managed PG schema names, migration filename parse shape. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/pkg-governance/pkg-governance-boundary.schema.ts` — `databaseConceptValueSchema`, `drizzleManagedPgSchemaSchema`, `parsedMigrationSqlFilenameSchema`.
 */
import { z } from "zod"

import {
  DatabaseConcept,
  type DatabaseConceptValue,
} from "./database-concepts.js"
import { DRIZZLE_MANAGED_PG_SCHEMAS } from "./constants.js"

const conceptValues = Object.values(DatabaseConcept) as [
  DatabaseConceptValue,
  ...DatabaseConceptValue[],
]

/** Runtime check for `DatabaseConcept` string values (docs, codegen, API metadata). */
export const databaseConceptValueSchema = z.enum(conceptValues)

/** PostgreSQL namespaces included in `drizzle.config.ts` `schemaFilter`. */
export const drizzleManagedPgSchemaSchema = z.enum(DRIZZLE_MANAGED_PG_SCHEMAS)

/** Shape produced by `parseMigrationSqlFilename` when parsing succeeds. */
export const parsedMigrationSqlFilenameSchema = z.object({
  index: z
    .string()
    .regex(/^\d{4}$/u, { error: "Expected four-digit migration index" }),
  slug: z.string().regex(/^[a-z0-9_]+$/u, {
    error: "Slug must be snake_case alphanumeric segments",
  }),
})
