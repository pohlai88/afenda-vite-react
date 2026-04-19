import type { AuthIntelligenceSessionLike } from "../services/build-auth-intelligence-snapshot.js"
import type { AuthIntelligenceService } from "../services/auth-intelligence.service.js"
import {
  toAuthRouteError,
  toAuthRouteSuccess,
} from "../utils/auth-http-response.js"

export function createAuthIntelligenceRoutes(deps: {
  intelligenceService: AuthIntelligenceService
}) {
  return {
    async getSnapshot(request: {
      requestId?: string
      actorUserId: string | null
      session: AuthIntelligenceSessionLike
      ipAddress: string | null
      userAgent: string | null
    }) {
      try {
        const snapshot = await deps.intelligenceService.getSnapshot({
          actorUserId: request.actorUserId,
          session: request.session,
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
        })

        return toAuthRouteSuccess(snapshot, request.requestId)
      } catch (error) {
        return toAuthRouteError(error)
      }
    },
  }
}
