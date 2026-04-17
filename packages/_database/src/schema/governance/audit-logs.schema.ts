import {
  foreignKey,
  index,
  jsonb,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { tenantMemberships } from "../iam/tenant-memberships.schema"
import { userAccounts } from "../iam/user-accounts.schema"
import { tenants } from "../mdm/tenants.schema"
import { governance } from "./_schema"
import {
  auditActorTypeEnum,
  auditOutcomeEnum,
  auditSourceChannelEnum,
  deploymentEnvironmentEnum,
} from "./audit-enums.schema"

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
      .default({})
      .notNull(),
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
