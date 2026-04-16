import { describe, expect, it, vi } from "vitest"

import { AuthCompanionError } from "../errors/auth-companion-error.js"
import { createAuthChallengeRoutes } from "../routes/auth-challenge.route.js"
import type { AuthChallengeService } from "../services/auth-challenge.service.js"

describe("createAuthChallengeRoutes", () => {
  it("maps invalid start body to 400", async () => {
    const challengeService = {
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(),
    } as unknown as AuthChallengeService
    const routes = createAuthChallengeRoutes({ challengeService })
    const res = await routes.start({
      body: {},
      requestId: undefined,
      actorUserId: null,
      ipAddress: null,
      userAgent: null,
    })
    expect(res.status).toBe(400)
    expect("error" in res.body ? res.body.error.code : "").toBe(
      "auth.challenge.start.invalid_body"
    )
  })

  it("maps invalid verify body to 400 (missing proof for totp)", async () => {
    const challengeService = {
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(),
    } as unknown as AuthChallengeService
    const routes = createAuthChallengeRoutes({ challengeService })
    const res = await routes.verify({
      body: { challengeId: "x", method: "totp" },
      requestId: undefined,
    })
    expect(res.status).toBe(400)
    expect("error" in res.body ? res.body.error.code : "").toBe(
      "auth.challenge.verify.invalid_body"
    )
  })

  it("maps service not_found to 404", async () => {
    const challengeService = {
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(async () => {
        throw new AuthCompanionError(
          "auth.challenge.not_found",
          "Challenge was not found.",
          404
        )
      }),
    } as unknown as AuthChallengeService
    const routes = createAuthChallengeRoutes({ challengeService })
    const res = await routes.verify({
      body: { challengeId: "x", method: "totp", proof: { code: "123456" } },
      requestId: undefined,
    })
    expect(res.status).toBe(404)
  })

  it("returns 200 on verified challenge", async () => {
    const challengeService = {
      startChallenge: vi.fn(),
      verifyChallenge: vi.fn(async () => ({
        verified: true,
        receipt: ["ok"],
      })),
    } as unknown as AuthChallengeService
    const routes = createAuthChallengeRoutes({ challengeService })
    const res = await routes.verify({
      body: { challengeId: "c1", method: "totp", proof: { code: "123456" } },
      requestId: undefined,
    })
    expect(res.status).toBe(200)
    const body = res.body as { data: { verified: boolean } }
    expect(body.data.verified).toBe(true)
  })
})
