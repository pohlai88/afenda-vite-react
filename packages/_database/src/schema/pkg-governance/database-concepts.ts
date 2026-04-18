/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Package governance** — string vocabulary for docs/codegen (`DatabaseConcept`); not used by Drizzle at runtime. No DDL. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/pkg-governance/database-concepts.ts` — `DatabaseConcept` map and key/value types.
 */
/**
 * Vocabulary for DB + Drizzle discussions (docs, ADRs, codegen). Not used by the ORM at runtime.
 *
 * Map each concern to the usual Drizzle surface:
 * - **Schema** — `pgSchema()` for multi-namespace layouts; migration journal schema is `DRIZZLE_MIGRATIONS_SCHEMA` in `constants.ts`.
 * - **Table** — `pgTable()` / `pgTableWithSchema()`.
 * - **PK / composite PK** — `.primaryKey()` on column or `primaryKey({ columns, name })` in table callback.
 * - **FK** — `.references()` on columns or explicit `foreignKey()`.
 * - **Index / unique** — `index()`, `uniqueIndex()` in table callback.
 * - **Check** — `check()` in table callback.
 * - **Sequence** — `serial`, `bigserial`, or explicit `pgSequence()`.
 * - **View / materialized view** — `pgView`, `pgMaterializedView` (`drizzle-orm/pg-core`).
 * - **RLS / Policy** — `pgPolicy`, `pgRole`, `crudPolicy` helpers (`drizzle-orm/pg-core`), plus Postgres roles.
 *
 * Query & runtime:
 * - **Select / Insert / Update / Delete** — `db.select()`, `db.insert()`, `db.update()`, `db.delete()`.
 * - **Filters** — `where` + `eq`, `and`, `or`, `sql`…
 * - **Joins** — `.leftJoin`, `.innerJoin`, … or relational `db.query.*` with `with`.
 * - **Dynamic SQL** — `sql` template; build fragments safely.
 * - **Read replicas** — driver/connection level (e.g. separate pool / Neon read-only endpoint), not Drizzle-specific.
 * - **Typed columns** — `InferSelectModel`, `InferInsertModel`, `.$inferSelect`.
 * - **Logging** — pass `logger` to `drizzle()` or wrap driver.
 * - **Print SQL** — `db.select().from(t).toSQL()` (Drizzle query builder).
 * - **Raw execution** — `db.execute(sql\`...\`)`.
 * - **Mock / test** — `drizzle()` with a mock-friendly driver or in-memory SQLite for unit tests (integration tests often use real Postgres).
 */
export const DatabaseConcept = {
  schema: "schema",
  table: "table",
  primaryKey: "primaryKey",
  foreignKey: "foreignKey",
  index: "index",
  unique: "unique",
  check: "check",
  compositeKey: "compositeKey",
  sequence: "sequence",
  view: "view",
  materializedView: "materializedView",
  role: "role",
  rlsPolicy: "rlsPolicy",
  relation: "relation",
  normalization: "normalization",
  polymorphicRelation: "polymorphicRelation",
  querySelect: "querySelect",
  queryInsert: "queryInsert",
  queryUpdate: "queryUpdate",
  queryDelete: "queryDelete",
  filters: "filters",
  joins: "joins",
  dynamicSql: "dynamicSql",
  readReplicas: "readReplicas",
  typedColumns: "typedColumns",
  logging: "logging",
  multiProjectSchema: "multiProjectSchema",
  printSql: "printSql",
  rawSql: "rawSql",
  standaloneQueryBuilder: "standaloneQueryBuilder",
  mockDriver: "mockDriver",
} as const

export type DatabaseConceptKey = keyof typeof DatabaseConcept
export type DatabaseConceptValue = (typeof DatabaseConcept)[DatabaseConceptKey]
