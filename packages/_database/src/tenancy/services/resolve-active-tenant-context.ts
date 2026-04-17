/**
 * Active tenant context resolution — one deterministic actor + tenant + membership from auth input.
 *
 * - Auth identity must resolve through **`identity_links`** (see ADR-0004).
 * - **`activeTenantId`** when set must match an active membership; when omitted, single active membership is the only allowed fallback (“bridge” / pre-pick state).
 * - Optional operating context ids are validated with **`assertMembershipScopeAccess`**, then **`assertContextAlignment`** so bindings agree (legal entity, business unit, location, org unit).
 *
 * @example Protected mutation handler
 * ```ts
 * const context = await resolveActiveTenantContext({
 *   db,
 *   authUserId: session.user.id,
 *   authProvider: "better-auth",
 *   authSessionId: session.session.id,
 *   activeTenantId: session.session.activeTenantId,
 *   activeLegalEntityId: session.session.activeLegalEntityId,
 *   activeBusinessUnitId: session.session.activeBusinessUnitId,
 *   activeLocationId: session.session.activeLocationId,
 *   activeOrgUnitId: session.session.activeOrgUnitId,
 * })
 * // context.tenantId → filters; context.membershipId → auth + audit; context.afendaUserId → actor
 * ```
 *
 * See `packages/_database/README.md` § “Protected API handlers” for audit field mapping (`session_id` on rows vs `authSessionId` on context).
 */

import { and, eq } from "drizzle-orm"

import {
  assertMembershipScopeAccess,
  type ScopeGrant,
} from "../../authorization/services/assert-membership-scope-access"
import type { DatabaseClient } from "../../client"
import { assertContextAlignment } from "./assert-context-alignment"
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
  activeLegalEntityId?: string | null
  activeBusinessUnitId?: string | null
  activeLocationId?: string | null
  activeOrgUnitId?: string | null
}

export type ActiveTenantContext = {
  authProvider: string
  authUserId: string
  authSessionId: string | null

  afendaUserId: string
  tenantId: string
  membershipId: string

  activeLegalEntityId: string | null
  activeBusinessUnitId: string | null
  activeLocationId: string | null
  activeOrgUnitId: string | null

  grants: {
    tenant: ScopeGrant
    legalEntity?: ScopeGrant
    businessUnit?: ScopeGrant
    location?: ScopeGrant
    orgUnit?: ScopeGrant
  }
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
    activeLegalEntityId,
    activeBusinessUnitId,
    activeLocationId,
    activeOrgUnitId,
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

  const tenantGrant = await assertMembershipScopeAccess({
    db,
    tenantId: selectedMembership.tenantId,
    membershipId: selectedMembership.membershipId,
    scopeType: "tenant",
    scopeId: selectedMembership.tenantId,
  })

  const legalEntityGrant = activeLegalEntityId
    ? await assertMembershipScopeAccess({
        db,
        tenantId: selectedMembership.tenantId,
        membershipId: selectedMembership.membershipId,
        scopeType: "legal_entity",
        scopeId: activeLegalEntityId,
      })
    : undefined

  const businessUnitGrant = activeBusinessUnitId
    ? await assertMembershipScopeAccess({
        db,
        tenantId: selectedMembership.tenantId,
        membershipId: selectedMembership.membershipId,
        scopeType: "business_unit",
        scopeId: activeBusinessUnitId,
      })
    : undefined

  const locationGrant = activeLocationId
    ? await assertMembershipScopeAccess({
        db,
        tenantId: selectedMembership.tenantId,
        membershipId: selectedMembership.membershipId,
        scopeType: "location",
        scopeId: activeLocationId,
      })
    : undefined

  const orgUnitGrant = activeOrgUnitId
    ? await assertMembershipScopeAccess({
        db,
        tenantId: selectedMembership.tenantId,
        membershipId: selectedMembership.membershipId,
        scopeType: "org_unit",
        scopeId: activeOrgUnitId,
      })
    : undefined

  const alignedContext = await assertContextAlignment({
    db,
    tenantId: selectedMembership.tenantId,
    activeLegalEntityId,
    activeBusinessUnitId,
    activeLocationId,
    activeOrgUnitId,
  })

  return {
    authProvider,
    authUserId,
    authSessionId,

    afendaUserId: identity.afendaUserId,
    tenantId: selectedMembership.tenantId,
    membershipId: selectedMembership.membershipId,

    activeLegalEntityId: alignedContext.legalEntity?.id ?? null,
    activeBusinessUnitId: alignedContext.businessUnit?.id ?? null,
    activeLocationId: alignedContext.location?.id ?? null,
    activeOrgUnitId: alignedContext.orgUnit?.id ?? null,

    grants: {
      tenant: tenantGrant,
      legalEntity: legalEntityGrant,
      businessUnit: businessUnitGrant,
      location: locationGrant,
      orgUnit: orgUnitGrant,
    },
  }
}
