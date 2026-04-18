/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **finance** schema (`pgSchema("finance")`) — COA, GL accounts, fiscal calendars/periods, legal-entity COA edges. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/finance/fiscal-calendars.schema.ts` — `finance.fiscal_calendars` tenant fiscal calendar definitions; parent for `finance.fiscal_periods`.
 */
import { sql } from "drizzle-orm"
import {
  check,
  index,
  smallint,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { tenants } from "../mdm/tenants.schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { fiscalCalendarTypeEnum, statusEnum } from "../shared/enums.schema"
import { finance } from "./_schema"

export const fiscalCalendars = finance.table(
  "fiscal_calendars",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade", onUpdate: "cascade" }),
    calendarCode: varchar("calendar_code", { length: 50 }).notNull(),
    calendarName: varchar("calendar_name", { length: 200 }).notNull(),
    calendarType: fiscalCalendarTypeEnum("calendar_type").notNull(),
    startMonth: smallint("start_month").notNull(),
    status: statusEnum("status").notNull().default("active"),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_fiscal_calendars_tenant_code").on(
      table.tenantId,
      table.calendarCode
    ),
    uqTenantIdId: unique("uq_fiscal_calendars_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_fiscal_calendars_tenant_status").on(
      table.tenantId,
      table.status
    ),
    ckStartMonth: check(
      "ck_fiscal_calendars_start_month",
      sql`${table.startMonth} between 1 and 12`
    ),
  })
)

export type FiscalCalendar = typeof fiscalCalendars.$inferSelect
export type NewFiscalCalendar = typeof fiscalCalendars.$inferInsert
