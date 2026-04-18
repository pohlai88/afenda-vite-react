/**
 * Default table/column identifiers for Better Auth’s PostgreSQL storage.
 * Align with `npx auth@latest migrate` / your `betterAuth({ session: { fields: … } })` overrides.
 *
 * Session/account tables use camelCase column names as in Better Auth core docs.
 * `audit_logs` uses snake_case (Afenda governed audit).
 */

export const DEFAULT_BETTER_AUTH_PG_TABLES = {
  sessionTable: "session",
  accountTable: "account",
  /** Set when passkey plugin is on (`AFENDA_AUTH_ALL_PLUGINS` default or `AFENDA_AUTH_PASSKEY_ENABLED`). */
  passkeyTable:
    process.env.AFENDA_AUTH_ALL_PLUGINS?.trim() !== "false" ||
    process.env.AFENDA_AUTH_PASSKEY_ENABLED === "true"
      ? ("passkey" as const)
      : (undefined as string | undefined),
  /** Better Auth core `user` table (2FA fields after `twoFactor` plugin migrate). */
  userTable: "user",
  auditTable: "audit_logs",
} as const

export const DEFAULT_BETTER_AUTH_PG_COLUMNS = {
  session: {
    id: "id",
    userId: "userId",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    userAgent: "userAgent",
    ipAddress: "ipAddress",
  },
  account: {
    userId: "userId",
    providerId: "providerId",
  },
  passkey: {
    userId: "userId",
  },
  audit: {
    id: "id",
    action: "action",
    recordedAt: "created_at",
    authUserId: "auth_user_id",
    metadata: "metadata",
  },
} as const
