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
 * This module: `7w1h-audit/contracts/audit-query-contract.ts` — Zod input for `queryAuditLogs` (core columns + `seven_w1h` path filters).
 */
import { z } from "zod/v4"

import {
  AUDIT_QUERY_W1H_PHASE_FILTER,
  AUDIT_QUERY_W1H_TEXT_FILTERS,
} from "./audit-seven-w1h-query-manifest"

const w1hTextShape = Object.fromEntries(
  AUDIT_QUERY_W1H_TEXT_FILTERS.map(([key]) => [
    key,
    z.string().min(1).optional(),
  ])
) as Record<
  (typeof AUDIT_QUERY_W1H_TEXT_FILTERS)[number][0],
  z.ZodOptional<z.ZodString>
>

export const auditQueryInputSchema = z
  .object({
    tenantId: z.string().uuid(),
    subjectType: z.string().min(1).optional(),
    subjectId: z.string().min(1).optional(),
    actorUserId: z.string().uuid().optional(),
    action: z.string().min(1).optional(),
    outcome: z.enum(["success", "rejected", "failed", "partial"]).optional(),
    requestId: z.string().min(1).optional(),
    traceId: z.string().min(1).optional(),
    correlationId: z.string().min(1).optional(),
    fromRecordedAt: z.date().optional(),
    toRecordedAt: z.date().optional(),
    offset: z.number().int().min(0).default(0),
    limit: z.number().int().positive().max(500).default(100),
    ...w1hTextShape,
    [AUDIT_QUERY_W1H_PHASE_FILTER.key]: z
      .enum(["started", "succeeded", "failed", "cancelled"])
      .optional(),
  })
  .strict()

export type AuditQueryInput = z.infer<typeof auditQueryInputSchema>

export function parseAuditQueryInput(value: unknown): AuditQueryInput {
  return auditQueryInputSchema.parse(value)
}
