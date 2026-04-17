import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

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

/**
 * AFENDA-issued auth challenges (opaque ticket / server-owned expiry & attempts).
 * Distinct from Better Auth session tables.
 */
export const authChallenges = pgTable(
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
        /** HMAC-SHA256 hex digest of the issued OTP (totp / email_otp only). Server-only. */
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
    challengeIdUnique: uniqueIndex("auth_challenges_challenge_id_uidx").on(
      table.challengeId
    ),
    subjectUserIdIdx: index("auth_challenges_subject_user_id_idx").on(
      table.subjectUserId
    ),
    subjectEmailIdx: index("auth_challenges_subject_email_idx").on(
      table.subjectEmail
    ),
    statusExpiresIdx: index("auth_challenges_status_expires_idx").on(
      table.status,
      table.expiresAt
    ),
  })
)
