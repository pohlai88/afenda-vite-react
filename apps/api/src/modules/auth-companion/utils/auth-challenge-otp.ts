import { createHmac, randomInt, timingSafeEqual } from "node:crypto"

/**
 * Server-issued OTP for `totp` / `email_otp` companion challenges.
 * Stored as a hex digest in `risk_snapshot.otpDigest` (not returned to the client).
 */
export function hashChallengeOtpCode(code: string): string {
  const secret = process.env.BETTER_AUTH_SECRET
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required for OTP challenges")
  }
  return createHmac("sha256", secret)
    .update(`afenda.auth.challenge.otp:${code.trim()}`)
    .digest("hex")
}

export function verifyChallengeOtpDigest(
  code: string,
  digest: string | undefined | null
): boolean {
  if (!digest || !code?.trim()) {
    return false
  }
  let expected: string
  try {
    expected = hashChallengeOtpCode(code)
  } catch {
    return false
  }
  const a = Buffer.from(expected, "hex")
  const b = Buffer.from(digest, "hex")
  if (a.length !== b.length) {
    return false
  }
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/** Six-digit numeric OTP for companion challenge issuance. */
export function generateChallengeOtpCode(): string {
  return String(randomInt(100_000, 1_000_000))
}
