import { boolean, index, text, uniqueIndex, uuid } from "drizzle-orm/pg-core"

import { timestampColumns } from "../shared/columns.schema"
import { iam } from "./_schema"

export const userAccounts = iam.table(
  "user_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    isActive: boolean("is_active").default(true).notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("uq_iam_user_accounts_email").on(table.email),
    index("idx_iam_user_accounts_is_active").on(table.isActive),
  ]
)

/** @deprecated Prefer `userAccounts` (guideline naming). */
export const users = userAccounts

export type UserAccount = typeof userAccounts.$inferSelect
export type NewUserAccount = typeof userAccounts.$inferInsert
export type User = UserAccount
export type NewUser = NewUserAccount
