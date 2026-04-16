import type {
  AuthChallengePrompt,
  AuthChallengeTicket,
  StartAuthChallengeBody,
  StartAuthChallengeResponse,
  VerifyAuthChallengeBody,
  VerifyAuthChallengeResponse,
} from "../contracts/auth-challenge.contract.js"
import { AuthCompanionError } from "../errors/auth-companion-error.js"
import type { AuthChallengePolicy } from "../policy/auth-challenge-policy.js"
import type {
  AuthChallengeRepo,
  AuthChallengeRiskSnapshotInput,
} from "../repo/auth-challenge.repo.js"
import {
  generateChallengeOtpCode,
  hashChallengeOtpCode,
  verifyChallengeOtpDigest,
} from "../utils/auth-challenge-otp.js"

function passkeyFeatureEnabled(): boolean {
  return process.env.AFENDA_AUTH_PASSKEY_ENABLED === "true"
}

export class AuthChallengeService {
  constructor(
    private readonly repo: AuthChallengeRepo,
    private readonly policy: AuthChallengePolicy
  ) {}

  async startChallenge(
    input: StartAuthChallengeBody,
    deps: {
      subjectUserId: string | null
      riskSnapshot: Omit<AuthChallengeRiskSnapshotInput, "otpDigest">
      deviceContextHash: string | null
    }
  ): Promise<StartAuthChallengeResponse> {
    const expiresAt = new Date(
      Date.now() + this.policy.defaultExpirySeconds * 1000
    )

    let riskSnapshot: AuthChallengeRiskSnapshotInput = {
      ...deps.riskSnapshot,
    }
    if (input.method === "totp" || input.method === "email_otp") {
      const code = generateChallengeOtpCode()
      riskSnapshot = {
        ...deps.riskSnapshot,
        otpDigest: hashChallengeOtpCode(code),
      }
      if (process.env.NODE_ENV !== "production") {
        console.info(
          `[afenda/auth-challenge] OTP for ${input.email.trim()} (${input.method}): ${code}`
        )
      }
    }

    const created = await this.repo.createIssuedChallenge({
      email: input.email,
      subjectUserId: deps.subjectUserId,
      method: input.method,
      expiresAt,
      attemptsRemaining: this.policy.defaultAttemptsRemaining,
      riskSnapshot,
      deviceContextHash: deps.deviceContextHash,
    })

    const ticket: AuthChallengeTicket = {
      challengeId: created.challengeId,
      method: input.method,
    }

    const prompt: AuthChallengePrompt = {
      title:
        input.method === "passkey"
          ? "Use your passkey"
          : input.method === "totp"
            ? "Enter your authenticator code"
            : "Enter the email code",
      description:
        input.method === "passkey"
          ? "Complete the passkey prompt on this device to continue."
          : input.method === "totp"
            ? "Use your authenticator app to continue."
            : "Use the one-time code sent to your email.",
      expiresAtIso: created.expiresAt.toISOString(),
      attemptsRemaining: created.attemptsRemaining,
    }

    return {
      ticket,
      prompt,
    }
  }

  async verifyChallenge(
    input: VerifyAuthChallengeBody
  ): Promise<VerifyAuthChallengeResponse> {
    if (input.method === "passkey" && !passkeyFeatureEnabled()) {
      throw new AuthCompanionError(
        "auth.challenge.passkey_disabled",
        "Passkey verification is not enabled for this tenant.",
        400
      )
    }

    const record = await this.repo.findChallengeById(input.challengeId)

    if (!record) {
      throw new AuthCompanionError(
        "auth.challenge.not_found",
        "Challenge was not found.",
        404
      )
    }

    if (record.method !== input.method) {
      throw new AuthCompanionError(
        "auth.challenge.mismatch",
        "Challenge method does not match.",
        401
      )
    }

    if (record.status !== "issued") {
      throw new AuthCompanionError(
        "auth.challenge.invalid_state",
        "Challenge is not available for verification.",
        409
      )
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      await this.repo.markExpired(record.challengeId)
      throw new AuthCompanionError(
        "auth.challenge.expired",
        "Challenge has expired.",
        401
      )
    }

    let proofOk = false

    if (input.method === "passkey") {
      void input.credential
      throw new AuthCompanionError(
        "auth.challenge.passkey_verify_pending",
        "Passkey cryptographic verification is wired in Wave 2 (Better Auth passkey plugin). Use TOTP or email OTP challenge, or password login.",
        501
      )
    }

    if (input.method === "totp" || input.method === "email_otp") {
      proofOk = verifyChallengeOtpDigest(
        input.proof.code,
        record.otpDigest ?? null
      )
    }

    if (!proofOk) {
      await this.repo.decrementAttempts(record.challengeId)
      throw new AuthCompanionError(
        "auth.challenge.invalid",
        "Challenge verification failed.",
        401
      )
    }

    await this.repo.markVerified(record.challengeId)
    await this.repo.markConsumed(record.challengeId)

    return {
      verified: true,
      receipt: [
        "Challenge ticket matched the issued auth flow.",
        "Challenge record was verified and consumed server-side.",
      ],
    }
  }
}
