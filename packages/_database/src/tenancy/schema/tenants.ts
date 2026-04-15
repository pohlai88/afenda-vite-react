import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { users } from "../../identity/schema/users"
import { timestampColumns } from "../../helpers/columns"
import { tenantStatus } from "./tenant-status"

export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /**
     * Stable external code (billing, integrations). Backfilled from `slug` in migration 0008.
     */
    code: varchar("code", { length: 63 }).notNull(),
    slug: varchar("slug", { length: 63 }).notNull(),
    name: text("name").notNull(),
    status: tenantStatus("status").default("active").notNull(),
    baseCurrencyCode: varchar("base_currency_code", { length: 3 })
      .notNull()
      .default("USD"),
    defaultLocale: varchar("default_locale", { length: 35 })
      .notNull()
      .default("en"),
    defaultTimezone: text("default_timezone").notNull().default("UTC"),
    ownerUserId: uuid("owner_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
      mode: "date",
    }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("tenants_code_unique").on(table.code),
    uniqueIndex("tenants_slug_unique").on(table.slug),
    index("tenants_status_idx").on(table.status),
    index("tenants_owner_user_idx").on(table.ownerUserId),
  ]
)

export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert
