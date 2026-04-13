import {
  createAuditInvariantViolation,
  type AuditError,
  type AuditErrorContext,
} from "../utils/audit-error-factory"

/**
 * AUDIT INVARIANT ERROR MAP
 *
 * Canonical invariant-to-error mapping helpers for the platform-default audit baseline.
 * Scope: centralizes construction of governed audit invariant violations so runtime
 * callers do not repeat invariant keys, default messages, or remediation language.
 * Intent: reduce drift at call sites, preserve stable verdict semantics, and provide
 * a single mapping layer that can later be enforced by CI and reused by APIs/logging.
 * Constraints: keep this module platform-default only; do not introduce feature-
 * specific truth logic, accounting-specific invariants, or domain workflow branching.
 */

export interface AuditInvariantErrorOptions {
  message?: string
  reason?: string
  remediation?: string
  context?: AuditErrorContext
  cause?: unknown
}

export interface AuditInvariantErrorMap {
  noInPlaceCorrection(options?: AuditInvariantErrorOptions): AuditError
  actorRequiredForUserAction(options?: AuditInvariantErrorOptions): AuditError
  delegationMustBeExplicit(options?: AuditInvariantErrorOptions): AuditError
  tenantRequiredForGovernedWrite(
    options?: AuditInvariantErrorOptions
  ): AuditError
  legalEntityRequiredWhenApplicable(
    options?: AuditInvariantErrorOptions
  ): AuditError
  privilegedActionMustBeAudited(
    options?: AuditInvariantErrorOptions
  ): AuditError
}

function violation(
  invariantKey:
    | "invariant.audit.no-in-place-correction"
    | "invariant.identity.actor-required-for-user-action"
    | "invariant.identity.delegation-must-be-explicit"
    | "invariant.scope.tenant-required-for-governed-write"
    | "invariant.scope.legal-entity-required-when-applicable"
    | "invariant.administration.privileged-action-must-be-audited",
  options?: AuditInvariantErrorOptions
): AuditError {
  return createAuditInvariantViolation({
    invariantKey,
    message: options?.message,
    reason: options?.reason,
    remediation: options?.remediation,
    context: options?.context,
    cause: options?.cause,
  })
}

export const auditInvariantErrorMap: AuditInvariantErrorMap = {
  noInPlaceCorrection(options) {
    return violation("invariant.audit.no-in-place-correction", {
      remediation:
        options?.remediation ??
        "Do not overwrite existing audit evidence. Record the correction as additive follow-up evidence linked to the prior record.",
      ...options,
    })
  },

  actorRequiredForUserAction(options) {
    return violation("invariant.identity.actor-required-for-user-action", {
      remediation:
        options?.remediation ??
        "Bind a resolvable actor identity before accepting the governed user action.",
      ...options,
    })
  },

  delegationMustBeExplicit(options) {
    return violation("invariant.identity.delegation-must-be-explicit", {
      remediation:
        options?.remediation ??
        "Preserve both the direct actor and the delegated or represented identity in the audit context.",
      ...options,
    })
  },

  tenantRequiredForGovernedWrite(options) {
    return violation("invariant.scope.tenant-required-for-governed-write", {
      remediation:
        options?.remediation ??
        "Bind tenant scope before executing the governed write operation.",
      ...options,
    })
  },

  legalEntityRequiredWhenApplicable(options) {
    return violation("invariant.scope.legal-entity-required-when-applicable", {
      remediation:
        options?.remediation ??
        "Provide and preserve legal-entity scope for operations that require legal-entity-bounded evidence.",
      ...options,
    })
  },

  privilegedActionMustBeAudited(options) {
    return violation(
      "invariant.administration.privileged-action-must-be-audited",
      {
        remediation:
          options?.remediation ??
          "Ensure privileged execution paths create governed audit evidence before the operation is allowed to proceed.",
        ...options,
      }
    )
  },
} as const

export function getAuditInvariantErrorMap(): AuditInvariantErrorMap {
  return auditInvariantErrorMap
}
