/**
 * Item MDM schema: route/service boundary for canonical item master data.
 * module · mdm · items · schema
 * Upstream: zod. Downstream: repo, service, routes, tests.
 * Side effects: none.
 * Coupling: mirrors the canonical item slice only; inventory movements remain outside this boundary.
 * experimental
 * @module modules/mdm/items/item.schema
 * @package @afenda/api
 */
import { z } from "zod"

export const itemTypeSchema = z.enum([
  "inventory",
  "service",
  "asset",
  "expense",
])

export const itemStatusSchema = z.enum(["active", "inactive", "blocked"])

export const itemSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  itemCode: z.string().trim().min(1).max(50),
  itemName: z.string().trim().min(1).max(255),
  canonicalName: z.string().trim().min(1).max(255),
  itemType: itemTypeSchema,
  baseUomCode: z.string().trim().min(1).max(20),
  categoryCode: z.string().trim().min(1).max(100).optional(),
  status: itemStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const itemListQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  itemType: itemTypeSchema.optional(),
  status: itemStatusSchema.optional(),
  categoryCode: z.string().trim().min(1).optional(),
})

export const itemIdParamSchema = z.object({
  itemId: z.string().trim().min(1),
})

export const createItemInputSchema = z.object({
  itemCode: z.string().trim().min(1).max(50).optional(),
  itemName: z.string().trim().min(1).max(255),
  canonicalName: z.string().trim().min(1).max(255).optional(),
  itemType: itemTypeSchema.default("inventory"),
  baseUomCode: z.string().trim().min(1).max(20).default("EA"),
  categoryCode: z.string().trim().min(1).max(100).optional(),
  status: itemStatusSchema.default("active"),
})

export type ItemType = z.infer<typeof itemTypeSchema>
export type ItemStatus = z.infer<typeof itemStatusSchema>
export type Item = z.infer<typeof itemSchema>
export type ItemListQuery = z.infer<typeof itemListQuerySchema>
export type ItemIdParam = z.infer<typeof itemIdParamSchema>
export type CreateItemInput = z.infer<typeof createItemInputSchema>
