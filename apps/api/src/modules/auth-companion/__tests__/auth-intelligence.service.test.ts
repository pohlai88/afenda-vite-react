import { describe, expect, it } from "vitest"

import { AuthIntelligenceService } from "../services/auth-intelligence.service.js"

describe("AuthIntelligenceService", () => {
  it("returns a complete snapshot with bounded score and allowed recommended method", async () => {
    const svc = new AuthIntelligenceService()
    const snap = await svc.getSnapshot({
      actorUserId: null,
      session: null,
      ipAddress: null,
      userAgent: "Mozilla/5.0",
    })

    expect(snap.score).toBeGreaterThanOrEqual(0)
    expect(snap.score).toBeLessThanOrEqual(100)
    expect(["passkey", "password", "social"]).toContain(snap.recommendedMethod)
    expect(snap.reasons.length).toBeGreaterThan(0)
    expect(snap.deviceLabel.length).toBeGreaterThan(0)
  })
})
