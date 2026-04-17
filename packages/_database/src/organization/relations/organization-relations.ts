import { relations } from "drizzle-orm"

import { membershipLegalEntityScopes } from "../../authorization/schema/membership-legal-entity-scopes.schema"
import { membershipOrgUnitScopes } from "../../authorization/schema/membership-org-unit-scopes.schema"
import { users } from "../../identity/schema/users.schema"
import { tenants } from "../../tenancy/schema/tenants.schema"
import { businessUnits } from "../schema/business-units.schema"
import { legalEntities } from "../schema/legal-entities.schema"
import { locations } from "../schema/locations.schema"
import { orgUnits } from "../schema/org-units.schema"

export const legalEntitiesRelations = relations(
  legalEntities,
  ({ many, one }) => ({
    orgUnits: many(orgUnits),
    scopeAssignments: many(membershipLegalEntityScopes),
    tenant: one(tenants, {
      fields: [legalEntities.tenantId],
      references: [tenants.id],
    }),
    parent: one(legalEntities, {
      fields: [legalEntities.parentLegalEntityId],
      references: [legalEntities.id],
      relationName: "legal_entity_parent",
    }),
    children: many(legalEntities, { relationName: "legal_entity_parent" }),
  })
)

export const businessUnitsRelations = relations(
  businessUnits,
  ({ many, one }) => ({
    tenant: one(tenants, {
      fields: [businessUnits.tenantId],
      references: [tenants.id],
    }),
    parent: one(businessUnits, {
      fields: [businessUnits.parentBusinessUnitId],
      references: [businessUnits.id],
      relationName: "business_unit_parent",
    }),
    children: many(businessUnits, { relationName: "business_unit_parent" }),
  })
)

export const locationsRelations = relations(locations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [locations.tenantId],
    references: [tenants.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [locations.legalEntityId],
    references: [legalEntities.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [locations.businessUnitId],
    references: [businessUnits.id],
  }),
}))

export const orgUnitsRelations = relations(orgUnits, ({ many, one }) => ({
  tenant: one(tenants, {
    fields: [orgUnits.tenantId],
    references: [tenants.id],
  }),

  parent: one(orgUnits, {
    fields: [orgUnits.parentOrgUnitId],
    references: [orgUnits.id],
    relationName: "org_unit_parent",
  }),

  children: many(orgUnits, {
    relationName: "org_unit_parent",
  }),

  legalEntity: one(legalEntities, {
    fields: [orgUnits.legalEntityId],
    references: [legalEntities.id],
  }),

  businessUnit: one(businessUnits, {
    fields: [orgUnits.businessUnitId],
    references: [businessUnits.id],
  }),

  location: one(locations, {
    fields: [orgUnits.locationId],
    references: [locations.id],
  }),

  managerUser: one(users, {
    fields: [orgUnits.managerUserId],
    references: [users.id],
  }),

  scopeAssignments: many(membershipOrgUnitScopes),
}))
