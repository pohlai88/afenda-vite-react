/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Tenancy **service** (not DDL): lists active tenant candidates for a Better Auth identity with
 * tenant display metadata, so callers can render an explicit tenant selector when one session maps
 * to multiple active tenant memberships. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Envelope timestamp: 2026-04-22T10:00:00.000Z
 */
import { and, eq, inArray } from "drizzle-orm"

import type { DatabaseClient } from "../../../client"
import { tenantMemberships } from "../../iam/tenant-memberships.schema"
import { tenants } from "../../mdm/tenants.schema"
import {
  requireAfendaMeContextFromBetterAuthUserId,
  type AfendaMeContext,
} from "./resolve-afenda-me-context"

export type AfendaTenantCandidate = {
  readonly tenantId: string
  readonly membershipId: string
  readonly tenantName: string
  readonly tenantCode: string
  readonly isDefault: boolean
}

export type AfendaTenantCandidateList = {
  readonly afendaUserId: string
  readonly defaultTenantId: string | null
  readonly candidates: readonly AfendaTenantCandidate[]
}

type TenantMembershipDetail = {
  readonly tenantId: string
  readonly membershipId: string
}

async function loadTenantMembershipDetails(
  db: DatabaseClient,
  afendaMeContext: AfendaMeContext
): Promise<readonly TenantMembershipDetail[]> {
  if (afendaMeContext.tenantIds.length === 0) {
    return []
  }

  return db
    .select({
      membershipId: tenantMemberships.id,
      tenantId: tenantMemberships.tenantId,
    })
    .from(tenantMemberships)
    .where(
      and(
        inArray(tenantMemberships.tenantId, afendaMeContext.tenantIds),
        eq(tenantMemberships.userAccountId, afendaMeContext.afendaUserId),
        eq(tenantMemberships.membershipStatus, "active")
      )
    )
}

export async function listAfendaTenantCandidatesFromBetterAuthUserId(
  db: DatabaseClient,
  betterAuthUserId: string,
  authProvider: string = "better-auth"
): Promise<AfendaTenantCandidateList> {
  const afendaMeContext = await requireAfendaMeContextFromBetterAuthUserId(
    db,
    betterAuthUserId,
    authProvider
  )

  if (afendaMeContext.tenantIds.length === 0) {
    return {
      afendaUserId: afendaMeContext.afendaUserId,
      defaultTenantId: afendaMeContext.defaultTenantId,
      candidates: [],
    }
  }

  const membershipRows = await loadTenantMembershipDetails(db, afendaMeContext)
  const tenantRows = await db
    .select({
      tenantId: tenants.id,
      tenantName: tenants.tenantName,
      tenantCode: tenants.tenantCode,
    })
    .from(tenants)
    .where(inArray(tenants.id, afendaMeContext.tenantIds))

  const membershipByTenantId = new Map(
    membershipRows.map((row) => [row.tenantId, row.membershipId])
  )
  const tenantById = new Map(
    tenantRows.map((row) => [
      row.tenantId,
      {
        tenantName: row.tenantName,
        tenantCode: row.tenantCode,
      },
    ])
  )

  const candidates = afendaMeContext.tenantIds.flatMap((tenantId) => {
    const membershipId = membershipByTenantId.get(tenantId)
    const tenant = tenantById.get(tenantId)

    if (!membershipId || !tenant) {
      return []
    }

    return [
      {
        tenantId,
        membershipId,
        tenantName: tenant.tenantName,
        tenantCode: tenant.tenantCode,
        isDefault: tenantId === afendaMeContext.defaultTenantId,
      },
    ]
  })

  return {
    afendaUserId: afendaMeContext.afendaUserId,
    defaultTenantId: afendaMeContext.defaultTenantId,
    candidates,
  }
}
