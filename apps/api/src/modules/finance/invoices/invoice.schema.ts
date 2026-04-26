import { z } from "zod"

const createInvoiceLineInputSchema = z.object({
  description: z.string().trim().min(1).max(200),
  quantity: z.number().positive(),
  unitPriceMinor: z.number().int().nonnegative(),
})

export const createInvoiceInputSchema = z.object({
  customerLabel: z.string().trim().min(1).max(120),
  currencyCode: z.string().trim().length(3).default("USD"),
  taxRate: z.number().min(0).max(1).default(0.1),
  daysUntilDue: z.number().int().min(1).max(90).default(7),
  items: z.array(createInvoiceLineInputSchema).min(1),
})

export const financeInvoiceListQuerySchema = z.object({
  status: z.enum(["draft", "open", "paid", "void", "uncollectible"]).optional(),
  search: z.string().trim().max(120).optional(),
})

export const financeInvoiceIdParamSchema = z.object({
  invoiceId: z.string().trim().min(1).max(120),
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceInputSchema>
export type FinanceInvoiceListQuery = z.infer<
  typeof financeInvoiceListQuerySchema
>
export type FinanceInvoiceIdParam = z.infer<typeof financeInvoiceIdParamSchema>
