import { sql } from "drizzle-orm"
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
import { users } from "./users.schema"

/**
 * Identity links — hard bridge between authentication identity and the Afenda ERP principal.
 *
 * - **Authority:** Better Auth `public.user` / session = authentication; Afenda `users` = business principal.
 * - **Rules:** Prefer resolving `identity_links` → `users` for audit and authorization; **email is metadata**, not identity truth.
 * - **Column name:** `better_auth_user_id` stores the Better Auth user id (some specs call this `auth_user_id`).
 *
 * Polymorphic `scope_id` is intentionally avoided here (this table links identities only).
 * See `docs/decisions/ADR-0004-identity-bridge-and-principals.md`.
 */
export const identityLinks = pgTable(
  "identity_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    afendaUserId: uuid("afenda_user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    /** e.g. `better-auth` — allows future IdPs without schema churn. */
    authProvider: text("auth_provider").notNull().default("better-auth"),
    betterAuthUserId: text("better_auth_user_id").notNull(),
    /** Snapshot / reconciliation aid; authoritative link is by IDs. */
    authEmail: text("auth_email"),
    isPrimary: boolean("is_primary").notNull().default(true),
    verifiedAt: timestamp("verified_at", {
      withTimezone: true,
      mode: "date",
    }),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("identity_links_provider_ba_user_unique").on(
      table.authProvider,
      table.betterAuthUserId
    ),
    uniqueIndex("identity_links_one_primary_per_provider")
      .on(table.afendaUserId, table.authProvider)
      .where(sql`${table.isPrimary} = true`),
    index("identity_links_afenda_user_idx").on(table.afendaUserId),
  ]
)

export type IdentityLink = typeof identityLinks.$inferSelect
export type NewIdentityLink = typeof identityLinks.$inferInsert
