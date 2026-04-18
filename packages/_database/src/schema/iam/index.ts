/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **iam** package barrel — `pgSchema("iam")` tables and Zod IAM boundary. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/iam/index.ts` — barrel re-export for `@afenda/database/schema` IAM domain.
 */
export * from "./_schema"
export * from "./iam-boundary.schema"
export * from "./authority-policies.schema"
export * from "./auth-challenges.schema"
export * from "./identity-links.schema"
export * from "./persons.schema"
export * from "./tenant-memberships.schema"
export * from "./tenant-role-assignments.schema"
export * from "./tenant-roles.schema"
export * from "./user-accounts.schema"
export * from "./user-identities.schema"
