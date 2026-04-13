import { describe, expect, it } from "vitest"

import {
  auditInvariantErrorMap,
  getAuditInvariantErrorMap,
} from "../services/audit-invariant-error-map"

describe("audit-invariant-error-map", () => {
  it("getAuditInvariantErrorMap returns the canonical map", () => {
    expect(getAuditInvariantErrorMap()).toBe(auditInvariantErrorMap)
  })
})
