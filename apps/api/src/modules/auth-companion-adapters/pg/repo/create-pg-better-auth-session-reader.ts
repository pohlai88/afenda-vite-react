import type { Pool } from "pg"

import { authSecurityRecentEventActionsInSql } from "../../../auth-companion/constants/auth-security-recent-event-actions.js"
import type { AuthSessionReader } from "../../../auth-companion/repo/auth-session.repo.js"
import { qident, tcol } from "./sql-ident.js"

export type BetterAuthPgTableMap = {
  readonly sessionTable: string
  readonly accountTable: string
  readonly passkeyTable?: string
  readonly auditTable: string
}

export type BetterAuthPgColumnMap = {
  readonly session: {
    readonly id: string
    readonly userId: string
    readonly createdAt: string
    readonly updatedAt: string
    readonly userAgent?: string
    readonly ipAddress?: string
  }
  readonly account: {
    readonly userId: string
    readonly providerId: string
  }
  readonly passkey?: {
    readonly userId: string
  }
  readonly audit: {
    readonly id: string
    readonly action: string
    readonly recordedAt: string
    readonly authUserId?: string
    readonly metadata?: string
  }
}

/**
 * Raw `pg.Pool` reader for Better Auth `session` / `account` / optional passkey tables,
 * plus Afenda `audit_logs` for recent security-relevant events.
 */
export function createPgBetterAuthSessionReader(
  pool: Pool,
  tables: BetterAuthPgTableMap,
  columns: BetterAuthPgColumnMap
): AuthSessionReader {
  return {
    async listSessionsForUser(userId, options) {
      const currentId = options?.currentSessionId
      const S = tables.sessionTable
      const c = columns.session

      const uaExpr = c.userAgent
        ? tcol(S, c.userAgent)
        : `'Unknown device'`
      const ipExpr = c.ipAddress ? tcol(S, c.ipAddress) : `'Unknown location'`

      const sessionSql = `
        SELECT
          ${tcol(S, c.id)}          AS id,
          ${tcol(S, c.createdAt)}   AS created_at,
          ${tcol(S, c.updatedAt)}   AS updated_at,
          ${uaExpr}                 AS user_agent,
          ${ipExpr}                 AS ip_address
        FROM ${qident(S)}
        WHERE ${tcol(S, c.userId)} = $1
        ORDER BY ${tcol(S, c.updatedAt)} DESC
      `

      const result = await pool.query(sessionSql, [userId])

      return result.rows.map((row) => ({
        id: String(row.id),
        device: String(row.user_agent ?? "Unknown device"),
        location: String(row.ip_address ?? "Unknown location"),
        createdAt: new Date(row.created_at),
        lastActiveAt: new Date(row.updated_at),
        isCurrent: currentId !== undefined && String(row.id) === currentId,
        risk: "low" as const,
      }))
    },

    async readAuthFactors(userId) {
      const A = tables.accountTable
      const ca = columns.account

      const accountSql = `
        SELECT ${tcol(A, ca.providerId)} AS provider_id
        FROM ${qident(A)}
        WHERE ${tcol(A, ca.userId)} = $1
      `
      const accountResult = await pool.query(accountSql, [userId])

      const providerIds = accountResult.rows.map((row) =>
        String((row as { provider_id: unknown }).provider_id)
      )

      let hasPasskey = false
      if (tables.passkeyTable && columns.passkey) {
        const P = tables.passkeyTable
        const cp = columns.passkey
        const passkeySql = `
          SELECT 1
          FROM ${qident(P)}
          WHERE ${tcol(P, cp.userId)} = $1
          LIMIT 1
        `
        const passkeyResult = await pool.query(passkeySql, [userId])
        hasPasskey = Number(passkeyResult.rowCount ?? 0) > 0
      }

      return {
        password:
          providerIds.includes("credential") || providerIds.includes("email"),
        social: providerIds.some(
          (providerId) =>
            providerId !== "credential" && providerId !== "email"
        ),
        passkey: hasPasskey,
        mfa: false,
      }
    },

    async listRecentAuthEvents(userId) {
      const T = tables.auditTable
      const a = columns.audit

      const authCol = a.authUserId
        ? `${tcol(T, a.authUserId)} = $1`
        : "FALSE"
      const metaCol =
        a.metadata && a.metadata.length > 0
          ? `${qident(T)}.${qident(a.metadata)}->>'betterAuthUserId' = $1`
          : "FALSE"

      const recentSql = `
        SELECT
          ${tcol(T, a.id)} AS id,
          ${tcol(T, a.action)} AS action,
          ${tcol(T, a.recordedAt)} AS recorded_at
        FROM ${qident(T)}
        WHERE
          (${authCol} OR ${metaCol})
          AND ${tcol(T, a.action)} IN (${authSecurityRecentEventActionsInSql()})
        ORDER BY ${tcol(T, a.recordedAt)} DESC
        LIMIT 5
      `

      const result = await pool.query(recentSql, [userId])

      return result.rows.map((row) => ({
        id: String((row as { id: unknown }).id),
        title: String((row as { action: unknown }).action),
        timeLabel: new Date(
          String((row as { recorded_at: unknown }).recorded_at)
        ).toISOString(),
      }))
    },
  }
}
