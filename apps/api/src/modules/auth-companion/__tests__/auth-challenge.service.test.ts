import { describe, expect, it, vi } from "vitest"

import { authChallengePolicy } from "../policy/auth-challenge-policy.js"
import type { AuthChallengeRepo } from "../repo/auth-challenge.repo.js"
import { AuthChallengeService } from "../services/auth-challenge.service.js"

const deps = {
  subjectUserId: null as string | null,
  riskSnapshot: {
    trustLevel: "medium" as const,
    recommendedMethod: "passkey" as const,
    reasons: ["x"],
  },
  deviceContextHash: null as string | null,
}

describe("AuthChallengeService", () => {
  it("startChallenge issues opaque ticket + prompt", async () => {
    const repo: AuthChallengeRepo = {
      createIssuedChallenge: vi.fn(async () => ({
        challengeId: "chlg_test",
        expiresAt: new Date(Date.now() + 60_000),
        attemptsRemaining: 3,
      })),
      findChallengeById: vi.fn(async () => null),
      decrementAttempts: vi.fn(async () => undefined),
      markVerified: vi.fn(async () => undefined),
      markConsumed: vi.fn(async () => undefined),
      markExpired: vi.fn(async () => undefined),
    }
    const svc = new AuthChallengeService(repo, authChallengePolicy)
    const out = await svc.startChallenge(
      { email: "a@b.com", method: "totp" },
      deps
    )
    expect(out.ticket.challengeId).toBe("chlg_test")
    expect(out.ticket.method).toBe("totp")
    expect(out.prompt.expiresAtIso).toBeDefined()
  })

  it("verifyChallenge rejects wrong method", async () => {
    const repo: AuthChallengeRepo = {
      createIssuedChallenge: vi.fn(),
      findChallengeById: vi.fn(async () => ({
        challengeId: "c1",
        subjectUserId: null,
        subjectEmail: "a@b.com",
        method: "totp",
        status: "issued",
        expiresAt: new Date(Date.now() + 60_000),
        attemptsRemaining: 3,
      })),
      decrementAttempts: vi.fn(async () => undefined),
      markVerified: vi.fn(async () => undefined),
      markConsumed: vi.fn(async () => undefined),
      markExpired: vi.fn(async () => undefined),
    }
    const svc = new AuthChallengeService(repo, authChallengePolicy)
    await expect(
      svc.verifyChallenge({ challengeId: "c1", method: "email_otp" })
    ).rejects.toMatchObject({
      code: "auth.challenge.mismatch",
    })
  })

  it("verifyChallenge rejects expired challenge", async () => {
    const repo: AuthChallengeRepo = {
      createIssuedChallenge: vi.fn(),
      findChallengeById: vi.fn(async () => ({
        challengeId: "c1",
        subjectUserId: null,
        subjectEmail: "a@b.com",
        method: "totp",
        status: "issued",
        expiresAt: new Date(Date.now() - 60_000),
        attemptsRemaining: 3,
      })),
      decrementAttempts: vi.fn(async () => undefined),
      markVerified: vi.fn(async () => undefined),
      markConsumed: vi.fn(async () => undefined),
      markExpired: vi.fn(async () => undefined),
    }
    const svc = new AuthChallengeService(repo, authChallengePolicy)
    await expect(
      svc.verifyChallenge({ challengeId: "c1", method: "totp" })
    ).rejects.toMatchObject({ code: "auth.challenge.expired" })
    expect(repo.markExpired).toHaveBeenCalledWith("c1")
  })

  it("verifyChallenge consumes challenge on success", async () => {
    const repo: AuthChallengeRepo = {
      createIssuedChallenge: vi.fn(),
      findChallengeById: vi.fn(async () => ({
        challengeId: "c1",
        subjectUserId: null,
        subjectEmail: "a@b.com",
        method: "totp",
        status: "issued",
        expiresAt: new Date(Date.now() + 60_000),
        attemptsRemaining: 3,
      })),
      decrementAttempts: vi.fn(async () => undefined),
      markVerified: vi.fn(async () => undefined),
      markConsumed: vi.fn(async () => undefined),
      markExpired: vi.fn(async () => undefined),
    }
    const svc = new AuthChallengeService(repo, authChallengePolicy)
    const out = await svc.verifyChallenge({ challengeId: "c1", method: "totp" })
    expect(out.verified).toBe(true)
    expect(repo.markVerified).toHaveBeenCalledWith("c1")
    expect(repo.markConsumed).toHaveBeenCalledWith("c1")
  })
})
