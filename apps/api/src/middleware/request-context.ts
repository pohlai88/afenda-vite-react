/**
 * Correlation id + aggregated request context (`requestId`, path, method, session stub).
 * Replaces separate `request-id` + `session-context` chains with one place for observability / auth.
 * Types: `../contract/request-context` (`SessionContext`, `RequestContext`, `AppVariables`, `ApiEnv`).
 * platform · http · middleware · request-context
 * Upstream: hono, `../contract/request-context`. Downstream: handlers via `c.get("requestContext")`, `c.get("requestId")`, `c.get("session")`.
 * Side effects: sets response `x-request-id` and context variables.
 * stable
 * @module middleware/request-context
 * @package @afenda/api
 */
import type {
  RequestContext,
  SessionContext,
} from "../contract/request-context.js"
import type { MiddlewareHandler } from "hono"

function defaultSession(): SessionContext {
  return {
    authenticated: false,
    userId: null,
    membershipId: null,
    tenantId: null,
  }
}

export const requestContextMiddleware: MiddlewareHandler = async (c, next) => {
  const requestId = c.req.header("x-request-id")?.trim() || crypto.randomUUID()

  c.header("x-request-id", requestId)
  c.set("requestId", requestId)

  const session = defaultSession()

  const requestContext: RequestContext = {
    requestId,
    path: c.req.path,
    method: c.req.method,
    session,
  }

  c.set("requestContext", requestContext)
  c.set("session", session)

  await next()
}
