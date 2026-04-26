/**
 * Frontend-facing auth companion endpoints.
 * These routes keep the Better Auth browser client (`/api/auth/*`) separate from Afenda’s
 * application-specific auth dashboard data (`/api/v1/auth/*`).
 *
 * @module api-auth-companion.routes
 * @package @afenda/api
 */
import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import type { Context } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"
import { z } from "zod"

import type {
  ApiEnv,
  SessionContext,
} from "./contract/request-context.contract.js"
import { getBetterAuthRuntime } from "./api-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "./api-env.js"

const revokeSessionSchema = z.object({
  sessionId: z.string().min(1),
})

const activateTenantContextSchema = z.object({
  activeTenantId: z.string().min(1).optional(),
})

type AuthApiMeta = {
  readonly timestamp: string
  readonly requestId?: string
}

type AuthApiSuccessEnvelope<T> = {
  readonly data: T
  readonly meta: AuthApiMeta
}

type AuthApiErrorEnvelope = {
  readonly error: {
    readonly code: string
    readonly message: string
  }
}

type BetterAuthListedSession = {
  readonly id: string
  readonly token: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly userAgent?: string | null
  readonly ipAddress?: string | null
}

type BetterAuthRuntime = ReturnType<typeof getBetterAuthRuntime>

function authApiSuccess<T>(
  requestId: string | undefined,
  data: T
): AuthApiSuccessEnvelope<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...(requestId ? { requestId } : {}),
    },
  }
}

function authApiError(code: string, message: string): AuthApiErrorEnvelope {
  return {
    error: {
      code,
      message,
    },
  }
}

function readRequestId(c: {
  get(key: "requestId"): string | undefined
}): string | undefined {
  return c.get("requestId")
}

function maskIpAddress(ipAddress: string | null | undefined): string {
  if (!ipAddress) {
    return "Region unavailable"
  }

  if (ipAddress.includes(":")) {
    return "IPv6 network"
  }

  const segments = ipAddress.split(".")
  if (segments.length !== 4) {
    return "Gateway-observed network"
  }

  return `${segments[0]}.${segments[1]}.*.*`
}

function formatTimestamp(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value)
}

function readDeviceLabel(userAgent: string | null | undefined): string {
  const normalized = userAgent?.trim()
  if (!normalized) {
    return "Unknown browser"
  }

  if (normalized.includes("Edg/")) return "Microsoft Edge"
  if (normalized.includes("Chrome/")) return "Google Chrome"
  if (normalized.includes("Firefox/")) return "Mozilla Firefox"
  if (normalized.includes("Safari/") && !normalized.includes("Chrome/")) {
    return "Safari"
  }

  return normalized.slice(0, 72)
}

function ensureAuthConfigured(c: Context<ApiEnv>): Response | null {
  if (hasBetterAuthRuntimeEnv()) {
    return null
  }

  return c.json(
    authApiError(
      "auth_not_configured",
      "Better Auth runtime is not configured for this API."
    ),
    503
  )
}

function ensureAuthenticatedSession(
  c: Context<ApiEnv>
): SessionContext | Response {
  const session = c.get("session")
  if (session.authenticated && session.authSessionId) {
    return session
  }

  return c.json(
    authApiError("auth_required", "Authentication is required."),
    401
  )
}

function mapSessionsPayload(
  listedSessions: readonly BetterAuthListedSession[],
  currentSession: SessionContext,
  capabilityHooks: BetterAuthRuntime["capabilityHooks"]
) {
  const sessions = listedSessions.map((session) => ({
    id: session.id,
    device: readDeviceLabel(session.userAgent),
    location: maskIpAddress(session.ipAddress),
    createdAt: session.createdAt.toISOString(),
    lastActiveAt: session.updatedAt.toISOString(),
    isCurrent: session.id === currentSession.authSessionId,
    risk:
      session.id === currentSession.authSessionId
        ? ("low" as const)
        : session.userAgent && session.ipAddress
          ? ("medium" as const)
          : ("high" as const),
  }))

  const recentEvents = listedSessions
    .slice()
    .sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime())
    .slice(0, 3)
    .map((session) => ({
      id: session.id,
      title:
        session.id === currentSession.authSessionId
          ? "Current session remains active."
          : `Session observed from ${readDeviceLabel(session.userAgent)}.`,
      timeLabel: formatTimestamp(session.updatedAt),
    }))

  return {
    sessions,
    factors: {
      password: true,
      social: true,
      passkey: capabilityHooks.passkeyEnabled,
      mfa: capabilityHooks.mfaEnabled,
    },
    recentEvents,
  }
}

function mapIntelligencePayload(
  runtime: BetterAuthRuntime,
  currentSession: SessionContext,
  emailVerified: boolean,
  currentListedSession?: BetterAuthListedSession
) {
  const reasons: Array<{
    readonly code: string
    readonly label: string
    readonly severity: "info" | "warning" | "danger"
  }> = []

  if (!emailVerified) {
    reasons.push({
      code: "auth.email.unverified",
      label: "Email verification is still outstanding for this account.",
      severity: "warning" as const,
    })
  }

  if (!currentSession.tenantId) {
    reasons.push({
      code: "auth.context.tenant_missing",
      label: "No tenant operating context is active on this session yet.",
      severity: "info" as const,
    })
  }

  if (runtime.capabilityHooks.stepUpPolicy === "risk_based") {
    reasons.push({
      code: "auth.step_up.risk_based",
      label:
        "Risk-based step-up review is enabled for higher-consequence sign-ins.",
      severity: "info" as const,
    })
  }

  if (reasons.length === 0) {
    reasons.push({
      code: "auth.session.stable",
      label: "Session continuity is intact and enforced server-side.",
      severity: "info" as const,
    })
  }

  return {
    trustLevel: emailVerified ? ("verified" as const) : ("medium" as const),
    score: emailVerified ? 91 : 74,
    deviceLabel: readDeviceLabel(currentListedSession?.userAgent),
    regionLabel: maskIpAddress(currentListedSession?.ipAddress),
    lastSeenLabel: currentListedSession
      ? formatTimestamp(currentListedSession.updatedAt)
      : "No trusted session history available",
    reasons,
    passkeyAvailable: runtime.capabilityHooks.passkeyEnabled,
    recommendedMethod: runtime.capabilityHooks.passkeyEnabled
      ? ("passkey" as const)
      : ("password" as const),
    stepUpPolicy: runtime.capabilityHooks.stepUpPolicy,
  }
}

function applyOutgoingHeaders(c: Context<ApiEnv>, headers: Headers): void {
  const headerBag = headers as Headers & {
    getSetCookie?: () => string[]
  }

  const setCookies =
    headerBag.getSetCookie?.() ??
    (headers.get("set-cookie") ? [headers.get("set-cookie") as string] : [])
  for (const cookie of setCookies) {
    c.header("set-cookie", cookie, { append: true })
  }

  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return
    }
    c.header(key, value, { append: true })
  })
}

function mapTenantActivationError(error: unknown): {
  status: ContentfulStatusCode
  code: string
  message: string
} {
  if (error instanceof Error) {
    if (error.message === "setSessionOperatingContext: unauthenticated") {
      return {
        status: 401,
        code: "auth_required",
        message: "Authentication is required.",
      }
    }

    if ("code" in error && error.code === "TENANT_CONTEXT_RESOLUTION") {
      const details =
        "details" in error && error.details && typeof error.details === "object"
          ? (error.details as { activeTenantId?: string | null })
          : null

      const requiresSelection =
        !details?.activeTenantId &&
        error.message.includes("multiple active memberships")

      return {
        status: requiresSelection ? 409 : 400,
        code: requiresSelection
          ? "tenant_selection_required"
          : "tenant_context_resolution_failed",
        message: error.message,
      }
    }
  }

  return {
    status: 500,
    code: "tenant_context_activation_failed",
    message: "Unable to activate the tenant context.",
  }
}

function mapTenantCandidateError(error: unknown): {
  status: ContentfulStatusCode
  code: string
  message: string
} {
  if (error instanceof Error) {
    if (error.message === "listTenantCandidates: unauthenticated") {
      return {
        status: 401,
        code: "auth_required",
        message: "Authentication is required.",
      }
    }

    if ("code" in error && error.code === "IDENTITY_LINK_REQUIRED") {
      return {
        status: 400,
        code: "tenant_context_resolution_failed",
        message: error.message,
      }
    }
  }

  return {
    status: 500,
    code: "tenant_candidates_unavailable",
    message: "Unable to load tenant candidates for this account.",
  }
}

export const authCompanionRoutes = new Hono<ApiEnv>()
  .get("/intelligence", async (c) => {
    const configurationFailure = ensureAuthConfigured(c)
    if (configurationFailure) {
      return configurationFailure
    }

    const currentSession = ensureAuthenticatedSession(c)
    if (currentSession instanceof Response) {
      return currentSession
    }

    const runtime = getBetterAuthRuntime()
    const betterSession = await runtime.auth.api.getSession({
      headers: c.req.raw.headers,
      query: {
        disableRefresh: true,
      },
    })

    if (!betterSession) {
      return c.json(
        authApiError("auth_required", "Authentication is required."),
        401
      )
    }

    const listedSessions = (await runtime.auth.api.listSessions({
      headers: c.req.raw.headers,
    })) as readonly BetterAuthListedSession[]

    const currentListedSession = listedSessions.find(
      (session) => session.id === betterSession.session.id
    )

    return c.json(
      authApiSuccess(
        readRequestId(c),
        mapIntelligencePayload(
          runtime,
          currentSession,
          betterSession.user.emailVerified,
          currentListedSession
        )
      )
    )
  })
  .get("/sessions", async (c) => {
    const configurationFailure = ensureAuthConfigured(c)
    if (configurationFailure) {
      return configurationFailure
    }

    const currentSession = ensureAuthenticatedSession(c)
    if (currentSession instanceof Response) {
      return currentSession
    }

    const runtime = getBetterAuthRuntime()
    const listedSessions = (await runtime.auth.api.listSessions({
      headers: c.req.raw.headers,
    })) as readonly BetterAuthListedSession[]

    return c.json(
      authApiSuccess(
        readRequestId(c),
        mapSessionsPayload(
          listedSessions,
          currentSession,
          runtime.capabilityHooks
        )
      )
    )
  })
  .post(
    "/sessions/revoke",
    zValidator("json", revokeSessionSchema),
    async (c) => {
      const configurationFailure = ensureAuthConfigured(c)
      if (configurationFailure) {
        return configurationFailure
      }

      const currentSession = ensureAuthenticatedSession(c)
      if (currentSession instanceof Response) {
        return currentSession
      }

      const { sessionId } = c.req.valid("json")
      const runtime = getBetterAuthRuntime()
      const listedSessions = (await runtime.auth.api.listSessions({
        headers: c.req.raw.headers,
      })) as readonly BetterAuthListedSession[]

      const targetSession = listedSessions.find(
        (session) => session.id === sessionId
      )

      if (!targetSession) {
        return c.json(
          authApiError(
            "session_not_found",
            "The requested session does not exist."
          ),
          404
        )
      }

      if (targetSession.id === currentSession.authSessionId) {
        return c.json(
          authApiError(
            "current_session_revoke_forbidden",
            "Use sign-out to terminate the current session."
          ),
          400
        )
      }

      await runtime.auth.api.revokeSession({
        headers: c.req.raw.headers,
        body: {
          token: targetSession.token,
        },
      })

      return c.json(
        authApiSuccess(readRequestId(c), {
          revokedSessionId: sessionId,
        })
      )
    }
  )
  .post(
    "/tenant-context/activate",
    zValidator("json", activateTenantContextSchema),
    async (c) => {
      const configurationFailure = ensureAuthConfigured(c)
      if (configurationFailure) {
        return configurationFailure
      }

      const currentSession = ensureAuthenticatedSession(c)
      if (currentSession instanceof Response) {
        return currentSession
      }

      const runtime = getBetterAuthRuntime()
      const { activeTenantId } = c.req.valid("json")

      try {
        const activation = await runtime.activateTenantContext({
          headers: c.req.raw.headers,
          activeTenantId: activeTenantId ?? null,
        })

        applyOutgoingHeaders(c, activation.outgoingHeaders)

        return c.json(
          authApiSuccess(readRequestId(c), {
            activated: true,
            authSessionId: currentSession.authSessionId,
            tenantId: activation.context.tenantId,
            membershipId: activation.context.membershipId,
            afendaUserId: activation.context.afendaUserId,
          })
        )
      } catch (error) {
        const mapped = mapTenantActivationError(error)
        return c.json(authApiError(mapped.code, mapped.message), mapped.status)
      }
    }
  )
  .get("/tenant-context/candidates", async (c) => {
    const configurationFailure = ensureAuthConfigured(c)
    if (configurationFailure) {
      return configurationFailure
    }

    const currentSession = ensureAuthenticatedSession(c)
    if (currentSession instanceof Response) {
      return currentSession
    }

    const runtime = getBetterAuthRuntime()

    try {
      const tenantCandidates = await runtime.listTenantCandidates({
        headers: c.req.raw.headers,
      })

      return c.json(
        authApiSuccess(readRequestId(c), {
          authSessionId: currentSession.authSessionId,
          afendaUserId: tenantCandidates.afendaUserId,
          activeTenantId: currentSession.tenantId,
          activeMembershipId: currentSession.membershipId,
          defaultTenantId: tenantCandidates.defaultTenantId,
          candidates: tenantCandidates.candidates,
        })
      )
    } catch (error) {
      const mapped = mapTenantCandidateError(error)
      return c.json(authApiError(mapped.code, mapped.message), mapped.status)
    }
  })
