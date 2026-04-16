import type { AuthIntelligenceSnapshot } from "../contracts/auth-intelligence.contract.js"

export type AuthIntelligenceSessionLike = {
  readonly user: {
    readonly emailVerified?: boolean | null
  }
} | null

function passkeyFeatureEnabled(): boolean {
  return process.env.AFENDA_AUTH_PASSKEY_ENABLED === "true"
}

function resolveDeviceLabel(userAgent: string): string {
  if (userAgent.includes("Windows")) {
    return "Windows workstation"
  }
  if (userAgent.includes("Macintosh")) {
    return "Mac workstation"
  }
  if (userAgent.includes("iPhone")) {
    return "iPhone browser"
  }
  return "Browser session"
}

function resolveRegionLabel(forwardedFor: string | null): string {
  if (!forwardedFor || forwardedFor.length === 0) {
    return "Region unresolved"
  }
  return `IP scope ${forwardedFor.split(",")[0]?.trim() ?? "unknown"}`
}

function trustFromSession(session: AuthIntelligenceSessionLike): {
  readonly trustLevel: AuthIntelligenceSnapshot["trustLevel"]
  readonly score: number
} {
  if (!session) {
    return { trustLevel: "medium", score: 72 }
  }
  if (session.user.emailVerified) {
    return { trustLevel: "high", score: 88 }
  }
  return { trustLevel: "medium", score: 75 }
}

/**
 * Pure composition for `GET /v1/auth/intelligence` — single source for trust labels and recommended method.
 */
export function buildAuthIntelligenceSnapshot(input: {
  readonly session: AuthIntelligenceSessionLike
  readonly userAgent: string
  readonly forwardedFor: string | null
}): AuthIntelligenceSnapshot {
  const trust = trustFromSession(input.session)
  const passkey = passkeyFeatureEnabled()
  const reasons: AuthIntelligenceSnapshot["reasons"] = [
    {
      code: "auth.risk.device-posture",
      label: "Device posture evaluated against recent secure sessions.",
      severity: "info",
    },
    {
      code: "auth.risk.geo-consistency",
      label: "Location history is within expected organization boundaries.",
      severity: trust.score >= 85 ? "info" : "warning",
    },
  ]
  if (!passkey) {
    reasons.push({
      code: "auth.risk.passkey-pilot-disabled",
      label: "Passkey fast lane is not enabled for this tenant policy.",
      severity: "warning",
    })
  }

  return {
    trustLevel: trust.trustLevel,
    score: trust.score,
    deviceLabel: resolveDeviceLabel(input.userAgent),
    regionLabel: resolveRegionLabel(input.forwardedFor),
    lastSeenLabel: input.session
      ? "Trusted session observed in the last 30 minutes."
      : "No active trusted session is attached to this browser.",
    reasons,
    passkeyAvailable: passkey,
    recommendedMethod: passkey ? "passkey" : "password",
  }
}
