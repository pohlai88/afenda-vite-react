/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; Drizzle `relations()` graphs under `src/relations/` (not `pgTable` DDL).
 * Import via `@afenda/database/relations` or from `./mdm-relations` / `./ref-relations`; do not deep-import `src/` from apps.
 * Not for browser bundles: used only with the Drizzle client on Node `pg`.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `relations/relation-names.ts` — canonical `relationName` strings when multiple FKs target the same table (`one` ↔ `many` must match).
 * @see https://orm.drizzle.team/docs/relations#disambiguating-relations
 */
export const DRIZZLE_RELATION_NAME = {
  /** `mdm.tenants.base_currency_code` → `ref.currencies.code` */
  tenantToCurrencyBase: "tenant_base_currency",
  /** `mdm.tenants.reporting_currency_code` → `ref.currencies.code` (nullable) */
  tenantToCurrencyReporting: "tenant_reporting_currency",
} as const

export type DrizzleDisambiguatedRelationName =
  (typeof DRIZZLE_RELATION_NAME)[keyof typeof DRIZZLE_RELATION_NAME]
