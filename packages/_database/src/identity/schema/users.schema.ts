import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
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
    givenName: text("given_name"),
    familyName: text("family_name"),
    avatarUrl: text("avatar_url"),
    isActive: boolean("is_active").default(true).notNull(),
    /** Synthetic / break-glass principals only. */
    isSystem: boolean("is_system").default(false).notNull(),
    deactivatedAt: timestamp("deactivated_at", {
      withTimezone: true,
      mode: "date",
    }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_is_active_idx").on(table.isActive),
  ]
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
