import { and, eq } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { identityLinks } from "../../schema/iam/identity-links.schema"
import { tenantMemberships } from "../../schema/iam/tenant-memberships.schema"
import { userAccounts } from "../../schema/iam/user-accounts.schema"
import { tenants } from "../../schema/mdm/tenants.schema"

export type ResolveActiveTenantContextInput = {
  db: DatabaseClient
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
      userIsActive: userAccounts.isActive,
    })
    .from(identityLinks)
    .innerJoin(userAccounts, eq(userAccounts.id, identityLinks.afendaUserId))
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
      { authProvider, authUserId }
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
    (row) => row.membershipStatus === "active" && row.tenantStatus === "active"
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
        ? "Active tenant is required because the user has multiple active memberships."
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

  return {
    authProvider,
    authUserId,
    authSessionId,
    afendaUserId: identity.afendaUserId,
    tenantId: selectedMembership.tenantId,
    membershipId: selectedMembership.membershipId,
  }
}
