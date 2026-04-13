import {
  getAuditErrorCodeSpec,
  type AuditErrorCode,
} from "../contracts/audit-error-code-registry"
import {
  createAuditInvariantViolation,
  type AuditError,
  type AuditInvariantViolationInput,
} from "./audit-error-factory"

export type CreateAuditInvariantViolationFromSpecCodeOptions = Omit<
  AuditInvariantViolationInput,
  "invariantKey"
>

/**
 * Resolves a stable spec code (e.g. `INV-FX-001`) from `auditErrorCodeRegistry`
 * and builds an invariant violation without hardcoding `invariantKey` at the call site.
 */
export function createAuditInvariantViolationFromSpecCode(
  specCode: AuditErrorCode,
  options?: CreateAuditInvariantViolationFromSpecCodeOptions
): AuditError {
  const spec = getAuditErrorCodeSpec(specCode)
  return createAuditInvariantViolation({
    ...options,
    invariantKey: spec.invariantKey,
  })
}
