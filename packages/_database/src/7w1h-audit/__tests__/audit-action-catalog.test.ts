import { describe, expect, it } from "vitest"

import {
  auditActionKeys,
  isAuditActionKey,
} from "../contracts/audit-action-catalog"

describe("audit-action-catalog", () => {
  it("isAuditActionKey is true for catalog keys", () => {
    for (const key of auditActionKeys) {
      expect(isAuditActionKey(key)).toBe(true)
    }
  })

  it("isAuditActionKey is false for unknown strings", () => {
    expect(isAuditActionKey("unknown.action")).toBe(false)
    expect(isAuditActionKey("")).toBe(false)
  })
})
