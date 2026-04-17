import { and, eq } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { identityLinks } from "../../identity/schema/identity-links.schema"
import { tenantMemberships } from "../schema/tenant-memberships.schema"
import { tenants } from "../schema/tenants.schema"

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
      status: tenantMemberships.status,
      tenantStatus: tenants.status,
    })
    .from(tenantMemberships)
    .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
    .where(eq(tenantMemberships.userId, afendaUserId))

  const tenantIds = memberships
    .filter((m) => m.status === "active" && m.tenantStatus === "active")
    .map((m) => m.tenantId)

  return {
    tenantIds,
    defaultTenantId: tenantIds[0] ?? null,
  }
}

/**
 * Runtime resolution: **`better_auth_user_id` → `identity_links` → Afenda user → memberships** (ADR-0004).
 * No email fallback — missing link is invalid for authenticated API use.
 */
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

/**
 * Same as {@link resolveAfendaMeContextFromBetterAuthUserId} but **throws** {@link IdentityLinkMissingError}
 * when no `identity_links` row exists — use on protected routes that require a bridged principal.
 */
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
      "No identity_links row for this Better Auth user; bootstrap or sign-up must create the bridge.",
      { betterAuthUserId, authProvider }
    )
  }
  return ctx
}
