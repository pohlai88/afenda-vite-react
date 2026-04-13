import {
  index,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { timestampColumns } from "../../helpers/columns"
import { tenantStatus } from "./tenant-status"

export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 63 }).notNull(),
    name: text("name").notNull(),
    status: tenantStatus("status").default("active").notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("tenants_slug_unique").on(table.slug),
    index("tenants_status_idx").on(table.status),
  ]
)

export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert
