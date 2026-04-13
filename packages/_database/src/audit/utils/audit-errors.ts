/**
 * Row validation and legacy insert-path errors (`AuditValidationError`).
 *
 * For governed baseline invariant failures with doctrine linkage, prefer
 * `AuditError` from `audit-error-factory` (via `audit-invariant-error-map` / `assert-audit-invariants`).
 */

/** Default `invariantKey` when throwing with a message string only (legacy / simple paths). */
export const AUDIT_VALIDATION_INVARIANT_GENERIC = "audit.validation" as const

/** V8-only; hoisted once (single-arg form avoids ctor overload typing issues). */
const captureStackTrace = (
  Error as { captureStackTrace?: (target: object) => void }
).captureStackTrace

export type AuditValidationResolution = {
  code: string
  message: string
  action?: string
}

export type AuditValidationContext = {
  who?: string
  what?: string
  when?: string
  where?: string
  why?: string
  how?: string
}

export type AuditValidationErrorParams = {
  message: string
  /** Generator-aligned stable id (e.g. INV-FX-001); set by factory helpers when used. */
  specCode?: string
  invariantKey: string
  doctrineRef?: string
  resolution?: AuditValidationResolution
  severity?: "blocking" | "warning"
  context?: AuditValidationContext
  causationId?: string
  correlationId?: string
  parentAuditId?: string
  payload?: Record<string, unknown>
  /** Chained underlying error (ES2022 `Error.cause`). */
  cause?: unknown
}

function normalizeAuditValidationInput(
  input: string | AuditValidationErrorParams
): AuditValidationErrorParams {
  return typeof input === "string"
    ? { message: input, invariantKey: AUDIT_VALIDATION_INVARIANT_GENERIC }
    : input
}

function errorCauseSnapshot(cause: unknown): unknown {
  if (cause instanceof Error) {
    return {
      name: cause.name,
      message: cause.message,
      ...(cause.stack !== undefined ? { stack: cause.stack } : {}),
    }
  }
  return cause
}

/**
 * Governed audit validation failure before persist.
 * Supports a plain message (simple paths) or a structured payload (traceability / replay).
 */
export class AuditValidationError extends Error {
  readonly code = "AUDIT_VALIDATION" as const

  readonly specCode?: string
  readonly invariantKey: string
  readonly doctrineRef?: string
  readonly resolution?: AuditValidationResolution
  readonly severity: "blocking" | "warning"
  readonly context?: AuditValidationContext
  readonly causationId?: string
  readonly correlationId?: string
  readonly parentAuditId?: string
  readonly payload?: Record<string, unknown>

  constructor(message: string)
  constructor(params: AuditValidationErrorParams)
  constructor(input: string | AuditValidationErrorParams) {
    const p = normalizeAuditValidationInput(input)
    const hasCause = p.cause !== undefined
    super(p.message, hasCause ? { cause: p.cause } : undefined)
    this.name = "AuditValidationError"
    Object.setPrototypeOf(this, new.target.prototype)

    captureStackTrace?.(this)

    const {
      specCode,
      invariantKey,
      doctrineRef,
      resolution,
      severity = "blocking",
      context,
      causationId,
      correlationId,
      parentAuditId,
      payload,
    } = p

    this.specCode = specCode
    this.invariantKey = invariantKey
    this.doctrineRef = doctrineRef
    this.resolution = resolution
    this.severity = severity
    this.context = context
    this.causationId = causationId
    this.correlationId = correlationId
    this.parentAuditId = parentAuditId
    this.payload = payload
  }

  /**
   * Serializable snapshot for `JSON.stringify` / log pipelines (native `Error` drops custom fields).
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      ...(this.stack !== undefined ? { stack: this.stack } : {}),
      ...(this.specCode !== undefined ? { specCode: this.specCode } : {}),
      invariantKey: this.invariantKey,
      ...(this.doctrineRef !== undefined
        ? { doctrineRef: this.doctrineRef }
        : {}),
      ...(this.resolution !== undefined ? { resolution: this.resolution } : {}),
      severity: this.severity,
      ...(this.context !== undefined ? { context: this.context } : {}),
      ...(this.causationId !== undefined
        ? { causationId: this.causationId }
        : {}),
      ...(this.correlationId !== undefined
        ? { correlationId: this.correlationId }
        : {}),
      ...(this.parentAuditId !== undefined
        ? { parentAuditId: this.parentAuditId }
        : {}),
      ...(this.payload !== undefined ? { payload: this.payload } : {}),
      ...(this.cause !== undefined
        ? { cause: errorCauseSnapshot(this.cause) }
        : {}),
    }
  }
}
