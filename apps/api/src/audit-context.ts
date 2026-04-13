import type { Context, MiddlewareHandler } from "hono"

/** Headers mapped into audit row correlation fields (see `audit_logs` schema). */
export type AuditRequestContext = {
  tenantId: string | undefined
  requestId: string | undefined
  traceId: string | undefined
  correlationId: string | undefined
}

declare module "hono" {
  interface ContextVariableMap {
    audit: AuditRequestContext
  }
}

function header(c: Context, name: string): string | undefined {
  const v = c.req.header(name)
  return v === "" || v === undefined ? undefined : v
}

/**
 * Extracts tenant and correlation identifiers from incoming requests so
 * `insertGovernedAuditLog` can preserve causal linkage at the HTTP boundary.
 */
export const auditContextMiddleware: MiddlewareHandler = async (c, next) => {
  const traceparent = c.req.header("traceparent")
  let traceFromW3C: string | undefined
  if (traceparent) {
    const parts = traceparent.split("-")
    if (parts.length >= 2 && parts[1] !== undefined && parts[1].length > 0) {
      traceFromW3C = parts[1]
    }
  }

  c.set("audit", {
    tenantId: header(c, "x-tenant-id"),
    requestId: header(c, "x-request-id"),
    traceId: header(c, "x-trace-id") ?? traceFromW3C,
    correlationId: header(c, "x-correlation-id"),
  })

  await next()
}
