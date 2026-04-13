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
import { legalEntities } from "./legal-entities"

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
    legalEntityId: uuid("legal_entity_id"),
    parentOrgUnitId: uuid("parent_org_unit_id"),
    code: varchar("code", { length: 64 }).notNull(),
    name: text("name").notNull(),
    kind: text("kind").default("unit").notNull(),
    status: text("status").default("active").notNull(),
    ...timestampColumns,
    ...optionalDeletedAtColumn,
  },
  (table) => [
    uniqueIndex("org_units_tenant_code_unique").on(table.tenantId, table.code),
    unique("org_units_id_tenant_unique").on(table.id, table.tenantId),
    index("org_units_tenant_status_idx").on(table.tenantId, table.status),
    index("org_units_legal_entity_idx").on(table.legalEntityId),
    index("org_units_parent_idx").on(table.parentOrgUnitId),
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
