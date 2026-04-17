import type { NewAuditLog } from "../../schema/governance/audit-logs.schema"
import { type AuditActionKey } from "../contracts/audit-action-catalog"
import { validateAuditLog } from "./validate-audit-log"

export interface BuildAuditLogInput extends Omit<
  NewAuditLog,
  "id" | "recordedAt" | "occurredAt" | "action"
> {
  action: AuditActionKey
  occurredAt?: Date
  recordedAt?: Date
}

export function buildAuditLog(input: BuildAuditLogInput): NewAuditLog {
  const now = new Date()

  return validateAuditLog({
    ...input,
    metadata: input.metadata ?? {},
    occurredAt: input.occurredAt ?? now,
    recordedAt: input.recordedAt ?? now,
  })
}
