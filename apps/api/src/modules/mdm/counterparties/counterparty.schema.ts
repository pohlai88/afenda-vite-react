/**
 * Counterparty MDM schema: route/service boundary for canonical counterparties.
 * Owns Zod validation and shared TS inference for list/create/get surfaces.
 * module · mdm · counterparties · schema
 * Upstream: zod. Downstream: repo, service, routes, tests.
 * Side effects: none.
 * Coupling: mirrors the first MDM slice only; broader MDM entities stay in their own ownership folders.
 * stable
 * @module modules/mdm/counterparties/counterparty.schema
 * @package @afenda/api
 */
import { z } from "zod"

export const counterpartyKindSchema = z.enum(["customer", "supplier", "hybrid"])

export const counterpartyStatusSchema = z.enum([
  "active",
  "inactive",
  "blocked",
])

export const counterpartySchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  code: z.string().trim().min(1).max(50),
  displayName: z.string().trim().min(1).max(255),
  canonicalName: z.string().trim().min(1).max(255),
  kind: counterpartyKindSchema,
  status: counterpartyStatusSchema,
  email: z.email().optional(),
  phone: z.string().trim().min(1).max(50).optional(),
  taxRegistrationNumber: z.string().trim().min(1).max(100).optional(),
  aliases: z.array(z.string().trim().min(1).max(255)).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const counterpartyListQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  kind: counterpartyKindSchema.optional(),
  status: counterpartyStatusSchema.optional(),
})

export const counterpartyIdParamSchema = z.object({
  counterpartyId: z.string().trim().min(1),
})

export const createCounterpartyInputSchema = z.object({
  code: z.string().trim().min(1).max(50).optional(),
  displayName: z.string().trim().min(1).max(255),
  canonicalName: z.string().trim().min(1).max(255).optional(),
  kind: counterpartyKindSchema.default("customer"),
  email: z.email().optional(),
  phone: z.string().trim().min(1).max(50).optional(),
  taxRegistrationNumber: z.string().trim().min(1).max(100).optional(),
  aliases: z.array(z.string().trim().min(1).max(255)).default([]),
  status: counterpartyStatusSchema.default("active"),
})

export type CounterpartyKind = z.infer<typeof counterpartyKindSchema>
export type CounterpartyStatus = z.infer<typeof counterpartyStatusSchema>
export type Counterparty = z.infer<typeof counterpartySchema>
export type CounterpartyListQuery = z.infer<typeof counterpartyListQuerySchema>
export type CounterpartyIdParam = z.infer<typeof counterpartyIdParamSchema>
export type CreateCounterpartyInput = z.infer<
  typeof createCounterpartyInputSchema
>
