import { index, text, uniqueIndex, uuid } from "drizzle-orm/pg-core"

import { timestampColumns } from "../shared/columns.schema"
import { iam } from "./_schema"
import { userAccounts } from "./user-accounts.schema"

export const userIdentities = iam.table(
  "user_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userAccounts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    provider: text("provider").notNull(),
    providerSubject: text("provider_subject").notNull(),
    email: text("email"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("uq_iam_user_identities_provider_subject").on(
      table.provider,
      table.providerSubject
    ),
    index("idx_iam_user_identities_user").on(table.userId),
  ]
)

export type UserIdentity = typeof userIdentities.$inferSelect
export type NewUserIdentity = typeof userIdentities.$inferInsert
