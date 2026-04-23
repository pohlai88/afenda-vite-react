import { Hono } from "hono"

import type { ApiEnv, SessionContext } from "../contract/request-context.js"
import { opsCommandMatrix } from "../command/command-matrix.js"
import { resolveActorAuthorityForTenant } from "../command/execute-command.js"
import { getBetterAuthRuntime } from "../lib/better-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../lib/env.js"

type BetterAuthSessionPayload = Awaited<
  ReturnType<
    ReturnType<typeof getBetterAuthRuntime>["auth"]["api"]["getSession"]
  >
>

function tenantIdsFromSession(session: SessionContext): readonly string[] {
  return session.tenantId ? [session.tenantId] : []
}

function serializeBetterAuthSession(
  session: NonNullable<BetterAuthSessionPayload>
) {
  return {
    user: {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      emailVerified: session.user.emailVerified ?? false,
    },
    session: {
      id: session.session.id,
      activeTenantId: session.session.activeTenantId ?? null,
      activeMembershipId: session.session.activeMembershipId ?? null,
    },
  }
}

function serializeSetupState(input: {
  readonly isAuthenticated: boolean
  readonly hasTenantContext: boolean
  readonly userName?: string | null
}) {
  const profileRecommended =
    !input.userName || input.userName.trim().length === 0

  return {
    state: !input.isAuthenticated
      ? ("auth" as const)
      : !input.hasTenantContext
        ? ("workspace_required" as const)
        : profileRecommended
          ? ("profile_recommended" as const)
          : ("ready" as const),
    hasTenantContext: input.hasTenantContext,
    profileRecommended,
  }
}

export const meRoutes = new Hono<ApiEnv>().get("/", async (c) => {
  const session = c.get("session")

  if (!session.authenticated) {
    return c.json(
      {
        code: "AUTH_REQUIRED",
        message: "Authentication is required.",
      },
      401
    )
  }

  if (!hasBetterAuthRuntimeEnv()) {
    return c.json(
      {
        code: "AUTH_NOT_CONFIGURED",
        message: "Better Auth runtime is not configured for this API.",
      },
      503
    )
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
      {
        code: "AUTH_REQUIRED",
        message: "Authentication is required.",
      },
      401
    )
  }

  let afenda = {
    afendaUserId: session.userId ?? betterSession.user.id,
    tenantIds: tenantIdsFromSession(session),
    defaultTenantId: session.tenantId,
  }
  let tenantCandidates: Array<{
    tenantId: string
    membershipId: string
    tenantName: string
    tenantCode: string
    isDefault: boolean
  }> = []

  try {
    const tenantCandidatePayload = await runtime.listTenantCandidates({
      headers: c.req.raw.headers,
    })

    afenda = {
      afendaUserId: tenantCandidatePayload.afendaUserId,
      tenantIds: tenantCandidatePayload.candidates.map(
        (candidate) => candidate.tenantId
      ),
      defaultTenantId:
        tenantCandidatePayload.defaultTenantId ?? session.tenantId,
    }
    tenantCandidates = [...tenantCandidatePayload.candidates]
  } catch {
    // Fall back to the session-derived operating context when tenant candidates are unavailable.
  }

  const tenantId = session.tenantId ?? afenda.defaultTenantId ?? null
  const actorAuthority =
    tenantId !== null
      ? await resolveActorAuthorityForTenant({
          session,
          tenantId,
          actorLabel:
            betterSession.user.name?.trim() ||
            betterSession.user.email?.trim() ||
            betterSession.user.id,
          requestId: c.get("requestId"),
        })
      : null

  return c.json({
    betterAuth: serializeBetterAuthSession(betterSession),
    afenda,
    actor: {
      id: betterSession.user.id,
      roles: actorAuthority?.roles ?? [],
      permissions: actorAuthority?.permissions ?? [],
    },
    tenant: {
      id: tenantId,
      memberships: tenantCandidates,
      capabilities: ["ops", "truth_records", "command_execution"],
    },
    truthContext: {
      enabledModules: ["ops"],
      commandMatrix: opsCommandMatrix,
    },
    session: {
      id: betterSession.session.id,
      activeTenantId: betterSession.session.activeTenantId ?? null,
      activeMembershipId: betterSession.session.activeMembershipId ?? null,
    },
    setup: serializeSetupState({
      isAuthenticated: true,
      hasTenantContext: Boolean(tenantId),
      userName: betterSession.user.name,
    }),
  })
})
