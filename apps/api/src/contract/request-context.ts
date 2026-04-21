/**
 * Request + session context types for Hono `Variables` (API + typed clients).
 * @module contract/request-context
 */
export type SessionContext = {
  authenticated: boolean
  authSessionId: string | null
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

export type RequestLogger = {
  child(bindings: Record<string, unknown>): RequestLogger
  debug(bindings: Record<string, unknown>, message?: string): void
  info(bindings: Record<string, unknown>, message?: string): void
  warn(bindings: Record<string, unknown>, message?: string): void
  error(bindings: Record<string, unknown>, message?: string): void
}

export type AppVariables = {
  requestId: string
  session: SessionContext
  requestContext: RequestContext
  logger: RequestLogger
}

export type ApiEnv = {
  Variables: AppVariables
}
