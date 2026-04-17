import { getAuditActionDefinition } from "../contracts/audit-action-catalog"
import {
  isAuditDoctrineKey,
  isAuditInvariantKey,
} from "../contracts/audit-doctrine-registry"
import { isAuditResolutionKey } from "../contracts/audit-resolution-catalog"
import type { NewAuditLog } from "../schema/audit-logs.schema"
import { AuditValidationError } from "../utils/audit-errors"

export function validateAuditLog(row: NewAuditLog): NewAuditLog {
  const actionDefinition = getAuditActionDefinition(row.action)

  if (row.actionCategory && row.actionCategory !== actionDefinition.category) {
    throw new AuditValidationError(
      `actionCategory mismatch for ${row.action}: expected ${actionDefinition.category}, got ${row.actionCategory}`
    )
  }

  if (row.riskLevel && row.riskLevel !== actionDefinition.risk) {
    throw new AuditValidationError(
      `riskLevel mismatch for ${row.action}: expected ${actionDefinition.risk}, got ${row.riskLevel}`
    )
  }

  if (actionDefinition.requiresReason && !row.reasonCode && !row.reasonText) {
    throw new AuditValidationError(
      `action ${row.action} requires reasonCode or reasonText`
    )
  }

  if (actionDefinition.requiresResolutionRef) {
    if (!row.resolutionRef) {
      throw new AuditValidationError(
        `action ${row.action} requires resolutionRef`
      )
    }
    if (!isAuditResolutionKey(row.resolutionRef)) {
      throw new AuditValidationError(
        `unknown resolutionRef: ${row.resolutionRef}`
      )
    }
  }

  if (row.doctrineRef && !isAuditDoctrineKey(row.doctrineRef)) {
    throw new AuditValidationError(`unknown doctrineRef: ${row.doctrineRef}`)
  }

  if (row.invariantRef && !isAuditInvariantKey(row.invariantRef)) {
    throw new AuditValidationError(`unknown invariantRef: ${row.invariantRef}`)
  }

  if (row.sourceChannel === "ui" && row.actorType === "unknown") {
    throw new AuditValidationError(
      "UI audit rows must not use actorType=unknown"
    )
  }

  if (!row.tenantId) {
    throw new AuditValidationError("tenantId is required")
  }

  if (!row.subjectType) {
    throw new AuditValidationError("subjectType is required")
  }

  return row
}
