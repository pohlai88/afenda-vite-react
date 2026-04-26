---
owner: api-ops-auth
truthStatus: canonical
docClass: canonical-doc
relatedDomain: access-control
---

# SEA market and localization topology

This document defines how Afenda should package Southeast Asia market support across:

- Vietnam
- Malaysia
- Indonesia
- Singapore
- Thailand
- Philippines

It also defines the language topology for:

- English
- Chinese
- Vietnamese
- Malay
- Indonesian
- Thai
- Filipino

The goal is to prevent two mistakes:

1. mixing language localization with market compliance
2. creating one country mega-package such as `packages/vietnam` or `packages/sea`

## Core rule

Afenda must separate:

- **language localization**
- **country reference data**
- **jurisdiction compliance**
- **domain business behavior**

These are related, but they are not the same thing.

## Canonical split

### 1. Language localization

Language localization belongs to the web i18n platform:

- `apps/web/src/app/_platform/i18n/**`

This layer owns:

- translation resources
- locale selection
- namespace policy
- glossary governance
- `Intl` display formatting
- language fallback behavior

This layer does **not** own:

- tax rules
- e-invoice regulation
- payroll law
- banking protocols
- market-specific business validation

### 2. Country reference data

Country reference data should be shared only when it is stable and reused across app and API surfaces.

Examples:

- country codes
- currencies
- bank directory metadata
- address subdivision metadata
- supported language-by-market maps

Preferred shared home:

- `packages/contracts/src/reference/**`

This layer must remain reference-only, not business-rule heavy.

### 3. Jurisdiction compliance

Jurisdiction rules belong to the owning domain in the API, not in a country package.

Examples:

- VAT/GST/SST/PPN rules
- e-invoice provider and clearance rules
- payroll deductions
- statutory insurance contributions
- withholding tax/report templates

These should live under domain-owned API modules such as:

- `apps/api/src/modules/finance/**`
- `apps/api/src/modules/hr/**`
- `apps/api/src/modules/payments/**`

### 4. Domain behavior

Business behavior should remain domain-first.

Examples:

- invoice approval
- customer management
- payment allocation
- payroll posting
- tax report generation

Country overlays may modify the domain behavior, but they must not replace the domain ownership model.

## Language topology

### Canonical runtime languages

Afenda should treat these as the target SEA language set:

- `en` — English
- `zh-Hans` — Simplified Chinese
- `vi` — Vietnamese
- `ms` — Malay
- `id` — Indonesian
- `th` — Thai
- `fil` — Filipino

### Why `zh-Hans` instead of plain `zh`

Chinese should not remain ambiguous.

Use:

- `zh-Hans` for Simplified Chinese first

Only add:

- `zh-Hant`

if the product later requires separate traditional-script support.

### Current live state

The current live web runtime ships:

- `en`
- `ms`
- `id`
- `vi`

Future locale expansion should be additive and metadata-driven, not introduced by ad hoc file scattering.

## Market-to-language guidance

This is the practical default matrix:

| Market      | Primary UI languages   | Notes                                                                                             |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| Vietnam     | `vi`, `en`, `zh-Hans`  | Vietnamese primary; English common for admin/regional users; Chinese optional by customer segment |
| Malaysia    | `ms`, `en`, `zh-Hans`  | Malay and English are core; Chinese support is commercially useful                                |
| Indonesia   | `id`, `en`, `zh-Hans`  | Indonesian primary; English common for regional operators                                         |
| Singapore   | `en`, `zh-Hans`, `ms`  | English-first market; Chinese and Malay may be needed for selected deployments                    |
| Thailand    | `th`, `en`, `zh-Hans`  | Thai primary; English common for cross-border ops                                                 |
| Philippines | `fil`, `en`, `zh-Hans` | English is strong; Filipino support may still be important for HR and frontline operations        |

This matrix drives:

- locale prioritization
- QA coverage
- rollout planning

It does **not** mean every tenant must enable every language.

## Canonical packaging topology

The intended topology is:

```text
apps/web/src/app/_platform/i18n/
  locales/
    en/
    zh-Hans/
    vi/
    ms/
    id/
    th/
    fil/
  glossary/
  policy/
  services/
  audit/

packages/contracts/src/reference/
  country.contract.ts
  country-language.contract.ts
  currency.contract.ts
  bank-directory.contract.ts
  address-reference.contract.ts

apps/api/src/modules/finance/
  tax-vn/
  tax-my/
  tax-id/
  tax-sg/
  tax-th/
  tax-ph/
  einvoice-vn/
  einvoice-my/
  einvoice-id/
  einvoice-sg/
  einvoice-th/
  einvoice-ph/

apps/api/src/modules/hr/
  payroll-vn/
  payroll-my/
  payroll-id/
  payroll-sg/
  payroll-th/
  payroll-ph/

apps/api/src/modules/payments/
  banking-vn/
  banking-my/
  banking-id/
  banking-sg/
  banking-th/
  banking-ph/
```

## Country packaging rule

Do **not** package by country at the workspace root.

Bad:

```text
packages/vietnam
packages/malaysia
packages/indonesia
packages/sea
```

Good:

```text
apps/api/src/modules/finance/tax-vn/
apps/api/src/modules/finance/tax-my/
apps/api/src/modules/payments/banking-vn/
apps/api/src/modules/hr/payroll-th/
```

This keeps ownership with the domain that actually changes.

## Country code convention

Use ISO-style short market suffixes in domain overlays:

- `vn`
- `my`
- `id`
- `sg`
- `th`
- `ph`

Examples:

- `tax-vn`
- `einvoice-my`
- `payroll-id`
- `banking-sg`

This is clearer than burying country identity in a generic file name.

## What belongs where

### Belongs in web i18n

- translated labels
- button copy
- validation messages
- user-facing headings
- locale-aware display formatting
- language picker metadata

### Belongs in shared reference contracts

- country metadata
- language availability by market
- currency definitions
- bank lists
- holiday/reference calendars if purely descriptive

### Belongs in API finance overlays

- VAT/GST/SST/PPN rules
- tax return mappings
- e-invoice structure and provider rules
- accounting compliance rules

### Belongs in API HR/payroll overlays

- statutory contributions
- leave benefit formulas
- payroll withholding
- insurance and pension calculations

### Belongs in API payments overlays

- bank transfer rules
- QR payment standards
- account-number and routing validation
- market-specific payment rails

## Practical country notes

### Vietnam

Keep:

- VAT/PIT/CIT
- e-invoice
- BHXH/BHYT/BHTN
- VietQR/bank directory

Split across finance, HR, and payments.

### Malaysia

Expect:

- SST/GST-era handling depending requirement scope
- payroll statutory deductions
- bank and payment reference data
- e-invoice rollout rules

### Indonesia

Expect:

- PPN and local tax/report mapping
- payroll statutory overlays
- local bank/payment conventions
- e-faktur style compliance surface if adopted

### Singapore

Expect:

- GST handling
- payroll and CPF-style statutory overlays
- English-first UI defaults
- strong need for clean audit/compliance evidence

### Thailand

Expect:

- VAT and statutory payroll overlays
- Thai-language UI requirement in some deployments
- payment and bank reference handling

### Philippines

Expect:

- VAT/payroll withholding overlays
- English + Filipino UX posture
- local banking/payment metadata

## Rollout sequence

Use this order:

1. Expand language topology in web i18n.
2. Add shared reference contracts only for stable cross-domain data.
3. Introduce jurisdiction overlays by domain, starting with finance.
4. Add payroll/statutory overlays next.
5. Add banking and payment overlays after finance/payroll boundaries are stable.

Do not start by creating one country package.

## Recommended immediate target

For the current repo, the practical next target is:

1. keep `apps/web/src/app/_platform/i18n/**` as the only language-runtime owner
2. define the target locale set as `en`, `zh-Hans`, `vi`, `ms`, `id`, `th`, `fil`
3. add country/language reference contracts only when shared runtime need appears
4. implement market compliance in future API domain overlays, not workspace country packages

## Anti-patterns

Do not do these:

- treat tax logic as localization
- mix e-invoice, payroll, banks, and translations in one package
- create `packages/vietnam` and then repeat it for every country
- use ambiguous `zh` when script matters
- place business validation in the web i18n layer
- duplicate market logic in both API and web

## Related docs

- [Internationalization (i18n)](./dependencies/i18n.md)
- [Authentication](./AUTHENTICATION.md)
- [API reference](./API.md)
- [Project structure](./PROJECT_STRUCTURE.md)
- [Monorepo boundaries](./MONOREPO_BOUNDARIES.md)
- [Security control-plane topology](./SECURITY_CONTROL_PLANE_TOPOLOGY.md)
