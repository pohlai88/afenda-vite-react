/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Identity barrel** under `src/schema/identity/` — re-exports `iam.user_accounts`, `iam.identity_links`, `iam.user_identities` and the Better Auth bootstrap service. **No DDL in this folder** (tables live under `src/schema/iam/`). Migrations N/A for this barrel.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/identity/index.ts` — convenience surface for identity linking; do not add new `*.schema.ts` tables here (see `docs/practical-discipline.md`).
 */
export * from "./services/ensure-identity-link-for-better-auth-user"
export * from "../iam/identity-links.schema"
export * from "../iam/user-identities.schema"
export * from "../iam/user-accounts.schema"
