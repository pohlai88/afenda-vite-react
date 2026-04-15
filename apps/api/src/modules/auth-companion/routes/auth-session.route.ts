import { RevokeAuthSessionBodySchema } from "../contracts/auth-session.contract.js"
import { AuthCompanionError } from "../errors/auth-companion-error.js"
import type { AuthSessionService } from "../services/auth-session.service.js"
import { toAuthRouteError, toAuthRouteSuccess } from "../utils/auth-http-response.js"

export function createAuthSessionRoutes(deps: {
  sessionService: AuthSessionService
}) {
  return {
    async list(request: {
      requestId?: string
      actorUserId: string | null
      currentSessionId?: string
    }) {
      try {
        if (!request.actorUserId) {
          throw new AuthCompanionError(
            "auth.sessions.unauthenticated",
            "Authentication required.",
            401
          )
        }

        const payload = await deps.sessionService.getSessions(
          request.actorUserId,
          {
            currentSessionId: request.currentSessionId,
          }
        )
        return toAuthRouteSuccess(payload, request.requestId)
      } catch (error) {
        return toAuthRouteError(error)
      }
    },

    async revoke(request: {
      body: unknown
      requestId?: string
      actorUserId: string | null
    }) {
      try {
        if (!request.actorUserId) {
          throw new AuthCompanionError(
            "auth.sessions.unauthenticated",
            "Authentication required.",
            401
          )
        }

        const parsed = RevokeAuthSessionBodySchema.safeParse(request.body)
        if (!parsed.success) {
          throw new AuthCompanionError(
            "auth.sessions.revoke.invalid_body",
            "Invalid revoke request.",
            400
          )
        }

        const result = await deps.sessionService.revokeSession(
          request.actorUserId,
          parsed.data.sessionId
        )

        return toAuthRouteSuccess(result, request.requestId)
      } catch (error) {
        return toAuthRouteError(error)
      }
    },
  }
}
