/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **finance** schema (`pgSchema("finance")`) — invoice header rows for finance-owned receivables state.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-26T00:00:00.000Z
 *
 * This module: `src/schema/finance/invoices.schema.ts` — `finance.invoices`; tenant-scoped finance invoice header rows.
 */
import { sql } from "drizzle-orm"
import {
  check,
  index,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
  integer,
} from "drizzle-orm/pg-core"

import { tenants } from "../mdm/tenants.schema"
import {
  auditColumns,
  currencyCodeColumn,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { finance } from "./_schema"

export const invoices = finance.table(
  "invoices",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    subscriptionId: varchar("subscription_id", { length: 120 }).notNull(),
    invoiceNumber: varchar("invoice_number", { length: 60 }).notNull(),
    customerLabel: varchar("customer_label", { length: 200 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("draft"),
    subtotalMinor: integer("subtotal_minor").notNull(),
    taxAmountMinor: integer("tax_amount_minor").notNull(),
    totalMinor: integer("total_minor").notNull(),
    currencyCode: currencyCodeColumn("currency_code").notNull(),
    periodStartAt: timestamp("period_start_at", {
      withTimezone: true,
    }).notNull(),
    periodEndAt: timestamp("period_end_at", { withTimezone: true }).notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    openedAt: timestamp("opened_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    voidedAt: timestamp("voided_at", { withTimezone: true }),
    ...metadataColumn,
    ...softDeleteColumn,
    ...auditColumns,
  },
  (table) => ({
    uqTenantInvoiceNumber: uniqueIndex("uq_invoices_tenant_invoice_number").on(
      table.tenantId,
      table.invoiceNumber
    ),
    uqTenantIdId: unique("uq_invoices_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_invoices_tenant_status").on(
      table.tenantId,
      table.status
    ),
    idxTenantDueAt: index("idx_invoices_tenant_due_at").on(
      table.tenantId,
      table.dueAt
    ),
    ckAmountsNonnegative: check(
      "ck_invoices_amounts_nonnegative",
      sql`${table.subtotalMinor} >= 0 and ${table.taxAmountMinor} >= 0 and ${table.totalMinor} >= 0`
    ),
    ckPeriodRange: check(
      "ck_invoices_period_range",
      sql`${table.periodEndAt} >= ${table.periodStartAt}`
    ),
    ckStatusDomain: check(
      "ck_invoices_status_domain",
      sql`${table.status} in ('draft', 'open', 'paid', 'void', 'uncollectible')`
    ),
  })
)

export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
