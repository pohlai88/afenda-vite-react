import { describe, expect, it } from "vitest"

import { buildAuditContext } from "../utils/build-audit-context"

describe("buildAuditContext", () => {
  it("fills optional fields with null and preserves operation", () => {
    const c = buildAuditContext({
      operation: "journal-entry.create",
      tenantId: "t1",
      actorUserId: "a1",
    })
    expect(c.operation).toBe("journal-entry.create")
    expect(c.tenantId).toBe("t1")
    expect(c.actorUserId).toBe("a1")
    expect(c.actingAsUserId).toBeNull()
    expect(c.entityId).toBeNull()
  })
})
