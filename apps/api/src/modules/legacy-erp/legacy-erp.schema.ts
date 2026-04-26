/**
 * Legacy ERP adapter schema: typed intake contract for stable legacy payloads.
 * Owns discriminated unions for transform requests and batch ingestion intake.
 * module · legacy-erp · schema
 * Upstream: zod. Downstream: service, routes, tests.
 * Side effects: none.
 * Coupling: intake contracts stay legacy-facing while persistence remains owner-module controlled.
 * experimental
 * @module modules/legacy-erp/legacy-erp.schema
 * @package @afenda/api
 */
import { z } from "zod"

export const legacyErpSourceSystemSchema = z.enum([
  "legacy_erp",
  "legacy_accounting",
  "legacy_crm",
  "legacy_mrp",
  "legacy_tpm",
])

export const legacyErpEntityKindSchema = z.enum([
  "counterparty",
  "journal-entry",
  "inventory-item",
])

export const legacyErpCounterpartySourceProfileSchema = z.enum([
  "legacy-tpm-customers",
])

export const legacyErpItemSourceProfileSchema = z.enum(["legacy-mrp-products"])

const legacyCounterpartyPayloadSchema = z.object({
  id: z.string().trim().min(1).optional(),
  externalId: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).optional(),
  externalCode: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  displayName: z.string().trim().min(1).optional(),
  canonicalName: z.string().trim().min(1).optional(),
  kind: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  email: z.email().optional(),
  phone: z.string().trim().min(1).optional(),
  taxRegistrationNumber: z.string().trim().min(1).optional(),
  taxCode: z.string().trim().min(1).optional(),
  vatNumber: z.string().trim().min(1).optional(),
  aliases: z.array(z.string().trim().min(1)).optional(),
  alias: z.string().trim().min(1).optional(),
})

const legacyJournalLinePayloadSchema = z.object({
  id: z.string().trim().min(1).optional(),
  accountId: z.string().trim().min(1).optional(),
  accountCode: z.string().trim().min(1).optional(),
  accountNumber: z.string().trim().min(1).optional(),
  accountName: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  debitAmount: z.number().finite().nonnegative().optional(),
  creditAmount: z.number().finite().nonnegative().optional(),
  amount: z.number().finite().nonnegative().optional(),
  side: z.string().trim().min(1).optional(),
  currency: z.string().trim().min(1).optional(),
  exchangeRate: z.number().finite().positive().optional(),
})

const legacyJournalEntryPayloadSchema = z.object({
  id: z.string().trim().min(1).optional(),
  externalId: z.string().trim().min(1).optional(),
  entryNumber: z.string().trim().min(1).optional(),
  journalNumber: z.string().trim().min(1).optional(),
  entryDate: z.string().trim().min(1).optional(),
  date: z.string().trim().min(1).optional(),
  postingDate: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1),
  reference: z.string().trim().min(1).optional(),
  memo: z.string().trim().min(1).optional(),
  journalType: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  sourceModule: z.string().trim().min(1).optional(),
  lines: z.array(legacyJournalLinePayloadSchema).min(1),
})

const legacyInventoryItemPayloadSchema = z.object({
  id: z.string().trim().min(1).optional(),
  externalId: z.string().trim().min(1).optional(),
  sku: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).optional(),
  itemCode: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).optional(),
  displayName: z.string().trim().min(1).optional(),
  canonicalName: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  uom: z.string().trim().min(1).optional(),
  uomCode: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  categoryCode: z.string().trim().min(1).optional(),
  itemType: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  baseUomCode: z.string().trim().min(1).optional(),
  onHandQuantity: z.number().finite().optional(),
})

export const legacyCounterpartyTransformRequestSchema = z.object({
  entityKind: z.literal("counterparty"),
  sourceSystem: legacyErpSourceSystemSchema,
  payload: legacyCounterpartyPayloadSchema,
})

export const legacyJournalTransformRequestSchema = z.object({
  entityKind: z.literal("journal-entry"),
  sourceSystem: legacyErpSourceSystemSchema,
  payload: legacyJournalEntryPayloadSchema,
})

export const legacyInventoryItemTransformRequestSchema = z.object({
  entityKind: z.literal("inventory-item"),
  sourceSystem: legacyErpSourceSystemSchema,
  payload: legacyInventoryItemPayloadSchema,
})

export const legacyErpTransformRequestSchema = z.discriminatedUnion(
  "entityKind",
  [
    legacyCounterpartyTransformRequestSchema,
    legacyJournalTransformRequestSchema,
    legacyInventoryItemTransformRequestSchema,
  ]
)

export const legacyErpIngestBatchRequestSchema = z.object({
  records: z.array(legacyErpTransformRequestSchema).min(1).max(100),
})

export const legacyErpCounterpartyPullRequestSchema = z.object({
  sourceProfile: legacyErpCounterpartySourceProfileSchema.default(
    "legacy-tpm-customers"
  ),
  search: z.string().trim().min(1).optional(),
  channel: z.string().trim().min(1).optional(),
  companyId: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
  pageSize: z.number().int().positive().max(100).default(50),
  maxRecords: z.number().int().positive().max(500).default(100),
})

export const legacyErpItemPullRequestSchema = z.object({
  sourceProfile: legacyErpItemSourceProfileSchema.default(
    "legacy-mrp-products"
  ),
  search: z.string().trim().min(1).optional(),
  status: z.string().trim().min(1).optional(),
  pageSize: z.number().int().positive().max(100).default(50),
  maxRecords: z.number().int().positive().max(500).default(100),
})

export type LegacyErpSourceSystem = z.infer<typeof legacyErpSourceSystemSchema>
export type LegacyErpEntityKind = z.infer<typeof legacyErpEntityKindSchema>
export type LegacyCounterpartyTransformRequest = z.infer<
  typeof legacyCounterpartyTransformRequestSchema
>
export type LegacyJournalTransformRequest = z.infer<
  typeof legacyJournalTransformRequestSchema
>
export type LegacyInventoryItemTransformRequest = z.infer<
  typeof legacyInventoryItemTransformRequestSchema
>
export type LegacyErpTransformRequest = z.infer<
  typeof legacyErpTransformRequestSchema
>
export type LegacyErpIngestBatchRequest = z.infer<
  typeof legacyErpIngestBatchRequestSchema
>
export type LegacyErpCounterpartySourceProfile = z.infer<
  typeof legacyErpCounterpartySourceProfileSchema
>
export type LegacyErpCounterpartyPullRequest = z.infer<
  typeof legacyErpCounterpartyPullRequestSchema
>
export type LegacyErpItemSourceProfile = z.infer<
  typeof legacyErpItemSourceProfileSchema
>
export type LegacyErpItemPullRequest = z.infer<
  typeof legacyErpItemPullRequestSchema
>
