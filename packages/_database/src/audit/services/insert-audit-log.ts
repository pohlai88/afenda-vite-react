import type { DatabaseClient } from "../../client"
import type { BuildAuditLogInput } from "./build-audit-log"
import { buildAuditLog } from "./build-audit-log"
import {
  auditLogs,
  type AuditLog,
  type NewAuditLog,
} from "../schema/audit-logs"
import { validateAuditLog } from "./validate-audit-log"

export type InsertAuditLogInput = Omit<
  NewAuditLog,
  "id" | "recordedAt" | "occurredAt"
> &
  Partial<Pick<NewAuditLog, "id" | "recordedAt" | "occurredAt">>

/**
 * Persists one append-only audit row. Sets `recordedAt` / `occurredAt` when omitted,
 * then runs `validateAuditLog` before insert. Prefer `insertGovernedAuditLog` for
 * application emission (catalog merge + payload parsing).
 */
export async function insertAuditLog(
  db: DatabaseClient,
  input: InsertAuditLogInput
): Promise<AuditLog> {
  const now = new Date()
  const row: NewAuditLog = {
    ...input,
    occurredAt: input.occurredAt ?? now,
    recordedAt: input.recordedAt ?? now,
  }
  const validated = validateAuditLog(row)
  const [created] = await db.insert(auditLogs).values(validated).returning()
  if (created === undefined) {
    throw new Error("insertAuditLog: expected exactly one row from returning()")
  }
  return created
}

/**
 * Builds from catalog + validation, then inserts. Prefer this for application-emitted audit.
 */
export async function insertGovernedAuditLog(
  db: DatabaseClient,
  input: BuildAuditLogInput
): Promise<AuditLog> {
  const row = buildAuditLog(input)
  return insertAuditLog(db, row)
}
