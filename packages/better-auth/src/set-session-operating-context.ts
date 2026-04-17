import {
  resolveActiveTenantContext,
  type ActiveTenantContext,
  type DatabaseClient,
} from "@afenda/database"

type AfendaAuth = ReturnType<
  typeof import("./create-afenda-auth.js").createAfendaAuth
>

/**
 * Server-owned operating context (restart baseline). Validates identity → active tenant membership,
 * then persists the tenant lens on the Better Auth session (`session.additionalFields`).
 */
export type SetSessionOperatingContextInput = {
  headers: Headers
  activeTenantId?: string | null
}

export async function setSessionOperatingContext(
  auth: AfendaAuth,
  db: DatabaseClient,
  params: SetSessionOperatingContextInput
): Promise<ActiveTenantContext> {
  const session = await auth.api.getSession({ headers: params.headers })
  if (!session) {
    throw new Error("setSessionOperatingContext: unauthenticated")
  }

  const ctx = await resolveActiveTenantContext({
    db,
    authUserId: session.user.id,
    authSessionId: session.session.id,
    activeTenantId: params.activeTenantId ?? undefined,
  })

  await auth.api.updateSession({
    headers: params.headers,
    body: {
      activeTenantId: ctx.tenantId,
      activeMembershipId: ctx.membershipId,
    },
  })

  return ctx
}
