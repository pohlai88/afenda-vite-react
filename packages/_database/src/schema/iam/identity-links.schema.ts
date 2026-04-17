import { sql } from "drizzle-orm"
import {
  boolean,
  index,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { timestampColumns } from "../shared/columns.schema"
import { iam } from "./_schema"
import { userAccounts } from "./user-accounts.schema"

export const identityLinks = iam.table(
  "identity_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    afendaUserId: uuid("afenda_user_id")
      .notNull()
      .references(() => userAccounts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    authProvider: text("auth_provider").notNull().default("better-auth"),
    betterAuthUserId: text("better_auth_user_id").notNull(),
    authEmail: text("auth_email"),
    isPrimary: boolean("is_primary").notNull().default(true),
    verifiedAt: timestamp("verified_at", {
      withTimezone: true,
      mode: "date",
    }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("uq_iam_identity_links_provider_ba_user").on(
      table.authProvider,
      table.betterAuthUserId
    ),
    uniqueIndex("uq_iam_identity_links_one_primary_per_provider")
      .on(table.afendaUserId, table.authProvider)
      .where(sql`${table.isPrimary} = true`),
    index("idx_iam_identity_links_afenda_user").on(table.afendaUserId),
  ]
)

export type IdentityLink = typeof identityLinks.$inferSelect
export type NewIdentityLink = typeof identityLinks.$inferInsert
