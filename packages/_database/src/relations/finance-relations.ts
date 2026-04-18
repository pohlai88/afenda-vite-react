/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; Drizzle `relations()` graphs under `src/relations/` (not `pgTable` DDL).
 * Import via `@afenda/database/relations`; do not deep-import `src/` from apps.
 * Not for browser bundles: server-only Drizzle + `pg`.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `relations/finance-relations.ts` — finance `relations()` (COA, accounts, fiscal calendars/periods, LE COA assignments).
 * `accounts.parent` self-FK; `itemEntitySettings` account `relationName` values must match `mdm-relations.ts`.
 */
import { relations } from "drizzle-orm"

import { accounts } from "../schema/finance/accounts.schema"
import { chartOfAccountSets } from "../schema/finance/chart-of-account-sets.schema"
import { fiscalCalendars } from "../schema/finance/fiscal-calendars.schema"
import { fiscalPeriods } from "../schema/finance/fiscal-periods.schema"
import { legalEntityCoaAssignments } from "../schema/finance/legal-entity-coa-assignments.schema"
import { itemEntitySettings } from "../schema/mdm/item-entity-settings.schema"
import { legalEntities } from "../schema/mdm/legal-entities.schema"
import { tenants } from "../schema/mdm/tenants.schema"

export const fiscalCalendarsRelations = relations(
  fiscalCalendars,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [fiscalCalendars.tenantId],
      references: [tenants.id],
    }),
    periods: many(fiscalPeriods),
    legalEntities: many(legalEntities),
  })
)

export const fiscalPeriodsRelations = relations(fiscalPeriods, ({ one }) => ({
  tenant: one(tenants, {
    fields: [fiscalPeriods.tenantId],
    references: [tenants.id],
  }),
  fiscalCalendar: one(fiscalCalendars, {
    fields: [fiscalPeriods.tenantId, fiscalPeriods.fiscalCalendarId],
    references: [fiscalCalendars.tenantId, fiscalCalendars.id],
  }),
}))

export const chartOfAccountSetsRelations = relations(
  chartOfAccountSets,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [chartOfAccountSets.tenantId],
      references: [tenants.id],
    }),
    accounts: many(accounts),
    legalEntityCoaAssignments: many(legalEntityCoaAssignments),
  })
)

export const legalEntityCoaAssignmentsRelations = relations(
  legalEntityCoaAssignments,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [legalEntityCoaAssignments.tenantId],
      references: [tenants.id],
    }),
    legalEntity: one(legalEntities, {
      fields: [
        legalEntityCoaAssignments.tenantId,
        legalEntityCoaAssignments.legalEntityId,
      ],
      references: [legalEntities.tenantId, legalEntities.id],
    }),
    coaSet: one(chartOfAccountSets, {
      fields: [
        legalEntityCoaAssignments.tenantId,
        legalEntityCoaAssignments.coaSetId,
      ],
      references: [chartOfAccountSets.tenantId, chartOfAccountSets.id],
    }),
  })
)

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [accounts.tenantId],
    references: [tenants.id],
  }),
  chartOfAccountSet: one(chartOfAccountSets, {
    fields: [accounts.tenantId, accounts.coaSetId],
    references: [chartOfAccountSets.tenantId, chartOfAccountSets.id],
  }),
  parent: one(accounts, {
    fields: [accounts.tenantId, accounts.parentAccountId],
    references: [accounts.tenantId, accounts.id],
    relationName: "account_parent",
  }),
  children: many(accounts, {
    relationName: "account_parent",
  }),
  salesItemSettings: many(itemEntitySettings, {
    relationName: "sales_account_item_settings",
  }),
  inventoryItemSettings: many(itemEntitySettings, {
    relationName: "inventory_account_item_settings",
  }),
  cogsItemSettings: many(itemEntitySettings, {
    relationName: "cogs_account_item_settings",
  }),
}))
