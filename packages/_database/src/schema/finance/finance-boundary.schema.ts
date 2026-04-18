/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Finance **Zod boundary** (not Drizzle DDL): enums and insert DTOs aligned with `finance.*` tables; `.schema.ts` satisfies `scripts/guard-schema-modules.ts`. Keep in sync when sibling DDL changes. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/finance/finance-boundary.schema.ts` — Zod v4 enums and insert schemas for accounts and fiscal periods; validate at API boundaries, not inside Drizzle table definitions.
 */
import { z } from "zod"

const uuid = (message = "Invalid id") => z.uuid({ error: message })

export const financeAccountTypeSchema = z.enum([
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
])

export const financePostingTypeSchema = z.enum(["posting", "heading"])

export const financeNormalBalanceSchema = z.enum(["debit", "credit"])

export const financeFiscalCalendarTypeSchema = z.enum(["monthly", "4-4-5", "custom"])

export const financeFiscalPeriodStatusSchema = z.enum([
  "open",
  "soft_closed",
  "hard_closed",
])

/** Insert-style payload for `finance.accounts` (omit DB defaults where optional). */
export const financeAccountInsertSchema = z.object({
  tenantId: uuid(),
  coaSetId: uuid(),
  parentAccountId: uuid().optional().nullable(),
  accountCode: z.string().trim().min(1).max(50),
  accountName: z.string().trim().min(1).max(200),
  accountType: financeAccountTypeSchema,
  postingType: financePostingTypeSchema,
  normalBalance: financeNormalBalanceSchema,
  isControlAccount: z.boolean().optional(),
  status: z
    .enum([
      "draft",
      "active",
      "inactive",
      "blocked",
      "suspended",
      "archived",
    ])
    .optional(),
  aliases: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, { error: "Expected ISO date (YYYY-MM-DD)" })

/** Insert-style payload for `finance.fiscal_periods` (`date` columns map to string at the boundary). */
export const financeFiscalPeriodInsertSchema = z
  .object({
    tenantId: uuid(),
    fiscalCalendarId: uuid(),
    periodCode: z.string().trim().min(1).max(50),
    periodName: z.string().trim().min(1).max(200),
    startDate: isoDateString,
    endDate: isoDateString,
    periodStatus: financeFiscalPeriodStatusSchema,
    yearNumber: z.number().int().positive(),
    periodNumber: z.number().int().positive(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((row, ctx) => {
    if (row.endDate < row.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "endDate must be on or after startDate",
      })
    }
  })

export type FinanceAccountInsert = z.infer<typeof financeAccountInsertSchema>
export type FinanceFiscalPeriodInsert = z.infer<typeof financeFiscalPeriodInsertSchema>
