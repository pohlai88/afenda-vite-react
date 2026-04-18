/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Package governance** under `src/schema/pkg-governance/` — migration filename patterns, PostgreSQL identifier helpers, Drizzle-managed schema list, `*.schema.ts` module convention, Zod boundaries. **No DDL** here; barrel uses `.js` specifiers for Node ESM resolution. Migrations N/A for this folder.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/pkg-governance/index.ts` — public barrel for pkg-governance symbols.
 */
export {
  DRIZZLE_MANAGED_PG_SCHEMAS,
  DRIZZLE_MIGRATIONS_SCHEMA,
  PG_IDENTIFIER_MAX_LENGTH,
  type DrizzleManagedPgSchema,
  type DrizzleMigrationsSchema,
} from "./constants.js"
export {
  DRIZZLE_MIGRATION_SQL_FILENAME,
  isMigrationSqlFilename,
  parseMigrationSqlFilename,
  type ParsedMigrationSqlFilename,
} from "./migration-sql-files.js"
export {
  assertPgIdentifierLength,
  checkName,
  compositePkName,
  fkName,
  indexName,
  materializedViewName,
  pgIdentifierUtf8ByteLength,
  pkName,
  rlsPolicyName,
  roleName,
  sequenceName,
  uniqueName,
  viewName,
} from "./sql-identifiers.js"
export {
  databaseConceptValueSchema,
  drizzleManagedPgSchemaSchema,
  parsedMigrationSqlFilenameSchema,
} from "./pkg-governance-boundary.schema.js"
export {
  DatabaseConcept,
  type DatabaseConceptKey,
  type DatabaseConceptValue,
} from "./database-concepts.js"
export {
  DRIZZLE_SCHEMA_MODULE_GLOB,
  DRIZZLE_SCHEMA_MODULE_SUFFIX,
  isDrizzleSchemaModuleFile,
} from "./schema-modules.js"
