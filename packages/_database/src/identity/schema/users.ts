import {
  boolean,
  index,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { timestampColumns } from "../../helpers/columns"

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_is_active_idx").on(table.isActive),
  ]
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
