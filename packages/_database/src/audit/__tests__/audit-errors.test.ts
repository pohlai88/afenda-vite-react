import { describe, expect, it } from "vitest"

import {
  AUDIT_VALIDATION_INVARIANT_GENERIC,
  AuditValidationError,
} from "../utils/audit-errors"

describe("AuditValidationError", () => {
  it("string constructor sets generic invariantKey and default severity", () => {
    const err = new AuditValidationError("tenantId is required")
    expect(err.message).toBe("tenantId is required")
    expect(err.invariantKey).toBe(AUDIT_VALIDATION_INVARIANT_GENERIC)
    expect(err.severity).toBe("blocking")
    expect(err.code).toBe("AUDIT_VALIDATION")
  })

  it("structured constructor preserves optional fields", () => {
    const err = new AuditValidationError({
      message: "blocked",
      invariantKey: "invariant.posting.balance",
      doctrineRef: "doctrine.ifrs.15",
      severity: "warning",
      resolution: {
        code: "RESOLVE_POSTING",
        message: "Approve override",
        action: "open-approval",
      },
      correlationId: "corr-1",
      payload: { rowId: "x" },
    })
    expect(err.invariantKey).toBe("invariant.posting.balance")
    expect(err.doctrineRef).toBe("doctrine.ifrs.15")
    expect(err.severity).toBe("warning")
    expect(err.resolution?.code).toBe("RESOLVE_POSTING")
    expect(err.correlationId).toBe("corr-1")
    expect(err.payload).toEqual({ rowId: "x" })
  })

  it("is instanceof Error and AuditValidationError", () => {
    const err = new AuditValidationError("x")
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(AuditValidationError)
  })

  it("chains cause via ErrorOptions and exposes it in toJSON", () => {
    const root = new Error("root")
    const err = new AuditValidationError({
      message: "wrapped",
      invariantKey: "inv.wrapped",
      cause: root,
    })
    expect(err.cause).toBe(root)
    const json = err.toJSON() as { cause?: { message?: string } }
    expect(json.cause?.message).toBe("root")
  })

  it("toJSON includes code and invariantKey for structured logs", () => {
    const err = new AuditValidationError("plain")
    const json = err.toJSON()
    expect(json.code).toBe("AUDIT_VALIDATION")
    expect(json.invariantKey).toBe(AUDIT_VALIDATION_INVARIANT_GENERIC)
    expect(json.severity).toBe("blocking")
  })

  it("toJSON serializes non-Error cause as-is", () => {
    const err = new AuditValidationError({
      message: "m",
      invariantKey: "k",
      cause: "upstream-detail",
    })
    const json = err.toJSON() as { cause?: unknown }
    expect(json.cause).toBe("upstream-detail")
  })
})
