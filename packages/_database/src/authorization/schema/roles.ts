import {
  boolean,
  index,
  pgTable,
  text,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { timestampColumns } from "../../helpers/columns"
import { tenants } from "../../tenancy/schema/tenants"

export const roles = pgTable(
  "roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").default(false).notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("roles_tenant_slug_unique").on(table.tenantId, table.slug),
    unique("roles_id_tenant_unique").on(table.id, table.tenantId),
    index("roles_tenant_system_idx").on(table.tenantId, table.isSystem),
  ]
)

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
