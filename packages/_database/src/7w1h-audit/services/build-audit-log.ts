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
 * This module: `7w1h-audit/services/build-audit-log.ts` — compose `NewAuditLog` rows with catalog `action` + defaults.
 */
import type { NewAuditLog } from "../audit-logs.schema"
import { type AuditActionKey } from "../contracts/audit-action-catalog"
import { type BuildAuditChangeEvidenceInput } from "../contracts/audit-change-contract"
import { buildAuditChangeEvidence } from "./build-audit-change-evidence"
import { validateAuditLog } from "./validate-audit-log"

export interface BuildAuditLogInput extends Omit<
  NewAuditLog,
  "id" | "recordedAt" | "occurredAt" | "action"
> {
  action: AuditActionKey
  occurredAt?: Date
  recordedAt?: Date
  changeEvidence?: BuildAuditChangeEvidenceInput
}

export function buildAuditLog(input: BuildAuditLogInput): NewAuditLog {
  const now = new Date()
  const { changeEvidence, ...rowInput } = input
  const metadata = { ...(input.metadata ?? {}) }

  if (changeEvidence !== undefined) {
    metadata.changeEvidence = buildAuditChangeEvidence(changeEvidence)
  }

  return validateAuditLog({
    ...rowInput,
    metadata,
    sevenW1h: input.sevenW1h ?? {},
    occurredAt: input.occurredAt ?? now,
    recordedAt: input.recordedAt ?? now,
  })
}
