/**
 * Legacy ERP adapter contract: canonical Afenda-side transform outputs for stable legacy APIs.
 * module · legacy-erp · contract
 * Upstream: MDM create payload shape. Downstream: service, routes, tests.
 * Side effects: none.
 * Coupling: outputs are Afenda-shaped candidates ready for owner-local modules to digest.
 * experimental
 * @module modules/legacy-erp/legacy-erp.contract
 * @package @afenda/api
 */
import type { CreateCounterpartyInput } from "../mdm/counterparties/counterparty.schema.js"
import type { CreateItemInput } from "../mdm/items/item.schema.js"
import type {
  LegacyErpEntityKind,
  LegacyErpSourceSystem,
} from "./legacy-erp.schema.js"

export const legacyErpTransformPermission = "admin:workspace:manage" as const

export type LegacyAdapterWarning = {
  readonly code: string
  readonly message: string
  readonly field?: string
}

export interface LegacyRecordProvenance {
  readonly sourceSystem: LegacyErpSourceSystem
  readonly sourceRecordId: string | null
  readonly entityKind: LegacyErpEntityKind
}

export interface AdaptedCounterpartyRecord extends CreateCounterpartyInput {
  readonly tenantId: string
  readonly code: string
  readonly canonicalName: string
}

export type LegacyJournalStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "POSTED"
  | "VOID"
  | "REVERSED"

export type LegacyJournalType =
  | "STANDARD"
  | "ADJUSTING"
  | "CLOSING"
  | "REVERSING"
  | "ACCRUAL"
  | "PAYROLL"
  | "AP_INVOICE"
  | "AR_INVOICE"
  | "PROMOTION"
  | "CLAIM"
  | "BUDGET"
  | "INVENTORY"
  | "DEPRECIATION"

export type LegacyJournalCurrency =
  | "VND"
  | "USD"
  | "EUR"
  | "GBP"
  | "SGD"
  | "JPY"
  | "CNY"

export interface AdaptedFinanceJournalRecord {
  readonly entryDate: Date
  readonly journalType: LegacyJournalType
  readonly targetStatus: LegacyJournalStatus
  readonly targetJournalType: LegacyJournalType
  readonly description: string
  readonly reference?: string
  readonly memo?: string
  readonly sourceModule?: string
  readonly sourceId?: string
  readonly autoPost?: boolean
  readonly lines: ReadonlyArray<{
    readonly accountId: string
    readonly debitAmount: number
    readonly creditAmount: number
    readonly description?: string
    readonly currency?: LegacyJournalCurrency
    readonly exchangeRate?: number
  }>
}

export interface AdaptedInventoryItemCandidate extends CreateItemInput {
  readonly tenantId: string
  readonly itemCode: string
  readonly itemName: string
  readonly canonicalName: string
  readonly baseUomCode: string
  readonly onHandQuantity?: number
  readonly currency?: LegacyJournalCurrency
}

export type LegacyErpIngestionDisposition = "persisted" | "candidate-only"

interface LegacyErpAdaptationBase<
  TKind extends LegacyErpEntityKind,
  TTargetBoundary extends string,
  TRecord,
> {
  readonly entityKind: TKind
  readonly targetBoundary: TTargetBoundary
  readonly provenance: LegacyRecordProvenance & { readonly entityKind: TKind }
  readonly warnings: readonly LegacyAdapterWarning[]
  readonly normalizedRecord: TRecord
}

export type LegacyCounterpartyAdaptation = LegacyErpAdaptationBase<
  "counterparty",
  "mdm.counterparty",
  AdaptedCounterpartyRecord
>

export type LegacyJournalAdaptation = LegacyErpAdaptationBase<
  "journal-entry",
  "finance.journal-entry",
  AdaptedFinanceJournalRecord
>

export type LegacyInventoryItemAdaptation = LegacyErpAdaptationBase<
  "inventory-item",
  "mdm.item",
  AdaptedInventoryItemCandidate
>

export type LegacyErpAdaptation =
  | LegacyCounterpartyAdaptation
  | LegacyJournalAdaptation
  | LegacyInventoryItemAdaptation

export interface LegacyErpIngestionResult {
  readonly disposition: LegacyErpIngestionDisposition
  readonly adaptation: LegacyErpAdaptation
  readonly persistedRecord?:
    | {
        readonly entityKind: "counterparty"
        readonly recordId: string
        readonly code: string
      }
    | {
        readonly entityKind: "inventory-item"
        readonly recordId: string
        readonly code: string
      }
    | undefined
}
