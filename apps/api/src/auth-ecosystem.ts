import type { AfendaAuth } from "@afenda/better-auth"

type AuthSession = NonNullable<
  Awaited<ReturnType<AfendaAuth["api"]["getSession"]>>
>

export type AuthTrustLevel = "low" | "medium" | "high" | "verified"
export type AuthRiskReasonSeverity = "info" | "warning" | "danger"

export interface AuthRiskReason {
  readonly code: string
  readonly label: string
  readonly severity: AuthRiskReasonSeverity
}

export interface AuthIntelligenceSnapshot {
  readonly trustLevel: AuthTrustLevel
  readonly score: number
  readonly deviceLabel: string
  readonly regionLabel: string
  readonly lastSeenLabel: string
  readonly reasons: readonly AuthRiskReason[]
  readonly passkeyAvailable: boolean
  readonly recommendedMethod: "passkey" | "password" | "social"
}

export interface AuthSessionItem {
  readonly id: string
  readonly device: string
  readonly location: string
  readonly createdAt: string
  readonly lastActiveAt: string
  readonly isCurrent: boolean
  readonly risk: "low" | "medium" | "high"
}

export interface AuthSessionsPayload {
  readonly sessions: readonly AuthSessionItem[]
  readonly factors: {
    readonly password: boolean
    readonly social: boolean
    readonly passkey: boolean
    readonly mfa: boolean
  }
  readonly recentEvents: readonly {
    readonly id: string
    readonly title: string
    readonly timeLabel: string
  }[]
}

export {
  authFail as authErrorEnvelope,
  authOk as authSuccessEnvelope,
} from "./modules/auth-companion/contracts/auth-api.contract.js"

function passkeyFeatureEnabled(): boolean {
  return process.env.AFENDA_AUTH_PASSKEY_ENABLED === "true"
}

function mfaFeatureEnabled(): boolean {
  return process.env.AFENDA_AUTH_MFA_ENABLED === "true"
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

export { buildAuthIntelligenceSnapshot } from "./modules/auth-companion/services/build-auth-intelligence-snapshot.js"

/** Demo-only session list payload for ALS / non-pool auth companion — not production data. */
export function buildDemoAuthSessionsPayload(input: {
  readonly session: AuthSession
  readonly userAgent: string
  readonly forwardedFor: string | null
}): AuthSessionsPayload {
  const now = new Date()
  const nowIso = now.toISOString()
  const priorIso = new Date(now.getTime() - 1000 * 60 * 44).toISOString()

  return {
    sessions: [
      {
        id: input.session.session.id,
        device: resolveDeviceLabel(input.userAgent),
        location: resolveRegionLabel(input.forwardedFor),
        createdAt: nowIso,
        lastActiveAt: nowIso,
        isCurrent: true,
        risk: "low",
      },
      {
        id: `archive_${input.session.session.id.slice(0, 8)}`,
        device: "Managed workstation",
        location: "Last known corporate network",
        createdAt: priorIso,
        lastActiveAt: priorIso,
        isCurrent: false,
        risk: "medium",
      },
    ],
    factors: {
      password: true,
      social: true,
      passkey: passkeyFeatureEnabled(),
      mfa: mfaFeatureEnabled(),
    },
    recentEvents: [
      {
        id: "evt-login-success",
        title: "Primary session challenge verified.",
        timeLabel: now.toISOString(),
      },
      {
        id: "evt-policy-eval",
        title: "Risk policy evaluated for tenant scope.",
        timeLabel: priorIso,
      },
    ],
  }
}
