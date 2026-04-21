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

  c.header("x-request-id", requestId)
  c.set("requestId", requestId)

  const session = createAnonymousSessionContext()

  const requestContext: RequestContext = {
    requestId,
    path: c.req.path,
    method: c.req.method,
    session,
  }

  c.set("requestContext", requestContext)
  setSessionContext(c, session)

  await next()
}
