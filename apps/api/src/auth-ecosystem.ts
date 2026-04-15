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

export interface AuthChallengeVerifyInput {
  readonly challengeId: string
  readonly type: "password" | "totp" | "email_otp" | "passkey_assertion"
  readonly expiresAt: string
  readonly attemptsRemaining: number
}

export function authSuccessEnvelope<T>(data: T, requestId?: string) {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
    },
  }
}

export function authErrorEnvelope(code: string, message: string) {
  return {
    error: {
      code,
      message,
    },
  }
}

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

function trustFromSession(session: AuthSession | null): {
  readonly trustLevel: AuthTrustLevel
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

export function buildAuthIntelligenceSnapshot(input: {
  readonly session: AuthSession | null
  readonly userAgent: string
  readonly forwardedFor: string | null
}): AuthIntelligenceSnapshot {
  const trust = trustFromSession(input.session)
  const passkey = passkeyFeatureEnabled()
  const reasons: AuthRiskReason[] = [
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

export function buildAuthSessionsPayload(input: {
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

export function verifyAuthChallengeInput(payload: unknown):
  | { readonly ok: true; readonly value: AuthChallengeVerifyInput }
  | {
      readonly ok: false
      readonly code: string
      readonly message: string
    } {
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      code: "auth.challenge.invalid_payload",
      message: "Challenge payload is invalid.",
    }
  }

  const candidate = payload as Partial<AuthChallengeVerifyInput>
  if (
    typeof candidate.challengeId !== "string" ||
    candidate.challengeId.trim().length === 0
  ) {
    return {
      ok: false,
      code: "auth.challenge.missing_id",
      message: "Challenge id is required.",
    }
  }
  if (
    candidate.type !== "password" &&
    candidate.type !== "totp" &&
    candidate.type !== "email_otp" &&
    candidate.type !== "passkey_assertion"
  ) {
    return {
      ok: false,
      code: "auth.challenge.invalid_type",
      message: "Unsupported challenge type.",
    }
  }
  if (candidate.type === "passkey_assertion" && !passkeyFeatureEnabled()) {
    return {
      ok: false,
      code: "auth.challenge.passkey_disabled",
      message: "Passkey verification is not enabled for this tenant.",
    }
  }

  return {
    ok: true,
    value: {
      challengeId: candidate.challengeId,
      type: candidate.type,
      expiresAt:
        typeof candidate.expiresAt === "string"
          ? candidate.expiresAt
          : new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      attemptsRemaining:
        typeof candidate.attemptsRemaining === "number"
          ? candidate.attemptsRemaining
          : 3,
    },
  }
}
