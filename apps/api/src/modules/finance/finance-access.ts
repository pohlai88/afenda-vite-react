import type { Context } from "hono"

import { getBetterAuthRuntime } from "../../api-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../../api-env.js"
import { resolveActorAuthorityForTenant } from "../../command/execute-command.js"
import type { ApiEnv } from "../../contract/request-context.contract.js"

function resolveTenantId(c: Context<ApiEnv>): string | null {
  const explicitHeader = c.req.header("x-tenant-id")?.trim()
  if (explicitHeader) {
    return explicitHeader
  }

  return c.get("session").tenantId
}

export function ensureFinanceTenantContext(
  c: Context<ApiEnv>
): string | Response {
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
          "Reads and writes must execute against the active tenant context on the current session.",
      },
      409
    )
  }

  return tenantId
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

export async function resolveFinanceAuthority(
  c: Context<ApiEnv>,
  tenantId: string
): Promise<{
  readonly roles: readonly string[]
  readonly permissions: readonly string[]
}> {
  const betterUser = await resolveBetterUser(c)

  return resolveActorAuthorityForTenant({
    session: c.get("session"),
    tenantId,
    actorLabel:
      betterUser?.name?.trim() ||
      betterUser?.email?.trim() ||
      c.get("session").userId ||
      "Afenda operator",
    requestId: c.get("requestId"),
  })
}
