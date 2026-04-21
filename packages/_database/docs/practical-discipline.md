# Practical discipline for the team

Norms for `@afenda/database`: **tenant safety**, **integrity**, a clear split between Drizzle and raw PostgreSQL, and **where files belong** in the repo.

This doc is **simple and strict**:

- **[`guideline/001-postgreSQL-DDL.md`](./guideline/001-postgreSQL-DDL.md) = architectural charter** (what the database must be).
- **[`guideline/008-db-tree.md`](./guideline/008-db-tree.md) = physical canonical repo tree** (what is on disk—placement authority; do not follow older draft trees such as `packages/db/src/...`).
- **[`guideline/002-foundation-inventory.md`](./guideline/002-foundation-inventory.md) = logical foundation** (`pgSchema` domains, must-have table families).
- **[`guideline/002A-foundation-inventory-architecture.md`](./guideline/002A-foundation-inventory-architecture.md) = full knowledge base** (L1/L2/L3 layers, relations, queries, raw SQL, Drizzle `out/`, invariants).
- **[`guideline/schema-inventory.json`](./guideline/schema-inventory.json) = machine-verified list** of every file under `src/schema/` and `src/7w1h-audit/` — run `pnpm run db:inventory:sync` in `packages/_database` when the tree changes (same PR as **008**).

From here on:

> **001 = architectural charter.**  
> **The checked-in database tree (`008-db-tree.md`) = physical file-placement truth.**  
> **`schema-inventory.json` must match disk** (`db:inventory:verify` is part of `db:guard`).

Any new database-related file must satisfy **001** and **008**; keep **002/002A** aligned when you change doctrine or architecture.

---

## 1. Freeze the canonical physical layout

Use these rules permanently:

- **Package root** is `packages/_database/`.
- **Drizzle-managed DDL** lives under `src/schema/`.
- A **real Drizzle DDL module** is a `*.schema.ts` (or namespace `_schema.ts`) under `src/schema/<domain>/`.
- **Only these PostgreSQL schema domains** are registered for Drizzle Kit (`DRIZZLE_MANAGED_PG_SCHEMAS`): **`ref`**, **`mdm`**, **`iam`**, **`finance`**, **`governance`** (plus the Drizzle migrations journal schema—see `pkg-governance/constants.ts`).
- Every new DDL module must be re-exported through the domain **`index.ts`** and **`src/schema/index.ts`**.

Earlier drafts that used **`packages/db/src/...`** are **superseded** by the actual tree under **`packages/_database/`**.

---

## 2. Domain placement map

| Concern                                                                   | Correct place                     |
| ------------------------------------------------------------------------- | --------------------------------- |
| Shared column builders / enums / SQL fragments                            | `src/schema/shared/`              |
| Reference masters                                                         | `src/schema/ref/`                 |
| Tenant root, structure, MDM masters, customization                        | `src/schema/mdm/`                 |
| Identities, memberships, roles, authority                                 | `src/schema/iam/`                 |
| Calendars, COA, accounts                                                  | `src/schema/finance/`             |
| Audit + governance **DDL** (tables/enums in `governance` PG schema)       | `src/schema/governance/`          |
| Drizzle `relations()` barrels                                             | `src/relations/`                  |
| 7W1H audit (DDL + services + Zod; tables remain `governance` in Postgres) | `src/7w1h-audit/`                 |
| Identity barrel + services                                                | `src/schema/identity/`            |
| Tenancy barrel + services                                                 | `src/schema/tenancy/`             |
| Package governance manifests / constants / guards                         | `src/schema/pkg-governance/`      |
| Schema env/column helpers (non-`*.schema.ts`)                             | `src/schema/environment-support/` |
| Runtime constants                                                         | `src/schema/constants/`           |

**Path freeze (same as [`008-db-tree.md`](./guideline/008-db-tree.md)):** `identity`, `tenancy`, `pkg-governance`, `environment-support`, and `constants` appear **only** as `src/schema/<folder>/`. **7W1H audit** lives at **`src/7w1h-audit/`** (sibling of `src/schema/`, export `@afenda/database/7w1h-audit`); audit DDL modules are **not** under `src/schema/governance/` anymore—they are co-located in `7w1h-audit/` and re-exported from `governance/index.ts` for Drizzle Kit.

---

## 3. What to keep in each domain (current buckets)

These align with **001** and the registered tree; keep new work in the same buckets unless charter changes.

### `src/schema/mdm/`

- Tenants, tenant profiles / policies / label overrides, document sequences
- Legal entities, business units, locations, org units
- Parties, customers, suppliers
- Items, item categories, item entity settings
- Master aliases, external identities
- Custom field definitions / values
- Tax registrations

### `src/schema/iam/`

- User accounts, persons
- Tenant memberships, tenant roles, tenant role assignments, authority policies
- Repo-specific auth/identity modules: **auth-challenges**, **identity-links**, **user-identities**

### `src/schema/finance/`

- Accounts, chart of account sets
- Fiscal calendars, fiscal periods
- Legal entity COA assignments

### `src/schema/governance/`

- Data sources; re-exports 7W1H audit DDL from `src/7w1h-audit/` (`audit_logs`, enums, Zod boundary)

---

## 4. Gap vs 001 (Layer 5 governance masters)

Compared with **[001](./guideline/001-postgreSQL-DDL.md)** Layer 5, the **physical tree does not yet** include several governance MDM tables (e.g. survivorship, golden-record workflow, match/merge, data quality).

**When you add them**, the clean fit is under the same PostgreSQL namespace you already use for governance DDL:

```text
packages/_database/src/schema/governance/
  survivorship-rules.schema.ts
  master-records.schema.ts
  master-record-matches.schema.ts
  master-record-merges.schema.ts
  data-quality-issues.schema.ts
```

Wire them through `governance/index.ts` and `src/schema/index.ts` like other modules.

---

## 5. Reserved suffix: `*.schema.ts`

- **`*.schema.ts` means** a real Drizzle / PostgreSQL DDL module (tables, enums, `pgSchema` handles) **under `src/schema/`** (see `pkg-governance/schema-modules.ts`).
- Files **outside `src/schema/`** that use `*.schema.ts` are **naming exceptions** (e.g. `src/relations/relations.schema.ts`, `src/studio/*.schema.ts`): candidates to **rename** (`*.bundle.ts`, `*.zod.ts`, `*.doc.ts`, etc.) if you want the suffix strictly reserved for DDL.

This removes ambiguity and reduces drift.

---

## 6. Do not

- Create **new DDL** under `src/relations/`.
- Invent **new DDL** under `src/schema/identity/` or `src/schema/tenancy/` **unless** the charter explicitly adds tables there—those folders are barrels/services, not alternate schema roots. (Governance **tables** include re-exports from `src/7w1h-audit/` for `audit_logs`; other governance DDL stays under `src/schema/governance/`.)
- Invent a **second** package layout such as `packages/db/src/schema/`.
- Mix **non-DDL** metadata into `src/schema/` without a clear rule.
- **Bypass** `src/schema/index.ts` registration for real DDL modules.

---

## 7. Canonical directory shape (summary)

Treat this as the **shape** to follow (authoritative file lists: **`008-db-tree.md`**). The tree below matches **`packages/_database/src`** as of the last doc sync.

**Relational DDL** (tables, enums, `pgSchema` handles for the five registered PostgreSQL domains) lives only under:

`src/schema/{ref,mdm,iam,finance,governance}/`  
plus **`src/schema/shared/`** (shared builders/enums/shared SQL defaults).

Everything else under `src/schema/` is **supporting** (barrels, pkg-governance, environment-support, constants, identity/tenancy services—not alternate DDL roots).

```text
packages/_database/
  src/
    client.ts
    index.ts
    7w1h-audit/            # 7W1H audit (DDL + services; Postgres `governance` schema)
    schema/
      index.ts
      shared/
      ref/
      mdm/
      iam/
      finance/
      governance/          # DDL for pgSchema("governance"); audit_logs re-exported from ../7w1h-audit
      identity/            # barrel + services (no extra DDL root)
      tenancy/             # barrel + services (no extra DDL root)
      pkg-governance/      # constants, schema filter, tooling
      environment-support/
      constants/
    relations/             # Drizzle relations() barrels — NOT DDL
    queries/               # canonical resolvers + query primitives
    studio/                # glossary / snapshots (not Postgres DDL)
    migrations/            # `index.ts` — layout metadata only; Drizzle output is `packages/_database/drizzle/`
    views/                   # Drizzle pgView canonical read models (re-exported from schema/index.ts)
    __tests__/             # package tests
```

**Do not** put new **`pgTable` / enum DDL** under `relations/`, `queries/`, `studio/`, or empty placeholders. **Exception:** governed audit DDL for `governance.audit_logs` belongs in **`src/7w1h-audit/`** (re-exported through `schema/governance`). Compose resolvers in app code (`src/queries/README.md`); do not add a parallel `src/application/` examples tree.

**Relations location:** Drizzle `relations()` barrels live only in **`src/relations/`** (`relations.schema.ts`, `*-relations.ts`). Do **not** add a parallel `src/schema/relations/` tree for the same concern—an empty folder there was removed as stray; if it reappears, delete it unless the team explicitly repurpose it (still not for `pgTable` DDL).

---

## 8. Operating rule

> **Architectural truth comes from 001. Physical file placement comes from the checked-in database tree (`008-db-tree.md`). Any new database file must satisfy both.**

Optional next deliverable: a **file-by-file placement ledger**—artifact → target path → why → export path.

---

## 9. PostgreSQL and Drizzle integrity

### Rule 1 — `tenant_id` on every tenant-owned table

Every table that carries tenant data must include **`tenant_id`** (and queries must scope on it). Shared reference tables under `ref` (or equivalent) are the exception where the model is explicitly global.

### Rule 2 — Composite FKs when a child references a tenant-owned parent

Where a child row belongs to a tenant-owned parent, prefer a **composite foreign key** on **`(tenant_id, parent_id)`** (parent keyed by `(tenant_id, id)`), not **`parent_id` alone**.

That keeps joins and deletes aligned with tenant scope and prevents cross-tenant pointer mistakes.

### Rule 3 — Nullable scope columns: do not rely on a plain composite unique alone

PostgreSQL treats **`NULL` as distinct** in unique indexes. For optional hierarchy columns (e.g. `business_unit_id`, `location_id`), a single nullable composite unique is often **not** sufficient.

Use **scope-specific partial unique indexes** (and document them in SQL migrations such as `sql/hardening/patch_e_nullable_scope_uniqueness.sql`).

### Rule 4 — Temporal records: no-overlap belongs in PostgreSQL

Where business validity ranges (effective dates, periods) must not overlap for the same scope, enforce **no overlap in the database**—for example **`btree_gist`** + **`daterange`** + **`EXCLUDE`**—not only in application code.

Service-layer checks are not enough under concurrency.

### Rule 5 — Drizzle vs raw SQL

**Use Drizzle for:**

- Type-safe queries
- Schema mirror (tables, enums, columns)
- Relations (`relations()`)
- Basic constraints you are happy to maintain in the TS schema (PK, FK, checks, ordinary indexes)

**Use raw PostgreSQL migrations for:**

- Advanced integrity (exclusion constraints, partial uniques that match nullable scope rules)
- Performance features you do not want to duplicate in Drizzle (e.g. GIN/trigram, generated columns owned by the server)
- Concurrency correctness (row-locked sequence allocation, trigger-maintained fields, validation triggers)

See `sql/hardening/README.md` for the recommended **baseline (Drizzle) / hardening SQL** split.
