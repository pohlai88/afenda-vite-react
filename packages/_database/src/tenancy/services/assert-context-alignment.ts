/**
 * CONTEXT ALIGNMENT
 *
 * Purpose
 * - Validate that the selected operating context forms a coherent combination.
 * - Prevent impossible or contradictory context mixes inside the same tenant.
 *
 * Rules
 * - Every selected object must exist and belong to the active tenant.
 * - Optional bindings are only enforced when the bound foreign key is present.
 * - Null linkage means "not constrained by this dimension", not automatic failure.
 *
 * Examples
 * - If a location is bound to legal entity A, active legal entity B is invalid.
 * - If an org unit is bound to location X, active location Y is invalid.
 * - If a linkage is null, the combination remains allowed unless another rule rejects it.
 */

import { eq } from "drizzle-orm"

import type { DatabaseClient } from "../../client"
import { businessUnits } from "../../organization/schema/business-units"
import { legalEntities } from "../../organization/schema/legal-entities"
import { locations } from "../../organization/schema/locations"
import { orgUnits } from "../../organization/schema/org-units"

export type AssertContextAlignmentInput = {
  db: DatabaseClient
  tenantId: string
  activeLegalEntityId?: string | null
  activeBusinessUnitId?: string | null
  activeLocationId?: string | null
  activeOrgUnitId?: string | null
}

export type ResolvedAlignedContext = {
  tenantId: string
  legalEntity: {
    id: string
  } | null
  businessUnit: {
    id: string
  } | null
  location: {
    id: string
    legalEntityId: string | null
    businessUnitId: string | null
  } | null
  orgUnit: {
    id: string
    legalEntityId: string | null
    businessUnitId: string | null
    locationId: string | null
  } | null
}

export class ContextAlignmentError extends Error {
  readonly code = "CONTEXT_ALIGNMENT" as const

  constructor(
    message: string,
    readonly details: Record<string, unknown>
  ) {
    super(message)
    this.name = "ContextAlignmentError"
  }
}

function assertTenantMatch(params: {
  tenantId: string
  actualTenantId: string
  subjectType: string
  subjectId: string
}): void {
  const { tenantId, actualTenantId, subjectType, subjectId } = params

  if (tenantId !== actualTenantId) {
    throw new ContextAlignmentError(
      `${subjectType} does not belong to the active tenant.`,
      {
        tenantId,
        actualTenantId,
        subjectType,
        subjectId,
      }
    )
  }
}

function assertBoundMatch(params: {
  label: string
  expectedId: string
  actualId: string | null
  actualSourceType: string
  actualSourceId: string
}): void {
  const { label, expectedId, actualId, actualSourceType, actualSourceId } =
    params

  if (actualId !== null && actualId !== expectedId) {
    throw new ContextAlignmentError(
      `${actualSourceType} conflicts with active ${label}.`,
      {
        label,
        expectedId,
        actualId,
        actualSourceType,
        actualSourceId,
      }
    )
  }
}

export async function assertContextAlignment(
  input: AssertContextAlignmentInput
): Promise<ResolvedAlignedContext> {
  const {
    db,
    tenantId,
    activeLegalEntityId,
    activeBusinessUnitId,
    activeLocationId,
    activeOrgUnitId,
  } = input

  const legalEntity = activeLegalEntityId
    ? await db
        .select({
          id: legalEntities.id,
          tenantId: legalEntities.tenantId,
        })
        .from(legalEntities)
        .where(eq(legalEntities.id, activeLegalEntityId))
        .limit(1)
        .then((rows) => rows[0] ?? null)
    : null

  if (activeLegalEntityId && !legalEntity) {
    throw new ContextAlignmentError("Active legal entity not found.", {
      tenantId,
      activeLegalEntityId,
    })
  }

  if (legalEntity) {
    assertTenantMatch({
      tenantId,
      actualTenantId: legalEntity.tenantId,
      subjectType: "legal_entity",
      subjectId: legalEntity.id,
    })
  }

  const businessUnit = activeBusinessUnitId
    ? await db
        .select({
          id: businessUnits.id,
          tenantId: businessUnits.tenantId,
        })
        .from(businessUnits)
        .where(eq(businessUnits.id, activeBusinessUnitId))
        .limit(1)
        .then((rows) => rows[0] ?? null)
    : null

  if (activeBusinessUnitId && !businessUnit) {
    throw new ContextAlignmentError("Active business unit not found.", {
      tenantId,
      activeBusinessUnitId,
    })
  }

  if (businessUnit) {
    assertTenantMatch({
      tenantId,
      actualTenantId: businessUnit.tenantId,
      subjectType: "business_unit",
      subjectId: businessUnit.id,
    })
  }

  const location = activeLocationId
    ? await db
        .select({
          id: locations.id,
          tenantId: locations.tenantId,
          legalEntityId: locations.legalEntityId,
          businessUnitId: locations.businessUnitId,
        })
        .from(locations)
        .where(eq(locations.id, activeLocationId))
        .limit(1)
        .then((rows) => rows[0] ?? null)
    : null

  if (activeLocationId && !location) {
    throw new ContextAlignmentError("Active location not found.", {
      tenantId,
      activeLocationId,
    })
  }

  if (location) {
    assertTenantMatch({
      tenantId,
      actualTenantId: location.tenantId,
      subjectType: "location",
      subjectId: location.id,
    })
  }

  const orgUnit = activeOrgUnitId
    ? await db
        .select({
          id: orgUnits.id,
          tenantId: orgUnits.tenantId,
          legalEntityId: orgUnits.legalEntityId,
          businessUnitId: orgUnits.businessUnitId,
          locationId: orgUnits.locationId,
        })
        .from(orgUnits)
        .where(eq(orgUnits.id, activeOrgUnitId))
        .limit(1)
        .then((rows) => rows[0] ?? null)
    : null

  if (activeOrgUnitId && !orgUnit) {
    throw new ContextAlignmentError("Active org unit not found.", {
      tenantId,
      activeOrgUnitId,
    })
  }

  if (orgUnit) {
    assertTenantMatch({
      tenantId,
      actualTenantId: orgUnit.tenantId,
      subjectType: "org_unit",
      subjectId: orgUnit.id,
    })
  }

  if (legalEntity && location) {
    assertBoundMatch({
      label: "legal entity",
      expectedId: legalEntity.id,
      actualId: location.legalEntityId,
      actualSourceType: "location",
      actualSourceId: location.id,
    })
  }

  if (businessUnit && location) {
    assertBoundMatch({
      label: "business unit",
      expectedId: businessUnit.id,
      actualId: location.businessUnitId,
      actualSourceType: "location",
      actualSourceId: location.id,
    })
  }

  if (legalEntity && orgUnit) {
    assertBoundMatch({
      label: "legal entity",
      expectedId: legalEntity.id,
      actualId: orgUnit.legalEntityId,
      actualSourceType: "org_unit",
      actualSourceId: orgUnit.id,
    })
  }

  if (businessUnit && orgUnit) {
    assertBoundMatch({
      label: "business unit",
      expectedId: businessUnit.id,
      actualId: orgUnit.businessUnitId,
      actualSourceType: "org_unit",
      actualSourceId: orgUnit.id,
    })
  }

  if (location && orgUnit) {
    assertBoundMatch({
      label: "location",
      expectedId: location.id,
      actualId: orgUnit.locationId,
      actualSourceType: "org_unit",
      actualSourceId: orgUnit.id,
    })
  }

  return {
    tenantId,
    legalEntity: legalEntity ? { id: legalEntity.id } : null,
    businessUnit: businessUnit ? { id: businessUnit.id } : null,
    location: location
      ? {
          id: location.id,
          legalEntityId: location.legalEntityId,
          businessUnitId: location.businessUnitId,
        }
      : null,
    orgUnit: orgUnit
      ? {
          id: orgUnit.id,
          legalEntityId: orgUnit.legalEntityId,
          businessUnitId: orgUnit.businessUnitId,
          locationId: orgUnit.locationId,
        }
      : null,
  }
}
