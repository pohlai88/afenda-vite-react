import { beforeEach, describe, expect, it, vi } from "vitest"

import { authChallengePolicy } from "../policy/auth-challenge-policy.js"
import type { AuthChallengeRepo } from "../repo/auth-challenge.repo.js"
import { AuthChallengeService } from "../services/auth-challenge.service.js"
import { hashChallengeOtpCode } from "../utils/auth-challenge-otp.js"

const deps = {
  subjectUserId: null as string | null,
  riskSnapshot: {
    trustLevel: "medium" as const,
    recommendedMethod: "passkey" as const,
    reasons: ["x"],
  },
  deviceContextHash: null as string | null,
}

beforeEach(() => {
  process.env.BETTER_AUTH_SECRET =
    "test-secret-for-challenge-tests-min-32-chars!!"
})

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
        otpDigest: hashChallengeOtpCode("123456"),
      })),
      decrementAttempts: vi.fn(async () => undefined),
      markVerified: vi.fn(async () => undefined),
      markConsumed: vi.fn(async () => undefined),
      markExpired: vi.fn(async () => undefined),
    }
    const svc = new AuthChallengeService(repo, authChallengePolicy)
    await expect(
      svc.verifyChallenge({
        challengeId: "c1",
        method: "email_otp",
        proof: { code: "123456" },
      })
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
        otpDigest: hashChallengeOtpCode("123456"),
      })),
      decrementAttempts: vi.fn(async () => undefined),
      markVerified: vi.fn(async () => undefined),
      markConsumed: vi.fn(async () => undefined),
      markExpired: vi.fn(async () => undefined),
    }
    const svc = new AuthChallengeService(repo, authChallengePolicy)
    await expect(
      svc.verifyChallenge({
        challengeId: "c1",
        method: "totp",
        proof: { code: "123456" },
      })
    ).rejects.toMatchObject({ code: "auth.challenge.expired" })
    expect(repo.markExpired).toHaveBeenCalledWith("c1")
  })

  it("verifyChallenge rejects passkey until WebAuthn wiring (501)", async () => {
    process.env.AFENDA_AUTH_PASSKEY_ENABLED = "true"
    const repo: AuthChallengeRepo = {
      createIssuedChallenge: vi.fn(),
      findChallengeById: vi.fn(async () => ({
        challengeId: "c1",
        subjectUserId: null,
        subjectEmail: "a@b.com",
        method: "passkey",
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
      svc.verifyChallenge({
        challengeId: "c1",
        method: "passkey",
        credential: {
          id: "x",
          response: {
            clientDataJSON: "a",
            authenticatorData: "b",
            signature: "c".repeat(32),
          },
        },
      })
    ).rejects.toMatchObject({ code: "auth.challenge.passkey_verify_pending" })
    process.env.AFENDA_AUTH_PASSKEY_ENABLED = "false"
  })

  it("verifyChallenge decrements attempts on bad OTP", async () => {
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
        otpDigest: hashChallengeOtpCode("123456"),
      })),
      decrementAttempts: vi.fn(async () => undefined),
      markVerified: vi.fn(async () => undefined),
      markConsumed: vi.fn(async () => undefined),
      markExpired: vi.fn(async () => undefined),
    }
    const svc = new AuthChallengeService(repo, authChallengePolicy)
    await expect(
      svc.verifyChallenge({
        challengeId: "c1",
        method: "totp",
        proof: { code: "000000" },
      })
    ).rejects.toMatchObject({ code: "auth.challenge.invalid" })
    expect(repo.decrementAttempts).toHaveBeenCalledWith("c1")
  })

  it("verifyChallenge consumes challenge on valid OTP", async () => {
    const code = "654321"
    const digest = hashChallengeOtpCode(code)
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
        otpDigest: digest,
      })),
      decrementAttempts: vi.fn(async () => undefined),
      markVerified: vi.fn(async () => undefined),
      markConsumed: vi.fn(async () => undefined),
      markExpired: vi.fn(async () => undefined),
    }
    const svc = new AuthChallengeService(repo, authChallengePolicy)
    const out = await svc.verifyChallenge({
      challengeId: "c1",
      method: "totp",
      proof: { code },
    })
    expect(out.verified).toBe(true)
    expect(repo.markVerified).toHaveBeenCalledWith("c1")
    expect(repo.markConsumed).toHaveBeenCalledWith("c1")
  })
})
