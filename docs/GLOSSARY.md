# Glossary of terms — Afenda ERP

This document defines **key terms** used in the **Afenda** monorepo so product, engineering, and support share the same vocabulary. Definitions are **Afenda / ERP–centric**; they are not tied to a specific database schema until your migrations exist ([Database](./DATABASE.md)).

**Related:** [Architecture](./ARCHITECTURE.md) · [Authentication](./AUTHENTICATION.md) · [Project structure](./PROJECT_STRUCTURE.md)

---

## Table of contents

1. [Platform: Vite client vs server](#1-platform-vite-client-vs-server)
2. [Tenant and organization](#2-tenant-and-organization)
3. [Identity: user vs employee (or party)](#3-identity-user-vs-employee-or-party)
4. [Roles, permissions, and delegation](#4-roles-permissions-and-delegation)
5. [ERP core concepts](#5-erp-core-concepts)
6. [Sales and customer accounts](#6-sales-and-customer-accounts)
7. [Optional product modules (reference)](#7-optional-product-modules-reference)
8. [Disambiguation summary](#8-disambiguation-summary)
9. [External references](#9-external-references)
10. [Maintenance](#10-maintenance)

---

## 1. Platform: Vite client vs server

Afenda’s primary UI is a **Vite + React SPA** in **`apps/web`**. [Vite](https://vitejs.dev/) builds a **client** bundle for the browser. Business rules, secrets, and **PostgreSQL** access belong on a **server** (API, workers, serverless)—see [Architecture](./ARCHITECTURE.md).

| Term | Meaning in Afenda |
| --- | --- |
| **Client** | Code that runs in the **browser** after `vite build` (React tree, TanStack Query, Zustand, etc.). Uses **`import.meta.env`** and **`VITE_*`** variables ([Deployment](./DEPLOYMENT.md)). |
| **Server / API** | Trusted runtime that holds **`DATABASE_URL`**, signs tokens, enforces authorization. **Never** ship DB credentials in the client bundle. |
| **Environment variables** | **`VITE_*`** — exposed to client build. **No `VITE_` prefix** — server-only (Auth secrets, DB, provider keys). |
| **SSR / extra environments** | The default product is **not** Next.js SSR. Vite 6’s [Environment API](https://vitejs.dev/guide/api-environment) allows multiple build targets (e.g. edge, workers); use it only if you add non-browser runtimes. |

---

## 2. Tenant and organization

### Tenant (organization)

A **tenant** is an **organization** whose data is **isolated** from other customers (multi-tenancy). In URLs and APIs this may appear as a **slug**, **subdomain**, or explicit **tenant id** in headers/claims.

**References:** [Multi-tenancy](https://en.wikipedia.org/wiki/Multitenancy); patterns similar to “workspace” (Slack) or “org” (GitHub).

**Relationships:** Owns users/memberships, master data, transactions, and configuration for that org.

---

## 3. Identity: user vs employee (or party)

### User

A **user** is an **authentication identity**: someone who can **sign in** (email/password, SSO, OIDC, passkeys, etc.). Technical details: subject id, IdP links, sessions—see [Authentication](./AUTHENTICATION.md).

- May belong to **one or more tenants** with different roles each.
- Does **not** by itself describe job title, cost center, or HR attributes—that is **domain** data.

### Employee / worker / party (domain)

An **employee** (or more generally a **party** / **business partner**) is a **domain record** in the ERP: person or organization you do business with (employee, customer contact, vendor contact).

- Scoped to a **tenant**.
- May exist **before** a login exists (e.g. hired-but-not-yet-provisioned, imported roster).
- **User ↔ employee** linking is product-specific (same email, explicit link table, etc.).

**Difference (common pattern):**

| | User | Employee / party |
| --- | --- | --- |
| Purpose | **Access** the system | **Represents** someone in business data |
| Login | Yes | Optional |
| Per tenant | Membership + roles | Org structure, HR, approvals |

---

## 4. Roles, permissions, and delegation

### Role

A **role** bundles **permissions** (menus, actions, data scopes) for a **tenant membership**. Examples (illustrative): `admin`, `accountant`, `warehouse_clerk`, `readonly`.

- Often **hierarchical** or **additive** (admin ⊃ accountant ⊃ viewer)—define explicitly in your product.
- Same **user** can have **different roles** in different tenants.

**References:** [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control).

### Permission

A fine-grained **action** on a resource (`invoice.post`, `inventory.adjust`, `report.export`). Prefer **permission checks** in APIs, not only UI hiding.

### Approver / manager (operational)

**Approver** — someone allowed to **approve** a document (PO, expense, journal) per workflow rules. **Manager** — org hierarchy for escalations and delegations; not always the same as RBAC `manager` role.

---

## 5. ERP core concepts

Definitions are **generic ERP**; your schema may use different names.

### Legal entity / company

**Legal entity** — registered unit for **statutory** reporting (tax id, fiscal books). A tenant may have **multiple** legal entities.

### Fiscal period

**Fiscal period** — time bucket for closing (month, quarter, year). **Period close** locks posting for that range.

### Chart of accounts (COA)

Structured list of **GL accounts** (assets, liabilities, equity, revenue, expense) used for financial reporting.

### Journal entry / document

**Journal entry** — accounting document with **debits and credits** that balance. **Posting** — transferring approved amounts from subledgers/journals into the **general ledger** and updating balances.

### General ledger (GL)

Central ledger for **posted** financial balances by account and dimension (company, cost center, etc.).

### Subledger

Specialized ledger feeding the GL: **AR** (receivables), **AP** (payables), **inventory**, **fixed assets**, etc.

### Cost center / dimension

**Dimension** used for **management reporting** (department, project, region). Often separate from legal entity.

### Item / SKU / product

**Item** — master record for something bought, sold, or stocked. **SKU** — stockkeeping identifier; **UoM** — unit of measure (each, kg, hour).

### Warehouse and stock

**Warehouse** (or location) — place where **on-hand quantity** is tracked. **Movement** — receipt, issue, transfer; may drive **inventory valuation**.

### Purchase order (PO) / sales order

**PO** — commitment to buy from a **vendor**. **Sales order** — commitment to sell to a **customer**. Both may have **lines**, **pricing**, and **fulfillment** states.

---

## 6. Sales and customer accounts

### Customer account

A **customer** (account) is a **commercial relationship**: sold-to / bill-to, contracts, credit limits, health metrics. In account-management or CS motions you may also track **goals**, **cadences**, and **KPIs**—model names vary by product (**Track goal**, **account plan**, etc.).

### Vendor / supplier

Counterparty for **procurement**; mirrored concepts: payment terms, bank details, performance.

---

## 7. Optional product modules (reference)

If Afenda (or an extension) implements **talent**, **learning**, or **OKR** features, terms like **skill**, **assessment**, **roadmap**, **objective / key result**, **learning assignment** follow common HR / performance practice ([SFIA](https://sfia-online.org/), [OKR](https://en.wikipedia.org/wiki/Objectives_and_key_results), ISO skills metrics). Keep **definitions** in a module-specific doc when you ship those tables—avoid overloading this glossary with schema you have not released.

Similarly, **AI-assisted** features (quizzes, agenda suggestions, semantic search over documents) depend on **product** and **governance** choices; see [Database](./DATABASE.md) for **pgvector** when relevant.

---

## 8. Disambiguation summary

| A | B |
| --- | --- |
| **User** | **Employee / party** — login identity vs business record |
| **Tenant** | **Legal entity** — customer org vs statutory company (tenant may have many legal entities) |
| **Role (RBAC)** | **Job title** — permissions vs HR label |
| **Posting (accounting)** | **HTTP POST** — financial transfer vs API verb |
| **Client (Vite)** | **Customer client** — browser runtime vs CRM “account” |

---

## 9. External references

- **OAuth 2.0 / OIDC** — [OAuth.net](https://oauth.net/2/)
- **WCAG** — accessibility ([WAI](https://www.w3.org/WAI/standards-guidelines/wcag/))
- **ERP patterns** — industry materials for finance, supply chain, and HR suites (SAP, Oracle, Microsoft Dynamics terminology often align at concept level)

---

## 10. Maintenance

Update this glossary when:

1. New **bounded contexts** or modules ship (e.g. manufacturing, projects).
2. **Tenant** or **auth** model changes ([Authentication](./AUTHENTICATION.md)).
3. Terms are **misused** in UI or APIs—fix docs and labels together.

**Last updated:** 2026-04-05
