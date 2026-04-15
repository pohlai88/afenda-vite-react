import type { Pool } from "pg"

import { AuthCompanionError } from "../../../auth-companion/errors/auth-companion-error.js"
import type { AuthSessionRevoker } from "../../../auth-companion/repo/auth-session.repo.js"
import { qident, tcol } from "./sql-ident.js"

/**
 * Optional seam when you prefer routing revocation through Better Auth’s own
 * server API (e.g. future `auth.api.*` helpers) instead of raw `DELETE`.
 * Prefer {@link createPgBetterAuthSessionRevoker} for delete-style storage
 * that matches default Better Auth session hooks.
 */
export function createBetterAuthSessionRevokerFromApi(api: {
  revokeSessionForUser: (args: {
    userId: string
    sessionId: string
  }) => Promise<void>
}): AuthSessionRevoker {
  return {
    async revokeSession(userId: string, sessionId: string): Promise<void> {
      await api.revokeSessionForUser({ userId, sessionId })
    },
  }
}

/**
 * Deletes a Better Auth session row (matches revoke semantics: row removed from storage).
 * Requires session id to belong to the given Better Auth user id.
 */
export function createPgBetterAuthSessionRevoker(
  pool: Pool,
  sessionTable: string,
  sessionColumns: { readonly id: string; readonly userId: string }
): AuthSessionRevoker {
  return {
    async revokeSession(userId: string, sessionId: string): Promise<void> {
      const S = sessionTable
      const c = sessionColumns
      const sql = `
        DELETE FROM ${qident(S)}
        WHERE ${tcol(S, c.id)} = $1
          AND ${tcol(S, c.userId)} = $2
      `
      const result = await pool.query(sql, [sessionId, userId])
      const n = Number(result.rowCount ?? 0)
      if (n === 0) {
        throw new AuthCompanionError(
          "auth.sessions.not_found",
          "Session was not found or is not owned by this user.",
          404
        )
      }
    },
  }
}
