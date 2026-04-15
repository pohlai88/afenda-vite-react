import { describe, expect, it } from "vitest"

import { buildAuditLog } from "../services/build-audit-log"

describe("audit metadata — auth security bridge keys", () => {
  it("accepts betterAuthUserId in metadata alongside auth_user_id column", () => {
    const row = buildAuditLog({
      tenantId: "00000000-0000-4000-8000-000000000001",
      action: "auth.session.created",
      actorType: "person",
      subjectType: "auth.session",
      subjectId: "sess_1",
      sourceChannel: "api",
      authUserId: "ba_abc",
      sessionId: "sess_1",
      metadata: {
        betterAuthUserId: "ba_abc",
      },
    })

    expect(row.authUserId).toBe("ba_abc")
    expect(row.metadata?.betterAuthUserId).toBe("ba_abc")
  })
})
