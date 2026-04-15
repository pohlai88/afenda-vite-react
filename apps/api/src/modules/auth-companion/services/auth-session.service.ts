import type { AuthSessionsPayload } from "../contracts/auth-session.contract.js"
import type {
  AuthSessionReader,
  AuthSessionRevoker,
} from "../repo/auth-session.repo.js"

export class AuthSessionService {
  constructor(
    private readonly reader: AuthSessionReader,
    private readonly revoker: AuthSessionRevoker
  ) {}

  async getSessions(
    userId: string,
    options?: { currentSessionId?: string }
  ): Promise<AuthSessionsPayload> {
    const [sessions, factors, recentEvents] = await Promise.all([
      this.reader.listSessionsForUser(userId, {
        currentSessionId: options?.currentSessionId,
      }),
      this.reader.readAuthFactors(userId),
      this.reader.listRecentAuthEvents(userId),
    ])

    return {
      sessions: sessions.map((session) => ({
        ...session,
        createdAt: session.createdAt.toISOString(),
        lastActiveAt: session.lastActiveAt.toISOString(),
      })),
      recentEvents: [...recentEvents],
      factors,
    }
  }

  async revokeSession(
    userId: string,
    sessionId: string
  ): Promise<{
    revokedSessionId: string
  }> {
    await this.revoker.revokeSession(userId, sessionId)
    return {
      revokedSessionId: sessionId,
    }
  }
}
