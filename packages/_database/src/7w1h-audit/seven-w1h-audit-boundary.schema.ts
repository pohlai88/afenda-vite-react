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
 * This module: `7w1h-audit/seven-w1h-audit-boundary.schema.ts` — Zod v4 insert/7W1H shapes for `governance.audit_logs` (not Drizzle DDL; filename `.schema.ts` matches package naming).
 */
import { z } from "zod"

const uuid = (message = "Invalid id") => z.uuid({ error: message })

export const governanceAuditActorTypeSchema = z.enum([
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

export const governanceAuditOutcomeSchema = z.enum([
  "success",
  "rejected",
  "failed",
  "partial",
])

export const governanceAuditSourceChannelSchema = z.enum([
  "ui",
  "api",
  "workflow",
  "job",
  "import",
  "replay",
  "system",
])

export const governanceDeploymentEnvironmentSchema = z.enum([
  "production",
  "prod",
  "staging",
  "sandbox",
  "dev",
])

/**
 * Optional **7W1H** payload for `governance.audit_logs.seven_w1h`.
 * Core dimensions **Who / What / When** also map to top-level columns (`actor_*`, `action`, `subject_*`, `occurred_at`, …).
 */
export const auditSevenW1HSchema = z
  .object({
    where: z
      .object({
        routeId: z.string().optional(),
        pathname: z.string().optional(),
        shellRegion: z.string().optional(),
        region: z.string().optional(),
      })
      .optional(),
    why: z
      .object({
        reasonCategory: z.string().optional(),
        metadataReasonKey: z.string().optional(),
      })
      .optional(),
    which: z
      .object({
        targetModule: z.string().optional(),
        targetFeature: z.string().optional(),
        targetEntityRef: z.string().optional(),
      })
      .optional(),
    whom: z
      .object({
        affectedSubjectRef: z.string().optional(),
      })
      .optional(),
    how: z
      .object({
        mechanism: z.string().optional(),
        interactionPhase: z
          .enum(["started", "succeeded", "failed", "cancelled"])
          .optional(),
        commandOutcomeCategory: z.string().optional(),
        errorMessage: z.string().optional(),
      })
      .optional(),
  })
  .strict()

export type AuditSevenW1H = z.infer<typeof auditSevenW1HSchema>

/** Core columns for inserting `governance.audit_logs` (IDs optional where nullable in DDL). */
export const governanceAuditLogInsertSchema = z.object({
  tenantId: uuid(),
  membershipId: uuid().optional().nullable(),
  authUserId: z.string().optional().nullable(),
  actorType: governanceAuditActorTypeSchema.optional(),
  actorUserId: uuid().optional().nullable(),
  actingAsUserId: uuid().optional().nullable(),
  action: z.string().min(1),
  subjectType: z.string().min(1),
  subjectId: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  sevenW1h: auditSevenW1HSchema.optional(),
  outcome: governanceAuditOutcomeSchema.optional(),
  sourceChannel: governanceAuditSourceChannelSchema.optional(),
  requestId: z.string().optional().nullable(),
  traceId: z.string().optional().nullable(),
  correlationId: z.string().optional().nullable(),
  commandId: z.string().optional().nullable(),
  sessionId: z.string().optional().nullable(),
  environment: governanceDeploymentEnvironmentSchema.optional(),
  occurredAt: z.coerce.date().optional(),
  recordedAt: z.coerce.date().optional(),
})

export type GovernanceAuditLogInsert = z.infer<
  typeof governanceAuditLogInsertSchema
>
