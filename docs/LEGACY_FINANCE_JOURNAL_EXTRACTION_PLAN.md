---
owner: finance-platform
truthStatus: canonical
docClass: canonical-doc
relatedDomain: legacy-adoption
---

# Legacy Finance Journal Extraction Plan

This document prepares the next extraction slice after `legacy MRP products -> mdm.items`.

The next slice is:

`legacy finance journals -> Afenda finance journal owner`

## Why journals next

- journals are the narrowest high-value finance write boundary
- the legacy sources are already visible and stable enough to map
- `packages/finance-core` already contains journal contracts and balancing logic
- invoices, allocations, and settlements depend on a trustworthy journal spine

## Source inventory

Primary legacy sources:

- `.legacy/cna-templates/apps/Accounting/src/lib/gl-engine/index.ts`
- `.legacy/cna-templates/apps/MRP/src/app/api/finance/gl/journals/route.ts`
- `.legacy/cna-templates/apps/MRP/src/lib/finance/gl-engine.ts`
- `.legacy/cna-templates/apps/TPM-api/finance/accruals/**`

Current live reusable Afenda source:

- `packages/finance-core/src/finance-core.contract.ts`
- `packages/finance-core/src/gl-core.ts`

## Extraction rule

- legacy APIs are transport truth only
- `packages/finance-core` is finance domain primitive truth
- `apps/api/src/modules/finance/journals/**` becomes the canonical write boundary
- `apps/api/src/modules/legacy-erp/**` remains the anti-corruption connector only

## Target topology

```text
apps/api/src/modules/finance/
  README.md
  finance.routes.ts

  journals/
    finance-journal.contract.ts
    finance-journal.schema.ts
    finance-journal.repo.ts
    finance-journal.service.ts
    finance-journal.routes.ts
    finance-journal-posting.policy.ts
```

Legacy connector expansion:

```text
apps/api/src/modules/legacy-erp/
  legacy-erp.schema.ts
  legacy-erp.contract.ts
  legacy-erp.service.ts
  legacy-erp-source.service.ts
  legacy-erp.routes.ts
```

New pull seam:

```text
POST /api/v1/legacy-erp/pull/journals
```

## Canonical mapping

Legacy journal payloads should normalize into Afenda finance input built from `CreateFinanceJournalInput`.

### Header mapping

- `entryDate` -> `entryDate`
- legacy `journalType` -> Afenda `journalType`
- `description` -> `description`
- legacy `reference` or `sourceRef` -> `reference`
- legacy source system -> `sourceModule`
- legacy source id -> `sourceId`
- legacy auto-post flag -> `autoPost`

### Line mapping

- `accountId` -> `accountId`
- `debitAmount` -> `debitAmount`
- `creditAmount` -> `creditAmount`
- `description` -> `description`
- `departmentId` -> `departmentId`
- `projectId` -> `projectId`
- `costCenterId` -> `costCenterId`
- `customerId` -> `customerId`
- `supplierId` -> `supplierId`
- `employeeId` -> `employeeId`
- `productId` -> `productId`
- `currency` -> `currency`
- `exchangeRate` -> `exchangeRate`

### Non-negotiable invariants

- at least 2 lines
- each line must have debit xor credit
- total debit must equal total credit
- journal status stays owner-controlled in Afenda
- posting, void, and reversal happen through finance owner logic only

## Proposed source profiles

The next connector should support these explicit profiles:

- `legacy-accounting-journals`
- `legacy-mrp-gl-journals`

`legacy-tpm-accruals` should stay deferred until the journal owner exists, then map accrual postings into the same finance boundary.

## Delivery order

### Step 1. Canonical finance owner

Build `apps/api/src/modules/finance/journals/**` first.

Minimum live surface:

- `GET /api/v1/finance/journals`
- `GET /api/v1/finance/journals/:journalId`
- `POST /api/v1/finance/journals`

Optional in the same slice if cheap:

- `POST /api/v1/finance/journals/:journalId/post`
- `POST /api/v1/finance/journals/:journalId/reverse`

### Step 2. Transform support

Extend `legacy-erp/transform` so:

- `journal-entry` -> `finance.journal-entry`

### Step 3. Ingest support

Extend `legacy-erp/ingest` so:

- balanced journal entries persist through `/api/v1/finance/journals`
- invalid entries stay explicit `candidate-only`

### Step 4. Pull support

Add:

- `POST /api/v1/legacy-erp/pull/journals`

That route should:

- fetch paginated legacy journals
- normalize into Afenda journal input
- persist through the finance owner
- return `persisted` vs `candidate-only`

## Acceptance gate

The journal extraction slice is ready to cut when all are true:

- finance journal owner routes are live in `apps/api`
- legacy connector profiles are explicit and versioned
- balanced journal imports persist successfully
- unbalanced imports fail visibly without partial posting
- route inventory generation stays green
- `packages/finance-core` is reused instead of duplicating balancing logic
- tests cover create, pull, ingest, and invalid-balance rejection

## Deliberate exclusions

Not part of this slice:

- invoices
- allocations
- settlements
- tax reports
- MISA export
- accrual batch posting

Those depend on the journal owner and should follow after it.

## Immediate implementation checklist

1. Create `apps/api/src/modules/finance/journals/**`
2. Reuse `packages/finance-core` balancing and numbering logic where viable
3. Add `finance:*` route permissions
4. Extend `legacy-erp` schemas with journal pull request/source profiles
5. Add focused tests for balanced and unbalanced imports
6. Mount `/api/v1/finance/*`
