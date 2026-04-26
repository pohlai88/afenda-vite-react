import {
  FINANCE_ERROR_CODES,
  FinanceCoreError,
  type CreateFinanceJournalInput,
  type FinanceJournalEntry,
  type TrialBalanceRow,
} from "./finance-core.contract"

export function validateJournalBalance(
  lines: readonly { debitAmount: number; creditAmount: number }[]
): {
  readonly isValid: boolean
  readonly totalDebit: number
  readonly totalCredit: number
  readonly difference: number
} {
  let totalDebit = 0
  let totalCredit = 0

  for (const line of lines) {
    totalDebit += line.debitAmount
    totalCredit += line.creditAmount
  }

  const difference = Math.abs(totalDebit - totalCredit)
  return {
    isValid: difference < 0.01,
    totalDebit,
    totalCredit,
    difference,
  }
}

export function validateJournalInput(input: CreateFinanceJournalInput): void {
  if (!input.entryDate) {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.validationError,
      "Entry date is required."
    )
  }

  if (!input.description.trim()) {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.validationError,
      "Description is required."
    )
  }

  if (!input.lines.length) {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.validationError,
      "At least one journal line is required."
    )
  }

  if (input.lines.length < 2) {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.validationError,
      "Journal entries require at least two lines."
    )
  }

  for (const [index, line] of input.lines.entries()) {
    if (!line.accountId.trim()) {
      throw new FinanceCoreError(
        FINANCE_ERROR_CODES.validationError,
        `Line ${index + 1}: accountId is required.`
      )
    }
    if (line.debitAmount < 0 || line.creditAmount < 0) {
      throw new FinanceCoreError(
        FINANCE_ERROR_CODES.validationError,
        `Line ${index + 1}: amounts cannot be negative.`
      )
    }
    if (line.debitAmount === 0 && line.creditAmount === 0) {
      throw new FinanceCoreError(
        FINANCE_ERROR_CODES.validationError,
        `Line ${index + 1}: debit or credit must be greater than zero.`
      )
    }
    if (line.debitAmount > 0 && line.creditAmount > 0) {
      throw new FinanceCoreError(
        FINANCE_ERROR_CODES.validationError,
        `Line ${index + 1}: a line cannot have both debit and credit.`
      )
    }
  }

  const totals = validateJournalBalance(input.lines)
  if (!totals.isValid) {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.journalNotBalanced,
      `Journal not balanced: debit ${totals.totalDebit.toFixed(2)} does not equal credit ${totals.totalCredit.toFixed(2)}.`
    )
  }
}

export function generateJournalNumber(
  date: Date,
  lastNumber: number,
  prefix = "JE"
): string {
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0")
  const sequence = `${lastNumber + 1}`.padStart(5, "0")
  return `${prefix}-${year}${month}-${sequence}`
}

export function parseJournalNumber(entryNumber: string): {
  readonly prefix: string
  readonly year: number
  readonly month: number
  readonly sequence: number
} | null {
  const match = entryNumber.match(/^([A-Z]+)-(\d{4})(\d{2})-(\d+)$/)
  if (!match) {
    return null
  }

  return {
    prefix: match[1],
    year: Number.parseInt(match[2], 10),
    month: Number.parseInt(match[3], 10),
    sequence: Number.parseInt(match[4], 10),
  }
}

export function calculateAccountBalance(
  lines: readonly { debitAmount: number; creditAmount: number }[],
  normalBalance: "DEBIT" | "CREDIT"
): number {
  let totalDebit = 0
  let totalCredit = 0

  for (const line of lines) {
    totalDebit += line.debitAmount
    totalCredit += line.creditAmount
  }

  return normalBalance === "DEBIT"
    ? totalDebit - totalCredit
    : totalCredit - totalDebit
}

export function getNormalBalance(accountType: string): "DEBIT" | "CREDIT" {
  const debitAccounts = [
    "ASSET",
    "EXPENSE",
    "CONTRA_LIABILITY",
    "CONTRA_EQUITY",
    "CONTRA_REVENUE",
  ]
  return debitAccounts.includes(accountType) ? "DEBIT" : "CREDIT"
}

export function calculateTrialBalanceTotals(
  rows: readonly Pick<TrialBalanceRow, "debit" | "credit">[]
): {
  readonly totalDebit: number
  readonly totalCredit: number
  readonly isBalanced: boolean
} {
  let totalDebit = 0
  let totalCredit = 0

  for (const row of rows) {
    totalDebit += row.debit
    totalCredit += row.credit
  }

  return {
    totalDebit,
    totalCredit,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
  }
}

export function createReversalLines<
  T extends { debitAmount: number; creditAmount: number },
>(
  originalLines: readonly T[]
): Array<
  Omit<T, "debitAmount" | "creditAmount"> & {
    debitAmount: number
    creditAmount: number
  }
> {
  return originalLines.map((line) => ({
    ...line,
    debitAmount: line.creditAmount,
    creditAmount: line.debitAmount,
  }))
}

export function validateCanPost(
  journal: Pick<FinanceJournalEntry, "status" | "totalDebit" | "totalCredit">
): void {
  if (journal.status === "POSTED") {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.journalAlreadyPosted,
      "Journal entry is already posted."
    )
  }

  if (journal.status === "VOID") {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.journalAlreadyVoid,
      "Cannot post a voided journal entry."
    )
  }

  const balanced = validateJournalBalance([
    {
      debitAmount: journal.totalDebit,
      creditAmount: journal.totalCredit,
    },
  ])

  if (!balanced.isValid) {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.journalNotBalanced,
      "Journal entry is not balanced."
    )
  }
}

export function validateCanVoid(
  journal: Pick<FinanceJournalEntry, "status">
): void {
  if (journal.status === "VOID") {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.journalAlreadyVoid,
      "Journal entry is already voided."
    )
  }
}

export function validateCanReverse(
  journal: Pick<FinanceJournalEntry, "status" | "reversedBy">
): void {
  if (journal.status !== "POSTED") {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.invalidStatus,
      "Only posted journal entries can be reversed."
    )
  }
  if (journal.reversedBy) {
    throw new FinanceCoreError(
      FINANCE_ERROR_CODES.journalAlreadyReversed,
      "Journal entry has already been reversed."
    )
  }
}

export function formatAmountVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatAmountUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatAmount(amount: number, currency = "VND"): string {
  if (currency === "VND") {
    return formatAmountVND(amount)
  }
  if (currency === "USD") {
    return formatAmountUSD(amount)
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getFiscalPeriod(
  date: Date,
  fiscalYearStartMonth = 1
): {
  readonly year: number
  readonly month: number
  readonly period: number
} {
  const month = date.getUTCMonth() + 1
  const calendarYear = date.getUTCFullYear()
  let fiscalYear = calendarYear
  let period = month - fiscalYearStartMonth + 1

  if (period <= 0) {
    period += 12
    fiscalYear -= 1
  }

  return { year: fiscalYear, month, period }
}

export function getPeriodDateRange(
  year: number,
  month: number
): {
  readonly startDate: Date
  readonly endDate: Date
} {
  const startDate = new Date(Date.UTC(year, month - 1, 1))
  const endDate = new Date(Date.UTC(year, month, 0))
  return { startDate, endDate }
}

export function validateAccountNumber(accountNumber: string): boolean {
  return /^\d{4}(-\d{2,3})*$/.test(accountNumber)
}

export function getAccountLevel(accountNumber: string): number {
  return accountNumber.split("-").length
}

export function getParentAccountNumber(accountNumber: string): string | null {
  const parts = accountNumber.split("-")
  return parts.length <= 1 ? null : parts.slice(0, -1).join("-")
}

export const VN_ACCOUNT_CATEGORIES = {
  "1": { name: "Tai san", nameEn: "Assets", type: "ASSET" },
  "2": { name: "No phai tra", nameEn: "Liabilities", type: "LIABILITY" },
  "3": { name: "Von chu so huu", nameEn: "Equity", type: "EQUITY" },
  "4": { name: "Doanh thu", nameEn: "Revenue", type: "REVENUE" },
  "5": { name: "Chi phi", nameEn: "Expenses", type: "EXPENSE" },
  "6": {
    name: "Chi phi san xuat",
    nameEn: "Production Costs",
    type: "EXPENSE",
  },
  "7": { name: "Thu nhap khac", nameEn: "Other Income", type: "REVENUE" },
  "8": { name: "Chi phi khac", nameEn: "Other Expenses", type: "EXPENSE" },
  "9": { name: "Ket qua kinh doanh", nameEn: "P&L Summary", type: "EQUITY" },
} as const
