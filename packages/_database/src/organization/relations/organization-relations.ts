import { relations } from "drizzle-orm"

import { membershipLegalEntityScopes } from "../../authorization/schema/membership-legal-entity-scopes"
import { membershipOrgUnitScopes } from "../../authorization/schema/membership-org-unit-scopes"
import { tenants } from "../../tenancy/schema/tenants"
import { legalEntities } from "../schema/legal-entities"
import { orgUnits } from "../schema/org-units"

export const legalEntitiesRelations = relations(
  legalEntities,
  ({ many, one }) => ({
    orgUnits: many(orgUnits),
    scopeAssignments: many(membershipLegalEntityScopes),
    tenant: one(tenants, {
      fields: [legalEntities.tenantId],
      references: [tenants.id],
    }),
  })
)

export const orgUnitsRelations = relations(orgUnits, ({ many, one }) => ({
  children: many(orgUnits),
  legalEntity: one(legalEntities, {
    fields: [orgUnits.legalEntityId],
    references: [legalEntities.id],
  }),
  parent: one(orgUnits, {
    fields: [orgUnits.parentOrgUnitId],
    references: [orgUnits.id],
    relationName: "org_unit_parent",
  }),
  scopeAssignments: many(membershipOrgUnitScopes),
  tenant: one(tenants, {
    fields: [orgUnits.tenantId],
    references: [tenants.id],
  }),
}))
