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
 * This module: `src/schema/iam/persons.schema.ts` — `iam.persons` human profile (PII); optional on `iam.tenant_memberships`.
 */
import { date, index, varchar } from "drizzle-orm/pg-core"

import {
  auditColumns,
  idColumn,
  lifecycleColumns,
  metadataColumn,
} from "../shared/columns.schema"
import { iam } from "./_schema"

export const persons = iam.table(
  "persons",
  {
    ...idColumn,
    givenName: varchar("given_name", { length: 100 }),
    familyName: varchar("family_name", { length: 100 }),
    fullName: varchar("full_name", { length: 200 }).notNull(),
    dateOfBirth: date("date_of_birth"),
    primaryEmail: varchar("primary_email", { length: 320 }),
    primaryPhone: varchar("primary_phone", { length: 50 }),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    fullNameIdx: index("idx_persons_full_name").on(t.fullName),
    emailIdx: index("idx_persons_primary_email").on(t.primaryEmail),
  })
)

export type Person = typeof persons.$inferSelect
export type NewPerson = typeof persons.$inferInsert
