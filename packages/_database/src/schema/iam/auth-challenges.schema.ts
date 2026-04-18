/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **iam** schema (`pgSchema("iam")`) — login accounts, provider links, memberships, roles, ABAC policies, step-up challenges. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/iam/auth-challenges.schema.ts` — `iam.auth_challenges` step-up / MFA lifecycle; `subject_*` text columns (no FK to `user_accounts` — intentional for pre-login flows).
 */
import { sql } from "drizzle-orm"
import {
  check,
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
    ckAttemptsRemaining: check(
      "ck_iam_auth_challenges_attempts_remaining",
      sql`${table.attemptsRemaining} >= 0`
    ),
    ckExpiresAfterIssued: check(
      "ck_iam_auth_challenges_expires_after_issued",
      sql`${table.expiresAt} > ${table.issuedAt}`
    ),
  })
)
