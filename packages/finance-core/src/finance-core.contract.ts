export type AccountType =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "REVENUE"
  | "EXPENSE"
  | "CONTRA_ASSET"
  | "CONTRA_LIABILITY"
  | "CONTRA_EQUITY"
  | "CONTRA_REVENUE"
  | "CONTRA_EXPENSE"

export type NormalBalance = "DEBIT" | "CREDIT"

export type JournalStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "POSTED"
  | "VOID"
  | "REVERSED"

export type JournalType =
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

export type TransactionSource =
  | "MANUAL"
  | "SYSTEM"
  | "IMPORT"
  | "API"
  | "INTEGRATION"

export type Currency = "VND" | "USD" | "EUR" | "GBP" | "SGD" | "JPY" | "CNY"

export type FinanceAccount = {
  readonly id: string
  readonly accountNumber: string
  readonly name: string
  readonly nameVi?: string
  readonly accountType: AccountType
  readonly normalBalance: NormalBalance
  readonly parentId?: string
  readonly level: number
  readonly isActive: boolean
  readonly isControl: boolean
  readonly isBankAccount: boolean
  readonly currency: Currency
  readonly description?: string
  readonly tenantId?: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly createdBy?: string
}

export type FinanceJournalLine = {
  readonly id: string
  readonly journalEntryId: string
  readonly lineNumber: number
  readonly accountId: string
  readonly accountNumber?: string
  readonly accountName?: string
  readonly debitAmount: number
  readonly creditAmount: number
  readonly description?: string
  readonly departmentId?: string
  readonly projectId?: string
  readonly costCenterId?: string
  readonly customerId?: string
  readonly supplierId?: string
  readonly employeeId?: string
  readonly productId?: string
  readonly currency?: Currency
  readonly exchangeRate?: number
  readonly baseCurrencyDebit?: number
  readonly baseCurrencyCredit?: number
  readonly taxCode?: string
  readonly taxAmount?: number
}

export type FinanceJournalEntry = {
  readonly id: string
  readonly entryNumber: string
  readonly entryDate: Date
  readonly postingDate?: Date
  readonly journalType: JournalType
  readonly status: JournalStatus
  readonly description: string
  readonly reference?: string
  readonly memo?: string
  readonly totalDebit: number
  readonly totalCredit: number
  readonly source: TransactionSource
  readonly sourceModule?: string
  readonly sourceId?: string
  readonly reversalOf?: string
  readonly reversedBy?: string
  readonly approvedBy?: string
  readonly approvedAt?: Date
  readonly postedBy?: string
  readonly postedAt?: Date
  readonly tenantId?: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly createdBy: string
  readonly lines: readonly FinanceJournalLine[]
}

export type CreateFinanceJournalInput = {
  readonly entryDate: Date
  readonly journalType?: JournalType
  readonly description: string
  readonly reference?: string
  readonly memo?: string
  readonly lines: readonly CreateFinanceJournalLineInput[]
  readonly sourceModule?: string
  readonly sourceId?: string
  readonly autoPost?: boolean
}

export type CreateFinanceJournalLineInput = {
  readonly accountId: string
  readonly debitAmount: number
  readonly creditAmount: number
  readonly description?: string
  readonly departmentId?: string
  readonly projectId?: string
  readonly costCenterId?: string
  readonly customerId?: string
  readonly supplierId?: string
  readonly employeeId?: string
  readonly productId?: string
  readonly currency?: Currency
  readonly exchangeRate?: number
}

export type AccountBalance = {
  readonly accountId: string
  readonly accountNumber: string
  readonly accountName: string
  readonly accountType: AccountType
  readonly normalBalance: NormalBalance
  readonly totalDebit: number
  readonly totalCredit: number
  readonly balance: number
  readonly openingBalance?: number
  readonly periodDebit?: number
  readonly periodCredit?: number
  readonly closingBalance?: number
}

export type TrialBalanceRow = {
  readonly accountNumber: string
  readonly accountName: string
  readonly accountType: AccountType
  readonly debit: number
  readonly credit: number
  readonly balance: number
}

export type TrialBalance = {
  readonly asOfDate: Date
  readonly rows: readonly TrialBalanceRow[]
  readonly totalDebit: number
  readonly totalCredit: number
  readonly isBalanced: boolean
}

export type FinancialPeriod = {
  readonly id: string
  readonly year: number
  readonly month: number
  readonly name: string
  readonly startDate: Date
  readonly endDate: Date
  readonly isClosed: boolean
  readonly closedAt?: Date
  readonly closedBy?: string
}

export type VietnamTaxConfig = {
  readonly pitBrackets: readonly {
    readonly minIncome: number
    readonly maxIncome: number
    readonly rate: number
  }[]
  readonly bhxhEmployeeRate: number
  readonly bhxhEmployerRate: number
  readonly bhytEmployeeRate: number
  readonly bhytEmployerRate: number
  readonly bhtnEmployeeRate: number
  readonly bhtnEmployerRate: number
  readonly personalDeduction: number
  readonly dependentDeduction: number
  readonly insuranceCeiling: number
  readonly vatStandardRate: number
  readonly vatReducedRate: number
  readonly vatZeroRate: number
}

export const DEFAULT_VIETNAM_TAX_CONFIG: VietnamTaxConfig = {
  pitBrackets: [
    { minIncome: 0, maxIncome: 5_000_000, rate: 0.05 },
    { minIncome: 5_000_000, maxIncome: 10_000_000, rate: 0.1 },
    { minIncome: 10_000_000, maxIncome: 18_000_000, rate: 0.15 },
    { minIncome: 18_000_000, maxIncome: 32_000_000, rate: 0.2 },
    { minIncome: 32_000_000, maxIncome: 52_000_000, rate: 0.25 },
    { minIncome: 52_000_000, maxIncome: 80_000_000, rate: 0.3 },
    { minIncome: 80_000_000, maxIncome: Number.POSITIVE_INFINITY, rate: 0.35 },
  ],
  bhxhEmployeeRate: 0.08,
  bhxhEmployerRate: 0.175,
  bhytEmployeeRate: 0.015,
  bhytEmployerRate: 0.03,
  bhtnEmployeeRate: 0.01,
  bhtnEmployerRate: 0.01,
  personalDeduction: 11_000_000,
  dependentDeduction: 4_400_000,
  insuranceCeiling: 36_000_000,
  vatStandardRate: 0.1,
  vatReducedRate: 0.05,
  vatZeroRate: 0,
}

export class FinanceCoreError extends Error {
  readonly code: string
  readonly details?: Readonly<Record<string, unknown>>

  constructor(
    code: string,
    message: string,
    details?: Readonly<Record<string, unknown>>
  ) {
    super(message)
    this.name = "FinanceCoreError"
    this.code = code
    this.details = details
  }
}

export const FINANCE_ERROR_CODES = {
  journalNotBalanced: "JOURNAL_NOT_BALANCED",
  journalNotFound: "JOURNAL_NOT_FOUND",
  journalAlreadyPosted: "JOURNAL_ALREADY_POSTED",
  journalAlreadyVoid: "JOURNAL_ALREADY_VOID",
  journalAlreadyReversed: "JOURNAL_ALREADY_REVERSED",
  accountNotFound: "ACCOUNT_NOT_FOUND",
  accountInactive: "ACCOUNT_INACTIVE",
  periodClosed: "PERIOD_CLOSED",
  insufficientPermissions: "INSUFFICIENT_PERMISSIONS",
  validationError: "VALIDATION_ERROR",
  invalidStatus: "INVALID_STATUS",
} as const
