import {
  getAuditRetentionDefinition,
  type AuditRetentionClass,
} from "../contracts/audit-retention-policy"
import type { AuditLog } from "../schema/audit-logs"

export interface AuditRetentionDisposition {
  retentionClass: AuditRetentionClass
  expiresAt: Date | null
  archiveRequired: boolean
  purgeAllowed: boolean
  blockedByLegalHold: boolean
  eligibleForArchive: boolean
  eligibleForPurge: boolean
}

function addDays(base: Date, days: number): Date {
  const result = new Date(base)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

export function getAuditRetentionDisposition(
  row: Pick<AuditLog, "retentionClass" | "legalHold" | "recordedAt">
): AuditRetentionDisposition {
  const retentionClass = (row.retentionClass ??
    "audit-standard") as AuditRetentionClass
  const definition = getAuditRetentionDefinition(retentionClass)

  const expiresAt =
    definition.retentionDays == null
      ? null
      : addDays(row.recordedAt, definition.retentionDays)

  const now = new Date()
  const expired = expiresAt != null && expiresAt <= now
  const blockedByLegalHold =
    definition.legalHoldBlocksDisposition && row.legalHold

  return {
    retentionClass,
    expiresAt,
    archiveRequired: definition.archiveRequired,
    purgeAllowed: definition.purgeAllowed,
    blockedByLegalHold,
    eligibleForArchive:
      !blockedByLegalHold && !!definition.archiveRequired && expired,
    eligibleForPurge:
      !blockedByLegalHold && !!definition.purgeAllowed && expired,
  }
}
