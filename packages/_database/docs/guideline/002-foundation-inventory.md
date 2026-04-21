# 002 — Foundation schema target (ground inventory)

**Status:** normative blueprint for **what must exist** in a multi-tenant ERP-style PostgreSQL + Drizzle foundation. **Not** a file-by-file disk tree.

**Authority:** Defines **PostgreSQL namespaces**, **bounded modules**, and **must-have table families** so the physical model stays coherent. Align with [001-postgreSQL-DDL.md](./001-postgreSQL-DDL.md) (doctrine), [008-db-tree.md](./008-db-tree.md) (registered tree and paths under `src/schema/`), and `.agents/skills/` (database-schema-designer, postgresql-table-design, multi-tenant-architecture, domain-driven design, drizzle-orm, erp-workflow-patterns).

**Full architecture map:** [002A-foundation-inventory-architecture.md](./002A-foundation-inventory-architecture.md) — **three layers of truth** (TS schema, generated migrations, raw SQL), complete **`src/schema/`** file tree, **`relations/`**, **`queries/`**, **`sql/hardening/`** patch order, Drizzle `out/` + journal, skill and Context7 alignment.

**Relationship to 008:** [008](./008-db-tree.md) is the **maintainer-maintained tree** of paths under `src/schema/`. **002** does not duplicate that list; it defines the **logical** foundation you implement inside those modules.

---

## 1. PostgreSQL schemas (`pgSchema` domains) — minimum set

| Schema           | Responsibility (ubiquitous language)                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **`ref`**        | Global reference data (currencies, countries, UOMs, locales, …)—no tenant column, or rows shared by all tenants.                         |
| **`iam`**        | **Who** can act: identities, credential challenges, persons, user accounts, memberships, roles, authority.                               |
| **`mdm`**        | **What the business is**: tenants, org structure, parties, locations, item masters, sequences, tenant-specific labels/policies.          |
| **`finance`**    | **How money is structured**: fiscal calendar, chart of accounts, accounts, assignments to legal entities.                                |
| **`governance`** | **What happened / quality**: immutable audit trail, data-source registry, MDM governance (aliases, survivorship, DQI—when you add them). |

`public` and `drizzle` (Kit metadata) are **not** listed here as business DDL namespaces; handle them in `drizzle.config.ts` and deployment policy, not as core domain schemas.

---

## 2. Code layout under `src/schema/` — minimum modules (folders)

| Module            | Must contain (conceptually)                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| **`shared/`**     | Shared enums, column recipes, Zod boundaries—one style for IDs, money, timestamps, tenant scope.  |
| **`ref/`**        | `pgSchema('ref')` + reference tables + ref boundary schemas.                                      |
| **`iam/`**        | `pgSchema('iam')` + identity and access tables + iam boundaries.                                  |
| **`mdm/`**        | `pgSchema('mdm')` + tenant + org + party + item masters + document/number sequences + boundaries. |
| **`finance/`**    | `pgSchema('finance')` + fiscal + COA + accounts + boundaries.                                     |
| **`governance/`** | `pgSchema('governance')` + audit logs + governance metadata + boundaries.                         |

Optional but common in the same package (not every file is `pgTable`):

| Module                     | Role                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **`audit/`**               | Pipeline: build, validate, insert audit **events** (uses governance tables).                                          |
| **`identity/`**            | Bridge external auth ↔ `iam` (e.g. ensure identity links).                                                            |
| **`tenancy/`**             | Resolve active tenant / membership **context** (mostly services + Zod; physical tenant tables stay in `mdm` / `iam`). |
| **`pkg-governance/`**      | Constants: managed schema list, migration identifiers, module registry.                                               |
| **`environment-support/`** | Non-DDL environment parsing and schema support shared by schema code.                                                 |
| **`constants/`**           | Runtime constants consumed by schema or tooling.                                                                      |

---

## 3. Must-have table families (entity spine)

Each row is a **family** to plan for; exact file names are implementation detail.

| Layer | Table family                                                                      | Schema               | Why it is non-negotiable                                                      |
| ----- | --------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------- |
| 0     | **Tenants** (type, status, governance level)                                      | `mdm`                | Isolation root; tenant-scoped rows hang off `tenant_id` where applicable.     |
| 0     | **Tenant policies / profiles / label overrides** (as needed)                      | `mdm`                | Business-truth overrides without code forks.                                  |
| 1     | **Legal entities, org units, business units, locations**                          | `mdm`                | Enterprise structure for ERP and finance.                                     |
| 1     | **Parties, addresses, party–address links**                                       | `mdm`                | Customer/supplier/other party spine.                                          |
| 2     | **User accounts, user identities, identity links**                                | `iam`                | Login subject and linkage to external IdPs.                                   |
| 2     | **Persons** (if distinct from login identity)                                     | `iam`                | Person record when the product separates it from credentials.                 |
| 2     | **Tenant memberships, tenant roles, role assignments, authority policies**        | `iam`                | Authorization and scope (tenant never trusts client-supplied identity alone). |
| 2     | **Auth challenges** (OTP, etc.)                                                   | `iam`                | Credential flows without bloating `user_accounts`.                            |
| 3     | **Items, categories, (optional) entity-specific settings**                        | `mdm`                | MDM backbone for operational ERP.                                             |
| 3     | **Document sequences** (per tenant / doc type)                                    | `mdm`                | Deterministic numbering.                                                      |
| 3     | **Custom field definitions + values** (if the product requires extensibility)     | `mdm`                | Metadata-driven fields.                                                       |
| 4     | **Chart of account sets, accounts, fiscal calendars and periods**                 | `finance`            | Minimum finance skeleton.                                                     |
| 4     | **Legal entity ↔ COA assignment** (or equivalent)                                 | `finance`            | Ties org structure to books.                                                  |
| 5     | **Audit log** (append-only: actor, action, entity, payload hash/redaction policy) | `governance`         | Compliance and debugging.                                                     |
| 5     | **Data sources / lineage** (even minimal)                                         | `governance`         | Which system owns a master row.                                               |
| 5     | **Master aliases and external identities** (when integrating other systems)       | `mdm` / `governance` | Golden record / matching—split per your doctrine.                             |
| —     | **Reference: countries, currencies, UOMs, locales, time zones**                   | `ref`                | Shared vocabulary; keeps `mdm` clean.                                         |

---

## 4. Non-table foundations (same package, same discipline)

| Piece                                          | Requirement                                                                                                                                         |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Relations** (`src/relations/` or equivalent) | Relational graph for FK-heavy areas you query with Drizzle relations; **index FK columns** in DDL (PostgreSQL does not auto-index FKs).             |
| **Kit entry graph**                            | `drizzle.config.ts` `schema` must resolve **every** `pgTable` / enum you migrate—no orphan table modules.                                           |
| **Tenant column discipline**                   | Tenant-scoped rows: **`tenant_id` + FK + index** where applicable; `ref` without `tenant_id` by design.                                             |
| **RLS / hardening**                            | When enforced in the database, policies and patches stay aligned with tenant-scoped tables—see [001](./001-postgreSQL-DDL.md) and `sql/hardening/`. |

---

## 5. Physical rules (PostgreSQL)

- **Primary keys** on durable entities; **foreign keys** with explicit **`ON DELETE` / `ON UPDATE`**; **index** referencing columns you join or filter on.
- **Money → `numeric`**; **timestamps → `timestamptz`**; **strings → `text`** unless a stricter rule exists in [001](./001-postgreSQL-DDL.md).
- **Normalize first**; denormalize only for measured read paths.

---

## 6. Summary

**002** is the **logical** foundation: namespaces, modules, and table families. **008** is the **path** registry for `src/schema/`. **001** is the **DDL doctrine**. Build tables against **§3**; place files per **008**; enforce types and policies per **001**.

---

## Document history

| Version | Date       | Notes                                                                                                             |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| 2.1     | 2026-04-18 | Link to [002A](./002A-foundation-inventory-architecture.md) full architecture map.                                |
| 2.0     | 2026-04-18 | Replaced file-level allowlist with ground-up foundation schema target; path allowlist is [008](./008-db-tree.md). |
| 1.1     | 2026-04-18 | (Superseded) §1 allowlist = §3 only; §10 Drizzle gaps.                                                            |
| 1.0     | 2026-04-18 | (Superseded) Initial file allowlist.                                                                              |
