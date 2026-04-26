/**
 * Correlation id + aggregated request context (`requestId`, path, method, session stub).
 * Replaces separate `request-id` + `session-context` chains with one place for observability / auth.
 * Types: `../contract/request-context.contract` (`SessionContext`, `RequestContext`, `AppVariables`, `ApiEnv`).
 * platform · http · middleware · request-context
 * Upstream: hono, `../contract/request-context.contract`. Downstream: handlers via `c.get("requestContext")`, `c.get("requestId")`, `c.get("session")`.
 * Side effects: sets response `x-request-id` and context variables.
 * stable
 * @module api-request-context.middleware
 * @package @afenda/api
 */
import type {
  RequestContext,
  SessionContext,
} from "./contract/request-context.contract.js"
import type { Context, MiddlewareHandler } from "hono"

export function createAnonymousSessionContext(): SessionContext {
  return {
    authenticated: false,
    authSessionId: null,
    userId: null,
    membershipId: null,
    tenantId: null,
  }
}

export function setSessionContext(
  context: Context,
  session: SessionContext
): void {
  context.set("session", session)

  const requestContext = context.get("requestContext") as
    | RequestContext
    | undefined

  if (requestContext) {
    requestContext.session = session
    context.set("requestContext", requestContext)
  }
}

export const requestContextMiddleware: MiddlewareHandler = async (c, next) => {
  const requestId = c.req.header("x-request-id")?.trim() || crypto.randomUUID()
  const traceId = c.req.header("x-trace-id")?.trim() || requestId

  c.header("x-request-id", requestId)
  c.header("x-trace-id", traceId)
  c.set("requestId", requestId)
  c.set("traceId", traceId)

  const session = createAnonymousSessionContext()

  const requestContext: RequestContext = {
    requestId,
    traceId,
    path: c.req.path,
    method: c.req.method,
    session,
  }

  c.set("requestContext", requestContext)
  setSessionContext(c, session)

  await next()
}
