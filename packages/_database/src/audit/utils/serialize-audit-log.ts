import type { AuditAdminView } from "../contracts/audit-admin-view-contract"
import type { AuditLog } from "../schema/audit-logs"

import { jsonWithIsoDates } from "./audit-json"

export { formatAuditErrorForLog as serializeAuditErrorForLog } from "./audit-error-factory"

/**
 * Stable JSON for exports, logs, and cross-service boundaries (Dates → ISO strings).
 */
export function serializeAuditLog(row: AuditLog): string {
  return jsonWithIsoDates(row)
}

/** Serialize admin read-model rows (same date handling as `serializeAuditLog`). */
export function serializeAuditAdminView(row: AuditAdminView): string {
  return jsonWithIsoDates(row)
}

/**
 * Parse serialized audit JSON back into a plain object (dates remain strings unless you revive them).
 */
export function parseSerializedAuditLog(json: string): unknown {
  return JSON.parse(json) as unknown
}
