/**
 * AUDIT RESOLUTION CATALOG
 *
 * Canonical registry for remediation, override, and approval outcomes that
 * explain how a rule violation, exception, or governed deviation was resolved.
 */

export interface AuditResolutionDefinition {
  key: string
  category: string
  description: string
  requiresApproval: boolean
  truthImpact: boolean
}

export const auditResolutionCatalog = {
  "resolution.none": {
    key: "resolution.none",
    category: "default",
    description: "No explicit resolution was required.",
    requiresApproval: false,
    truthImpact: false,
  },
  "resolution.invoice.posting-approved": {
    key: "resolution.invoice.posting-approved",
    category: "approval",
    description: "Invoice posting proceeded under approved governed flow.",
    requiresApproval: true,
    truthImpact: true,
  },
  "resolution.invariant.override-approved": {
    key: "resolution.invariant.override-approved",
    category: "override",
    description: "An invariant exception was explicitly approved.",
    requiresApproval: true,
    truthImpact: true,
  },
  "resolution.audit.redaction-approved": {
    key: "resolution.audit.redaction-approved",
    category: "privacy-governance",
    description:
      "Audit redaction was approved under governed privacy procedure.",
    requiresApproval: true,
    truthImpact: true,
  },
  "resolution.reconciliation.adjustment-applied": {
    key: "resolution.reconciliation.adjustment-applied",
    category: "reconciliation",
    description:
      "A reconciliation discrepancy was resolved with an approved adjustment.",
    requiresApproval: true,
    truthImpact: true,
  },
} as const satisfies Record<string, AuditResolutionDefinition>

export type AuditResolutionKey = keyof typeof auditResolutionCatalog

export function isAuditResolutionKey(
  value: string
): value is AuditResolutionKey {
  return value in auditResolutionCatalog
}

export function getAuditResolutionDefinition(
  resolutionRef: string
): AuditResolutionDefinition {
  if (!isAuditResolutionKey(resolutionRef)) {
    throw new Error(`Unknown audit resolutionRef: ${resolutionRef}`)
  }
  return auditResolutionCatalog[resolutionRef]
}
