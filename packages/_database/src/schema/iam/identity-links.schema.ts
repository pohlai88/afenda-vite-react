/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **iam** schema (`pgSchema("iam")`) — login accounts, provider links, memberships, roles, ABAC policies, step-up challenges. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/iam/identity-links.schema.ts` — `iam.identity_links` Better Auth ↔ Afenda user (used by tenancy resolution services).
 */
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
