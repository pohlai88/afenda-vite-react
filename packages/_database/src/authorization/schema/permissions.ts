import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core"

import { timestampColumns } from "../../helpers/columns"

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    category: text("category").notNull(),
    description: text("description"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("permissions_key_unique").on(table.key),
    index("permissions_category_idx").on(table.category),
  ]
)

export type Permission = typeof permissions.$inferSelect
export type NewPermission = typeof permissions.$inferInsert
