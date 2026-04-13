import {
  auditInvariantErrorMap,
  type AuditInvariantErrorOptions,
} from "./audit-invariant-error-map"

/**
 * ASSERT AUDIT INVARIANTS
 *
 * Runtime helpers for the **platform-default audit baseline** only: identity,
 * scope, delegation, privileged audibility, and append-only shape. Failures throw
 * via {@link auditInvariantErrorMap} (structured `AuditError`), not ad-hoc
 * `Error` strings.
 *
 * ## Per-assertion style
 *
 * Use when you want **clear local intent**—only the checks relevant to that line
 * of code:
 *
 * - {@link assertActorForUserAction}
 * - {@link assertDelegationMustBeExplicit}
 * - {@link assertTenantForGovernedWrite}
 * - {@link assertLegalEntityWhenApplicable}
 * - {@link assertPrivilegedActionMustBeAudited}
 * - {@link assertNoInPlaceCorrection}
 *
 * Pass the same `options.context` shape everywhere — prefer `buildAuditContext`
 * (`utils/build-audit-context`) so command handlers do not rebuild context literals by hand.
 *
 * ## Baseline bundle style
 *
 * Use {@link assertDefaultAuditBaseline} at **command boundaries** when you want
 * the full default package enforced in one call.
 *
 * ## Predictable failure order (`assertDefaultAuditBaseline`)
 *
 * Order is stable so foundational identity/scope problems surface before
 * downstream audit-shape failures:
 *
 * 1. Actor present for user-originated work
 * 2. Delegation explicit when acting-as is set
 * 3. Tenant present for governed writes
 * 4. Legal entity when applicable
 * 5. Privileged actions must be audited when flagged
 * 6. No in-place correction (append-only evidence)
 *
 * ## Design constraints
 *
 * - **Baseline-only** — no feature policy leakage, no accounting-specific
 *   branching, no truth-engine entanglement.
 * - **Composes** — mix single assertions and the bundle as needed.
 */

export type AssertAuditInvariantOptions = AuditInvariantErrorOptions

export interface AssertActorForUserActionInput {
  actorUserId?: string | null
  options?: AssertAuditInvariantOptions
}

export interface AssertDelegationExplicitInput {
  actorUserId?: string | null
  actingAsUserId?: string | null
  options?: AssertAuditInvariantOptions
}

export interface AssertTenantForGovernedWriteInput {
  tenantId?: string | null
  options?: AssertAuditInvariantOptions
}

export interface AssertLegalEntityWhenApplicableInput {
  requiresLegalEntity: boolean
  legalEntityId?: string | null
  options?: AssertAuditInvariantOptions
}

export interface AssertPrivilegedActionAuditedInput {
  isPrivilegedAction: boolean
  auditWillBeCreated: boolean
  options?: AssertAuditInvariantOptions
}

export interface AssertNoInPlaceCorrectionInput {
  isInPlaceMutation: boolean
  options?: AssertAuditInvariantOptions
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export function assertActorForUserAction(
  input: AssertActorForUserActionInput
): void {
  if (hasText(input.actorUserId)) {
    return
  }

  throw auditInvariantErrorMap.actorRequiredForUserAction(input.options)
}

export function assertDelegationMustBeExplicit(
  input: AssertDelegationExplicitInput
): void {
  const hasDelegatedExecution = hasText(input.actingAsUserId)

  if (!hasDelegatedExecution) {
    return
  }

  if (hasText(input.actorUserId)) {
    return
  }

  throw auditInvariantErrorMap.delegationMustBeExplicit(input.options)
}

export function assertTenantForGovernedWrite(
  input: AssertTenantForGovernedWriteInput
): void {
  if (hasText(input.tenantId)) {
    return
  }

  throw auditInvariantErrorMap.tenantRequiredForGovernedWrite(input.options)
}

export function assertLegalEntityWhenApplicable(
  input: AssertLegalEntityWhenApplicableInput
): void {
  if (!input.requiresLegalEntity) {
    return
  }

  if (hasText(input.legalEntityId)) {
    return
  }

  throw auditInvariantErrorMap.legalEntityRequiredWhenApplicable(input.options)
}

export function assertPrivilegedActionMustBeAudited(
  input: AssertPrivilegedActionAuditedInput
): void {
  if (!input.isPrivilegedAction) {
    return
  }

  if (input.auditWillBeCreated) {
    return
  }

  throw auditInvariantErrorMap.privilegedActionMustBeAudited(input.options)
}

export function assertNoInPlaceCorrection(
  input: AssertNoInPlaceCorrectionInput
): void {
  if (!input.isInPlaceMutation) {
    return
  }

  throw auditInvariantErrorMap.noInPlaceCorrection(input.options)
}

export interface AssertDefaultAuditBaselineInput {
  actorUserId?: string | null
  actingAsUserId?: string | null
  tenantId?: string | null
  requiresLegalEntity?: boolean
  legalEntityId?: string | null
  isPrivilegedAction?: boolean
  auditWillBeCreated?: boolean
  isInPlaceMutation?: boolean
  options?: AssertAuditInvariantOptions
}

/**
 * Runs the platform-default baseline assertions in a predictable order.
 * Order matters because actor/scope failures are usually more actionable than
 * downstream privileged/audit-shape failures.
 */
export function assertDefaultAuditBaseline(
  input: AssertDefaultAuditBaselineInput
): void {
  assertActorForUserAction({
    actorUserId: input.actorUserId,
    options: input.options,
  })

  assertDelegationMustBeExplicit({
    actorUserId: input.actorUserId,
    actingAsUserId: input.actingAsUserId,
    options: input.options,
  })

  assertTenantForGovernedWrite({
    tenantId: input.tenantId,
    options: input.options,
  })

  assertLegalEntityWhenApplicable({
    requiresLegalEntity: input.requiresLegalEntity ?? false,
    legalEntityId: input.legalEntityId,
    options: input.options,
  })

  assertPrivilegedActionMustBeAudited({
    isPrivilegedAction: input.isPrivilegedAction ?? false,
    auditWillBeCreated: input.auditWillBeCreated ?? true,
    options: input.options,
  })

  assertNoInPlaceCorrection({
    isInPlaceMutation: input.isInPlaceMutation ?? false,
    options: input.options,
  })
}
