import {
  StartAuthChallengeBodySchema,
  VerifyAuthChallengeBodySchema,
} from "../contracts/auth-challenge.contract.js"
import { AuthCompanionError } from "../errors/auth-companion-error.js"
import type { AuthChallengeService } from "../services/auth-challenge.service.js"
import {
  toAuthRouteError,
  toAuthRouteSuccess,
} from "../utils/auth-http-response.js"

function passkeyFeatureEnabled(): boolean {
  return process.env.AFENDA_AUTH_PASSKEY_ENABLED === "true"
}

function readChallengeMethodFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== "object") {
    return undefined
  }
  const m = (body as { method?: unknown }).method
  return typeof m === "string" ? m : undefined
}

export function createAuthChallengeRoutes(deps: {
  challengeService: AuthChallengeService
}) {
  return {
    async start(request: {
      body: unknown
      requestId?: string
      actorUserId: string | null
      ipAddress: string | null
      userAgent: string | null
    }) {
      try {
        const parsed = StartAuthChallengeBodySchema.safeParse(request.body)
        if (!parsed.success) {
          throw new AuthCompanionError(
            "auth.challenge.start.invalid_body",
            "Invalid challenge request.",
            400
          )
        }

        if (parsed.data.method === "passkey" && !passkeyFeatureEnabled()) {
          throw new AuthCompanionError(
            "auth.challenge.passkey_disabled",
            "Passkey verification is not enabled for this tenant.",
            400
          )
        }

        const result = await deps.challengeService.startChallenge(parsed.data, {
          subjectUserId: request.actorUserId,
          riskSnapshot: {
            trustLevel: "medium",
            recommendedMethod: "passkey",
            reasons: ["auth.risk.new_device"],
          },
          deviceContextHash: request.userAgent ?? null,
        })

        return toAuthRouteSuccess(result, request.requestId)
      } catch (error) {
        return toAuthRouteError(error)
      }
    },

    async verify(request: { body: unknown; requestId?: string }) {
      try {
        if (
          readChallengeMethodFromBody(request.body) === "passkey" &&
          !passkeyFeatureEnabled()
        ) {
          throw new AuthCompanionError(
            "auth.challenge.passkey_disabled",
            "Passkey verification is not enabled for this tenant.",
            400
          )
        }

        const parsed = VerifyAuthChallengeBodySchema.safeParse(request.body)
        if (!parsed.success) {
          throw new AuthCompanionError(
            "auth.challenge.verify.invalid_body",
            "Invalid challenge verification request.",
            400
          )
        }

        const result = await deps.challengeService.verifyChallenge(parsed.data)
        return toAuthRouteSuccess(result, request.requestId)
      } catch (error) {
        return toAuthRouteError(error)
      }
    },
  }
}
