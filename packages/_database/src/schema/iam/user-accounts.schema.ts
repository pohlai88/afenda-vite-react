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
 * This module: `src/schema/iam/user-accounts.schema.ts` — `iam.user_accounts` Afenda login row; `users` is a deprecated alias for `userAccounts`.
 */
import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  index,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

import { locales } from "../ref/locales.schema"
import { timezones } from "../ref/timezones.schema"
import {
  auditColumns,
  idColumn,
  lifecycleColumns,
  metadataColumn,
} from "../shared/columns.schema"
import { iam } from "./_schema"

export const userAccounts = iam.table(
  "user_accounts",
  {
    ...idColumn,
    username: varchar("username", { length: 100 }),
    email: varchar("email", { length: 320 }),
    displayName: varchar("display_name", { length: 200 }).notNull(),
    accountStatus: varchar("account_status", { length: 20 })
      .notNull()
      .default("active"),
    isServiceAccount: boolean("is_service_account").notNull().default(false),
    localeCode: varchar("locale_code", { length: 20 }).references(
      () => locales.code,
      { onDelete: "set null", onUpdate: "cascade" }
    ),
    timezoneName: varchar("timezone_name", { length: 100 }).references(
      () => timezones.name,
      { onDelete: "set null", onUpdate: "cascade" }
    ),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    usernameUq: uniqueIndex("uq_iam_user_accounts_username").on(t.username),
    emailUq: uniqueIndex("uq_iam_user_accounts_email").on(t.email),
    statusCheck: check(
      "ck_iam_user_accounts_account_status",
      sql`${t.accountStatus} in ('invited','active','suspended','locked','archived')`
    ),
    statusIdx: index("idx_iam_user_accounts_account_status").on(t.accountStatus),
  })
)

/** @deprecated Prefer `userAccounts` (guideline naming). */
export const users = userAccounts

export type UserAccount = typeof userAccounts.$inferSelect
export type NewUserAccount = typeof userAccounts.$inferInsert
export type User = UserAccount
export type NewUser = NewUserAccount
