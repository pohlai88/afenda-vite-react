/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; 7W1H audit modules under `src/7w1h-audit/` (re-exported via `schema/governance` for Drizzle Kit). Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (@afenda/database, @afenda/database/7w1h-audit, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `7w1h-audit/contracts/audit-seven-w1h-query-manifest.ts` — single source of truth for `seven_w1h` list filters (query key ↔ JSON path; keeps Zod and SQL in sync).
 */
export const AUDIT_QUERY_W1H_TEXT_FILTERS = [
  ["w1hWhereRouteId", "where", "routeId"],
  ["w1hWherePathname", "where", "pathname"],
  ["w1hWhereShellRegion", "where", "shellRegion"],
  ["w1hWhereRegion", "where", "region"],
  ["w1hWhyReasonCategory", "why", "reasonCategory"],
  ["w1hWhyMetadataReasonKey", "why", "metadataReasonKey"],
  ["w1hWhichTargetModule", "which", "targetModule"],
  ["w1hWhichTargetFeature", "which", "targetFeature"],
  ["w1hWhichTargetEntityRef", "which", "targetEntityRef"],
  ["w1hWhomAffectedSubjectRef", "whom", "affectedSubjectRef"],
  ["w1hHowMechanism", "how", "mechanism"],
  ["w1hHowCommandOutcomeCategory", "how", "commandOutcomeCategory"],
] as const

/** Enum-valued path (same `#>>` mechanism; value is a known phase string). */
export const AUDIT_QUERY_W1H_PHASE_FILTER = {
  key: "w1hHowInteractionPhase",
  path: ["how", "interactionPhase"],
} as const

/** PostgreSQL `#>>` path literal for a two-segment JSON key path. */
export function auditSevenW1hPgPathLiteral(
  segment: readonly [string, string]
): string {
  return `'{${segment[0]},${segment[1]}}'`
}
