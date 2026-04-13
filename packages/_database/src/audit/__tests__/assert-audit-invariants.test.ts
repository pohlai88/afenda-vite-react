import { describe, expect, it } from "vitest"

import {
  assertActorForUserAction,
  assertDefaultAuditBaseline,
  assertDelegationMustBeExplicit,
  assertLegalEntityWhenApplicable,
  assertNoInPlaceCorrection,
  assertPrivilegedActionMustBeAudited,
  assertTenantForGovernedWrite,
} from "../services/assert-audit-invariants"
import {
  isAuditInvariantViolationError,
  type AuditErrorContext,
} from "../utils/audit-error-factory"
import { buildAuditContext } from "../utils/build-audit-context"

const tenant = "00000000-0000-4000-8000-000000000001"
const actor = "00000000-0000-4000-8000-000000000002"
const legalEntity = "00000000-0000-4000-8000-000000000003"

function ctx(
  partial: Partial<AuditErrorContext> & { operation: string }
): AuditErrorContext {
  return buildAuditContext({
    operation: partial.operation,
    tenantId: partial.tenantId,
    actorUserId: partial.actorUserId,
    actingAsUserId: partial.actingAsUserId,
    legalEntityId: partial.legalEntityId,
    entityType: partial.entityType,
    entityId: partial.entityId,
  })
}

describe("assert-audit-invariants — success paths (early returns)", () => {
  it("assertDelegationMustBeExplicit passes when acting-as is set and actor is present", () => {
    expect(() =>
      assertDelegationMustBeExplicit({
        actorUserId: actor,
        actingAsUserId: "00000000-0000-4000-8000-000000000099",
        options: {},
      })
    ).not.toThrow()
  })

  it("assertLegalEntityWhenApplicable skips when not required or id present", () => {
    expect(() =>
      assertLegalEntityWhenApplicable({
        requiresLegalEntity: false,
        legalEntityId: null,
        options: {},
      })
    ).not.toThrow()
    expect(() =>
      assertLegalEntityWhenApplicable({
        requiresLegalEntity: true,
        legalEntityId: legalEntity,
        options: {},
      })
    ).not.toThrow()
  })

  it("assertPrivilegedActionMustBeAudited skips when not privileged or audit planned", () => {
    expect(() =>
      assertPrivilegedActionMustBeAudited({
        isPrivilegedAction: false,
        auditWillBeCreated: false,
        options: {},
      })
    ).not.toThrow()
    expect(() =>
      assertPrivilegedActionMustBeAudited({
        isPrivilegedAction: true,
        auditWillBeCreated: true,
        options: {},
      })
    ).not.toThrow()
  })

  it("assertNoInPlaceCorrection skips when not an in-place mutation", () => {
    expect(() =>
      assertNoInPlaceCorrection({ isInPlaceMutation: false, options: {} })
    ).not.toThrow()
  })
})

describe("assert-audit-invariants — payload", () => {
  it("assertActorForUserAction: invariant, doctrine, remediation default", () => {
    try {
      assertActorForUserAction({
        actorUserId: null,
        options: {
          context: ctx({
            operation: "journal-entry.create",
            tenantId: tenant,
            entityType: "journalEntry",
          }),
        },
      })
      expect.fail("expected throw")
    } catch (e) {
      expect(isAuditInvariantViolationError(e)).toBe(true)
      if (!isAuditInvariantViolationError(e)) {
        return
      }
      expect(e.payload.invariantKey).toBe(
        "invariant.identity.actor-required-for-user-action"
      )
      expect(e.payload.doctrineKey).toBe(
        "doctrine.identity.attributable-action"
      )
      expect(e.payload.remediation).toContain(
        "Bind a resolvable actor identity"
      )
    }
  })

  it("assertDelegationMustBeExplicit: invariant and doctrine", () => {
    try {
      assertDelegationMustBeExplicit({
        actorUserId: null,
        actingAsUserId: "00000000-0000-4000-8000-000000000099",
        options: { context: ctx({ operation: "x" }) },
      })
      expect.fail("expected throw")
    } catch (e) {
      expect(isAuditInvariantViolationError(e)).toBe(true)
      if (!isAuditInvariantViolationError(e)) {
        return
      }
      expect(e.payload.invariantKey).toBe(
        "invariant.identity.delegation-must-be-explicit"
      )
      expect(e.payload.doctrineKey).toBe(
        "doctrine.identity.delegation-transparent"
      )
      expect(e.payload.remediation).toContain("delegated")
    }
  })

  it("assertTenantForGovernedWrite: invariant and doctrine", () => {
    try {
      assertTenantForGovernedWrite({
        tenantId: null,
        options: {
          context: ctx({ operation: "payment.post", actorUserId: actor }),
        },
      })
      expect.fail("expected throw")
    } catch (e) {
      expect(isAuditInvariantViolationError(e)).toBe(true)
      if (!isAuditInvariantViolationError(e)) {
        return
      }
      expect(e.payload.invariantKey).toBe(
        "invariant.scope.tenant-required-for-governed-write"
      )
      expect(e.payload.doctrineKey).toBe("doctrine.scope.operation-bounded")
      expect(e.payload.remediation).toContain("tenant scope")
    }
  })

  it("assertLegalEntityWhenApplicable: invariant and doctrine", () => {
    try {
      assertLegalEntityWhenApplicable({
        requiresLegalEntity: true,
        legalEntityId: null,
        options: {
          context: ctx({
            operation: "payment.post",
            tenantId: tenant,
            actorUserId: actor,
          }),
        },
      })
      expect.fail("expected throw")
    } catch (e) {
      expect(isAuditInvariantViolationError(e)).toBe(true)
      if (!isAuditInvariantViolationError(e)) {
        return
      }
      expect(e.payload.invariantKey).toBe(
        "invariant.scope.legal-entity-required-when-applicable"
      )
      expect(e.payload.doctrineKey).toBe("doctrine.scope.operation-bounded")
      expect(e.payload.remediation).toContain("legal-entity")
    }
  })

  it("assertPrivilegedActionMustBeAudited: invariant and doctrine", () => {
    try {
      assertPrivilegedActionMustBeAudited({
        isPrivilegedAction: true,
        auditWillBeCreated: false,
        options: {
          context: ctx({ operation: "admin.purge", tenantId: tenant }),
        },
      })
      expect.fail("expected throw")
    } catch (e) {
      expect(isAuditInvariantViolationError(e)).toBe(true)
      if (!isAuditInvariantViolationError(e)) {
        return
      }
      expect(e.payload.invariantKey).toBe(
        "invariant.administration.privileged-action-must-be-audited"
      )
      expect(e.payload.doctrineKey).toBe(
        "doctrine.administration.privileged-actions-auditable"
      )
      expect(e.payload.remediation).toContain("privileged")
    }
  })

  it("assertNoInPlaceCorrection: invariant and doctrine", () => {
    try {
      assertNoInPlaceCorrection({
        isInPlaceMutation: true,
        options: { context: ctx({ operation: "audit.row.patch" }) },
      })
      expect.fail("expected throw")
    } catch (e) {
      expect(isAuditInvariantViolationError(e)).toBe(true)
      if (!isAuditInvariantViolationError(e)) {
        return
      }
      expect(e.payload.invariantKey).toBe(
        "invariant.audit.no-in-place-correction"
      )
      expect(e.payload.doctrineKey).toBe("doctrine.audit.append-only")
      expect(e.payload.remediation).toContain("additive")
    }
  })
})

describe("assertDefaultAuditBaseline — failure order", () => {
  const baselineDefaults: Parameters<typeof assertDefaultAuditBaseline>[0] = {
    actorUserId: actor,
    actingAsUserId: null,
    tenantId: tenant,
    requiresLegalEntity: true,
    legalEntityId: legalEntity,
    isPrivilegedAction: false,
    auditWillBeCreated: true,
    isInPlaceMutation: false,
    options: {
      context: ctx({
        operation: "payment.post",
        tenantId: tenant,
        actorUserId: actor,
        legalEntityId: legalEntity,
        entityType: "payment",
        entityId: "pay-1",
      }),
    },
  }

  function firstInvariantKey(
    input: Parameters<typeof assertDefaultAuditBaseline>[0]
  ) {
    try {
      assertDefaultAuditBaseline(input)
      return null
    } catch (e) {
      if (!isAuditInvariantViolationError(e)) {
        throw e
      }
      return e.payload.invariantKey
    }
  }

  it("1 — missing actor before tenant / legal / privileged / in-place", () => {
    expect(
      firstInvariantKey({
        ...baselineDefaults,
        actorUserId: null,
        tenantId: null,
        requiresLegalEntity: true,
        legalEntityId: null,
        isPrivilegedAction: true,
        auditWillBeCreated: false,
        isInPlaceMutation: true,
      })
    ).toBe("invariant.identity.actor-required-for-user-action")
  })

  it("2 — missing tenant after actor + delegation satisfied", () => {
    expect(
      firstInvariantKey({
        ...baselineDefaults,
        actorUserId: actor,
        actingAsUserId: null,
        tenantId: null,
        requiresLegalEntity: true,
        legalEntityId: legalEntity,
      })
    ).toBe("invariant.scope.tenant-required-for-governed-write")
  })

  it("3 — legal entity after tenant satisfied", () => {
    expect(
      firstInvariantKey({
        ...baselineDefaults,
        actorUserId: actor,
        tenantId: tenant,
        requiresLegalEntity: true,
        legalEntityId: null,
      })
    ).toBe("invariant.scope.legal-entity-required-when-applicable")
  })

  it("4 — privileged audit after scope satisfied", () => {
    expect(
      firstInvariantKey({
        ...baselineDefaults,
        requiresLegalEntity: false,
        legalEntityId: legalEntity,
        isPrivilegedAction: true,
        auditWillBeCreated: false,
        isInPlaceMutation: false,
      })
    ).toBe("invariant.administration.privileged-action-must-be-audited")
  })

  it("5 — no in-place correction last among failures when prior checks pass", () => {
    expect(
      firstInvariantKey({
        ...baselineDefaults,
        requiresLegalEntity: false,
        isPrivilegedAction: false,
        auditWillBeCreated: true,
        isInPlaceMutation: true,
      })
    ).toBe("invariant.audit.no-in-place-correction")
  })
})
