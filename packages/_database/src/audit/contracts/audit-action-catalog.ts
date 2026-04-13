/**
 * AUDIT ACTION CATALOG
 *
 * Canonical audit action registry.
 * Every emitted action key must come from this catalog or a generated extension surface.
 */

export type AuditActionRisk = "low" | "medium" | "high" | "critical"

export interface AuditActionDefinition {
  key: string
  category: string
  risk: AuditActionRisk
  truthImpact: boolean
  requiresReason: boolean
  requiresResolutionRef: boolean
  description: string
}

export const auditActionCatalog = {
  "auth.login.succeeded": {
    key: "auth.login.succeeded",
    category: "authentication",
    risk: "medium",
    truthImpact: false,
    requiresReason: false,
    requiresResolutionRef: false,
    description: "User authentication succeeded.",
  },
  "auth.login.failed": {
    key: "auth.login.failed",
    category: "authentication",
    risk: "high",
    truthImpact: false,
    requiresReason: false,
    requiresResolutionRef: false,
    description: "User authentication failed.",
  },
  "invoice.created": {
    key: "invoice.created",
    category: "billing",
    risk: "medium",
    truthImpact: true,
    requiresReason: false,
    requiresResolutionRef: false,
    description: "Invoice record was created.",
  },
  "invoice.posted": {
    key: "invoice.posted",
    category: "billing",
    risk: "high",
    truthImpact: true,
    requiresReason: false,
    requiresResolutionRef: true,
    description: "Invoice was posted into accountable business state.",
  },
  "audit.redaction.applied": {
    key: "audit.redaction.applied",
    category: "audit-governance",
    risk: "critical",
    truthImpact: true,
    requiresReason: true,
    requiresResolutionRef: true,
    description: "Governed redaction was applied to audit evidence.",
  },
  "shell.interaction.recorded": {
    key: "shell.interaction.recorded",
    category: "shell-ui",
    risk: "low",
    truthImpact: false,
    requiresReason: false,
    requiresResolutionRef: false,
    description:
      "UI shell interaction evidence only (navigation, command invocation surface) — not business-domain truth.",
  },
} as const satisfies Record<string, AuditActionDefinition>

export type AuditActionKey = keyof typeof auditActionCatalog

export function isAuditActionKey(value: string): value is AuditActionKey {
  return value in auditActionCatalog
}

export function getAuditActionDefinition(
  action: string
): AuditActionDefinition {
  if (!isAuditActionKey(action)) {
    throw new Error(`Unknown audit action: ${action}`)
  }
  return auditActionCatalog[action]
}
