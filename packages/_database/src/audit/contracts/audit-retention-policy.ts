/**
 * AUDIT RETENTION POLICY
 *
 * Canonical retention classes for audit evidence.
 * These are policy classes; actual purge/archive execution is handled separately.
 */

export interface AuditRetentionDefinition {
  key: string
  description: string
  retentionDays: number | null
  archiveRequired: boolean
  purgeAllowed: boolean
  legalHoldBlocksDisposition: boolean
}

export const auditRetentionPolicy = {
  "audit-short": {
    key: "audit-short",
    description: "Short-lived operational audit evidence.",
    retentionDays: 90,
    archiveRequired: false,
    purgeAllowed: true,
    legalHoldBlocksDisposition: true,
  },
  "audit-standard": {
    key: "audit-standard",
    description: "Default enterprise audit evidence.",
    retentionDays: 365 * 3,
    archiveRequired: true,
    purgeAllowed: true,
    legalHoldBlocksDisposition: true,
  },
  "audit-finance": {
    key: "audit-finance",
    description: "Finance-affecting audit evidence.",
    retentionDays: 365 * 7,
    archiveRequired: true,
    purgeAllowed: true,
    legalHoldBlocksDisposition: true,
  },
  "audit-regulated": {
    key: "audit-regulated",
    description: "Regulated or compliance-sensitive evidence.",
    retentionDays: 365 * 10,
    archiveRequired: true,
    purgeAllowed: true,
    legalHoldBlocksDisposition: true,
  },
  "audit-indefinite": {
    key: "audit-indefinite",
    description: "Indefinite retention until explicit governed review.",
    retentionDays: null,
    archiveRequired: true,
    purgeAllowed: false,
    legalHoldBlocksDisposition: true,
  },
} as const

export type AuditRetentionClass = keyof typeof auditRetentionPolicy

export function isAuditRetentionClass(
  value: string
): value is AuditRetentionClass {
  return value in auditRetentionPolicy
}

export function getAuditRetentionDefinition(
  value: string
): AuditRetentionDefinition {
  if (!isAuditRetentionClass(value)) {
    throw new Error(`Unknown audit retentionClass: ${value}`)
  }
  return auditRetentionPolicy[value]
}
