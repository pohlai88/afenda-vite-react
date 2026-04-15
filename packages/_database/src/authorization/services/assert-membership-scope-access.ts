/**
 * Membership scope access — deterministic tenant-bound scope enforcement.
 *
 * - Membership must be **active** and belong to the active tenant.
 * - Target object must belong to the same tenant.
 * - **Exclude** always denies when it matches.
 * - **Includes** for a scope type narrow access for that type; if any include rows exist for that type, the target must be explicitly included.
 * - If **no** include rows exist for that type, active membership grants tenant-wide access for that type (subject to tenant-level includes when present).
 */

import { and, eq, inArray } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { businessUnits } from "../../organization/schema/business-units"
import { legalEntities } from "../../organization/schema/legal-entities"
import { locations } from "../../organization/schema/locations"
import { orgUnits } from "../../organization/schema/org-units"
import { tenantMemberships } from "../../tenancy/schema/tenant-memberships"
import { tenants } from "../../tenancy/schema/tenants"
import { membershipScopes } from "../schema/membership-scopes"

export type MembershipScopeType =
  | "tenant"
  | "legal_entity"
  | "business_unit"
  | "location"
  | "org_unit"

export type MembershipScopeAccessMode = "include" | "exclude"

export type ScopeGrantReason =
  | "membership-default"
  | "tenant-include"
  | "type-include"

export type ScopeGrant = {
  scopeType: MembershipScopeType
  scopeId: string
  reason: ScopeGrantReason
}

export class MembershipScopeAccessError extends Error {
  readonly code = "MEMBERSHIP_SCOPE_ACCESS" as const

  constructor(
    message: string,
    readonly details: Record<string, unknown>
  ) {
    super(message)
    this.name = "MembershipScopeAccessError"
  }
}

export type AssertMembershipScopeAccessInput = {
  db: DatabaseClient
  tenantId: string
  membershipId: string
  scopeType: MembershipScopeType
  scopeId: string
}

export type ScopeRow = {
  scopeType: MembershipScopeType
  scopeId: string
  accessMode: MembershipScopeAccessMode
}

async function resolveTargetTenantId(
  db: DatabaseClient,
  scopeType: MembershipScopeType,
  scopeId: string
): Promise<string> {
  switch (scopeType) {
    case "tenant": {
      const [row] = await db
        .select({ tenantId: tenants.id })
        .from(tenants)
        .where(eq(tenants.id, scopeId))
        .limit(1)

      if (!row) {
        throw new MembershipScopeAccessError("Target tenant not found.", {
          scopeType,
          scopeId,
        })
      }

      return row.tenantId
    }

    case "legal_entity": {
      const [row] = await db
        .select({ tenantId: legalEntities.tenantId })
        .from(legalEntities)
        .where(eq(legalEntities.id, scopeId))
        .limit(1)

      if (!row) {
        throw new MembershipScopeAccessError("Target legal entity not found.", {
          scopeType,
          scopeId,
        })
      }

      return row.tenantId
    }

    case "business_unit": {
      const [row] = await db
        .select({ tenantId: businessUnits.tenantId })
        .from(businessUnits)
        .where(eq(businessUnits.id, scopeId))
        .limit(1)

      if (!row) {
        throw new MembershipScopeAccessError("Target business unit not found.", {
          scopeType,
          scopeId,
        })
      }

      return row.tenantId
    }

    case "location": {
      const [row] = await db
        .select({ tenantId: locations.tenantId })
        .from(locations)
        .where(eq(locations.id, scopeId))
        .limit(1)

      if (!row) {
        throw new MembershipScopeAccessError("Target location not found.", {
          scopeType,
          scopeId,
        })
      }

      return row.tenantId
    }

    case "org_unit": {
      const [row] = await db
        .select({ tenantId: orgUnits.tenantId })
        .from(orgUnits)
        .where(eq(orgUnits.id, scopeId))
        .limit(1)

      if (!row) {
        throw new MembershipScopeAccessError("Target org unit not found.", {
          scopeType,
          scopeId,
        })
      }

      return row.tenantId
    }

    default: {
      const _exhaustive: never = scopeType
      return _exhaustive
    }
  }
}

/** Pure evaluation for unit tests and inline reuse. */
export function evaluateMembershipScopeGrant(params: {
  tenantId: string
  scopeType: MembershipScopeType
  scopeId: string
  rows: ScopeRow[]
}): ScopeGrant {
  const { tenantId, scopeType, scopeId, rows } = params

  const exactTenantExclude = rows.some(
    (row) =>
      row.scopeType === "tenant" &&
      row.scopeId === tenantId &&
      row.accessMode === "exclude"
  )

  const exactTypeExclude = rows.some(
    (row) =>
      row.scopeType === scopeType &&
      row.scopeId === scopeId &&
      row.accessMode === "exclude"
  )

  if (exactTenantExclude || exactTypeExclude) {
    throw new MembershipScopeAccessError("Membership scope explicitly denied.", {
      tenantId,
      scopeType,
      scopeId,
      deniedBy: exactTypeExclude ? "type-exclude" : "tenant-exclude",
    })
  }

  const tenantIncludes = rows.filter(
    (row) => row.scopeType === "tenant" && row.accessMode === "include"
  )

  const typeIncludes = rows.filter(
    (row) => row.scopeType === scopeType && row.accessMode === "include"
  )

  const hasTenantInclude = tenantIncludes.some((row) => row.scopeId === tenantId)
  const hasTypeInclude = typeIncludes.some((row) => row.scopeId === scopeId)

  if (scopeType === "tenant") {
    if (tenantIncludes.length > 0 && !hasTenantInclude) {
      throw new MembershipScopeAccessError(
        "Membership tenant include list does not grant this tenant.",
        {
          tenantId,
          scopeType,
          scopeId,
        }
      )
    }

    return {
      scopeType,
      scopeId,
      reason: tenantIncludes.length > 0 ? "tenant-include" : "membership-default",
    }
  }

  if (typeIncludes.length > 0) {
    if (!hasTypeInclude) {
      throw new MembershipScopeAccessError(
        "Membership include list does not grant this scoped object.",
        {
          tenantId,
          scopeType,
          scopeId,
        }
      )
    }

    return {
      scopeType,
      scopeId,
      reason: "type-include",
    }
  }

  if (tenantIncludes.length > 0 && !hasTenantInclude) {
    throw new MembershipScopeAccessError(
      "Membership tenant include list does not grant this tenant.",
      {
        tenantId,
        scopeType,
        scopeId,
      }
    )
  }

  return {
    scopeType,
    scopeId,
    reason: tenantIncludes.length > 0 ? "tenant-include" : "membership-default",
  }
}

export async function assertMembershipScopeAccess(
  input: AssertMembershipScopeAccessInput
): Promise<ScopeGrant> {
  const { db, tenantId, membershipId, scopeType, scopeId } = input

  const [membership] = await db
    .select({
      id: tenantMemberships.id,
      tenantId: tenantMemberships.tenantId,
      status: tenantMemberships.status,
    })
    .from(tenantMemberships)
    .where(eq(tenantMemberships.id, membershipId))
    .limit(1)

  if (!membership) {
    throw new MembershipScopeAccessError("Membership not found.", {
      membershipId,
      tenantId,
      scopeType,
      scopeId,
    })
  }

  if (membership.status !== "active") {
    throw new MembershipScopeAccessError("Membership is not active.", {
      membershipId,
      membershipStatus: membership.status,
      tenantId,
      scopeType,
      scopeId,
    })
  }

  if (membership.tenantId !== tenantId) {
    throw new MembershipScopeAccessError("Membership does not belong to tenant.", {
      membershipId,
      membershipTenantId: membership.tenantId,
      tenantId,
      scopeType,
      scopeId,
    })
  }

  const targetTenantId = await resolveTargetTenantId(db, scopeType, scopeId)

  if (targetTenantId !== tenantId) {
    throw new MembershipScopeAccessError(
      "Scoped object does not belong to the active tenant.",
      {
        membershipId,
        tenantId,
        targetTenantId,
        scopeType,
        scopeId,
      }
    )
  }

  const scopeTypesForQuery: MembershipScopeType[] = ["tenant", scopeType]

  const rows = await db
    .select({
      scopeType: membershipScopes.scopeType,
      scopeId: membershipScopes.scopeId,
      accessMode: membershipScopes.accessMode,
    })
    .from(membershipScopes)
    .where(
      and(
        eq(membershipScopes.membershipId, membershipId),
        eq(membershipScopes.tenantId, tenantId),
        inArray(membershipScopes.scopeType, scopeTypesForQuery)
      )
    )

  return evaluateMembershipScopeGrant({
    tenantId,
    scopeType,
    scopeId,
    rows: rows.map((r) => ({
      scopeType: r.scopeType as MembershipScopeType,
      scopeId: r.scopeId,
      accessMode: r.accessMode as MembershipScopeAccessMode,
    })),
  })
}
