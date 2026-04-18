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
 * This module: `7w1h-audit/audit-enums.schema.ts` — `pgEnum` definitions for `governance.audit_logs` and deployment. `deployment_environment` includes `production` and `prod`; prefer **`production`** for new rows.
 */
import { pgEnum } from "drizzle-orm/pg-core"

export const auditActorTypeEnum = pgEnum("audit_actor_type", [
  "person",
  "service",
  "system",
  "integration",
  "scheduler",
  "migration",
  "policy_engine",
  "ai",
  "unknown",
])

export const auditOutcomeEnum = pgEnum("audit_outcome", [
  "success",
  "rejected",
  "failed",
  "partial",
])

export const auditSourceChannelEnum = pgEnum("audit_source_channel", [
  "ui",
  "api",
  "workflow",
  "job",
  "import",
  "replay",
  "system",
])

export const deploymentEnvironmentEnum = pgEnum("deployment_environment", [
  "production",
  "prod",
  "staging",
  "sandbox",
  "dev",
])
