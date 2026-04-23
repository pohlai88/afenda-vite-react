import type { Context } from "hono"
import { Hono } from "hono"

import type { ApiEnv } from "../contract/request-context.js"
import {
  executeCommand,
  resolveActorAuthorityForTenant,
} from "../command/execute-command.js"
import { getBetterAuthRuntime } from "../lib/better-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../lib/env.js"
import {
  filterWorkspaceSnapshotForPermissions,
  readOpsAuditFeed,
  readOpsCounterpartyFeed,
  readOpsEventsWorkspaceFeed,
  readWorkspaceSnapshot,
} from "../modules/operations/ops.projection.js"

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

function applyLegacyOpsCompatibilityHeaders(
  c: Context<ApiEnv>,
  legacySurface:
    | "ops-workspace-snapshot"
    | "ops-event-claim-wrapper"
    | "ops-event-advance-wrapper"
): void {
  c.header("deprecation", "true")
  c.header("x-afenda-legacy-surface", legacySurface)
  c.header(
    "x-afenda-replacement-surfaces",
    "ops/events-workspace, ops/audit, ops/counterparties, commands/execute"
  )
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
  .get("/workspace", async (c) => {
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

    applyLegacyOpsCompatibilityHeaders(c, "ops-workspace-snapshot")

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
            "The actor does not have permission to view the ops workspace.",
        },
        403
      )
    }

    return c.json(
      filterWorkspaceSnapshotForPermissions({
        snapshot: await readWorkspaceSnapshot(tenantId, {
          includeAudit: authority.permissions.includes("ops:audit:view"),
        }),
        permissions: authority.permissions,
      })
    )
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
            "The actor does not have permission to view the counterparty operating surface.",
        },
        403
      )
    }

    return c.json(await readOpsCounterpartyFeed(tenantId))
  })
  .post("/events/:eventId/claim", async (c) => {
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
            "Commands must execute against the active tenant context on the current session.",
        },
        409
      )
    }

    try {
      applyLegacyOpsCompatibilityHeaders(c, "ops-event-claim-wrapper")
      const betterUser = await resolveBetterUser(c)
      const eventId = c.req.param("eventId")
      await executeCommand({
        request: {
          type: "ops.event.claim",
          payload: { eventId },
        },
        session: c.get("session"),
        tenantId,
        actorLabel:
          betterUser?.name?.trim() ||
          betterUser?.email?.trim() ||
          c.get("session").userId ||
          "Afenda operator",
        requestId: c.get("requestId"),
      })
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
      return c.json(
        filterWorkspaceSnapshotForPermissions({
          snapshot: await readWorkspaceSnapshot(tenantId, {
            includeAudit: authority.permissions.includes("ops:audit:view"),
          }),
          permissions: authority.permissions,
        })
      )
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith("command_forbidden:")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to execute this command.",
          },
          403
        )
      }
      if (
        error instanceof Error &&
        error.message.startsWith("ops_event_invalid_transition:")
      ) {
        return c.json(
          {
            code: "INVALID_TRANSITION",
            message: "The requested transition violates the ops state machine.",
          },
          409
        )
      }
      if (
        error instanceof Error &&
        error.message.startsWith("event_not_found:")
      ) {
        return c.json(
          {
            code: "EVENT_NOT_FOUND",
            message: "The requested event does not exist.",
          },
          404
        )
      }
      if (
        error instanceof Error &&
        error.message.startsWith("ops_event_concurrency_conflict:")
      ) {
        return c.json(
          {
            code: "STALE_STATE",
            message:
              "The event changed while this command was executing. Reload and try again.",
          },
          409
        )
      }
      throw error
    }
  })
  .post("/events/:eventId/advance", async (c) => {
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
            "Commands must execute against the active tenant context on the current session.",
        },
        409
      )
    }

    try {
      applyLegacyOpsCompatibilityHeaders(c, "ops-event-advance-wrapper")
      const betterUser = await resolveBetterUser(c)
      const eventId = c.req.param("eventId")
      await executeCommand({
        request: {
          type: "ops.event.advance",
          payload: { eventId },
        },
        session: c.get("session"),
        tenantId,
        actorLabel:
          betterUser?.name?.trim() ||
          betterUser?.email?.trim() ||
          c.get("session").userId ||
          "Afenda operator",
        requestId: c.get("requestId"),
      })
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
      return c.json(
        filterWorkspaceSnapshotForPermissions({
          snapshot: await readWorkspaceSnapshot(tenantId, {
            includeAudit: authority.permissions.includes("ops:audit:view"),
          }),
          permissions: authority.permissions,
        })
      )
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith("command_forbidden:")
      ) {
        return c.json(
          {
            code: "FORBIDDEN",
            message:
              "The actor does not have permission to execute this command.",
          },
          403
        )
      }
      if (
        error instanceof Error &&
        error.message.startsWith("ops_event_invalid_transition:")
      ) {
        return c.json(
          {
            code: "INVALID_TRANSITION",
            message: "The requested transition violates the ops state machine.",
          },
          409
        )
      }
      if (
        error instanceof Error &&
        error.message.startsWith("event_not_found:")
      ) {
        return c.json(
          {
            code: "EVENT_NOT_FOUND",
            message: "The requested event does not exist.",
          },
          404
        )
      }
      if (
        error instanceof Error &&
        error.message.startsWith("ops_event_concurrency_conflict:")
      ) {
        return c.json(
          {
            code: "STALE_STATE",
            message:
              "The event changed while this command was executing. Reload and try again.",
          },
          409
        )
      }
      throw error
    }
  })
