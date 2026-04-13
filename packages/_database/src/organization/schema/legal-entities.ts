import {
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

export const legalEntities = pgTable(
  "legal_entities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    code: varchar("code", { length: 32 }).notNull(),
    name: text("name").notNull(),
    taxId: text("tax_id"),
    baseCurrency: varchar("base_currency", { length: 3 }),
    status: text("status").default("active").notNull(),
    ...timestampColumns,
    ...optionalDeletedAtColumn,
  },
  (table) => [
    uniqueIndex("legal_entities_tenant_code_unique").on(
      table.tenantId,
      table.code
    ),
    unique("legal_entities_id_tenant_unique").on(table.id, table.tenantId),
    index("legal_entities_tenant_status_idx").on(table.tenantId, table.status),
  ]
)

export type LegalEntity = typeof legalEntities.$inferSelect
export type NewLegalEntity = typeof legalEntities.$inferInsert
