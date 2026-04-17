import { sql } from "drizzle-orm"
import {
  boolean,
  char,
  check,
  index,
  integer,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

import { ref } from "./_schema"

export const currencies = ref.table(
  "currencies",
  {
    code: char("code", { length: 3 }).primaryKey(),
    numericCode: char("numeric_code", { length: 3 }),
    name: varchar("name", { length: 100 }).notNull(),
    symbol: varchar("symbol", { length: 10 }),
    minorUnit: smallint("minor_unit").notNull().default(2),
    isActive: boolean("is_active").notNull().default(true),
    versionNo: integer("version_no").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    minorUnitCheck: check(
      "ck_currencies_minor_unit",
      sql`${t.minorUnit} >= 0 and ${t.minorUnit} <= 6`
    ),
    nameIdx: index("idx_currencies_name").on(t.name),
  })
)

export type Currency = typeof currencies.$inferSelect
export type NewCurrency = typeof currencies.$inferInsert
