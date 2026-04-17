import { AuthCompanionError } from "../errors/auth-companion-error.js"

export type AuthSessionListOptions = {
  /** Better Auth session id for the active cookie — marks matching row as current. */
  readonly currentSessionId?: string
}

export type AuthSessionRow = {
  readonly id: string
  readonly device: string
  readonly location: string
  readonly createdAt: Date
  readonly lastActiveAt: Date
  readonly isCurrent: boolean
  readonly risk: "low" | "medium" | "high"
}

/** Read path: list sessions, factors, recent audit-backed events (no revocation). */
export interface AuthSessionReader {
  listSessionsForUser(
    userId: string,
    options?: AuthSessionListOptions
  ): Promise<readonly AuthSessionRow[]>

  listRecentAuthEvents(userId: string): Promise<
    readonly {
      id: string
      title: string
      timeLabel: string
    }[]
  >

  readAuthFactors(userId: string): Promise<{
    password: boolean
    social: boolean
    passkey: boolean
    mfa: boolean
  }>
}

/** Revoke path: Better Auth storage seam (e.g. DELETE session row), separate from reads. */
export interface AuthSessionRevoker {
  revokeSession(userId: string, sessionId: string): Promise<void>
}

export interface AuthSessionRepo
  extends AuthSessionReader, AuthSessionRevoker {}

function throwSessionStorageUnavailable(): never {
  throw new AuthCompanionError(
    "auth.sessions.storage_unavailable",
    "Session list and revoke require a PostgreSQL pool and Better Auth tables. Configure DATABASE_URL and pass the same pool as Better Auth.",
    503
  )
}

/**
 * Used when the API is bootstrapped without a {@link Pool} (or without a Drizzle client).
 * Session-backed routes return 503 until storage is wired; seeding applies on top of tenant scope.
 */
export class UnavailableAuthSessionStorageRepo implements AuthSessionRepo {
  async listSessionsForUser(): Promise<readonly AuthSessionRow[]> {
    throwSessionStorageUnavailable()
  }

  async revokeSession(): Promise<void> {
    throwSessionStorageUnavailable()
  }

  async listRecentAuthEvents(): Promise<
    readonly {
      id: string
      title: string
      timeLabel: string
    }[]
  > {
    throwSessionStorageUnavailable()
  }

  async readAuthFactors(): Promise<{
    password: boolean
    social: boolean
    passkey: boolean
    mfa: boolean
  }> {
    throwSessionStorageUnavailable()
  }
}
