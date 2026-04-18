/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Tenancy **service** (not DDL): loads `AfendaMeContext` from `identity_links` + active `tenant_memberships` / `tenants`; optional vs throwing entry points. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/tenancy/services/resolve-afenda-me-context.ts` — `resolveAfendaMeContextFromBetterAuthUserId`, `requireAfendaMeContextFromBetterAuthUserId`, `IdentityLinkMissingError`.
 */
import { and, eq } from "drizzle-orm"

import type { DatabaseClient } from "../../../client"
import { identityLinks } from "../../iam/identity-links.schema"
import { tenantMemberships } from "../../iam/tenant-memberships.schema"
import { tenants } from "../../mdm/tenants.schema"

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
      membershipStatus: tenantMemberships.membershipStatus,
      tenantStatus: tenants.status,
    })
    .from(tenantMemberships)
    .innerJoin(tenants, eq(tenantMemberships.tenantId, tenants.id))
    .where(eq(tenantMemberships.userAccountId, afendaUserId))

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
