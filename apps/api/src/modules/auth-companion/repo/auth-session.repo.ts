import { buildAuthSessionsPayload } from "../../../auth-ecosystem.js"
import { AuthCompanionError } from "../errors/auth-companion-error.js"
import {
  getAuthSessionRequestContext,
  type AuthSessionRequestContext,
} from "../utils/auth-request-context.js"

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

/** ALS demo + legacy combined adapter. */
export interface AuthSessionRepo extends AuthSessionReader, AuthSessionRevoker {}

export type { AuthSessionRequestContext } from "../utils/auth-request-context.js"

/**
 * Request-scoped session repo: requires {@link runWithAuthSessionContext} around
 * route handlers (see Hono registration).
 */
export class AlsBackedDemoAuthSessionRepo implements AuthSessionRepo {
  private requireContext(): AuthSessionRequestContext {
    const ctx = getAuthSessionRequestContext()
    if (!ctx) {
      throw new AuthCompanionError(
        "auth.sessions.no_request_context",
        "Session request context is missing.",
        500
      )
    }
    return ctx
  }

  private payload() {
    const { session, userAgent, forwardedFor } = this.requireContext()
    return buildAuthSessionsPayload({
      session,
      userAgent,
      forwardedFor,
    })
  }

  async listSessionsForUser(
    _userId: string,
    options?: AuthSessionListOptions
  ): Promise<readonly AuthSessionRow[]> {
    const p = this.payload()
    const currentId = options?.currentSessionId
    return p.sessions.map((s) => ({
      id: s.id,
      device: s.device,
      location: s.location,
      createdAt: new Date(s.createdAt),
      lastActiveAt: new Date(s.lastActiveAt),
      isCurrent:
        currentId !== undefined ? s.id === currentId : s.isCurrent,
      risk: s.risk,
    }))
  }

  async revokeSession(_userId: string, sessionId: string): Promise<void> {
    const { session } = this.requireContext()
    const archivedSessionId = `archive_${session.session.id.slice(0, 8)}`
    const allowed =
      sessionId === session.session.id || sessionId === archivedSessionId
    if (!allowed) {
      throw new AuthCompanionError(
        "auth.sessions.not_found",
        "Session was not found in the current tenant scope.",
        404
      )
    }
  }

  async listRecentAuthEvents(_userId: string): Promise<
    readonly {
      id: string
      title: string
      timeLabel: string
    }[]
  > {
    return this.payload().recentEvents
  }

  async readAuthFactors(_userId: string): Promise<{
    password: boolean
    social: boolean
    passkey: boolean
    mfa: boolean
  }> {
    return this.payload().factors
  }
}
