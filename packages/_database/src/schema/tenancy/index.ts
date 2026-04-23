/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Tenancy barrel** under `src/schema/tenancy/` — Zod tenancy validators, active-tenant / “me” context services, and re-exports of `iam.tenant_memberships` + `mdm.tenants`. **No new DDL** here; canonical tables remain under `src/schema/iam/` and `src/schema/mdm/`. Migrations N/A for this barrel.
 * Import via package exports only (`@afenda/database`, `@afenda/database/tenancy`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/tenancy/index.ts` — convenience surface for tenant context; see `docs/practical-discipline.md` for folder charter.
 */
export * from "./services/assert-user-has-tenant-access"
export * from "./services/list-afenda-tenant-candidates"
export * from "./services/resolve-active-tenant-context"
export * from "./services/resolve-afenda-me-context"
export * from "./tenancy-boundary.schema"
export * from "../iam/tenant-memberships.schema"
export * from "../mdm/tenants.schema"
