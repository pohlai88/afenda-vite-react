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
 * This module: `7w1h-audit/audit-logs.schema.ts` — `governance.audit_logs` DDL; append-only tenant-scoped events; no `updated_at` / soft delete.
 * Membership link is optional; composite FK uses `(tenant_id, membership_id)` with `ON DELETE SET NULL`.
 *
 * ## 7W1H mapping (investigation / compliance narrative)
 *
 * | Dimension | Stored as |
 * | --------- | --------- |
 * | **Who** | `actor_type`, `actor_user_id`, `acting_as_user_id`, `auth_user_id`, `membership_id` |
 * | **What** | `action` (catalog key), `subject_type`, `subject_id` |
 * | **When** | `occurred_at` (business time), `created_at` (ingest / record time) |
 * | **Which (tenant scope)** | `tenant_id` |
 * | **Result (governed outcome)** | `outcome` |
 * | **Where** | `source_channel`, optional `seven_w1h.where` |
 * | **Why** | optional `seven_w1h.why` |
 * | **Which** | `subject_*` plus optional `seven_w1h.which` |
 * | **Whom** (affected) | optional `seven_w1h.whom` |
 * | **How** | optional `seven_w1h.how` |
 *
 * Arbitrary extensibility remains in `metadata` (JSON). Prefer typed `seven_w1h` for consistent dimensions.
 */
import { sql } from "drizzle-orm"
import {
  foreignKey,
  index,
  jsonb,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { tenantMemberships } from "../schema/iam/tenant-memberships.schema"
import { userAccounts } from "../schema/iam/user-accounts.schema"
import { tenants } from "../schema/mdm/tenants.schema"
import { governance } from "../schema/governance/_schema"
import {
  auditActorTypeEnum,
  auditOutcomeEnum,
  auditSourceChannelEnum,
  deploymentEnvironmentEnum,
} from "./audit-enums.schema"
import type { AuditSevenW1H } from "./seven-w1h-audit-boundary.schema"

export const auditLogs = governance.table(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    membershipId: uuid("membership_id"),
    authUserId: text("auth_user_id"),
    actorType: auditActorTypeEnum("actor_type").default("unknown").notNull(),
    actorUserId: uuid("actor_user_id").references(() => userAccounts.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    actingAsUserId: uuid("acting_as_user_id").references(
      () => userAccounts.id,
      {
        onDelete: "set null",
        onUpdate: "cascade",
      }
    ),
    action: text("action").notNull(),
    subjectType: text("subject_type").notNull(),
    subjectId: text("subject_id"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    sevenW1h: jsonb("seven_w1h")
      .$type<AuditSevenW1H>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    outcome: auditOutcomeEnum("outcome").default("success").notNull(),
    sourceChannel: auditSourceChannelEnum("source_channel")
      .default("api")
      .notNull(),
    requestId: text("request_id"),
    traceId: text("trace_id"),
    correlationId: text("correlation_id"),
    commandId: text("command_id"),
    sessionId: text("session_id"),
    environment: deploymentEnvironmentEnum("environment")
      .default("production")
      .notNull(),
    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
    recordedAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    membershipTenantFk: foreignKey({
      columns: [table.tenantId, table.membershipId],
      foreignColumns: [tenantMemberships.tenantId, tenantMemberships.id],
      name: "fk_governance_audit_logs_membership_tenant",
    }).onDelete("set null"),
    tenantRecordedIdx: index("idx_governance_audit_logs_tenant_recorded").on(
      table.tenantId,
      table.recordedAt
    ),
    tenantMembershipIdx: index(
      "idx_governance_audit_logs_tenant_membership"
    ).on(table.tenantId, table.membershipId),
    tenantActionRecordedIdx: index(
      "idx_governance_audit_logs_tenant_action_recorded"
    ).on(table.tenantId, table.action, table.recordedAt),
    tenantSubjectRecordedIdx: index(
      "idx_governance_audit_logs_tenant_subject_recorded"
    ).on(table.tenantId, table.subjectType, table.subjectId, table.recordedAt),
    requestIdx: index("idx_governance_audit_logs_request").on(table.requestId),
    traceIdx: index("idx_governance_audit_logs_trace").on(table.traceId),
    correlationIdx: index("idx_governance_audit_logs_correlation").on(
      table.correlationId
    ),
  })
)

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
