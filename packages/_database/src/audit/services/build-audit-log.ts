import {
  getAuditActionDefinition,
  type AuditActionKey,
} from "../contracts/audit-action-catalog"
import {
  parseAuditChanges,
  parseAuditMetadata,
} from "../contracts/audit-payload-contract"
import { redactAuditPayload } from "../contracts/audit-redaction-policy"
import type { NewAuditLog } from "../schema/audit-logs.schema"
import { AuditValidationError } from "../utils/audit-errors"
import { validateAuditLog } from "./validate-audit-log"

function parseChangesPayload(value: unknown): NewAuditLog["changes"] {
  try {
    return parseAuditChanges(
      redactAuditPayload(value)
    ) as NewAuditLog["changes"]
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    throw new AuditValidationError(`invalid audit changes payload: ${message}`)
  }
}

function parseMetadataPayload(value: unknown): NewAuditLog["metadata"] {
  try {
    return parseAuditMetadata(
      redactAuditPayload(value)
    ) as NewAuditLog["metadata"]
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    throw new AuditValidationError(`invalid audit metadata payload: ${message}`)
  }
}

export interface BuildAuditLogInput extends Omit<
  NewAuditLog,
  | "actionCategory"
  | "riskLevel"
  | "changes"
  | "metadata"
  | "environment"
  | "legalHold"
> {
  action: AuditActionKey
  changes?: unknown
  metadata?: unknown
  environment?: NewAuditLog["environment"]
  legalHold?: boolean
}

/**
 * Builds a validated `NewAuditLog` row: merges catalog metadata, redacts + parses JSON payloads, runs validation.
 */
export function buildAuditLog(input: BuildAuditLogInput): NewAuditLog {
  const actionDefinition = getAuditActionDefinition(input.action)

  const row: NewAuditLog = {
    ...input,
    actionCategory: actionDefinition.category,
    riskLevel: actionDefinition.risk,
    changes: parseChangesPayload(input.changes),
    metadata: parseMetadataPayload(input.metadata),
    environment: input.environment ?? "production",
    legalHold: input.legalHold ?? false,
  }

  return validateAuditLog(row)
}
