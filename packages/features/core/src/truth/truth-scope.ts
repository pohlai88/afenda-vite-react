/**
 * TruthScope defines the deterministic context for all ERP operations.
 * Allocation, settlement, and valuation all depend on scope being correct.
 * If scope is wrong, truth is wrong.
 */
export interface TruthScope {
  /** Current tenant (organization) ID */
  readonly tenantId: string
  /** Legal entity for statutory reporting (tax ID, fiscal books) */
  readonly legalEntityId: string
  /** Accounting period for closing and posting restrictions */
  readonly accountingPeriodId: string
  /** Reporting currency for valuation and consolidation */
  readonly reportingCurrency: string
}
