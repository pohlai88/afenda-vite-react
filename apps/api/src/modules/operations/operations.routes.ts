import type { Context } from "hono"
import { Hono } from "hono"

import type { ApiEnv } from "../../contract/request-context.contract.js"
import { getBetterAuthRuntime } from "../../api-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../../api-env.js"
import { resolveActorAuthorityForTenant } from "../../command/execute-command.js"
import {
  readOpsAuditFeed,
  readOpsCounterpartyFeed,
  readOpsEventsWorkspaceFeed,
} from "./ops.projection.js"

function resolveTenantId(c: Context<ApiEnv>): string | null {
  const explicitHeader = c.req.header("x-tenant-id")?.trim()
  if (explicitHeader) {
    return explicitHeader
  }

  return c.get("session").tenantId
}

async function resolveBetterUser(
  c: Context<ApiEnv>
): Promise<
  { readonly name?: string | null; readonly email?: string | null } | undefined
> {
  if (!hasBetterAuthRuntimeEnv()) {
    return undefined
  }

  const runtime = getBetterAuthRuntime()
  const betterSession = await runtime.auth.api.getSession({
    headers: c.req.raw.headers,
    query: {
      disableRefresh: true,
    },
  })

  if (!betterSession) {
    return undefined
  }

  return {
    name: betterSession.user.name ?? null,
    email: betterSession.user.email ?? null,
  }
}

function parseAuditFeedLimit(
  rawLimit: string | undefined
): number | undefined | null {
  if (!rawLimit) {
    return undefined
  }

  const parsed = Number.parseInt(rawLimit, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null
  }

  return parsed
}

function parseAuditFeedBefore(
  rawBefore: string | undefined
): string | undefined | null {
  const value = rawBefore?.trim()
  if (!value) {
    return undefined
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed.toISOString()
}

export const operationsRoutes = new Hono<ApiEnv>()
  .use("*", async (c, next) => {
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

    await next()
  })
  .get("/events-workspace", async (c) => {
    const tenantId = resolveTenantId(c)
    if (!tenantId) {
      return c.json(
        {
          code: "TENANT_CONTEXT_REQUIRED",
          message: "An active tenant context is required.",
        },
        409
      )
    }

    if (c.get("session").tenantId && tenantId !== c.get("session").tenantId) {
      return c.json(
        {
          code: "TENANT_CONTEXT_MISMATCH",
          message:
            "Reads must execute against the active tenant context on the current session.",
        },
        409
      )
    }

    const betterUser = await resolveBetterUser(c)
    const authority = await resolveActorAuthorityForTenant({
      session: c.get("session"),
      tenantId,
      actorLabel:
        betterUser?.name?.trim() ||
        betterUser?.email?.trim() ||
        c.get("session").userId ||
        "Afenda operator",
      requestId: c.get("requestId"),
    })

    if (!authority.permissions.includes("ops:event:view")) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to view the events operating surface.",
        },
        403
      )
    }

    return c.json(
      await readOpsEventsWorkspaceFeed(tenantId, {
        includeAudit: authority.permissions.includes("ops:audit:view"),
      })
    )
  })
  .get("/audit", async (c) => {
    const tenantId = resolveTenantId(c)
    if (!tenantId) {
      return c.json(
        {
          code: "TENANT_CONTEXT_REQUIRED",
          message: "An active tenant context is required.",
        },
        409
      )
    }

    if (c.get("session").tenantId && tenantId !== c.get("session").tenantId) {
      return c.json(
        {
          code: "TENANT_CONTEXT_MISMATCH",
          message:
            "Reads must execute against the active tenant context on the current session.",
        },
        409
      )
    }

    const parsedLimit = parseAuditFeedLimit(c.req.query("limit"))
    if (parsedLimit === null) {
      return c.json(
        {
          code: "BAD_REQUEST",
          message: "The audit feed limit must be a positive integer.",
        },
        400
      )
    }

    const parsedBefore = parseAuditFeedBefore(c.req.query("before"))
    if (parsedBefore === null) {
      return c.json(
        {
          code: "BAD_REQUEST",
          message: "The audit feed cursor must be a valid ISO timestamp.",
        },
        400
      )
    }

    const betterUser = await resolveBetterUser(c)
    const authority = await resolveActorAuthorityForTenant({
      session: c.get("session"),
      tenantId,
      actorLabel:
        betterUser?.name?.trim() ||
        betterUser?.email?.trim() ||
        c.get("session").userId ||
        "Afenda operator",
      requestId: c.get("requestId"),
    })

    if (!authority.permissions.includes("ops:audit:view")) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to view the ops audit feed.",
        },
        403
      )
    }

    return c.json(
      await readOpsAuditFeed(tenantId, {
        before: parsedBefore,
        limit: parsedLimit ?? undefined,
      })
    )
  })
  .get("/counterparties", async (c) => {
    const tenantId = resolveTenantId(c)
    if (!tenantId) {
      return c.json(
        {
          code: "TENANT_CONTEXT_REQUIRED",
          message: "An active tenant context is required.",
        },
        409
      )
    }

    if (c.get("session").tenantId && tenantId !== c.get("session").tenantId) {
      return c.json(
        {
          code: "TENANT_CONTEXT_MISMATCH",
          message:
            "Reads must execute against the active tenant context on the current session.",
        },
        409
      )
    }

    const betterUser = await resolveBetterUser(c)
    const authority = await resolveActorAuthorityForTenant({
      session: c.get("session"),
      tenantId,
      actorLabel:
        betterUser?.name?.trim() ||
        betterUser?.email?.trim() ||
        c.get("session").userId ||
        "Afenda operator",
      requestId: c.get("requestId"),
    })

    if (!authority.permissions.includes("ops:event:view")) {
      return c.json(
        {
          code: "FORBIDDEN",
          message:
            "The actor does not have permission to view the counterparty operating projection.",
        },
        403
      )
    }

    return c.json(await readOpsCounterpartyFeed(tenantId))
  })
