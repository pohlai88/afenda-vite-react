import { and, eq } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { identityLinks } from "../../schema/iam/identity-links.schema"
import { tenantMemberships } from "../../schema/iam/tenant-memberships.schema"
import { tenants } from "../../schema/mdm/tenants.schema"

export type AfendaMeContext = {
  afendaUserId: string
  tenantIds: string[]
  defaultTenantId: string | null
}

export class IdentityLinkMissingError extends Error {
  readonly code = "IDENTITY_LINK_REQUIRED" as const

  constructor(
    message: string,
    readonly details: { betterAuthUserId: string; authProvider: string }
  ) {
    super(message)
    this.name = "IdentityLinkMissingError"
  }
}

async function loadTenantMembershipSlice(
  db: DatabaseClient,
  afendaUserId: string
): Promise<Pick<AfendaMeContext, "tenantIds" | "defaultTenantId">> {
  const memberships = await db
    .select({
      tenantId: tenantMemberships.tenantId,
      membershipStatus: tenantMemberships.status,
      tenantStatus: tenants.status,
    })
    .from(tenantMemberships)
    .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
    .where(eq(tenantMemberships.userId, afendaUserId))

  const tenantIds = memberships
    .filter(
      (row) =>
        row.membershipStatus === "active" && row.tenantStatus === "active"
    )
    .map((row) => row.tenantId)

  return {
    tenantIds,
    defaultTenantId: tenantIds[0] ?? null,
  }
}

export async function resolveAfendaMeContextFromBetterAuthUserId(
  db: DatabaseClient,
  betterAuthUserId: string,
  authProvider: string = "better-auth"
): Promise<AfendaMeContext | null> {
  const [link] = await db
    .select({ afendaUserId: identityLinks.afendaUserId })
    .from(identityLinks)
    .where(
      and(
        eq(identityLinks.authProvider, authProvider),
        eq(identityLinks.betterAuthUserId, betterAuthUserId)
      )
    )
    .limit(1)

  if (!link) return null

  const { tenantIds, defaultTenantId } = await loadTenantMembershipSlice(
    db,
    link.afendaUserId
  )

  return {
    afendaUserId: link.afendaUserId,
    tenantIds,
    defaultTenantId,
  }
}

export async function requireAfendaMeContextFromBetterAuthUserId(
  db: DatabaseClient,
  betterAuthUserId: string,
  authProvider: string = "better-auth"
): Promise<AfendaMeContext> {
  const ctx = await resolveAfendaMeContextFromBetterAuthUserId(
    db,
    betterAuthUserId,
    authProvider
  )
  if (!ctx) {
    throw new IdentityLinkMissingError(
      "No identity_links row exists for this Better Auth user.",
      { betterAuthUserId, authProvider }
    )
  }
  return ctx
}
