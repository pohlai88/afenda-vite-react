import type { AuthIntelligenceSnapshot } from "../contracts/auth-intelligence.contract.js"

export class AuthIntelligenceService {
  async getSnapshot(input: {
    actorUserId: string | null
    ipAddress: string | null
    userAgent: string | null
  }): Promise<AuthIntelligenceSnapshot> {
    void input.actorUserId
    void input.ipAddress
    return {
      trustLevel: "medium",
      score: 72,
      deviceLabel: input.userAgent ?? "Unknown browser",
      regionLabel: "Unverified region",
      lastSeenLabel: "No previous trusted session",
      reasons: [
        {
          code: "auth.risk.new_device",
          label: "New device detected for this account.",
          severity: "warning",
        },
      ],
      passkeyAvailable: true,
      recommendedMethod: "passkey",
    }
  }
}
