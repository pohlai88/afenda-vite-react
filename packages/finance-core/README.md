# `@afenda/finance-core`

Database-agnostic accounting and Vietnam tax primitives for Afenda finance workloads.

## Owns

- finance/accounting contracts for journals, lines, accounts, and periods
- general ledger validation and helper logic
- journal numbering and reversal utilities
- trial balance and account-balance math
- Vietnam tax, payroll, insurance, and VAT calculations

## Does Not Own

- database persistence
- API routes
- TPM-specific DTOs
- payment processing
- billing plan logic

This package is the reusable extraction from the legacy `tpm-shared/src/finance-core` subtree. The Promo Master shared DTOs were intentionally not carried over.
