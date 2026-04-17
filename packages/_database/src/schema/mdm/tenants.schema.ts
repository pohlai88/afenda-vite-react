import {
  index,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { userAccounts } from "../iam/user-accounts.schema"
import { currencies } from "../ref/currencies.schema"
import { timestampColumns } from "../shared/columns.schema"
import { mdm } from "./_schema"
import { tenantStatus } from "./tenant-status.schema"

export const tenants = mdm.table(
  "tenants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 63 }).notNull(),
    slug: varchar("slug", { length: 63 }).notNull(),
    name: text("name").notNull(),
    status: tenantStatus("status").default("active").notNull(),
    baseCurrencyCode: varchar("base_currency_code", { length: 3 })
      .notNull()
      .default("USD")
      .references(() => currencies.code, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    defaultLocale: varchar("default_locale", { length: 35 })
      .notNull()
      .default("en"),
    defaultTimezone: text("default_timezone").notNull().default("UTC"),
    ownerUserId: uuid("owner_user_id").references(() => userAccounts.id, {
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
    uniqueIndex("uq_mdm_tenants_code").on(table.code),
    uniqueIndex("uq_mdm_tenants_slug").on(table.slug),
    index("idx_mdm_tenants_status").on(table.status),
  ]
)

export type Tenant = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert
