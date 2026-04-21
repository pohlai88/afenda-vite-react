/**
 * Resolves the Better Auth session for the current request and mirrors it onto the API request
 * context so logs and downstream handlers see one stable session surface.
 *
 * @module middleware/better-auth-session-context
 * @package @afenda/api
 */
import type { MiddlewareHandler } from "hono"

import type { SessionContext } from "../contract/request-context.js"
import { getBetterAuthRuntime } from "../lib/better-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../lib/env.js"
import { loggerForContext } from "../lib/logger.js"
import { setSessionContext } from "./request-context.js"

function mapAuthenticatedSession(session: {
  readonly session: {
    readonly id: string
    readonly activeTenantId?: string | null
    readonly activeMembershipId?: string | null
  }
  readonly user: {
    readonly id: string
  }
}): SessionContext {
  return {
    authenticated: true,
    authSessionId: session.session.id,
    userId: session.user.id,
    membershipId: session.session.activeMembershipId ?? null,
    tenantId: session.session.activeTenantId ?? null,
  }
}

function applyOutgoingHeaders(
  setHeader: (
    name: string,
    value: string,
    options?: { append?: boolean }
  ) => void,
  headers: Headers
): void {
  const headerBag = headers as Headers & {
    getSetCookie?: () => string[]
  }

  const setCookies =
    headerBag.getSetCookie?.() ??
    (headers.get("set-cookie") ? [headers.get("set-cookie") as string] : [])
  for (const cookie of setCookies) {
    setHeader("set-cookie", cookie, { append: true })
  }

  headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      return
    }
    setHeader(key, value, { append: true })
  })
}

export const betterAuthSessionContextMiddleware: MiddlewareHandler = async (
  c,
  next
) => {
  if (!hasBetterAuthRuntimeEnv()) {
    await next()
    return
  }

  const runtime = getBetterAuthRuntime()

  const session = await runtime.auth.api.getSession({
    headers: c.req.raw.headers,
    query: {
      disableRefresh: true,
    },
  })

  if (session) {
    let mappedSession = mapAuthenticatedSession(session)

    if (!mappedSession.tenantId || !mappedSession.membershipId) {
      try {
        const activation = await runtime.activateTenantContext({
          headers: c.req.raw.headers,
        })

        applyOutgoingHeaders(c.header.bind(c), activation.outgoingHeaders)

        mappedSession = {
          ...mappedSession,
          membershipId: activation.context.membershipId,
          tenantId: activation.context.tenantId,
        }
      } catch (error) {
        loggerForContext(c).debug(
          {
            path: c.req.path,
            method: c.req.method,
            error: error instanceof Error ? error.message : "unknown_error",
          },
          "tenant context activation skipped"
        )
      }
    }

    setSessionContext(c, mappedSession)
  }

  await next()
}
