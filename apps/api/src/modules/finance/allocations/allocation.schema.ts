import { z } from "zod"

export const createAllocationInputSchema = z.object({
  invoiceNumber: z.string().trim().min(1).max(48),
  customerLabel: z.string().trim().min(1).max(120),
  targetLabel: z.string().trim().min(1).max(120),
  amountMinor: z.number().int().positive(),
  currencyCode: z.string().trim().length(3).default("USD"),
})

export const financeAllocationListQuerySchema = z.object({
  status: z.enum(["planned", "allocated", "released"]).optional(),
  search: z.string().trim().max(120).optional(),
})

export type CreateAllocationInput = z.infer<typeof createAllocationInputSchema>
export type FinanceAllocationListQuery = z.infer<
  typeof financeAllocationListQuerySchema
>
