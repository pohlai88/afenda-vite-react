import {
  resolveActiveTenantContext,
  type ActiveTenantContext,
  type DatabaseClient,
} from "@afenda/database"

type AfendaAuth = ReturnType<
  typeof import("./create-afenda-auth.js").createAfendaAuth
>

/**
 * Server-owned operating context (ADR-0006). Validates identity → membership → scope → alignment,
 * then persists the lens on the Better Auth session (`session.additionalFields`). Not authority:
 * protected routes must still call {@link resolveActiveTenantContext} (or this) — never trust client-authored IDs alone.
 */
export type SetSessionOperatingContextInput = {
  headers: Headers
  activeTenantId?: string | null
  activeLegalEntityId?: string | null
  activeBusinessUnitId?: string | null
  activeLocationId?: string | null
  activeOrgUnitId?: string | null
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
    activeLegalEntityId: params.activeLegalEntityId ?? undefined,
    activeBusinessUnitId: params.activeBusinessUnitId ?? undefined,
    activeLocationId: params.activeLocationId ?? undefined,
    activeOrgUnitId: params.activeOrgUnitId ?? undefined,
  })

  await auth.api.updateSession({
    headers: params.headers,
    body: {
      activeTenantId: ctx.tenantId,
      activeMembershipId: ctx.membershipId,
      activeLegalEntityId: ctx.activeLegalEntityId,
      activeBusinessUnitId: ctx.activeBusinessUnitId,
      activeLocationId: ctx.activeLocationId,
      activeOrgUnitId: ctx.activeOrgUnitId,
    },
  })

  return ctx
}
