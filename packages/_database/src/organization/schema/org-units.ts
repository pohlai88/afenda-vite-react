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
import { users } from "../../identity/schema/users"
import { tenants } from "../../tenancy/schema/tenants"
import { businessUnits } from "./business-units"
import { legalEntities } from "./legal-entities"
import { locations } from "./locations"

/**
 * Org units — governed people/reporting structure inside a tenant.
 *
 * One table for department, team, function, region, cost center, etc. (see `kind`).
 * Do not introduce a separate top-level `teams` table unless lifecycle truly differs.
 *
 * - Org unit is tenant-bounded, not tenant-defining.
 * - Optional links to legal entity, business unit, and location make operating context explicit.
 */
export const orgUnits = pgTable(
  "org_units",
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

    /** e.g. `department` | `team` | `function` | `region` | `cost_center` — app-enforced vocabulary. */
    kind: text("kind").notNull().default("department"),
    status: text("status").notNull().default("active"),

    parentOrgUnitId: uuid("parent_org_unit_id"),

    legalEntityId: uuid("legal_entity_id"),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    managerUserId: uuid("manager_user_id"),

    ...timestampColumns,
    ...optionalDeletedAtColumn,
  },
  (table) => [
    uniqueIndex("org_units_tenant_code_unique").on(table.tenantId, table.code),
    unique("org_units_id_tenant_unique").on(table.id, table.tenantId),
    index("org_units_tenant_status_idx").on(table.tenantId, table.status),
    index("org_units_tenant_kind_idx").on(table.tenantId, table.kind),
    index("org_units_tenant_parent_idx").on(
      table.tenantId,
      table.parentOrgUnitId
    ),
    index("org_units_legal_entity_idx").on(table.legalEntityId),
    index("org_units_parent_idx").on(table.parentOrgUnitId),
    index("org_units_business_unit_idx").on(table.businessUnitId),
    index("org_units_location_idx").on(table.locationId),
    foreignKey({
      name: "org_units_business_unit_tenant_fk",
      columns: [table.businessUnitId, table.tenantId],
      foreignColumns: [businessUnits.id, businessUnits.tenantId],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "org_units_location_tenant_fk",
      columns: [table.locationId, table.tenantId],
      foreignColumns: [locations.id, locations.tenantId],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "org_units_manager_user_fk",
      columns: [table.managerUserId],
      foreignColumns: [users.id],
    })
      .onDelete("set null")
      .onUpdate("cascade"),
    foreignKey({
      name: "org_units_legal_entity_tenant_fk",
      columns: [table.legalEntityId, table.tenantId],
      foreignColumns: [legalEntities.id, legalEntities.tenantId],
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
    foreignKey({
      name: "org_units_parent_tenant_fk",
      columns: [table.parentOrgUnitId, table.tenantId],
      foreignColumns: [table.id, table.tenantId],
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ]
)

export type OrgUnit = typeof orgUnits.$inferSelect
export type NewOrgUnit = typeof orgUnits.$inferInsert
