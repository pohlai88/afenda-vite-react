import { describe, expect, it } from "vitest"

import { getAuditRetentionDisposition } from "../services/audit-retention-service"

describe("getAuditRetentionDisposition", () => {
  it("blocks disposition when legal hold is active", () => {
    const result = getAuditRetentionDisposition({
      retentionClass: "audit-standard",
      legalHold: true,
      recordedAt: new Date("2020-01-01T00:00:00.000Z"),
    })

    expect(result.blockedByLegalHold).toBe(true)
    expect(result.eligibleForArchive).toBe(false)
    expect(result.eligibleForPurge).toBe(false)
  })

  it("treats indefinite retention as non-expiring", () => {
    const result = getAuditRetentionDisposition({
      retentionClass: "audit-indefinite",
      legalHold: false,
      recordedAt: new Date("2020-01-01T00:00:00.000Z"),
    })

    expect(result.expiresAt).toBeNull()
    expect(result.eligibleForPurge).toBe(false)
  })
})
