import type { DatabaseClient } from "../../client"
import {
  auditLogs,
  type AuditLog,
  type NewAuditLog,
} from "../../schema/governance/audit-logs.schema"
import { type BuildAuditLogInput, buildAuditLog } from "./build-audit-log"
import { validateAuditLog } from "./validate-audit-log"

export type InsertAuditLogInput = Omit<
  NewAuditLog,
  "id" | "recordedAt" | "occurredAt"
> &
  Partial<Pick<NewAuditLog, "id" | "recordedAt" | "occurredAt">>

export async function insertAuditLog(
  db: DatabaseClient,
  input: InsertAuditLogInput
): Promise<AuditLog> {
  const now = new Date()
  const row = validateAuditLog({
    ...input,
    metadata: input.metadata ?? {},
    occurredAt: input.occurredAt ?? now,
    recordedAt: input.recordedAt ?? now,
  })

  const [created] = await db.insert(auditLogs).values(row).returning()
  if (!created) {
    throw new Error("insertAuditLog: expected one row from returning()")
  }
  return created
}

export async function insertGovernedAuditLog(
  db: DatabaseClient,
  input: BuildAuditLogInput
): Promise<AuditLog> {
  return insertAuditLog(db, buildAuditLog(input))
}
