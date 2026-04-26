/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **finance** schema (`pgSchema("finance")`) — invoice line rows belonging to finance invoice headers.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-26T00:00:00.000Z
 *
 * This module: `src/schema/finance/invoice-items.schema.ts` — `finance.invoice_items`; tenant-safe invoice line rows.
 */
import { sql } from "drizzle-orm"
import {
  check,
  doublePrecision,
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
} from "../shared/columns.schema"
import { finance } from "./_schema"
import { invoices } from "./invoices.schema"

export const invoiceItems = finance.table(
  "invoice_items",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    invoiceId: uuid("invoice_id").notNull(),
    lineNumber: integer("line_number").notNull(),
    description: varchar("description", { length: 200 }).notNull(),
    quantity: doublePrecision("quantity").notNull(),
    unitPriceMinor: integer("unit_price_minor").notNull(),
    amountMinor: integer("amount_minor").notNull(),
    ...metadataColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqInvoiceLineNumber: uniqueIndex("uq_invoice_items_invoice_line_number").on(
      table.invoiceId,
      table.lineNumber
    ),
    uqTenantIdId: unique("uq_invoice_items_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantInvoice: index("idx_invoice_items_tenant_invoice").on(
      table.tenantId,
      table.invoiceId
    ),
    fkInvoice: foreignKey({
      columns: [table.tenantId, table.invoiceId],
      foreignColumns: [invoices.tenantId, invoices.id],
      name: "fk_invoice_items_invoice",
    }),
    ckQuantityPositive: check(
      "ck_invoice_items_quantity_positive",
      sql`${table.quantity} > 0`
    ),
    ckMoneyNonnegative: check(
      "ck_invoice_items_money_nonnegative",
      sql`${table.unitPriceMinor} >= 0 and ${table.amountMinor} >= 0`
    ),
  })
)

export type InvoiceItem = typeof invoiceItems.$inferSelect
export type NewInvoiceItem = typeof invoiceItems.$inferInsert
