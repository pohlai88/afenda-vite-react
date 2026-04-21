# 📋 WEEK 2 FINANCE - QUICK REFERENCE

## 🗓️ DAILY TASKS

| Day       | Focus           | Deliverables                 |
| --------- | --------------- | ---------------------------- |
| **Day 1** | Accrual API     | 6 endpoints implemented      |
| **Day 2** | Accrual UI      | 3 pages + components         |
| **Day 3** | Deduction API   | 5 endpoints + matching logic |
| **Day 4** | Deduction UI    | 3 pages + matcher            |
| **Day 5** | GL + Chequebook | 4 pages + 9 endpoints        |

---

## 🔌 API ENDPOINTS CHECKLIST

### Accruals (6)

```
[ ] GET    /api/finance/accruals
[ ] GET    /api/finance/accruals/:id
[ ] POST   /api/finance/accruals/calculate
[ ] PUT    /api/finance/accruals/:id
[ ] POST   /api/finance/accruals/:id/post
[ ] POST   /api/finance/accruals/:id/reverse
```

### Deductions (5)

```
[ ] GET    /api/finance/deductions
[ ] POST   /api/finance/deductions
[ ] GET    /api/finance/deductions/:id
[ ] POST   /api/finance/deductions/:id/match
[ ] POST   /api/finance/deductions/:id/dispute
```

### GL Journals (5)

```
[ ] GET    /api/finance/gl-journals
[ ] POST   /api/finance/gl-journals
[ ] GET    /api/finance/gl-journals/:id
[ ] POST   /api/finance/gl-journals/:id/post
[ ] POST   /api/finance/gl-journals/:id/reverse
```

### Chequebook (4)

```
[ ] GET    /api/finance/chequebook
[ ] POST   /api/finance/chequebook
[ ] POST   /api/finance/chequebook/:id/clear
[ ] POST   /api/finance/chequebook/:id/void
```

---

## 📄 PAGES CHECKLIST

### Accruals (3)

```
[ ] /finance/accruals          - List page
[ ] /finance/accruals/:id      - Detail page
[ ] /finance/accruals/calculate - Calculator page
```

### Deductions (3)

```
[ ] /finance/deductions        - List page
[ ] /finance/deductions/:id    - Detail page
[ ] /finance/deductions/matching - Matcher page
```

### GL Journals (2)

```
[ ] /finance/gl-journals       - List page
[ ] /finance/gl-journals/:id   - Detail/Entry page
```

### Chequebook (2)

```
[ ] /finance/chequebook        - List page
[ ] /finance/chequebook/new    - Issue cheque page
```

---

## 🧩 COMPONENTS CHECKLIST

### Accruals

```
[ ] AccrualCard.tsx
[ ] AccrualForm.tsx
[ ] AccrualCalculator.tsx
[ ] AccrualStatusBadge.tsx
```

### Deductions

```
[ ] DeductionCard.tsx
[ ] DeductionForm.tsx
[ ] DeductionMatcher.tsx
[ ] MatchingSuggestionCard.tsx
```

### GL Journals

```
[ ] GLJournalEntry.tsx
[ ] GLJournalForm.tsx
[ ] AccountSummaryCard.tsx
```

### Chequebook

```
[ ] ChequeCard.tsx
[ ] ChequeForm.tsx
[ ] ChequeStatusBadge.tsx
```

### Shared

```
[ ] FinanceStats.tsx
[ ] FinanceDashboard.tsx
```

---

## 🪝 HOOKS CHECKLIST

```
[ ] useAccruals.ts
    - useAccruals(params)
    - useAccrual(id)
    - useCalculateAccruals()
    - usePostAccrual()
    - useReverseAccrual()

[ ] useDeductions.ts
    - useDeductions(params)
    - useDeduction(id)
    - useCreateDeduction()
    - useMatchDeduction()
    - useDisputeDeduction()
    - useMatchingSuggestions(id)

[ ] useGLJournals.ts
    - useGLJournals(params)
    - useGLJournal(id)
    - useCreateGLJournal()
    - usePostGLJournal()

[ ] useChequebook.ts
    - useCheques(params)
    - useCheque(id)
    - useIssueCheque()
    - useClearCheque()
    - useVoidCheque()
```

---

## 📊 GL ACCOUNT CODES

| Code | Name                | Type      |
| ---- | ------------------- | --------- |
| 1000 | Cash                | Asset     |
| 1100 | Accounts Receivable | Asset     |
| 2000 | Accounts Payable    | Liability |
| 2100 | Accrued Liabilities | Liability |
| 6100 | Promotion Expense   | Expense   |
| 6200 | Trade Spend         | Expense   |
| 6300 | Rebate Expense      | Expense   |

---

## 🔄 WORKFLOWS

### Accrual Posting

```
1. Calculate accruals for period
2. Review calculated amounts
3. Select accruals to post
4. Choose GL accounts
5. Post to GL
6. Verify journal entries
```

### Deduction Matching

```
1. Record deduction from customer
2. View matching suggestions
3. Select matching claim
4. Confirm match
5. Claim status → PAID
6. Deduction status → MATCHED
```

### Cheque Issuance

```
1. Select payee (customer)
2. Enter amount
3. Link to claim (optional)
4. Issue cheque
5. Track until cleared
```

---

## 🧪 TEST SCENARIOS

### Accruals

```
1. Calculate accruals for 2026-01
2. Post accrual to GL (6100 Dr, 2100 Cr)
3. Reverse a posted accrual
4. Verify GL balances
```

### Deductions

```
1. Create deduction for customer
2. Check matching suggestions
3. Match with approved claim
4. Verify claim status = PAID
```

### Chequebook

```
1. Issue cheque for claim payment
2. Clear cheque
3. Void cheque with reason
```

---

## 📁 FILE STRUCTURE

```
apps/web/src/
├── pages/finance/
│   ├── index.tsx
│   ├── accruals/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── calculate.tsx
│   ├── deductions/
│   │   ├── index.tsx
│   │   ├── [id].tsx
│   │   └── matching.tsx
│   ├── gl-journals/
│   │   ├── index.tsx
│   │   └── [id].tsx
│   └── chequebook/
│       ├── index.tsx
│       └── new.tsx
├── components/finance/
│   └── [components]
├── hooks/finance/
│   └── [hooks]
└── types/
    └── finance.ts

apps/api/api/finance/
├── accruals.ts
├── deductions.ts
├── gl-journals.ts
└── chequebook.ts
```

---

## 🚀 COMMANDS

```bash
# Start dev
npm run dev

# Generate Prisma client after schema changes
cd apps/api && npx prisma generate

# Open Prisma Studio
cd apps/api && npx prisma studio

# Run tests
npm run test

# Commit progress
git add .
git commit -m "feat(finance): Day X - [description]"
```

---

## ✅ END OF WEEK 2 GOALS

- [ ] All 20 API endpoints working
- [ ] All 10 pages implemented
- [ ] All hooks with React Query
- [ ] Accrual → GL posting works
- [ ] Deduction → Claim matching works
- [ ] Chequebook CRUD works
- [ ] Tests passing
- [ ] Code committed
