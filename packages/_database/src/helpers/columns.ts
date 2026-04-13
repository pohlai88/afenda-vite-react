import { timestamp } from "drizzle-orm/pg-core"

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
