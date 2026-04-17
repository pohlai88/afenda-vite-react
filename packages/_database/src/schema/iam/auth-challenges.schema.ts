import {
  index,
  integer,
  jsonb,
  pgEnum,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

import { iam } from "./_schema"

export const authChallengeMethodEnum = pgEnum("auth_challenge_method", [
  "passkey",
  "totp",
  "email_otp",
])

export const authChallengeStatusEnum = pgEnum("auth_challenge_status", [
  "issued",
  "verified",
  "consumed",
  "expired",
  "cancelled",
])

export const authChallenges = iam.table(
  "auth_challenges",
  {
    id: text("id").primaryKey(),
    challengeId: text("challenge_id").notNull(),
    subjectUserId: text("subject_user_id"),
    subjectEmail: text("subject_email").notNull(),
    method: authChallengeMethodEnum("method").notNull(),
    status: authChallengeStatusEnum("status").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    attemptsRemaining: integer("attempts_remaining").notNull(),
    riskSnapshot: jsonb("risk_snapshot")
      .$type<{
        trustLevel: "low" | "medium" | "high" | "verified"
        recommendedMethod: "passkey" | "password" | "social"
        reasons: readonly string[]
        otpDigest?: string
      }>()
      .notNull(),
    deviceContextHash: text("device_context_hash"),
    issuedAt: timestamp("issued_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    verifiedAt: timestamp("verified_at", {
      withTimezone: true,
      mode: "date",
    }),
    consumedAt: timestamp("consumed_at", {
      withTimezone: true,
      mode: "date",
    }),
    expiredAt: timestamp("expired_at", {
      withTimezone: true,
      mode: "date",
    }),
    cancelledAt: timestamp("cancelled_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => ({
    challengeIdUnique: uniqueIndex("uq_iam_auth_challenges_challenge_id").on(
      table.challengeId
    ),
    subjectUserIdIdx: index("idx_iam_auth_challenges_subject_user_id").on(
      table.subjectUserId
    ),
    subjectEmailIdx: index("idx_iam_auth_challenges_subject_email").on(
      table.subjectEmail
    ),
    statusExpiresIdx: index("idx_iam_auth_challenges_status_expires").on(
      table.status,
      table.expiresAt
    ),
  })
)
