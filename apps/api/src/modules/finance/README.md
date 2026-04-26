# Finance Module

Canonical finance API ownership boundary.

Live first slice:

- `invoices`
- `allocations`
- `settlements`

Live route family:

- `/api/v1/finance/invoices`
- `/api/v1/finance/allocations`
- `/api/v1/finance/settlements`

Current ownership rule:

- finance writes must not flow through `operations`
- legacy finance imports must pass through `legacy-erp` anti-corruption seams first
- posting, settlement, allocation, and reversal remain finance-owned behaviors

Current posture:

- invoice, allocation, and settlement transport live here
- `@afenda/billing` supplies the invoice domain contract shape
- invoices now promote to the finance persistence boundary when a DB client is available
- allocations and settlements remain in-memory until their own persistence slice lands
