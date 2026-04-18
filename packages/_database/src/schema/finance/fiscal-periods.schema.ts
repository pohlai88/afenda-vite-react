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
 * This module: `src/schema/finance/fiscal-periods.schema.ts` — `finance.fiscal_periods`; overlap exclusion + `period_range` in `sql/hardening/patch_n_temporal_overlap_wave.sql` (requires `btree_gist` from `patch_h`).
 */
import { sql } from "drizzle-orm"
import {
  check,
  date,
  foreignKey,
  index,
  integer,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { fiscalPeriodStatusEnum } from "../shared/enums.schema"
import { fiscalCalendars } from "./fiscal-calendars.schema"
import { finance } from "./_schema"

export const fiscalPeriods = finance.table(
  "fiscal_periods",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    fiscalCalendarId: uuid("fiscal_calendar_id").notNull(),
    periodCode: varchar("period_code", { length: 50 }).notNull(),
    periodName: varchar("period_name", { length: 200 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    periodStatus: fiscalPeriodStatusEnum("period_status").notNull(),
    yearNumber: integer("year_number").notNull(),
    periodNumber: integer("period_number").notNull(),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqCalendarCode: uniqueIndex("uq_fiscal_periods_calendar_period_code").on(
      table.fiscalCalendarId,
      table.periodCode
    ),
    uqCalendarYearPeriod: uniqueIndex(
      "uq_fiscal_periods_calendar_year_period"
    ).on(table.fiscalCalendarId, table.yearNumber, table.periodNumber),
    uqTenantIdId: unique("uq_fiscal_periods_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_fiscal_periods_tenant_status").on(
      table.tenantId,
      table.periodStatus
    ),
    idxCalendarDates: index("idx_fiscal_periods_calendar_dates").on(
      table.fiscalCalendarId,
      table.startDate,
      table.endDate
    ),
    fkCalendar: foreignKey({
      columns: [table.tenantId, table.fiscalCalendarId],
      foreignColumns: [fiscalCalendars.tenantId, fiscalCalendars.id],
      name: "fk_fiscal_periods_calendar",
    }),
    ckDateRange: check(
      "ck_fiscal_periods_date_range",
      sql`${table.endDate} >= ${table.startDate}`
    ),
    ckPeriodNumber: check(
      "ck_fiscal_periods_period_number",
      sql`${table.periodNumber} > 0`
    ),
    ckYearNumber: check(
      "ck_fiscal_periods_year_number",
      sql`${table.yearNumber} > 0`
    ),
  })
)

export type FiscalPeriod = typeof fiscalPeriods.$inferSelect
export type NewFiscalPeriod = typeof fiscalPeriods.$inferInsert
