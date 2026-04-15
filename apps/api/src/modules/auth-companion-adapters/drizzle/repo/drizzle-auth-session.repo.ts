import { auditLogs } from "@afenda/database/schema"
import type { DatabaseClient } from "@afenda/database"
import { and, desc, eq, inArray, or, sql } from "drizzle-orm"

import { AUTH_SECURITY_RECENT_EVENT_ACTIONS } from "../../../auth-companion/constants/auth-security-recent-event-actions.js"
import type {
  AuthSessionListOptions,
  AuthSessionRepo,
} from "../../../auth-companion/repo/auth-session.repo.js"
import { AlsBackedDemoAuthSessionRepo } from "../../../auth-companion/repo/auth-session.repo.js"

export type DrizzleAuthSessionTableRefs = {
  /** Better Auth (or compatible) `session` table — optional until modeled in Drizzle. */
  readonly sessions?: object
  readonly accounts?: object
  readonly passkeys?: object
  /** Defaults to governed `audit_logs` from `@afenda/database` when omitted. */
  readonly auditLogs?: typeof auditLogs
}

/**
 * Maps Better Auth–shaped session/account/passkey tables into the auth-companion
 * session contract when `sessions` + `accounts` are provided; otherwise delegates
 * list/revoke/factors/recent-events to {@link AlsBackedDemoAuthSessionRepo}
 * (request-scoped demo payloads).
 *
 * **Recent events:** when `sessions` is present, reads from `audit_logs` by
 * `auth_user_id`, with a transitional fallback to `metadata.betterAuthUserId`
 * for rows written before `auth_user_id` was populated. Filters to the four
 * auth-security actions in `AUTH_SECURITY_RECENT_EVENT_ACTIONS`. When `sessions`
 * is omitted, uses the ALS-backed demo list so local/dev UX stays coherent.
 */
export function createDrizzleAuthSessionRepo(
  db: DatabaseClient,
  tables: DrizzleAuthSessionTableRefs = {}
): AuthSessionRepo {
  const als = new AlsBackedDemoAuthSessionRepo()
  const sessions = tables.sessions
  const accounts = tables.accounts
  const passkeys = tables.passkeys
  const audit = tables.auditLogs ?? auditLogs

  return {
    async listSessionsForUser(userId: string, _options?: AuthSessionListOptions) {
      if (!sessions) {
        return als.listSessionsForUser(userId)
      }

      // Optional Better Auth tables are not modeled in this package yet; callers pass Drizzle tables.
      const S = sessions as any

      const rows = await db
        .select({
          id: S.id,
          userAgent: S.userAgent,
          ipAddress: S.ipAddress,
          createdAt: S.createdAt,
          updatedAt: S.updatedAt,
          isCurrent: S.isCurrent,
        })
        .from(S)
        .where(eq(S.userId, userId))
        .orderBy(desc(S.updatedAt))

      return rows.map((row) => ({
        id: String(row.id),
        device: String(row.userAgent ?? "") || "Unknown device",
        location: String(row.ipAddress ?? "") || "Unknown location",
        createdAt: row.createdAt as Date,
        lastActiveAt: row.updatedAt as Date,
        isCurrent: Boolean(row.isCurrent),
        risk: "low" as const,
      }))
    },

    async revokeSession(userId: string, sessionId: string): Promise<void> {
      if (!sessions) {
        await als.revokeSession(userId, sessionId)
        return
      }

      const S = sessions as any

      await db
        .update(S)
        .set({
          revokedAt: new Date(),
        })
        .where(eq(S.id, sessionId))
    },

    async listRecentAuthEvents(userId: string) {
      if (!sessions) {
        return als.listRecentAuthEvents(userId)
      }

      const rows = await db
        .select({
          id: audit.id,
          title: audit.action,
          recordedAt: audit.recordedAt,
        })
        .from(audit)
        .where(
          and(
            or(
              eq(audit.authUserId, userId),
              sql`(${audit.metadata}->>'betterAuthUserId') = ${userId}`,
            ),
            inArray(audit.action, [...AUTH_SECURITY_RECENT_EVENT_ACTIONS]),
          ),
        )
        .orderBy(desc(audit.recordedAt))
        .limit(5)

      return rows.map((row) => ({
        id: String(row.id),
        title: row.title,
        timeLabel: row.recordedAt.toISOString(),
      }))
    },

    async readAuthFactors(userId: string) {
      if (!accounts) {
        return als.readAuthFactors(userId)
      }

      const A = accounts as any

      const accountRows = await db
        .select({
          providerId: A.providerId,
        })
        .from(A)
        .where(eq(A.userId, userId))

      const hasPassword = accountRows.some(
        (row) =>
          String(row.providerId) === "credential" ||
          String(row.providerId) === "email"
      )
      const hasSocial = accountRows.some((row) => {
        const p = String(row.providerId ?? "")
        return p !== "credential" && p !== "email"
      })

      let hasPasskey = false
      if (passkeys) {
        const P = passkeys as any
        const passkeyRows = await db
          .select({ id: P.id })
          .from(P)
          .where(eq(P.userId, userId))
          .limit(1)
        hasPasskey = passkeyRows.length > 0
      }

      return {
        password: hasPassword,
        social: hasSocial,
        passkey: hasPasskey,
        mfa: false,
      }
    },
  }
}
