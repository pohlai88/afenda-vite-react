import {
  foreignKey,
  index,
  pgTable,
  text,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  optionalDeletedAtColumn,
  timestampColumns,
} from "../../helpers/columns"
import { tenants } from "../../tenancy/schema/tenants"
import { businessUnits } from "./business-units"
import { legalEntities } from "./legal-entities"

/**
 * Physical site / branch / warehouse inside a tenant.
 */
export const locations = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    code: varchar("code", { length: 64 }).notNull(),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    legalEntityId: uuid("legal_entity_id"),
    businessUnitId: uuid("business_unit_id"),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    regionCode: text("region_code"),
    city: text("city"),
    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    postalCode: text("postal_code"),
    timezone: text("timezone"),
    status: text("status").default("active").notNull(),
    ...timestampColumns,
    ...optionalDeletedAtColumn,
  },
  (table) => [
    uniqueIndex("locations_tenant_code_unique").on(table.tenantId, table.code),
    unique("locations_id_tenant_unique").on(table.id, table.tenantId),
    index("locations_tenant_legal_entity_idx").on(
      table.tenantId,
      table.legalEntityId
    ),
    index("locations_tenant_business_unit_idx").on(
      table.tenantId,
      table.businessUnitId
    ),
    foreignKey({
      name: "locations_legal_entity_tenant_fk",
      columns: [table.legalEntityId, table.tenantId],
      foreignColumns: [legalEntities.id, legalEntities.tenantId],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "locations_business_unit_tenant_fk",
      columns: [table.businessUnitId, table.tenantId],
      foreignColumns: [businessUnits.id, businessUnits.tenantId],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
  ]
)

export type Location = typeof locations.$inferSelect
export type NewLocation = typeof locations.$inferInsert
