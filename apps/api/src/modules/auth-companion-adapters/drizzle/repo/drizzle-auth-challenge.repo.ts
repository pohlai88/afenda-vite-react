import type { DatabaseClient } from "@afenda/database"
import { authChallenges } from "@afenda/database/schema"
import { and, eq, sql } from "drizzle-orm"

import type { AuthChallengeMethod } from "../../../auth-companion/contracts/auth-challenge.contract.js"
import type {
  AuthChallengeRepo,
  StoredAuthChallengeRecord,
} from "../../../auth-companion/repo/auth-challenge.repo.js"

function isAuthChallengeMethod(value: string): value is AuthChallengeMethod {
  return value === "passkey" || value === "totp" || value === "email_otp"
}

function isStoredStatus(
  value: string
): value is StoredAuthChallengeRecord["status"] {
  return (
    value === "issued" ||
    value === "verified" ||
    value === "consumed" ||
    value === "expired" ||
    value === "cancelled"
  )
}

function toRecord(row: {
  challengeId: string
  subjectUserId: string | null
  subjectEmail: string
  method: string
  status: string
  expiresAt: Date
  attemptsRemaining: number
}): StoredAuthChallengeRecord | null {
  if (!isAuthChallengeMethod(row.method) || !isStoredStatus(row.status)) {
    return null
  }
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

export function createDrizzleAuthChallengeRepo(
  db: DatabaseClient
): AuthChallengeRepo {
  return {
    async createIssuedChallenge(input) {
      const rowId = crypto.randomUUID()
      const challengeId = `chlg_${crypto.randomUUID()}`
      const now = new Date()

      await db.insert(authChallenges).values({
        id: rowId,
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
        issuedAt: now,
      })

      return {
        challengeId,
        expiresAt: input.expiresAt,
        attemptsRemaining: input.attemptsRemaining,
      }
    },

    async findChallengeById(challengeId) {
      const rows = await db
        .select({
          challengeId: authChallenges.challengeId,
          subjectUserId: authChallenges.subjectUserId,
          subjectEmail: authChallenges.subjectEmail,
          method: authChallenges.method,
          status: authChallenges.status,
          expiresAt: authChallenges.expiresAt,
          attemptsRemaining: authChallenges.attemptsRemaining,
        })
        .from(authChallenges)
        .where(eq(authChallenges.challengeId, challengeId))
        .limit(1)

      const row = rows[0]
      if (!row) {
        return null
      }
      return toRecord({
        ...row,
        method: String(row.method),
        status: String(row.status),
      })
    },

    async decrementAttempts(challengeId: string): Promise<void> {
      await db
        .update(authChallenges)
        .set({
          attemptsRemaining: sql`${authChallenges.attemptsRemaining} - 1`,
        })
        .where(
          and(
            eq(authChallenges.challengeId, challengeId),
            eq(authChallenges.status, "issued")
          )
        )
    },

    async markVerified(challengeId: string): Promise<void> {
      await db
        .update(authChallenges)
        .set({
          status: "verified",
          verifiedAt: new Date(),
        })
        .where(
          and(
            eq(authChallenges.challengeId, challengeId),
            eq(authChallenges.status, "issued")
          )
        )
    },

    async markConsumed(challengeId: string): Promise<void> {
      await db
        .update(authChallenges)
        .set({
          status: "consumed",
          consumedAt: new Date(),
        })
        .where(eq(authChallenges.challengeId, challengeId))
    },

    async markExpired(challengeId: string): Promise<void> {
      await db
        .update(authChallenges)
        .set({
          status: "expired",
          expiredAt: new Date(),
        })
        .where(
          and(
            eq(authChallenges.challengeId, challengeId),
            eq(authChallenges.status, "issued")
          )
        )
    },
  }
}
