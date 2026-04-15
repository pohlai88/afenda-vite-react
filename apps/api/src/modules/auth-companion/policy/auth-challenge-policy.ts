export type AuthChallengePolicy = {
  readonly defaultExpirySeconds: number
  readonly defaultAttemptsRemaining: number
}

export const authChallengePolicy = {
  defaultExpirySeconds: 120,
  defaultAttemptsRemaining: 3,
} as const satisfies AuthChallengePolicy
