import { isAuditActionKey } from "../contracts/audit-action-catalog"
import type { NewAuditLog } from "../../schema/governance/audit-logs.schema"

export function validateAuditLog(row: NewAuditLog): NewAuditLog {
  if (!row.tenantId) {
    throw new Error("tenantId is required")
  }

  if (!row.subjectType) {
    throw new Error("subjectType is required")
  }

  if (!isAuditActionKey(row.action)) {
    throw new Error(`Unknown audit action: ${row.action}`)
  }

  if (row.sourceChannel === "ui" && row.actorType === "unknown") {
    throw new Error("UI audit rows must not use actorType=unknown")
  }

  return row
}
