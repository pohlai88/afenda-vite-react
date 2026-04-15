import type { AuthChallengeMethod } from "../contracts/auth-challenge.contract.js"

export interface StoredAuthChallengeRecord {
  readonly challengeId: string
  readonly subjectUserId: string | null
  readonly subjectEmail: string
  readonly method: AuthChallengeMethod
  readonly status:
    | "issued"
    | "verified"
    | "consumed"
    | "expired"
    | "cancelled"
  readonly expiresAt: Date
  readonly attemptsRemaining: number
}

type InternalChallengeRow = StoredAuthChallengeRecord & {
  readonly riskSnapshot: {
    readonly trustLevel: "low" | "medium" | "high" | "verified"
    readonly recommendedMethod: "passkey" | "password" | "social"
    readonly reasons: readonly string[]
  }
  readonly deviceContextHash: string | null
}

export interface AuthChallengeRepo {
  createIssuedChallenge(input: {
    email: string
    subjectUserId: string | null
    method: AuthChallengeMethod
    expiresAt: Date
    attemptsRemaining: number
    riskSnapshot: {
      trustLevel: "low" | "medium" | "high" | "verified"
      recommendedMethod: "passkey" | "password" | "social"
      reasons: readonly string[]
    }
    deviceContextHash: string | null
  }): Promise<{
    challengeId: string
    expiresAt: Date
    attemptsRemaining: number
  }>

  findChallengeById(
    challengeId: string
  ): Promise<StoredAuthChallengeRecord | null>

  decrementAttempts(challengeId: string): Promise<void>
  markVerified(challengeId: string): Promise<void>
  markConsumed(challengeId: string): Promise<void>
  markExpired(challengeId: string): Promise<void>
}

function toRecord(row: InternalChallengeRow): StoredAuthChallengeRecord {
  return {
    challengeId: row.challengeId,
    subjectUserId: row.subjectUserId,
    subjectEmail: row.subjectEmail,
    method: row.method,
    status: row.status,
    expiresAt: row.expiresAt,
    attemptsRemaining: row.attemptsRemaining,
  }
}

export class InMemoryAuthChallengeRepo implements AuthChallengeRepo {
  private readonly store = new Map<string, InternalChallengeRow>()

  async createIssuedChallenge(input: {
    email: string
    subjectUserId: string | null
    method: AuthChallengeMethod
    expiresAt: Date
    attemptsRemaining: number
    riskSnapshot: {
      trustLevel: "low" | "medium" | "high" | "verified"
      recommendedMethod: "passkey" | "password" | "social"
      reasons: readonly string[]
    }
    deviceContextHash: string | null
  }): Promise<{
    challengeId: string
    expiresAt: Date
    attemptsRemaining: number
  }> {
    const challengeId = `chlg_${crypto.randomUUID()}`
    const row: InternalChallengeRow = {
      challengeId,
      subjectUserId: input.subjectUserId,
      subjectEmail: input.email.trim(),
      method: input.method,
      status: "issued",
      expiresAt: input.expiresAt,
      attemptsRemaining: input.attemptsRemaining,
      riskSnapshot: {
        trustLevel: input.riskSnapshot.trustLevel,
        recommendedMethod: input.riskSnapshot.recommendedMethod,
        reasons: [...input.riskSnapshot.reasons],
      },
      deviceContextHash: input.deviceContextHash,
    }
    this.store.set(challengeId, row)
    return {
      challengeId,
      expiresAt: input.expiresAt,
      attemptsRemaining: input.attemptsRemaining,
    }
  }

  async findChallengeById(
    challengeId: string
  ): Promise<StoredAuthChallengeRecord | null> {
    const row = this.store.get(challengeId)
    if (!row) {
      return null
    }
    return toRecord(row)
  }

  async decrementAttempts(challengeId: string): Promise<void> {
    const row = this.store.get(challengeId)
    if (!row) {
      return
    }
    const next = Math.max(0, row.attemptsRemaining - 1)
    const status: StoredAuthChallengeRecord["status"] =
      next === 0 ? "cancelled" : row.status
    this.store.set(challengeId, {
      ...row,
      attemptsRemaining: next,
      status,
    })
  }

  async markVerified(challengeId: string): Promise<void> {
    const row = this.store.get(challengeId)
    if (!row) {
      return
    }
    this.store.set(challengeId, {
      ...row,
      status: "verified",
    })
  }

  async markConsumed(challengeId: string): Promise<void> {
    const row = this.store.get(challengeId)
    if (!row) {
      return
    }
    this.store.set(challengeId, {
      ...row,
      status: "consumed",
    })
  }

  async markExpired(challengeId: string): Promise<void> {
    const row = this.store.get(challengeId)
    if (!row) {
      return
    }
    this.store.set(challengeId, {
      ...row,
      status: "expired",
    })
  }
}
