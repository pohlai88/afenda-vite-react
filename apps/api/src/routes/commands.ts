import { zValidator } from "@hono/zod-validator"
import type { Context } from "hono"
import { Hono } from "hono"

import type { ApiEnv } from "../contract/request-context.js"
import { commandExecutionSchema } from "../command/command-contracts.js"
import { executeCommand } from "../command/execute-command.js"
import { getBetterAuthRuntime } from "../lib/better-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../lib/env.js"

function resolveTenantId(c: Context<ApiEnv>): string | null {
  const explicitHeader = c.req.header("x-tenant-id")?.trim()
  if (explicitHeader) {
    return explicitHeader
  }

  return c.get("session").tenantId
}

async function resolveCommandActorLabel(c: Context<ApiEnv>): Promise<string> {
  if (hasBetterAuthRuntimeEnv()) {
    const betterSession = await getBetterAuthRuntime().auth.api.getSession({
      headers: c.req.raw.headers,
      query: {
        disableRefresh: true,
      },
    })

    const namedActor = betterSession?.user.name?.trim()
    if (namedActor && namedActor.length > 0) {
      return namedActor
    }

    const emailActor = betterSession?.user.email?.trim()
    if (emailActor && emailActor.length > 0) {
      return emailActor
    }
  }

  const session = c.get("session")
  return session.userId ?? "Afenda operator"
}

export const commandsRoutes = new Hono<ApiEnv>().post(
  "/execute",
  zValidator("json", commandExecutionSchema),
  async (c) => {
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

    if (session.tenantId && tenantId !== session.tenantId) {
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
      const result = await executeCommand({
        request: c.req.valid("json"),
        session,
        tenantId,
        actorLabel: await resolveCommandActorLabel(c),
        requestId: c.get("requestId"),
      })

      return c.json(result)
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
  }
)
