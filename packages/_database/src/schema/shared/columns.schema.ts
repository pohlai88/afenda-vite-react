import { timestamp } from "drizzle-orm/pg-core"

/** Standard created/updated timestamps for mutable rows (guideline shared columns). */
export const timestampColumns = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
} as const

export const optionalDeletedAtColumn = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
} as const
