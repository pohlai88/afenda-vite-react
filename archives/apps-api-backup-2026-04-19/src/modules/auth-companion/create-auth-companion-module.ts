import { authChallengePolicy } from "./policy/auth-challenge-policy.js"
import { createAuthChallengeRoutes } from "./routes/auth-challenge.route.js"
import { createAuthIntelligenceRoutes } from "./routes/auth-intelligence.route.js"
import { createAuthSessionRoutes } from "./routes/auth-session.route.js"
import { AuthChallengeService } from "./services/auth-challenge.service.js"
import { AuthIntelligenceService } from "./services/auth-intelligence.service.js"
import { AuthSessionService } from "./services/auth-session.service.js"

type CreateAuthCompanionModuleInput = {
  challengeRepo: ConstructorParameters<typeof AuthChallengeService>[0]
  sessionReader: ConstructorParameters<typeof AuthSessionService>[0]
  sessionRevoker: ConstructorParameters<typeof AuthSessionService>[1]
}

export function createAuthCompanionModule(
  input: CreateAuthCompanionModuleInput
) {
  const intelligenceService = new AuthIntelligenceService()
  const challengeService = new AuthChallengeService(
    input.challengeRepo,
    authChallengePolicy
  )
  const sessionService = new AuthSessionService(
    input.sessionReader,
    input.sessionRevoker
  )

  return {
    services: {
      intelligenceService,
      challengeService,
      sessionService,
    },
    routes: {
      intelligenceRoutes: createAuthIntelligenceRoutes({
        intelligenceService,
      }),
      challengeRoutes: createAuthChallengeRoutes({
        challengeService,
      }),
      sessionRoutes: createAuthSessionRoutes({
        sessionService,
      }),
    },
  } as const
}

export type AuthCompanionModule = ReturnType<typeof createAuthCompanionModule>
