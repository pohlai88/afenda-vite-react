/**
 * Legacy ERP adapter service: anti-corruption layer for stable legacy API payloads.
 * Owns deterministic normalization into Afenda-shaped records and first-step owner handoff.
 * module · legacy-erp · service
 * Upstream: legacy schema, MDM normalization policy, finance-core validation.
 * Downstream: routes, owner modules, tests.
 * Side effects: counterparty ingestion persists through the canonical MDM service.
 * Coupling: unsupported entities remain candidates until their owning Afenda modules are live.
 * experimental
 * @module modules/legacy-erp/legacy-erp.service
 * @package @afenda/api
 */
import { badRequest, unprocessableEntity } from "../../api-errors.js"
import { createCounterparty, createItem } from "../mdm/index.js"
import {
  normalizeCounterpartyCanonicalName,
  normalizeCounterpartyCode,
  normalizeCounterpartyDisplayName,
} from "../mdm/counterparties/counterparty-normalization.policy.js"
import type {
  AdaptedCounterpartyRecord,
  AdaptedFinanceJournalRecord,
  AdaptedInventoryItemCandidate,
  LegacyAdapterWarning,
  LegacyErpAdaptation,
  LegacyErpIngestionResult,
  LegacyJournalCurrency,
  LegacyJournalStatus,
  LegacyJournalType,
  LegacyRecordProvenance,
} from "./legacy-erp.contract.js"
import type {
  LegacyErpIngestBatchRequest,
  LegacyErpTransformRequest,
} from "./legacy-erp.schema.js"

function compactWhitespace(value: string): string {
  return value.trim().replace(/\s+/gu, " ")
}

function canonicalizeText(value: string): string {
  return compactWhitespace(value).toUpperCase()
}

function resolveSourceRecordId(
  payload: Record<string, unknown>
): string | null {
  for (const key of ["id", "externalId", "external_id"]) {
    const value = payload[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  return null
}

function createProvenance(
  input: LegacyErpTransformRequest
): LegacyRecordProvenance {
  return {
    sourceSystem: input.sourceSystem,
    sourceRecordId: resolveSourceRecordId(
      input.payload as Record<string, unknown>
    ),
    entityKind: input.entityKind,
  }
}

function normalizeCounterpartyKind(
  value: string | undefined,
  warnings: LegacyAdapterWarning[]
): "customer" | "supplier" | "hybrid" {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) {
    warnings.push({
      code: "legacy_counterparty_kind_defaulted",
      message: "Legacy counterparty kind was missing; defaulted to customer.",
      field: "kind",
    })
    return "customer"
  }

  switch (normalized) {
    case "customer":
    case "client":
    case "account":
      return "customer"
    case "supplier":
    case "vendor":
      return "supplier"
    case "hybrid":
    case "partner":
      return "hybrid"
    default:
      warnings.push({
        code: "legacy_counterparty_kind_unmapped",
        message: `Legacy counterparty kind "${value}" was not mapped; defaulted to customer.`,
        field: "kind",
      })
      return "customer"
  }
}

function normalizeCounterpartyStatus(
  value: string | undefined,
  warnings: LegacyAdapterWarning[]
): "active" | "inactive" | "blocked" {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) {
    return "active"
  }

  switch (normalized) {
    case "active":
    case "enabled":
    case "open":
      return "active"
    case "inactive":
    case "disabled":
    case "archived":
      return "inactive"
    case "blocked":
    case "suspended":
    case "blacklisted":
      return "blocked"
    default:
      warnings.push({
        code: "legacy_counterparty_status_unmapped",
        message: `Legacy counterparty status "${value}" was not mapped; defaulted to active.`,
        field: "status",
      })
      return "active"
  }
}

function adaptCounterparty(input: {
  readonly tenantId: string
  readonly request: Extract<
    LegacyErpTransformRequest,
    { entityKind: "counterparty" }
  >
}): LegacyErpAdaptation {
  const warnings: LegacyAdapterWarning[] = []
  const payload = input.request.payload
  const rawDisplayName = payload.displayName ?? payload.name

  if (!rawDisplayName) {
    throw badRequest("Legacy counterparty payload requires a display name.", {
      entityKind: input.request.entityKind,
      sourceSystem: input.request.sourceSystem,
    })
  }

  const displayName = normalizeCounterpartyDisplayName(rawDisplayName)
  const canonicalName = normalizeCounterpartyCanonicalName(
    payload.canonicalName ?? displayName
  )
  const code = normalizeCounterpartyCode({
    code: payload.code ?? payload.externalCode,
    displayName,
  })

  const aliases = [
    ...(payload.aliases ?? []),
    ...(payload.alias ? [payload.alias] : []),
  ].map(compactWhitespace)
  const uniqueAliases = Array.from(
    new Set(
      aliases.filter(
        (value) =>
          value.length > 0 &&
          value.localeCompare(displayName, undefined, {
            sensitivity: "accent",
          }) !== 0
      )
    )
  )

  const normalizedRecord: AdaptedCounterpartyRecord = {
    tenantId: input.tenantId,
    code,
    displayName,
    canonicalName,
    kind: normalizeCounterpartyKind(payload.kind ?? payload.type, warnings),
    status: normalizeCounterpartyStatus(payload.status, warnings),
    email: payload.email,
    phone: payload.phone,
    taxRegistrationNumber:
      payload.taxRegistrationNumber ?? payload.taxCode ?? payload.vatNumber,
    aliases: uniqueAliases,
  }

  return {
    entityKind: "counterparty",
    targetBoundary: "mdm.counterparty",
    provenance: {
      ...createProvenance(input.request),
      entityKind: "counterparty",
    },
    warnings,
    normalizedRecord,
  }
}

function parseLegacyIsoDate(
  value: string | undefined,
  field: string
): Date | undefined {
  if (!value) {
    return undefined
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw badRequest(
      `Legacy journal field "${field}" must be a valid ISO date.`,
      {
        field,
        value,
      }
    )
  }

  return parsed
}

function normalizeJournalType(
  value: string | undefined,
  warnings: LegacyAdapterWarning[]
): LegacyJournalType {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) {
    return "STANDARD"
  }

  const journalTypeMap: Record<string, LegacyJournalType> = {
    standard: "STANDARD",
    manual: "STANDARD",
    adjusting: "ADJUSTING",
    closing: "CLOSING",
    reversing: "REVERSING",
    accrual: "ACCRUAL",
    payroll: "PAYROLL",
    ap_invoice: "AP_INVOICE",
    "ap-invoice": "AP_INVOICE",
    ar_invoice: "AR_INVOICE",
    "ar-invoice": "AR_INVOICE",
    promotion: "PROMOTION",
    claim: "CLAIM",
    budget: "BUDGET",
    inventory: "INVENTORY",
    depreciation: "DEPRECIATION",
  }

  const mapped = journalTypeMap[normalized]
  if (mapped) {
    return mapped
  }

  warnings.push({
    code: "legacy_journal_type_unmapped",
    message: `Legacy journal type "${value}" was not mapped; defaulted to STANDARD.`,
    field: "journalType",
  })
  return "STANDARD"
}

function normalizeJournalStatus(
  value: string | undefined,
  warnings: LegacyAdapterWarning[]
): LegacyJournalStatus {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) {
    return "DRAFT"
  }

  const journalStatusMap: Record<string, LegacyJournalStatus> = {
    draft: "DRAFT",
    pending_approval: "PENDING_APPROVAL",
    "pending-approval": "PENDING_APPROVAL",
    pending: "PENDING_APPROVAL",
    approved: "PENDING_APPROVAL",
    posted: "POSTED",
    void: "VOID",
    voided: "VOID",
    reversed: "REVERSED",
  }

  const mapped = journalStatusMap[normalized]
  if (mapped) {
    return mapped
  }

  warnings.push({
    code: "legacy_journal_status_unmapped",
    message: `Legacy journal status "${value}" was not mapped; defaulted to DRAFT.`,
    field: "status",
  })
  return "DRAFT"
}

function normalizeCurrency(
  value: string | undefined
): LegacyJournalCurrency | undefined {
  const normalized = value?.trim().toUpperCase()

  switch (normalized) {
    case "VND":
    case "USD":
    case "EUR":
    case "GBP":
    case "SGD":
    case "JPY":
    case "CNY":
      return normalized
    default:
      return undefined
  }
}

function validateJournalCandidate(input: AdaptedFinanceJournalRecord): void {
  if (!input.description.trim()) {
    throw new Error("Description is required.")
  }

  if (input.lines.length < 2) {
    throw new Error("Journal entries require at least two lines.")
  }

  let totalDebit = 0
  let totalCredit = 0

  for (const [index, line] of input.lines.entries()) {
    if (!line.accountId.trim()) {
      throw new Error(`Line ${index + 1}: accountId is required.`)
    }

    if (line.debitAmount < 0 || line.creditAmount < 0) {
      throw new Error(`Line ${index + 1}: amounts cannot be negative.`)
    }

    if (line.debitAmount === 0 && line.creditAmount === 0) {
      throw new Error(
        `Line ${index + 1}: debit or credit must be greater than zero.`
      )
    }

    if (line.debitAmount > 0 && line.creditAmount > 0) {
      throw new Error(
        `Line ${index + 1}: a line cannot have both debit and credit.`
      )
    }

    totalDebit += line.debitAmount
    totalCredit += line.creditAmount
  }

  if (Math.abs(totalDebit - totalCredit) >= 0.01) {
    throw new Error(
      `Journal not balanced: debit ${totalDebit.toFixed(2)} does not equal credit ${totalCredit.toFixed(2)}.`
    )
  }
}

function resolveJournalAmounts(line: {
  readonly debitAmount?: number
  readonly creditAmount?: number
  readonly amount?: number
  readonly side?: string
}): { readonly debitAmount: number; readonly creditAmount: number } {
  if (
    typeof line.debitAmount === "number" ||
    typeof line.creditAmount === "number"
  ) {
    return {
      debitAmount: line.debitAmount ?? 0,
      creditAmount: line.creditAmount ?? 0,
    }
  }

  const amount = line.amount ?? 0
  const side = line.side?.trim().toLowerCase()

  switch (side) {
    case "debit":
    case "dr":
      return { debitAmount: amount, creditAmount: 0 }
    case "credit":
    case "cr":
      return { debitAmount: 0, creditAmount: amount }
    default:
      return { debitAmount: 0, creditAmount: 0 }
  }
}

function adaptJournal(input: {
  readonly request: Extract<
    LegacyErpTransformRequest,
    { entityKind: "journal-entry" }
  >
}): LegacyErpAdaptation {
  const warnings: LegacyAdapterWarning[] = []
  const payload = input.request.payload
  const targetJournalType = normalizeJournalType(payload.journalType, warnings)
  const targetStatus = normalizeJournalStatus(payload.status, warnings)
  const entryDate = parseLegacyIsoDate(
    payload.entryDate ?? payload.date,
    "entryDate"
  )

  if (!entryDate) {
    throw badRequest("Legacy journal payload requires an entryDate/date.", {
      entityKind: input.request.entityKind,
      sourceSystem: input.request.sourceSystem,
    })
  }

  const normalizedRecord: AdaptedFinanceJournalRecord = {
    entryDate,
    journalType: targetJournalType,
    targetJournalType,
    targetStatus,
    description: compactWhitespace(payload.description),
    reference: payload.reference,
    memo: payload.memo,
    sourceModule: payload.sourceModule ?? input.request.sourceSystem,
    sourceId: payload.externalId ?? payload.id,
    autoPost: targetStatus === "POSTED",
    lines: payload.lines.map((line, index) => {
      const amounts = resolveJournalAmounts(line)
      const accountId = line.accountId ?? line.accountCode ?? line.accountNumber

      if (!accountId) {
        throw badRequest(
          `Legacy journal line ${index + 1} requires an account id or code.`,
          {
            line: index + 1,
          }
        )
      }

      return {
        accountId: compactWhitespace(accountId),
        description: line.description,
        debitAmount: amounts.debitAmount,
        creditAmount: amounts.creditAmount,
        currency: normalizeCurrency(line.currency),
        exchangeRate: line.exchangeRate,
      }
    }),
  }

  try {
    validateJournalCandidate(normalizedRecord)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Legacy journal payload is invalid."
    throw unprocessableEntity(message, {
      entityKind: input.request.entityKind,
      sourceSystem: input.request.sourceSystem,
    })
  }

  return {
    entityKind: "journal-entry",
    targetBoundary: "finance.journal-entry",
    provenance: {
      ...createProvenance(input.request),
      entityKind: "journal-entry",
    },
    warnings,
    normalizedRecord,
  }
}

function normalizeInventoryStatus(
  value: string | undefined,
  warnings: LegacyAdapterWarning[]
): "active" | "inactive" | "blocked" {
  const normalized = value?.trim().toLowerCase()

  if (!normalized) {
    return "active"
  }

  switch (normalized) {
    case "active":
    case "enabled":
    case "available":
      return "active"
    case "inactive":
    case "disabled":
    case "archived":
      return "inactive"
    case "blocked":
    case "hold":
    case "suspended":
      return "blocked"
    default:
      warnings.push({
        code: "legacy_inventory_status_unmapped",
        message: `Legacy inventory status "${value}" was not mapped; defaulted to active.`,
        field: "status",
      })
      return "active"
  }
}

function adaptInventoryItem(input: {
  readonly tenantId: string
  readonly request: Extract<
    LegacyErpTransformRequest,
    { entityKind: "inventory-item" }
  >
}): LegacyErpAdaptation {
  const warnings: LegacyAdapterWarning[] = []
  const payload = input.request.payload
  const rawItemName = payload.displayName ?? payload.name

  if (!rawItemName) {
    throw badRequest("Legacy inventory item payload requires a display name.", {
      entityKind: input.request.entityKind,
      sourceSystem: input.request.sourceSystem,
    })
  }

  const itemName = compactWhitespace(rawItemName)
  const canonicalName = canonicalizeText(payload.canonicalName ?? rawItemName)
  const codeSource = payload.code ?? payload.itemCode ?? payload.sku ?? itemName
  const itemCode = canonicalizeText(codeSource).replace(/[^A-Z0-9]+/gu, "-")

  const itemType = payload.itemType?.trim().toLowerCase()
  const normalizedItemType =
    itemType === "service" ||
    itemType === "asset" ||
    itemType === "expense" ||
    itemType === "inventory"
      ? itemType
      : "inventory"

  if (itemType && normalizedItemType !== itemType) {
    warnings.push({
      code: "legacy_inventory_item_type_unmapped",
      message: `Legacy inventory item type "${payload.itemType}" was not mapped; defaulted to inventory.`,
      field: "itemType",
    })
  }

  const normalizedRecord: AdaptedInventoryItemCandidate = {
    tenantId: input.tenantId,
    itemCode,
    itemName,
    canonicalName,
    itemType: normalizedItemType,
    status: normalizeInventoryStatus(payload.status, warnings),
    baseUomCode: payload.baseUomCode ?? payload.uomCode ?? payload.uom ?? "EA",
    categoryCode: payload.categoryCode ?? payload.category,
    onHandQuantity: payload.onHandQuantity,
  }

  return {
    entityKind: "inventory-item",
    targetBoundary: "mdm.item",
    provenance: {
      ...createProvenance(input.request),
      entityKind: "inventory-item",
    },
    warnings,
    normalizedRecord,
  }
}

export function adaptLegacyErpPayload(input: {
  readonly tenantId: string
  readonly request: LegacyErpTransformRequest
}): LegacyErpAdaptation {
  switch (input.request.entityKind) {
    case "counterparty":
      return adaptCounterparty({
        tenantId: input.tenantId,
        request: input.request,
      })
    case "journal-entry":
      return adaptJournal({
        request: input.request,
      })
    case "inventory-item":
      return adaptInventoryItem({
        tenantId: input.tenantId,
        request: input.request,
      })
  }
}

export async function ingestLegacyErpBatch(input: {
  readonly tenantId: string
  readonly request: LegacyErpIngestBatchRequest
}): Promise<{
  readonly totalRecords: number
  readonly persistedCount: number
  readonly candidateOnlyCount: number
  readonly results: readonly LegacyErpIngestionResult[]
}> {
  const results: LegacyErpIngestionResult[] = []

  for (const record of input.request.records) {
    const adaptation = adaptLegacyErpPayload({
      tenantId: input.tenantId,
      request: record,
    })

    if (adaptation.entityKind === "counterparty") {
      const persisted = await createCounterparty({
        tenantId: input.tenantId,
        payload: adaptation.normalizedRecord,
      })

      results.push({
        disposition: "persisted",
        adaptation,
        persistedRecord: {
          entityKind: "counterparty",
          recordId: persisted.id,
          code: persisted.code,
        },
      })
      continue
    }

    if (adaptation.entityKind === "inventory-item") {
      const persisted = await createItem({
        tenantId: input.tenantId,
        payload: adaptation.normalizedRecord,
      })

      results.push({
        disposition: "persisted",
        adaptation,
        persistedRecord: {
          entityKind: "inventory-item",
          recordId: persisted.id,
          code: persisted.itemCode,
        },
      })
      continue
    }

    results.push({
      disposition: "candidate-only",
      adaptation,
    })
  }

  const persistedCount = results.filter(
    (result) => result.disposition === "persisted"
  ).length

  return {
    totalRecords: results.length,
    persistedCount,
    candidateOnlyCount: results.length - persistedCount,
    results,
  }
}
