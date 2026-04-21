/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; read-model resolvers under `src/queries/` (see `queries/README.md`).
 * Import via `@afenda/database` or `@afenda/database/queries`; do not deep-import `src/` from apps.
 * Joins `iam.tenant_memberships` → `tenant_role_assignments` → `tenant_roles`; scope columns follow `patch_m` / `patch_n` SQL as deployed.
 * **Membership lifecycle:** `joined_at` / `ended_at` vs `asOfDate` as calendar dates (UTC day semantics), consistent with `assertIsoDateOnly`.
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `queries/resolve-membership-scope.ts` — single round-trip membership + role scopes for authorization bootstrap.
 */
import { and, asc, desc, eq, isNull, or, sql } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"

import type { DatabaseClient } from "../client"
import { tenantMemberships } from "../schema/iam/tenant-memberships.schema"
import { tenantRoleAssignments } from "../schema/iam/tenant-role-assignments.schema"
import { tenantRoles } from "../schema/iam/tenant-roles.schema"
import { effectiveOnAsOfDatePredicate } from "./query-primitives/effective-date-predicate"
import {
  assertIsoDateOnly,
  todayIsoDateUtc,
} from "./query-primitives/iso-date-assertions"

export type TenantMembershipRecord = InferSelectModel<typeof tenantMemberships>
export type TenantRoleAssignmentRecord = InferSelectModel<
  typeof tenantRoleAssignments
>
export type TenantRoleRecord = InferSelectModel<typeof tenantRoles>

export type ResolvedMembershipRoleScope = {
  assignment: TenantRoleAssignmentRecord
  role: TenantRoleRecord
}

export type ResolvedMembershipScope = {
  membership: TenantMembershipRecord | null
  roleScopes: ResolvedMembershipRoleScope[]
}

export type ResolveMembershipScopeParams = {
  tenantId: string
  userAccountId: string
  /** ISO date `YYYY-MM-DD`; defaults to today (UTC). */
  asOfDate?: string
}

/**
 * Resolve active tenant membership and effective role scopes.
 *
 * Single round-trip: membership + left-joined assignments/roles (deterministic sort).
 */
export async function resolveMembershipScope(
  db: DatabaseClient,
  params: ResolveMembershipScopeParams
): Promise<ResolvedMembershipScope> {
  const { tenantId, userAccountId, asOfDate: asOfDateParam } = params

  const asOfDate = asOfDateParam ?? todayIsoDateUtc()
  assertIsoDateOnly(asOfDate, "asOfDate")

  const rows = await db
    .select({
      membership: tenantMemberships,
      assignment: tenantRoleAssignments,
      role: tenantRoles,
    })
    .from(tenantMemberships)
    .leftJoin(
      tenantRoleAssignments,
      and(
        eq(tenantRoleAssignments.tenantId, tenantMemberships.tenantId),
        eq(tenantRoleAssignments.tenantMembershipId, tenantMemberships.id),
        eq(tenantRoleAssignments.isDeleted, false),
        effectiveOnAsOfDatePredicate(
          tenantRoleAssignments.effectiveFrom,
          tenantRoleAssignments.effectiveTo,
          asOfDate
        )
      )
    )
    .leftJoin(
      tenantRoles,
      and(
        eq(tenantRoleAssignments.tenantId, tenantRoles.tenantId),
        eq(tenantRoleAssignments.tenantRoleId, tenantRoles.id),
        eq(tenantRoles.isDeleted, false)
      )
    )
    .where(
      and(
        eq(tenantMemberships.tenantId, tenantId),
        eq(tenantMemberships.userAccountId, userAccountId),
        eq(tenantMemberships.membershipStatus, "active"),
        eq(tenantMemberships.isDeleted, false),
        sql`${tenantMemberships.joinedAt}::date <= ${asOfDate}::date`,
        or(
          isNull(tenantMemberships.endedAt),
          sql`${tenantMemberships.endedAt}::date >= ${asOfDate}::date`
        )
      )
    )
    .orderBy(
      asc(tenantRoles.roleCode),
      asc(tenantRoleAssignments.scopeType),
      desc(tenantRoleAssignments.effectiveFrom),
      desc(tenantRoleAssignments.id)
    )

  if (rows.length === 0) {
    return { membership: null, roleScopes: [] }
  }

  const membership = rows[0]!.membership
  const roleScopes: ResolvedMembershipRoleScope[] = []
  for (const row of rows) {
    if (row.assignment != null && row.role != null) {
      roleScopes.push({ assignment: row.assignment, role: row.role })
    }
  }

  return { membership, roleScopes }
}
