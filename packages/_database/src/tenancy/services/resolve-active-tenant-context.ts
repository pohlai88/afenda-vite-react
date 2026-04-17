import { and, eq } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { identityLinks } from "../../identity/schema/identity-links.schema"
import { users } from "../../identity/schema/users.schema"
import { tenantMemberships } from "../schema/tenant-memberships.schema"
import { tenants } from "../schema/tenants.schema"

export type ResolveActiveTenantContextInput = {
  db: DatabaseClient
  /** Better Auth user id (`public.user.id`); maps to `identity_links.better_auth_user_id`. */
  authUserId: string
  authProvider?: string
  authSessionId?: string | null

  activeTenantId?: string | null
}

export type ActiveTenantContext = {
  authProvider: string
  authUserId: string
  authSessionId: string | null

  afendaUserId: string
  tenantId: string
  membershipId: string
}

export class TenantContextResolutionError extends Error {
  readonly code = "TENANT_CONTEXT_RESOLUTION" as const

  constructor(
    message: string,
    readonly details: Record<string, unknown>
  ) {
    super(message)
    this.name = "TenantContextResolutionError"
  }
}

export async function resolveActiveTenantContext(
  input: ResolveActiveTenantContextInput
): Promise<ActiveTenantContext> {
  const {
    db,
    authUserId,
    authProvider = "better-auth",
    authSessionId = null,
    activeTenantId,
  } = input

  const [identity] = await db
    .select({
      afendaUserId: identityLinks.afendaUserId,
      userIsActive: users.isActive,
    })
    .from(identityLinks)
    .innerJoin(users, eq(users.id, identityLinks.afendaUserId))
    .where(
      and(
        eq(identityLinks.authProvider, authProvider),
        eq(identityLinks.betterAuthUserId, authUserId)
      )
    )
    .limit(1)

  if (!identity) {
    throw new TenantContextResolutionError(
      "Authentication identity is not linked to an Afenda user.",
      {
        authProvider,
        authUserId,
      }
    )
  }

  if (!identity.userIsActive) {
    throw new TenantContextResolutionError("Linked Afenda user is inactive.", {
      authProvider,
      authUserId,
      afendaUserId: identity.afendaUserId,
    })
  }

  const memberships = await db
    .select({
      membershipId: tenantMemberships.id,
      tenantId: tenantMemberships.tenantId,
      membershipStatus: tenantMemberships.status,
      tenantStatus: tenants.status,
    })
    .from(tenantMemberships)
    .innerJoin(tenants, eq(tenants.id, tenantMemberships.tenantId))
    .where(eq(tenantMemberships.userId, identity.afendaUserId))

  const activeMemberships = memberships.filter(
    (row) => row.membershipStatus === "active"
  )

  if (activeMemberships.length === 0) {
    throw new TenantContextResolutionError(
      "Afenda user has no active tenant membership.",
      {
        afendaUserId: identity.afendaUserId,
        authProvider,
        authUserId,
      }
    )
  }

  const selectedMembership =
    activeTenantId == null
      ? activeMemberships.length === 1
        ? activeMemberships[0]
        : null
      : (activeMemberships.find((row) => row.tenantId === activeTenantId) ??
        null)

  if (!selectedMembership) {
    throw new TenantContextResolutionError(
      activeTenantId == null
        ? "Active tenant is required because user has multiple active memberships."
        : "Requested active tenant is not an active membership for this user.",
      {
        afendaUserId: identity.afendaUserId,
        authProvider,
        authUserId,
        activeTenantId,
        activeMembershipTenantIds: activeMemberships.map((row) => row.tenantId),
      }
    )
  }

  if (selectedMembership.tenantStatus !== "active") {
    throw new TenantContextResolutionError("Selected tenant is not active.", {
      tenantId: selectedMembership.tenantId,
      tenantStatus: selectedMembership.tenantStatus,
    })
  }

  return {
    authProvider,
    authUserId,
    authSessionId,

    afendaUserId: identity.afendaUserId,
    tenantId: selectedMembership.tenantId,
    membershipId: selectedMembership.membershipId,
  }
}
