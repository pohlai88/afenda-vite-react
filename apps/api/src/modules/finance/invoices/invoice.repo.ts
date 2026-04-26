import type { DatabaseClient } from "@afenda/database"
import { invoiceItems, invoices } from "@afenda/database/schema"
import { and, asc, desc, eq } from "drizzle-orm"

import type {
  CreateInvoiceInput,
  FinanceInvoiceListQuery,
} from "./invoice.schema.js"
import type {
  FinanceInvoiceRecord,
  FinanceInvoiceTransition,
} from "./invoice.contract.js"

const invoicesByTenant = new Map<string, FinanceInvoiceRecord[]>()
let invoiceSequence = 1000

function nextInvoiceId(): string {
  invoiceSequence += 1
  return `inv_fin_${invoiceSequence}`
}

function nextInvoiceNumber(): string {
  invoiceSequence += 1
  return `AF-${new Date().getUTCFullYear()}-${String(invoiceSequence).padStart(6, "0")}`
}

function createInvoiceRecordFromPayload(input: {
  readonly tenantId: string
  readonly payload: CreateInvoiceInput
  readonly now: Date
  readonly createId?: () => string
}): FinanceInvoiceRecord {
  const subtotalMinor = input.payload.items.reduce(
    (sum, line) => sum + line.quantity * line.unitPriceMinor,
    0
  )
  const taxAmountMinor = Math.round(subtotalMinor * input.payload.taxRate)

  return {
    id: input.createId?.() ?? nextInvoiceId(),
    tenantId: input.tenantId,
    subscriptionId: "finance-manual",
    invoiceNumber: nextInvoiceNumber(),
    customerLabel: input.payload.customerLabel.trim(),
    status: "draft",
    subtotalMinor,
    taxAmountMinor,
    totalMinor: subtotalMinor + taxAmountMinor,
    currencyCode: input.payload.currencyCode.toUpperCase(),
    periodStartAt: input.now,
    periodEndAt: input.now,
    dueAt: new Date(
      input.now.getTime() + input.payload.daysUntilDue * 24 * 60 * 60 * 1000
    ),
    items: input.payload.items.map((line) => ({
      description: line.description.trim(),
      quantity: line.quantity,
      unitPriceMinor: line.unitPriceMinor,
      amountMinor: line.quantity * line.unitPriceMinor,
    })),
    createdAt: input.now,
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
    value
  )
}

async function findDbInvoices(input: {
  readonly database: DatabaseClient
  readonly tenantId: string
  readonly query: FinanceInvoiceListQuery
}): Promise<FinanceInvoiceRecord[]> {
  const filters = [eq(invoices.tenantId, input.tenantId)]
  if (input.query.status) {
    filters.push(eq(invoices.status, input.query.status))
  }

  const invoiceRows = await input.database.query.invoices.findMany({
    where: and(...filters),
    orderBy: [desc(invoices.createdAt)],
    with: {
      items: {
        orderBy: [asc(invoiceItems.lineNumber)],
      },
    },
  })

  const search = input.query.search?.trim().toLowerCase()
  const records = invoiceRows.map((invoice) => ({
    id: invoice.id,
    tenantId: invoice.tenantId,
    subscriptionId: invoice.subscriptionId,
    invoiceNumber: invoice.invoiceNumber,
    customerLabel: invoice.customerLabel,
    status: invoice.status as FinanceInvoiceRecord["status"],
    subtotalMinor: invoice.subtotalMinor,
    taxAmountMinor: invoice.taxAmountMinor,
    totalMinor: invoice.totalMinor,
    currencyCode: invoice.currencyCode,
    periodStartAt: invoice.periodStartAt,
    periodEndAt: invoice.periodEndAt,
    dueAt: invoice.dueAt,
    paidAt: invoice.paidAt ?? undefined,
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPriceMinor: item.unitPriceMinor,
      amountMinor: item.amountMinor,
    })),
    createdAt: invoice.createdAt,
  }))

  if (!search) {
    return records
  }

  return records.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(search) ||
      invoice.customerLabel.toLowerCase().includes(search)
  )
}

async function findDbInvoiceById(input: {
  readonly database: DatabaseClient
  readonly tenantId: string
  readonly invoiceId: string
}): Promise<FinanceInvoiceRecord | null> {
  if (!isUuid(input.invoiceId)) {
    return null
  }

  const invoiceRow = await input.database.query.invoices.findFirst({
    where: and(
      eq(invoices.tenantId, input.tenantId),
      eq(invoices.id, input.invoiceId)
    ),
    with: {
      items: {
        orderBy: [asc(invoiceItems.lineNumber)],
      },
    },
  })

  if (!invoiceRow) {
    return null
  }

  return {
    id: invoiceRow.id,
    tenantId: invoiceRow.tenantId,
    subscriptionId: invoiceRow.subscriptionId,
    invoiceNumber: invoiceRow.invoiceNumber,
    customerLabel: invoiceRow.customerLabel,
    status: invoiceRow.status as FinanceInvoiceRecord["status"],
    subtotalMinor: invoiceRow.subtotalMinor,
    taxAmountMinor: invoiceRow.taxAmountMinor,
    totalMinor: invoiceRow.totalMinor,
    currencyCode: invoiceRow.currencyCode,
    periodStartAt: invoiceRow.periodStartAt,
    periodEndAt: invoiceRow.periodEndAt,
    dueAt: invoiceRow.dueAt,
    paidAt: invoiceRow.paidAt ?? undefined,
    items: invoiceRow.items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unitPriceMinor: item.unitPriceMinor,
      amountMinor: item.amountMinor,
    })),
    createdAt: invoiceRow.createdAt,
  }
}

async function insertDbInvoice(input: {
  readonly database: DatabaseClient
  readonly tenantId: string
  readonly payload: CreateInvoiceInput
}): Promise<FinanceInvoiceRecord> {
  const now = new Date()
  const record = createInvoiceRecordFromPayload({
    tenantId: input.tenantId,
    payload: input.payload,
    now,
    createId: () => crypto.randomUUID(),
  })

  await input.database.transaction(async (tx) => {
    await tx.insert(invoices).values({
      id: record.id,
      tenantId: record.tenantId,
      subscriptionId: record.subscriptionId,
      invoiceNumber: record.invoiceNumber,
      customerLabel: record.customerLabel,
      status: record.status,
      subtotalMinor: record.subtotalMinor,
      taxAmountMinor: record.taxAmountMinor,
      totalMinor: record.totalMinor,
      currencyCode: record.currencyCode,
      periodStartAt: record.periodStartAt,
      periodEndAt: record.periodEndAt,
      dueAt: record.dueAt,
      metadata: {},
    })

    await tx.insert(invoiceItems).values(
      record.items.map((item, index) => ({
        tenantId: record.tenantId,
        invoiceId: record.id,
        lineNumber: index + 1,
        description: item.description,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        amountMinor: item.amountMinor,
        metadata: {},
      }))
    )
  })

  return record
}

async function transitionDbInvoiceStatus(input: {
  readonly database: DatabaseClient
  readonly tenantId: string
  readonly invoiceId: string
  readonly nextStatus: FinanceInvoiceRecord["status"]
  readonly now: Date
}): Promise<FinanceInvoiceRecord | null> {
  await input.database
    .update(invoices)
    .set({
      status: input.nextStatus,
      openedAt: input.nextStatus === "open" ? input.now : undefined,
      paidAt: input.nextStatus === "paid" ? input.now : null,
      voidedAt: input.nextStatus === "void" ? input.now : undefined,
    })
    .where(
      and(
        eq(invoices.tenantId, input.tenantId),
        eq(invoices.id, input.invoiceId)
      )
    )

  return findDbInvoiceById({
    database: input.database,
    tenantId: input.tenantId,
    invoiceId: input.invoiceId,
  })
}

function seedInvoices(tenantId: string): FinanceInvoiceRecord[] {
  const now = new Date("2026-04-25T09:00:00.000Z")
  return [
    {
      id: nextInvoiceId(),
      tenantId,
      subscriptionId: "finance-manual",
      invoiceNumber: nextInvoiceNumber(),
      customerLabel: "Atlas Retail Group",
      status: "open",
      subtotalMinor: 245000,
      taxAmountMinor: 24500,
      totalMinor: 269500,
      currencyCode: "USD",
      periodStartAt: new Date("2026-04-01T00:00:00.000Z"),
      periodEndAt: new Date("2026-04-30T00:00:00.000Z"),
      dueAt: new Date("2026-05-02T00:00:00.000Z"),
      items: [
        {
          description: "Monthly reconciliation support",
          quantity: 1,
          unitPriceMinor: 245000,
          amountMinor: 245000,
        },
      ],
      createdAt: now,
    },
    {
      id: nextInvoiceId(),
      tenantId,
      subscriptionId: "finance-manual",
      invoiceNumber: nextInvoiceNumber(),
      customerLabel: "Northstar Distribution",
      status: "draft",
      subtotalMinor: 88000,
      taxAmountMinor: 8800,
      totalMinor: 96800,
      currencyCode: "USD",
      periodStartAt: new Date("2026-04-10T00:00:00.000Z"),
      periodEndAt: new Date("2026-04-25T00:00:00.000Z"),
      dueAt: new Date("2026-05-05T00:00:00.000Z"),
      items: [
        {
          description: "Exception handling review",
          quantity: 4,
          unitPriceMinor: 22000,
          amountMinor: 88000,
        },
      ],
      createdAt: new Date("2026-04-22T11:00:00.000Z"),
    },
  ]
}

function getTenantInvoices(tenantId: string): FinanceInvoiceRecord[] {
  const existing = invoicesByTenant.get(tenantId)
  if (existing) {
    return existing
  }

  const seeded = seedInvoices(tenantId)
  invoicesByTenant.set(tenantId, seeded)
  return seeded
}

export const financeInvoiceRepository = {
  async findMany(
    tenantId: string,
    query: FinanceInvoiceListQuery,
    database?: DatabaseClient
  ): Promise<FinanceInvoiceRecord[]> {
    if (database) {
      return findDbInvoices({
        database,
        tenantId,
        query,
      })
    }

    const search = query.search?.trim().toLowerCase()

    return getTenantInvoices(tenantId)
      .filter((invoice) =>
        query.status ? invoice.status === query.status : true
      )
      .filter((invoice) => {
        if (!search) {
          return true
        }

        return (
          invoice.invoiceNumber.toLowerCase().includes(search) ||
          invoice.customerLabel.toLowerCase().includes(search)
        )
      })
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime()
      )
  },

  async findById(input: {
    readonly tenantId: string
    readonly invoiceId: string
    readonly database?: DatabaseClient
  }): Promise<FinanceInvoiceRecord | null> {
    if (input.database) {
      return findDbInvoiceById(
        input as {
          tenantId: string
          invoiceId: string
          database: DatabaseClient
        }
      )
    }

    return (
      getTenantInvoices(input.tenantId).find(
        (invoice) => invoice.id === input.invoiceId
      ) ?? null
    )
  },

  async insert(input: {
    readonly tenantId: string
    readonly payload: CreateInvoiceInput
    readonly database?: DatabaseClient
  }): Promise<FinanceInvoiceRecord> {
    if (input.database) {
      return insertDbInvoice({
        database: input.database,
        tenantId: input.tenantId,
        payload: input.payload,
      })
    }

    const record = createInvoiceRecordFromPayload({
      tenantId: input.tenantId,
      payload: input.payload,
      now: new Date(),
    })

    const current = getTenantInvoices(input.tenantId)
    invoicesByTenant.set(input.tenantId, [record, ...current])
    return record
  },

  async transitionStatus(input: {
    readonly tenantId: string
    readonly invoiceId: string
    readonly transition: FinanceInvoiceTransition
    readonly database?: DatabaseClient
  }): Promise<FinanceInvoiceRecord | null> {
    const current = input.database
      ? await findDbInvoiceById({
          database: input.database,
          tenantId: input.tenantId,
          invoiceId: input.invoiceId,
        })
      : (getTenantInvoices(input.tenantId).find(
          (invoice) => invoice.id === input.invoiceId
        ) ?? null)

    if (!current) {
      return null
    }

    const now = new Date()
    const nextStatus =
      input.transition === "open"
        ? "open"
        : input.transition === "paid"
          ? "paid"
          : "void"

    if (input.database) {
      return transitionDbInvoiceStatus({
        database: input.database,
        tenantId: input.tenantId,
        invoiceId: input.invoiceId,
        nextStatus,
        now,
      })
    }

    const nextRecord: FinanceInvoiceRecord = {
      ...current,
      status: nextStatus,
      paidAt: nextStatus === "paid" ? now : current.paidAt,
    }
    invoicesByTenant.set(
      input.tenantId,
      getTenantInvoices(input.tenantId).map((invoice) =>
        invoice.id === input.invoiceId ? nextRecord : invoice
      )
    )
    return nextRecord
  },
}

export function __resetFinanceInvoiceRepoForTests(): void {
  invoicesByTenant.clear()
  invoiceSequence = 1000
}
