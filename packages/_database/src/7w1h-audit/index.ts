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
 * This module: `7w1h-audit/index.ts` — package barrel: DDL, Zod, action catalog, insert/query, `seven_w1h` list filters.
 */
export type {
  AuditSevenW1H,
  GovernanceAuditLogInsert,
} from "./seven-w1h-audit-boundary.schema"
export {
  auditSevenW1HSchema,
  governanceAuditActorTypeSchema,
  governanceAuditLogInsertSchema,
  governanceAuditOutcomeSchema,
  governanceAuditSourceChannelSchema,
  governanceDeploymentEnvironmentSchema,
} from "./seven-w1h-audit-boundary.schema"
export * from "./audit-enums.schema"
export * from "./audit-logs.schema"
export * from "./contracts/audit-action-catalog"
export * from "./contracts/audit-seven-w1h-query-manifest"
export * from "./contracts/audit-query-contract"
export * from "./services/audit-query-service"
export * from "./services/build-audit-log"
export * from "./services/insert-audit-log"
export * from "./services/validate-audit-log"
