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

/**
 * Operating line / division / segment inside a tenant (not a second tenancy root).
 */
export const businessUnits = pgTable(
  "business_units",
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
    status: text("status").default("active").notNull(),
    parentBusinessUnitId: uuid("parent_business_unit_id"),
    ...timestampColumns,
    ...optionalDeletedAtColumn,
  },
  (table) => [
    uniqueIndex("business_units_tenant_code_unique").on(
      table.tenantId,
      table.code
    ),
    unique("business_units_id_tenant_unique").on(table.id, table.tenantId),
    index("business_units_tenant_status_idx").on(table.tenantId, table.status),
    index("business_units_parent_idx").on(table.parentBusinessUnitId),
    foreignKey({
      name: "business_units_parent_tenant_fk",
      columns: [table.parentBusinessUnitId, table.tenantId],
      foreignColumns: [table.id, table.tenantId],
    })
      .onDelete("restrict")
      .onUpdate("cascade"),
  ]
)

export type BusinessUnit = typeof businessUnits.$inferSelect
export type NewBusinessUnit = typeof businessUnits.$inferInsert
