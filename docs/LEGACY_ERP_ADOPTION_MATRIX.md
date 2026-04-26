---
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: legacy-adoption
---

# Legacy ERP Adoption Matrix

This document defines how Afenda should adopt capability from `.legacy/cna-templates/**`.

The legacy tree is **reference input**, not import authority.

Afenda must not copy legacy topology blindly.
Afenda must extract the mature capability, re-home it under current ownership boundaries, and upgrade it to a stronger governed architecture.

## Core rule

Use this decision model for every legacy surface:

- `Borrow now`
  extract the proven concept or algorithm immediately into the live repo
- `Rebuild in Afenda style`
  keep the capability, but reimplement it under live ownership, naming, and governance
- `Reject permanently`
  do not port the topology or runtime model because it conflicts with Afenda doctrine

## Upgrade posture

Afenda should become stronger than legacy in these ways:

- one governed monorepo instead of many app-local stacks
- ownership-first topology instead of mixed app-local buckets
- database truth + API domain boundary + shell metadata instead of app-local direct CRUD spread
- typed command and truth/audit spine instead of ad hoc state mutation
- metadata-driven module activation instead of hardcoded module explosion
- Vercel-first web delivery and Hono API posture instead of default Kubernetes complexity
- stronger governance evidence and boundary checks than the legacy templates had

## Current live reality

Afenda already has strong foundational truth in:

- [packages/\_database](C:/NexusCanon/afenda-react-vite/packages/_database/README.md)
- [apps/api](C:/NexusCanon/afenda-react-vite/apps/api/README.md)
- [apps/web ERP shell catalog](C:/NexusCanon/afenda-react-vite/apps/web/src/app/_platform/erp-catalog/policy/erp-module-catalog.policy.ts)
- [packages/finance-core](C:/NexusCanon/afenda-react-vite/packages/finance-core/src/index.ts)
- [packages/machine](C:/NexusCanon/afenda-react-vite/packages/machine/README.md)

What is still missing is broad **backend ERP application ownership** for finance, inventory, sales, employees, reports, and TPM-style workflows.

## Legacy source inventory

The strongest legacy capability is distributed across:

- `.legacy/cna-templates/apps/*`
- `.legacy/cna-templates/docs/*`
- `.legacy/cna-templates/infrastructure/*`
- `.legacy/cna-templates/reports/*`

Those sources contain:

- module breadth and sample flows
- domain vocabulary and workflow examples
- finance, CRM, MRP, and TPM route coverage
- deployment and observability patterns
- audit, readiness, and verification artifacts

They also contain a lot of drift:

- app-local duplicated concerns
- direct Prisma/runtime coupling inside apps
- transport and domain logic mixed together
- infra ambition far above current live delivery needs
- many feature buckets with weak ownership boundaries

## Adoption matrix

### Legacy apps

| Legacy app            | Legacy strength                                                                        | Afenda target                                                                                                        | Verdict                                  | Notes                                                               |
| --------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| `Accounting`          | GL, invoices, tax, reporting engines, e2e coverage                                     | `packages/finance-core`, `apps/api/src/modules/finance/**`, `apps/web/src/app/_features/finance/**`                  | `Borrow now` + `Rebuild in Afenda style` | Highest-value legacy business logic source                          |
| `CRM`                 | counterparties, deals, quotes, campaigns, portal patterns                              | `apps/api/src/modules/mdm/**`, future `apps/api/src/modules/crm/**`, `apps/web/src/app/_features/crm/**`             | `Rebuild in Afenda style`                | Reuse domain inventory, not app-local topology                      |
| `MRP`                 | inventory, BOM, production, purchasing, quality, import/export, strong testing breadth | future `apps/api/src/modules/inventory/**`, `production/**`, `quality/**`, `apps/web/src/app/_features/inventory/**` | `Rebuild in Afenda style`                | Richest operational breadth, but also the most topology drift       |
| `HRM` / `HRM-unified` | employee, attendance, payroll, HR workflows                                            | future `apps/api/src/modules/hr/**`, `payroll/**`, `apps/web/src/app/_features/employees/**`                         | `Rebuild in Afenda style`                | Good domain inventory source                                        |
| `TPM-api`             | budgets, claims, settlements, planning, targets, promo flows                           | future `apps/api/src/modules/trade-promotion/**` or `finance-commercial/**`                                          | `Borrow now` + `Rebuild in Afenda style` | Highest-value source for allocations/settlements/business workflows |
| `TPM-web`             | TPM UX patterns                                                                        | future `apps/web/src/app/_features/trade-promotion/**`                                                               | `Rebuild in Afenda style`                | Keep shell/runtime separate from feature UI                         |
| `Ecommerce`           | order and commerce flow examples                                                       | future `apps/api/src/modules/sales/**` and web sales surfaces                                                        | `Rebuild in Afenda style`                | Useful for order lifecycle, not as an app to port                   |
| `PM`                  | project workflow ideas                                                                 | future `apps/api/src/modules/projects/**` if justified                                                               | `Defer`                                  | Not core to current ERP spine                                       |
| `OTB`                 | domain-specific planning ideas                                                         | future planning/reporting slices if justified                                                                        | `Defer`                                  | Low current priority                                                |
| `ExcelAI`             | spreadsheet-driven assistive flows                                                     | `packages/machine`, future import/export and Lynx skills                                                             | `Rebuild in Afenda style`                | Absorb capability into Lynx and import surfaces                     |
| `HRM-AI`              | AI-assisted HR use-cases                                                               | `packages/machine` + HR module-owned skills                                                                          | `Rebuild in Afenda style`                | Do not create separate AI apps                                      |
| `landing-page`        | marketing examples                                                                     | `apps/web/src/marketing/**`                                                                                          | `Borrow now`                             | Design/content reference only                                       |
| `liphoco`             | customer-specific specialization                                                       | domain/customer overlay docs only                                                                                    | `Reject permanently` as product topology | Keep as benchmark/reference, not product structure                  |
| `TPM-api-nestjs`      | alternative backend transport                                                          | none                                                                                                                 | `Reject permanently`                     | Conflicts with live Hono direction                                  |
| `docs` under apps     | handover/test/readiness artifacts                                                      | owner-local docs under live features/apps                                                                            | `Borrow now` selectively                 | Good evidence style source                                          |

### Legacy docs

| Legacy docs area      | Value                                     | Afenda action                                                                                           | Verdict                                  |
| --------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `docs/architecture/*` | broad system narrative and diagrams       | mine for capability map and diagram ideas; rewrite to current monorepo truth                            | `Borrow now` + `Rebuild in Afenda style` |
| `docs/api/*`          | broad route inventory by domain           | use as module backlog input for future API boundaries                                                   | `Borrow now`                             |
| `docs/database/*`     | entity coverage and migration narrative   | compare against live `_database` schema coverage                                                        | `Borrow now`                             |
| `docs/guides/*`       | contributor onboarding and testing habits | absorb only where they fit live tooling                                                                 | `Borrow now` selectively                 |
| legacy ADRs           | benchmark decision archaeology            | use as reference only; do not revive obsolete decisions like Next.js, Kong, Keycloak, Prisma-by-default | `Reject permanently` as active decisions |

### Legacy infrastructure

| Legacy infra area | Value                                                     | Afenda action                                                     | Verdict                                 |
| ----------------- | --------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------- |
| `monitoring/*`    | strongest infra source: Prometheus, Grafana, Loki, alerts | adapt dashboards/alerts into a lighter Afenda observability stack | `Borrow now`                            |
| `docker/*`        | local and deploy packaging examples                       | mine for app startup and health patterns only                     | `Borrow now` selectively                |
| `terraform/*`     | multi-cloud enterprise coverage                           | keep as reference for future enterprise deployments only          | `Defer`                                 |
| `k8s/*`           | cluster deployment examples                               | defer until the product outgrows current Vercel/Hono posture      | `Defer`                                 |
| `kong/*`          | API gateway patterns                                      | reuse only policy ideas like rate limiting and ingress hardening  | `Reject permanently` as default runtime |
| `tpm/*`           | app verification and docker verification examples         | borrow verification posture, not topology                         | `Borrow now` selectively                |
| `search/*`        | local search infrastructure example                       | align only if live `packages/search` expands                      | `Defer`                                 |

### Legacy reports

| Legacy report surface                | Value                                | Afenda action                                                               | Verdict                  |
| ------------------------------------ | ------------------------------------ | --------------------------------------------------------------------------- | ------------------------ |
| `competitive-analysis.js`            | report-generation pattern            | if needed, move report generation to `.artifacts/` or governed docs tooling | `Borrow now` selectively |
| `ERP_Competitive_Analysis_2026.docx` | market framing and benchmark posture | use as market input, not repo truth                                         | `Borrow now` selectively |

## What Afenda should adopt immediately

These are the highest-value legacy capabilities to pull into the live product next.

### 1. Finance backend spine

Use `Accounting` and `TPM-api/finance` as the primary source material for:

- journal posting workflows
- accruals
- invoices
- allocations
- settlements
- reporting contracts
- fiscal period logic

Target live ownership:

- `packages/finance-core`
- `apps/api/src/modules/finance/**`
- `apps/web/src/app/_features/finance/**`

This should become the first major ERP backend expansion after MDM.

### 2. Inventory and MRP domain spine

Use `MRP` as the source material for:

- items
- BOM
- warehouses and inventory movements
- purchasing
- production orders
- quality checks
- supplier operational views

Target live ownership:

- `_database` MDM + inventory schema extensions
- `apps/api/src/modules/inventory/**`
- `apps/api/src/modules/production/**`
- `apps/api/src/modules/quality/**`
- `apps/web/src/app/_features/inventory/**`

### 3. TPM commercial workflow spine

Use `TPM-api` as the source material for:

- budgets
- claims
- targets
- contract milestones
- settlement batches
- post-analysis

This is the best source for real ERP commercial workflow logic in the legacy tree.

Target live ownership:

- future `apps/api/src/modules/trade-promotion/**`
- future finance-commercial workflow support
- corresponding web features

### 4. Higher-end observability

Use legacy monitoring assets to enrich the live repo with:

- business and per-app dashboard concepts
- app/database/queue alert classes
- readiness/liveness evidence posture
- log and metrics taxonomy

Target live ownership:

- `packages/metrics`
- `apps/api/src/api-health*`
- future docs under `docs/DEPLOYMENT.md` and observability guidance

### 5. Verification and rollout discipline

The strongest legacy process signal is not code, it is the amount of:

- e2e coverage
- audit reports
- handover docs
- rollback plans
- readiness reports

Afenda should not copy the file sprawl, but it should adopt the discipline:

- module readiness reports under docs or `.artifacts/`
- rollback plans for major backend slices
- stronger end-to-end verification for enabled ERP modules

## What Afenda should not adopt directly

Do not port these legacy patterns directly:

- app-per-domain runtime sprawl
- Next.js as default ERP runtime
- Prisma-per-app as the live data doctrine
- Kong as required gateway
- Keycloak as default auth posture
- NATS JetStream as immediate default event runtime
- Kubernetes and Terraform as the default deployment baseline
- giant app-local `lib/`, `components/`, or `hooks/` junk drawers
- mixed security/auth/rate-limit/audit buckets

## Higher-end target architecture

To become better than legacy, Afenda should converge on this model:

```txt
packages/_database
  persisted truth
  canonical schema and audit foundation

packages/finance-core
  pure accounting and tax primitives

packages/events
  thin execution-linkage and envelope contracts

packages/machine
  Lynx runtime contracts and governed machine skills

apps/api/src/modules/*
  canonical backend ownership domains
  write boundaries
  read/query boundaries
  workflow orchestration

apps/web/src/app/_features/*
  product feature UI and client adapters

apps/web/src/app/_platform/*
  shell, auth, tenant, i18n, runtime
```

That is stronger than legacy because:

- domain write boundaries become explicit
- shared packages stay thin and disciplined
- the shell stays metadata-driven
- backend ownership becomes clearer than legacy app-local stacks
- governance can be enforced mechanically

## Delivery priority

Use this order.

1. `Finance`
   Build `apps/api/src/modules/finance/**` using legacy `Accounting` and `TPM-api/finance` as source material.

2. `Inventory`
   Build `inventory`, `production`, and `quality` ownership domains from legacy `MRP`.

3. `Trade promotion`
   Build `budgets`, `claims`, `allocations`, `settlements`, and `targets` from legacy `TPM-api`.

4. `CRM expansion`
   Extend beyond counterparties into deals, quotes, and sales workflow.

5. `Employees and payroll`
   Build HR ownership domains from legacy `HRM`.

6. `Observability and rollout evidence`
   Upgrade live monitoring, readiness, and verification posture from legacy infra and reports.

## Immediate next implementation slices

The most defensible next build slices are:

1. `apps/api/src/modules/finance/journals/**`
2. `apps/api/src/modules/finance/invoices/**`
3. `apps/api/src/modules/finance/allocations/**`
4. `apps/api/src/modules/finance/settlements/**`
5. `apps/api/src/modules/inventory/items/**`

Those slices align with:

- existing planned ERP catalog entries
- existing `packages/finance-core`
- existing `_database` schema foundation
- strongest legacy business logic sources

## Final decision

Adopt the legacy tree as a **capability quarry**, not as a topology template.

The live product should:

- absorb the best domain logic from legacy
- preserve the best verification habits from legacy
- reject the mixed and overgrown topology from legacy
- rebuild every important capability under Afenda ownership-first governance

That is the path to a product that is broader than the current live repo and cleaner than the legacy system.
