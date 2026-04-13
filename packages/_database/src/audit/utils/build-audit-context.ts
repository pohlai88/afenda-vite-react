import {
  normalizeAuditErrorContext,
  type AuditErrorContext,
} from "./audit-error-factory"

/**
 * Command-handler input for a consistent {@link AuditErrorContext}.
 * Keeps operation (and optional scope/entity fields) in one place so assertion
 * helpers do not rebuild `context: { ... }` literals by hand.
 */
export type BuildAuditContextInput = {
  /** Stable operation name, e.g. `journal-entry.create`. */
  operation: string
  tenantId?: string | null
  actorUserId?: string | null
  actingAsUserId?: string | null
  legalEntityId?: string | null
  entityType?: string | null
  entityId?: string | null
  field?: string | null
  detail?: string | null
  metadata?: Record<string, unknown> | null
}

/**
 * Returns a normalized {@link AuditErrorContext} for `assert*` / audit error options.
 * Uses the same trimming rules as `createAuditInvariantViolation`.
 */
export function buildAuditContext(
  input: BuildAuditContextInput
): AuditErrorContext {
  const raw: AuditErrorContext = {
    operation: input.operation,
    tenantId: input.tenantId ?? null,
    actorUserId: input.actorUserId ?? null,
    actingAsUserId: input.actingAsUserId ?? null,
    legalEntityId: input.legalEntityId ?? null,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    field: input.field ?? null,
    detail: input.detail ?? null,
    metadata: input.metadata ?? null,
  }
  return normalizeAuditErrorContext(raw) ?? raw
}
