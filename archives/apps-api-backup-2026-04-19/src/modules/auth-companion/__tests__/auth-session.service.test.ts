import { describe, expect, it, vi } from "vitest"

import type {
  AuthSessionReader,
  AuthSessionRevoker,
} from "../repo/auth-session.repo.js"
import { AuthSessionService } from "../services/auth-session.service.js"

describe("AuthSessionService", () => {
  it("serializes dates to ISO and returns revoke payload", async () => {
    const now = new Date()
    const reader: AuthSessionReader = {
      listSessionsForUser: vi.fn(async () => [
        {
          id: "s1",
          device: "d",
          location: "l",
          createdAt: now,
          lastActiveAt: now,
          isCurrent: true,
          risk: "low",
        },
      ]),
      listRecentAuthEvents: vi.fn(async () => [
        { id: "e1", title: "t", timeLabel: "now" },
      ]),
      readAuthFactors: vi.fn(async () => ({
        password: true,
        social: false,
        passkey: false,
        mfa: false,
      })),
    }
    const revoker: AuthSessionRevoker = {
      revokeSession: vi.fn(async () => undefined),
    }

    const svc = new AuthSessionService(reader, revoker)
    const payload = await svc.getSessions("u1")

    expect(payload.sessions[0].createdAt).toMatch(/^\d{4}-/)
    expect(payload.sessions[0].lastActiveAt).toMatch(/^\d{4}-/)
    expect(payload.recentEvents).toHaveLength(1)
    expect(payload.factors.password).toBe(true)

    const out = await svc.revokeSession("u1", "s1")
    expect(out.revokedSessionId).toBe("s1")
    expect(revoker.revokeSession).toHaveBeenCalledWith("u1", "s1")
  })
})
