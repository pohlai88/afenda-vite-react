/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **governance** package barrel — `pgSchema("governance")` tables plus re-exports from `src/7w1h-audit/` so Drizzle Kit sees audit DDL with governance. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/governance/index.ts` — barrel: governance DDL, 7W1H audit enums/logs/boundary, data sources, Zod governance boundary.
 */
export * from "./_schema"
export * from "../../7w1h-audit/audit-enums.schema"
export * from "../../7w1h-audit/audit-logs.schema"
export * from "../../7w1h-audit/seven-w1h-audit-boundary.schema"
export * from "./data-sources.schema"
export * from "./governance-boundary.schema"
