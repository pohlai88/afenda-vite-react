/**
 * Request + session context types for Hono `Variables` (API + typed clients).
 * @module contract/request-context
 */
export type SessionContext = {
  authenticated: boolean
  userId: string | null
  membershipId: string | null
  tenantId: string | null
}

export type RequestContext = {
  requestId: string
  path: string
  method: string
  session: SessionContext
}

export type AppVariables = {
  requestId: string
  session: SessionContext
  requestContext: RequestContext
}

export type ApiEnv = {
  Variables: AppVariables
}
