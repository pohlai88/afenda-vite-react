/**
 * Public exports for the auth companion feature (challenges, sessions, intelligence contracts).
 *
 * @module modules/auth-companion
 */
export {
  createAuthCompanionModule,
  type AuthCompanionModule,
} from "./create-auth-companion-module.js"

export type { AuthIntelligenceSnapshot } from "./contracts/auth-intelligence.contract.js"
export type { AuthSessionsPayload } from "./contracts/auth-session.contract.js"
export type {
  AuthChallengeMethod,
  AuthChallengeTicket,
  AuthChallengePrompt,
  StartAuthChallengeBody,
  StartAuthChallengeResponse,
  VerifyAuthChallengeBody,
  VerifyAuthChallengeResponse,
} from "./contracts/auth-challenge.contract.js"
