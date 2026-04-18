/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Tenancy **service** (not DDL): resolves `identity_links` → active `tenant_memberships` + `tenants` row for Better Auth subject; selects membership when `activeTenantId` is set or unique. Tables defined under `src/schema/iam/` / `src/schema/mdm/`. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/tenancy/services/resolve-active-tenant-context.ts` — `resolveActiveTenantContext`, `TenantContextResolutionError`.
 */
import { and, eq } from "drizzle-orm"

import type { DatabaseClient } from "../../../client"
import { identityLinks } from "../../iam/identity-links.schema"
import { tenantMemberships } from "../../iam/tenant-memberships.schema"
import { userAccounts } from "../../iam/user-accounts.schema"
import { tenants } from "../../mdm/tenants.schema"

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
      accountStatus: userAccounts.accountStatus,
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

  if (identity.accountStatus !== "active") {
    throw new TenantContextResolutionError(
      "Linked Afenda user is not active (account status).",
      {
        authProvider,
        authUserId,
        afendaUserId: identity.afendaUserId,
        accountStatus: identity.accountStatus,
      }
    )
  }

  const memberships = await db
    .select({
      membershipId: tenantMemberships.id,
      tenantId: tenantMemberships.tenantId,
      membershipStatus: tenantMemberships.membershipStatus,
      tenantStatus: tenants.status,
    })
    .from(tenantMemberships)
    .innerJoin(tenants, eq(tenants.id, tenantMemberships.tenantId))
    .where(eq(tenantMemberships.userAccountId, identity.afendaUserId))

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
