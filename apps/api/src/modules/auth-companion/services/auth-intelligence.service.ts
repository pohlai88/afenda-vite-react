import type { AuthIntelligenceSnapshot } from "../contracts/auth-intelligence.contract.js"

import {
  buildAuthIntelligenceSnapshot,
  type AuthIntelligenceSessionLike,
} from "./build-auth-intelligence-snapshot.js"

export class AuthIntelligenceService {
  async getSnapshot(input: {
    actorUserId: string | null
    session: AuthIntelligenceSessionLike
    ipAddress: string | null
    userAgent: string | null
  }): Promise<AuthIntelligenceSnapshot> {
    void input.actorUserId
    return buildAuthIntelligenceSnapshot({
      session: input.session,
      userAgent: input.userAgent ?? "",
      forwardedFor: input.ipAddress,
    })
  }
}
