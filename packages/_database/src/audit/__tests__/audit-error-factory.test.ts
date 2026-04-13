import { describe, expect, it } from "vitest"

import type { AuditInvariantKey } from "../contracts/audit-doctrine-registry"
import { getAuditErrorCodeSpec } from "../contracts/audit-error-code-registry"
import {
  createAuditInvariantViolation,
  createAuditRegistryResolutionFailure,
  formatAuditErrorForLog,
  isAuditError,
  isAuditInvariantViolationError,
  toAuditErrorPayload,
} from "../utils/audit-error-factory"
import { createAuditInvariantViolationFromSpecCode } from "../utils/create-audit-invariant-violation-from-spec-code"
import { serializeAuditErrorForLog } from "../utils/serialize-audit-log"

describe("createAuditInvariantViolation", () => {
  it("binds invariant to doctrine and payload fields", () => {
    const err = createAuditInvariantViolation({
      invariantKey: "invariant.scope.legal-entity-required-when-applicable",
    })
    expect(isAuditInvariantViolationError(err)).toBe(true)
    if (!isAuditInvariantViolationError(err)) {
      return
    }
    expect(err.payload.invariantKey).toBe(
      "invariant.scope.legal-entity-required-when-applicable"
    )
    expect(err.payload.doctrineKey).toBe("doctrine.scope.operation-bounded")
    expect(err.payload.severity).toBe("critical")
  })
})

describe("createAuditInvariantViolationFromSpecCode", () => {
  it("resolves invariantKey from registry", () => {
    const err = createAuditInvariantViolationFromSpecCode("INV-FX-001")
    expect(isAuditInvariantViolationError(err)).toBe(true)
    if (!isAuditInvariantViolationError(err)) {
      return
    }
    expect(err.payload.invariantKey).toBe(
      "invariant.scope.legal-entity-required-when-applicable"
    )
  })
})

describe("serializeAuditErrorForLog", () => {
  it("aliases formatAuditErrorForLog", () => {
    const err = createAuditInvariantViolationFromSpecCode("INV-AUD-001")
    const s = serializeAuditErrorForLog(err)
    expect(s).toContain("AUDIT_INVARIANT_VIOLATION")
    expect(s).toContain("invariant.audit.no-in-place-correction")
  })

  it("formats AUDIT_REGISTRY_RESOLUTION_FAILURE payloads", () => {
    const err = createAuditRegistryResolutionFailure({
      message: "registry failed",
      reason: "missing row",
      context: { operation: "op" },
    })
    const s = formatAuditErrorForLog(err)
    expect(s).toContain("AUDIT_REGISTRY_RESOLUTION_FAILURE")
    expect(s).toContain("registry failed")
  })
})

describe("audit error guards", () => {
  it("isAuditError and toAuditErrorPayload", () => {
    const err = createAuditRegistryResolutionFailure({})
    expect(isAuditError(err)).toBe(true)
    expect(toAuditErrorPayload(err)?.code).toBe(
      "AUDIT_REGISTRY_RESOLUTION_FAILURE"
    )
    expect(toAuditErrorPayload(new Error("x"))).toBeNull()
  })

  it("createAuditInvariantViolation wraps unknown invariant keys", () => {
    const err = createAuditInvariantViolation({
      invariantKey: "invariant.__fake__.unknown" as AuditInvariantKey,
    })
    expect(err.payload.code).toBe("AUDIT_REGISTRY_RESOLUTION_FAILURE")
    expect(formatAuditErrorForLog(err)).toContain(
      "AUDIT_REGISTRY_RESOLUTION_FAILURE"
    )
  })
})

describe("getAuditErrorCodeSpec", () => {
  it("maps INV-FX-001 to the registry invariant key", () => {
    const spec = getAuditErrorCodeSpec("INV-FX-001")
    expect(spec.invariantKey).toBe(
      "invariant.scope.legal-entity-required-when-applicable"
    )
    expect(spec.defaultResolutionRef).toBe(
      "resolution.invoice.posting-approved"
    )
  })

  it("rejects unknown spec codes", () => {
    expect(() => getAuditErrorCodeSpec("INV-UNKNOWN-999")).toThrow(
      /Unknown audit error code/
    )
  })
})
