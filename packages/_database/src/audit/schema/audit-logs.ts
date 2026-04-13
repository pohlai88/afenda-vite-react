import {
  boolean,
  foreignKey,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { users } from "../../identity/schema/users"
import { legalEntities } from "../../organization/schema/legal-entities"
import { tenants } from "../../tenancy/schema/tenants"
import {
  auditActorTypeEnum,
  auditOutcomeEnum,
  auditRiskLevelEnum,
  auditSourceChannelEnum,
  deploymentEnvironmentEnum,
} from "./audit-enums"

/**
 * Append-only audit evidence (`docs/AUDIT_ARCHITECTURE.md`).
 * No `updated_at` / `deleted_at` — corrections are new rows.
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),

    /**
     * Optional finance / statutory boundary. FK is to `legal_entities.id` (PK);
     * callers must ensure the entity belongs to `tenant_id`.
     */
    legalEntityId: uuid("legal_entity_id").references(() => legalEntities.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    actorType: auditActorTypeEnum("actor_type").default("unknown").notNull(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    /** Snapshot when the principal record may be removed or anonymized. */
    actorDisplay: text("actor_display"),
    actingAsUserId: uuid("acting_as_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    /** Stable dot-notation key, e.g. `invoice.posted`. */
    action: text("action").notNull(),
    actionCategory: text("action_category"),
    /** Denormalized from the action catalog at write time for reporting filters. */
    riskLevel: auditRiskLevelEnum("risk_level").default("low").notNull(),

    /**
     * Primary subject (polymorphic). DB column remains `entity_type` until a dedicated rename migration is applied.
     */
    subjectType: text("entity_type").notNull(),
    /** DB column `entity_id`. */
    subjectId: text("entity_id"),

    aggregateType: text("aggregate_type"),
    aggregateId: text("aggregate_id"),
    documentType: text("document_type"),
    documentId: text("document_id"),

    parentAuditId: uuid("parent_audit_id"),

    changes: jsonb("changes").$type<Record<string, unknown>>(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    outcome: auditOutcomeEnum("outcome").default("success").notNull(),
    errorCode: text("error_code"),

    sourceChannel: auditSourceChannelEnum("source_channel")
      .default("api")
      .notNull(),

    requestId: text("request_id"),
    traceId: text("trace_id"),
    correlationId: text("correlation_id"),
    causationId: text("causation_id"),
    commandId: text("command_id"),
    sessionId: text("session_id"),
    jobId: text("job_id"),
    batchId: text("batch_id"),
    idempotencyKey: text("idempotency_key"),

    reasonCode: text("reason_code"),
    reasonText: text("reason_text"),

    environment: deploymentEnvironmentEnum("environment")
      .default("production")
      .notNull(),

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    doctrineRef: text("doctrine_ref"),
    invariantRef: text("invariant_ref"),
    /** Governed resolution key when approvals / exceptions apply (`audit-resolution-catalog`). */
    resolutionRef: text("resolution_ref"),

    aiModelVersion: text("ai_model_version"),
    aiPromptVersion: text("ai_prompt_version"),

    retentionClass: text("retention_class"),
    legalHold: boolean("legal_hold").default(false).notNull(),

    /** When the business action occurred (user clock). Defaults to insert time if omitted by writer. */
    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    /**
     * When this row was persisted (system clock). DB column remains `created_at` until a rename migration.
     */
    recordedAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    /** Business-effective time (posting period, backdated ops). */
    effectiveAt: timestamp("effective_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => [
    foreignKey({
      name: "audit_logs_parent_fk",
      columns: [table.parentAuditId],
      foreignColumns: [table.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    index("audit_logs_tenant_created_at_idx").on(
      table.tenantId,
      table.recordedAt
    ),
    index("audit_logs_subject_idx").on(table.subjectType, table.subjectId),
    /** Tenant-scoped subject history (time-ordered) for investigation queries. */
    index("audit_logs_tenant_subject_recorded_idx").on(
      table.tenantId,
      table.subjectType,
      table.subjectId,
      table.recordedAt
    ),
    index("audit_logs_actor_user_idx").on(table.actorUserId),
    index("audit_logs_action_recorded_idx").on(table.action, table.recordedAt),
    index("audit_logs_request_idx").on(table.requestId),
    index("audit_logs_trace_idx").on(table.traceId),
    index("audit_logs_correlation_idx").on(table.correlationId),
    index("audit_logs_parent_idx").on(table.parentAuditId),
    index("audit_logs_legal_entity_idx").on(
      table.tenantId,
      table.legalEntityId
    ),
    index("audit_logs_risk_recorded_idx").on(table.riskLevel, table.recordedAt),
    index("audit_logs_outcome_recorded_idx").on(
      table.outcome,
      table.recordedAt
    ),
    index("audit_logs_causation_idx").on(table.causationId),
    index("audit_logs_command_idx").on(table.commandId),
    index("audit_logs_batch_idx").on(table.batchId),
    index("audit_logs_job_idx").on(table.jobId),
  ]
)

export type AuditLog = typeof auditLogs.$inferSelect
export type NewAuditLog = typeof auditLogs.$inferInsert
