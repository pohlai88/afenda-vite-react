import { z } from "zod"

export const createSettlementInputSchema = z.object({
  invoiceNumber: z.string().trim().min(1).max(48),
  counterpartyLabel: z.string().trim().min(1).max(120),
  amountMinor: z.number().int().positive(),
  currencyCode: z.string().trim().length(3).default("USD"),
  daysUntilDue: z.number().int().min(1).max(60).default(5),
})

export const financeSettlementListQuerySchema = z.object({
  status: z.enum(["pending", "completed"]).optional(),
  search: z.string().trim().max(120).optional(),
})

export type CreateSettlementInput = z.infer<typeof createSettlementInputSchema>
export type FinanceSettlementListQuery = z.infer<
  typeof financeSettlementListQuerySchema
>
