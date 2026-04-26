# Migration Notes: Legacy `tpm-shared/finance-core` -> `@afenda/finance-core`

## Preserved

- journal/account/contracts
- general-ledger validation helpers
- reversal and numbering logic
- Vietnam payroll, PIT, VAT, and insurance calculations

## Deliberate Changes

- split from the misleading `tpm-shared` package
- dropped Promo Master / TPM DTOs and generic API response helpers
- normalized naming to Afenda package conventions
- kept the package database-agnostic and runtime-safe

## Why

The legacy package mixed TPM-specific shared types with reusable finance logic. Afenda keeps only the finance core as a clean standalone package boundary.
