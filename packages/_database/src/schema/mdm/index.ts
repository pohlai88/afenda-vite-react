/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **mdm** package barrel — `pgSchema("mdm")` tables and Zod MDM boundary. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/mdm/index.ts` — barrel re-export for the MDM schema package.
 */

export * from "./_schema"
export * from "./mdm-boundary.schema"
export * from "./addresses.schema"
export * from "./business-units.schema"
export * from "./custom-field-definitions.schema"
export * from "./custom-field-values.schema"
export * from "./customers.schema"
export * from "./document-sequences.schema"
export * from "./external-identities.schema"
export * from "./item-categories.schema"
export * from "./item-entity-settings.schema"
export * from "./items.schema"
export * from "./legal-entities.schema"
export * from "./locations.schema"
export * from "./master-aliases.schema"
export * from "./org-units.schema"
export * from "./party-addresses.schema"
export * from "./parties.schema"
export * from "./suppliers.schema"
export * from "./tax-registrations.schema"
export * from "./tenant-label-overrides.schema"
export * from "./tenant-policies.schema"
export * from "./tenant-profiles.schema"
export * from "./tenants.schema"
