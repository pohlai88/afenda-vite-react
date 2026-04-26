import { db, type DatabaseClient } from "@afenda/database"

import { getBetterAuthRuntime } from "../../../api-auth-runtime.js"
import type {
  FinanceInvoiceDto,
  FinanceInvoiceListResponse,
  FinanceInvoiceRecord,
  FinanceInvoiceTransition,
} from "./invoice.contract.js"
import type {
  CreateInvoiceInput,
  FinanceInvoiceListQuery,
} from "./invoice.schema.js"
import {
  __resetFinanceInvoiceRepoForTests,
  financeInvoiceRepository,
} from "./invoice.repo.js"

export class FinanceInvoiceNotFoundError extends Error {
  constructor(invoiceId: string) {
    super(`Finance invoice ${invoiceId} was not found.`)
    this.name = "FinanceInvoiceNotFoundError"
  }
}

export class FinanceInvoiceLifecycleError extends Error {
  constructor(
    readonly invoiceId: string,
    readonly currentStatus: FinanceInvoiceRecord["status"],
    readonly transition: FinanceInvoiceTransition
  ) {
    super(
      `Invoice ${invoiceId} cannot transition via ${transition} from ${currentStatus}.`
    )
    this.name = "FinanceInvoiceLifecycleError"
  }
}

function toFinanceInvoiceDto(invoice: FinanceInvoiceRecord): FinanceInvoiceDto {
  return {
    id: invoice.id,
    tenantId: invoice.tenantId,
    subscriptionId: invoice.subscriptionId,
    invoiceNumber: invoice.invoiceNumber,
    customerLabel: invoice.customerLabel,
    status: invoice.status,
    subtotalMinor: invoice.subtotalMinor,
    taxAmountMinor: invoice.taxAmountMinor,
    totalMinor: invoice.totalMinor,
    currencyCode: invoice.currencyCode,
    periodStartAt: invoice.periodStartAt.toISOString(),
    periodEndAt: invoice.periodEndAt.toISOString(),
    dueAt: invoice.dueAt.toISOString(),
    paidAt: invoice.paidAt?.toISOString(),
    items: invoice.items,
    createdAt: invoice.createdAt.toISOString(),
  }
}

function selectFinanceInvoiceDatabase(): DatabaseClient | undefined {
  const runtime = getBetterAuthRuntime() as ReturnType<
    typeof getBetterAuthRuntime
  > & {
    db?: DatabaseClient | null
  }

  if (runtime.db) {
    return runtime.db
  }

  if (process.env.NODE_ENV === "test") {
    return undefined
  }

  return db
}

function assertTransitionAllowed(
  invoice: FinanceInvoiceRecord,
  transition: FinanceInvoiceTransition
): void {
  const allowed =
    (transition === "open" && invoice.status === "draft") ||
    (transition === "paid" && invoice.status === "open") ||
    (transition === "void" &&
      (invoice.status === "draft" || invoice.status === "open"))

  if (!allowed) {
    throw new FinanceInvoiceLifecycleError(
      invoice.id,
      invoice.status,
      transition
    )
  }
}

export async function listFinanceInvoices(input: {
  readonly tenantId: string
  readonly query: FinanceInvoiceListQuery
}): Promise<FinanceInvoiceListResponse> {
  const items = await financeInvoiceRepository.findMany(
    input.tenantId,
    input.query,
    selectFinanceInvoiceDatabase()
  )
  return {
    tenantId: input.tenantId,
    items: items.map(toFinanceInvoiceDto),
    totalItems: items.length,
    totalAmountMinor: items.reduce((sum, item) => sum + item.totalMinor, 0),
  }
}

export async function createFinanceInvoice(input: {
  readonly tenantId: string
  readonly payload: CreateInvoiceInput
}): Promise<FinanceInvoiceDto> {
  const item = await financeInvoiceRepository.insert({
    ...input,
    database: selectFinanceInvoiceDatabase(),
  })
  return toFinanceInvoiceDto(item)
}

export async function getFinanceInvoiceDetail(input: {
  readonly tenantId: string
  readonly invoiceId: string
}): Promise<FinanceInvoiceDto> {
  const item = await financeInvoiceRepository.findById({
    ...input,
    database: selectFinanceInvoiceDatabase(),
  })
  if (!item) {
    throw new FinanceInvoiceNotFoundError(input.invoiceId)
  }
  return toFinanceInvoiceDto(item)
}

export async function transitionFinanceInvoiceStatus(input: {
  readonly tenantId: string
  readonly invoiceId: string
  readonly transition: FinanceInvoiceTransition
}): Promise<FinanceInvoiceDto> {
  const current = await financeInvoiceRepository.findById({
    tenantId: input.tenantId,
    invoiceId: input.invoiceId,
    database: selectFinanceInvoiceDatabase(),
  })

  if (!current) {
    throw new FinanceInvoiceNotFoundError(input.invoiceId)
  }

  assertTransitionAllowed(current, input.transition)

  const item = await financeInvoiceRepository.transitionStatus({
    ...input,
    database: selectFinanceInvoiceDatabase(),
  })

  if (!item) {
    throw new FinanceInvoiceNotFoundError(input.invoiceId)
  }

  return toFinanceInvoiceDto(item)
}

export function __resetFinanceInvoicesForTests(): void {
  __resetFinanceInvoiceRepoForTests()
}
