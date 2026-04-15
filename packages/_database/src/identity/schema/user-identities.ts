import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core"

import { timestampColumns } from "../../helpers/columns"
import { users } from "./users"

/**
 * @deprecated Legacy generic `provider` + `provider_subject` links. Do **not** use for new work.
 * The canonical authentication → Afenda principal bridge is `identity_links` (`identityLinks` in Drizzle),
 * per ADR-0004. This table remains until any historical rows are migrated and the table is dropped.
 */
export const userIdentities = pgTable(
  "user_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    provider: text("provider").notNull(),
    providerSubject: text("provider_subject").notNull(),
    email: text("email"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("user_identities_provider_subject_unique").on(
      table.provider,
      table.providerSubject
    ),
    index("user_identities_user_idx").on(table.userId),
  ]
)

export type UserIdentity = typeof userIdentities.$inferSelect
export type NewUserIdentity = typeof userIdentities.$inferInsert
