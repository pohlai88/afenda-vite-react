export type AuthChallengeMethod = "passkey" | "totp" | "email_otp"

export interface AuthChallengeTicket {
  readonly challengeId: string
  readonly method: AuthChallengeMethod
}

export interface AuthChallengePrompt {
  readonly title: string
  readonly description: string
  readonly expiresAtIso?: string
  readonly attemptsRemaining?: number
}

export interface AuthChallengeStartPayload {
  readonly ticket: AuthChallengeTicket
  readonly prompt: AuthChallengePrompt
}

export interface AuthChallengeVerifyPayload {
  readonly verified: boolean
  readonly receipt: readonly string[]
}

/** WebAuthn assertion fields (client-serialized), aligned with API contract. */
export interface PasskeyCredentialProof {
  readonly id: string
  readonly response: {
    readonly clientDataJSON: string
    readonly authenticatorData: string
    readonly signature: string
    readonly userHandle?: string | null
  }
}

export type AuthChallengeVerifyProof =
  | { readonly kind: "passkey"; readonly credential: PasskeyCredentialProof }
  | { readonly kind: "otp"; readonly code: string }

export function isAuthChallengeMethod(
  value: unknown
): value is AuthChallengeMethod {
  return value === "passkey" || value === "totp" || value === "email_otp"
}
