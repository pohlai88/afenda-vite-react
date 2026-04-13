import {
  getAuditDoctrineDefinition,
  getAuditInvariantDefinition,
  type AuditDoctrineKey,
  type AuditInvariantKey,
  type AuditInvariantSeverity,
} from "../contracts/audit-doctrine-registry"

/**
 * AUDIT ERROR FACTORY
 *
 * Structured verdict-oriented audit errors for the platform-default audit baseline.
 * Scope: converts governed audit invariant failures into explicit runtime errors with
 * doctrine linkage, severity, operator-facing message, and machine-readable metadata.
 * Intent: provide stronger audit failure semantics than conventional ERP generic errors
 * while remaining platform-default and non-feature-specific.
 * Constraints: keep payloads stable, deterministic, and suitable for logging, APIs,
 * and future mapping layers; do not introduce feature-domain truth logic here.
 */

/** Discriminator on `AuditError.payload.code` (distinct from spec ids in `audit-error-code-registry`). */
export const auditPayloadCodeValues = [
  "AUDIT_INVARIANT_VIOLATION",
  "AUDIT_REGISTRY_RESOLUTION_FAILURE",
] as const

export type AuditPayloadCode = (typeof auditPayloadCodeValues)[number]

export interface AuditErrorContext {
  actorUserId?: string | null
  actingAsUserId?: string | null
  tenantId?: string | null
  legalEntityId?: string | null
  operation?: string | null
  entityType?: string | null
  entityId?: string | null
  field?: string | null
  detail?: string | null
  metadata?: Record<string, unknown> | null
}

export interface AuditInvariantViolationInput {
  invariantKey: AuditInvariantKey
  message?: string
  reason?: string
  remediation?: string
  context?: AuditErrorContext
  cause?: unknown
}

export interface AuditInvariantViolationPayload {
  code: "AUDIT_INVARIANT_VIOLATION"
  invariantKey: AuditInvariantKey
  doctrineKey: AuditDoctrineKey
  severity: AuditInvariantSeverity
  category: string
  doctrineDescription: string
  invariantDescription: string
  message: string
  reason: string
  remediation: string | null
  context: AuditErrorContext | null
}

export interface AuditRegistryResolutionFailurePayload {
  code: "AUDIT_REGISTRY_RESOLUTION_FAILURE"
  message: string
  reason: string
  context: AuditErrorContext | null
}

export type AuditErrorPayload =
  | AuditInvariantViolationPayload
  | AuditRegistryResolutionFailurePayload

export class AuditError extends Error {
  readonly code: AuditPayloadCode
  readonly payload: AuditErrorPayload
  override readonly cause?: unknown

  constructor(payload: AuditErrorPayload, cause?: unknown) {
    super(payload.message)
    this.name = "AuditError"
    this.code = payload.code
    this.payload = payload
    this.cause = cause
  }
}

function normalizeOptionalText(value: string | undefined): string | null {
  if (value == null) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Trims string fields and drops all-empty contexts. Used by violation creation and
 * `buildAuditContext` so command handlers and errors share one shape.
 */
export function normalizeAuditErrorContext(
  context: AuditErrorContext | undefined
): AuditErrorContext | null {
  if (!context) {
    return null
  }

  const normalized: AuditErrorContext = {
    actorUserId: context.actorUserId ?? null,
    actingAsUserId: context.actingAsUserId ?? null,
    tenantId: context.tenantId ?? null,
    legalEntityId: context.legalEntityId ?? null,
    operation: normalizeOptionalText(context.operation ?? undefined),
    entityType: normalizeOptionalText(context.entityType ?? undefined),
    entityId: normalizeOptionalText(context.entityId ?? undefined),
    field: normalizeOptionalText(context.field ?? undefined),
    detail: normalizeOptionalText(context.detail ?? undefined),
    metadata: context.metadata ?? null,
  }

  const hasMeaningfulValue = Object.values(normalized).some(
    (value) => value !== null && value !== undefined
  )

  return hasMeaningfulValue ? normalized : null
}

function buildDefaultViolationMessage(
  invariantKey: AuditInvariantKey,
  doctrineKey: AuditDoctrineKey,
  severity: AuditInvariantSeverity
): string {
  return [
    `Audit invariant violated: ${invariantKey}.`,
    `Governing doctrine: ${doctrineKey}.`,
    `Severity: ${severity}.`,
  ].join(" ")
}

function buildDefaultViolationReason(
  invariantDescription: string,
  doctrineDescription: string
): string {
  return [
    invariantDescription,
    `Governing doctrine rationale: ${doctrineDescription}`,
  ].join(" ")
}

export function createAuditInvariantViolation(
  input: AuditInvariantViolationInput
): AuditError {
  try {
    const invariant = getAuditInvariantDefinition(input.invariantKey)
    const doctrine = getAuditDoctrineDefinition(invariant.doctrineRef)

    const payload: AuditInvariantViolationPayload = {
      code: "AUDIT_INVARIANT_VIOLATION",
      invariantKey: input.invariantKey,
      doctrineKey: invariant.doctrineRef,
      severity: invariant.severity,
      category: doctrine.category,
      doctrineDescription: doctrine.description,
      invariantDescription: invariant.description,
      message:
        normalizeOptionalText(input.message) ??
        buildDefaultViolationMessage(
          input.invariantKey,
          invariant.doctrineRef,
          invariant.severity
        ),
      reason:
        normalizeOptionalText(input.reason) ??
        buildDefaultViolationReason(
          invariant.description,
          doctrine.description
        ),
      remediation: normalizeOptionalText(input.remediation),
      context: normalizeAuditErrorContext(input.context),
    }

    return new AuditError(payload, input.cause)
  } catch (cause) {
    return createAuditRegistryResolutionFailure({
      message:
        "Audit registry resolution failed while constructing an audit invariant violation.",
      reason:
        "The requested invariant or its governing doctrine could not be resolved from the default audit registry.",
      context: normalizeAuditErrorContext(input.context),
      cause,
    })
  }
}

export function createAuditRegistryResolutionFailure(input: {
  message?: string
  reason?: string
  context?: AuditErrorContext | null
  cause?: unknown
}): AuditError {
  const context =
    input.context == null ? null : normalizeAuditErrorContext(input.context)

  const payload: AuditRegistryResolutionFailurePayload = {
    code: "AUDIT_REGISTRY_RESOLUTION_FAILURE",
    message:
      normalizeOptionalText(input.message) ??
      "Audit registry resolution failure.",
    reason:
      normalizeOptionalText(input.reason) ??
      "The audit doctrine or invariant registry could not be resolved safely.",
    context,
  }

  return new AuditError(payload, input.cause)
}

export function isAuditError(value: unknown): value is AuditError {
  return value instanceof AuditError
}

export function isAuditInvariantViolationError(
  value: unknown
): value is AuditError & {
  payload: AuditInvariantViolationPayload
} {
  return (
    value instanceof AuditError &&
    value.payload.code === "AUDIT_INVARIANT_VIOLATION"
  )
}

export function toAuditErrorPayload(value: unknown): AuditErrorPayload | null {
  if (!isAuditError(value)) {
    return null
  }

  return value.payload
}

export function formatAuditErrorForLog(error: AuditError): string {
  const { payload } = error

  if (payload.code === "AUDIT_INVARIANT_VIOLATION") {
    return JSON.stringify(
      {
        name: error.name,
        code: payload.code,
        message: payload.message,
        invariantKey: payload.invariantKey,
        doctrineKey: payload.doctrineKey,
        severity: payload.severity,
        category: payload.category,
        reason: payload.reason,
        remediation: payload.remediation,
        context: payload.context,
      },
      null,
      2
    )
  }

  return JSON.stringify(
    {
      name: error.name,
      code: payload.code,
      message: payload.message,
      reason: payload.reason,
      context: payload.context,
    },
    null,
    2
  )
}
