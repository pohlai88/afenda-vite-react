# 001-FINAL — Canonical ERP Tenant-MDM PostgreSQL Design Charter

**File:** `001-postgreSQL-DDL.md` — same content as **001-FINAL**; the filename is the stable path in `docs/guideline/`.

> **Charter scope.** This is the reconciled baseline—not another wave, not an implementation guess, and not a partial pack. It is the **strict database charter** distilled from the original 001: internal ambiguities are normalized into one usable standard; wherever 001 gave examples, they are expressed as rules; wherever a concept needs a hard PostgreSQL guardrail, that guardrail is explicit. Authority for architecture, layers, doctrine, and implementation order comes from the original 001.

---

## 1. Authority

**001 is the sovereign database baseline.**

Until you explicitly replace it, every later schema, migration, ORM file, resolver, or service must be judged against 001 first. 001 defines the target architecture, the integrity doctrine, the missing-but-mandatory enterprise features, and the correct implementation order: **canonical PostgreSQL DDL first, Drizzle mirror second**.

## 2. What 001 is really saying

001 is not “a set of tables.”

It is a rule that your ERP database must be a **governed enterprise data platform** with:

- key strategy
- constraint strategy
- tenant isolation
- alias and external identity
- MDM governance
- controlled customization
- canonical query surfaces
- PostgreSQL-native enforcement
- Drizzle mirroring rather than weakening the truth

---

## 3. Canonical layer model

The database is permanently divided into **6 layers**.

### Layer 1 — Business truth root

This is the enterprise boundary and customization root:

- `tenants`
- `tenant_profiles`
- `tenant_policies`
- `tenant_label_overrides`
- `document_sequences`

### Layer 2 — Enterprise structure

This is the structural operating model under a tenant:

- `legal_entities`
- `business_units`
- `locations`
- `org_units`

### Layer 3 — Security scope

This is access and operating authority:

- `tenant_memberships`
- `roles`
- `role_assignments`
- `authority_policies`

### Layer 4 — MDM business masters

This is the operational and accounting master surface:

- `parties`
- `customers`
- `suppliers`
- `items`
- `item_entity_settings`
- `accounts`
- tax profile / registration surfaces as required by the model

### Layer 5 — MDM governance

This is the truth-reconciliation layer:

- `master_aliases`
- `external_identities`
- `survivorship_rules`
- duplicate/match tables
- merge history
- data quality issues

### Layer 6 — Platform-grade mechanics

This is where enterprise integrity is enforced:

- partial indexes
- GIN indexes
- generated columns
- triggers
- views / materialized views
- RLS
- audit trail
- controlled JSONB
- other PostgreSQL-native mechanics where appropriate

---

## 4. Non-negotiable design doctrine

These are not optional preferences. They are the permanent doctrine of the database:

- UUID surrogate PK plus business key
- scoped uniqueness
- strong FK discipline
- effective-dated integrity
- soft-delete-aware uniqueness
- tenant-safe referential integrity
- alias and external identity handling
- controlled extensibility with JSONB
- canonical query surfaces
- PostgreSQL as invariant enforcer
- Drizzle as typed mirror and orchestration aid

---

## 5. Standard table contract

For most tenant-owned mutable master tables, 001 establishes a common contract:

```sql
id                      uuid primary key
tenant_id               uuid not null
code                    varchar(...) not null
name                    varchar(...) not null
status                  varchar(...) not null
description             text null
aliases                 text[] not null default '{}'
external_ref            varchar(...) null
source_system_id        uuid null
effective_from          date not null default current_date
effective_to            date null
is_deleted              boolean not null default false
created_at              timestamptz not null default now()
updated_at              timestamptz not null default now()
created_by              uuid null
updated_by              uuid null
version_no              integer not null default 1
metadata                jsonb not null default '{}'::jsonb
```

**Implementation note (Afenda `@afenda/database`).** The fragment above is **normative intent**. In Drizzle modules, `status` for shared lifecycles is typically a **`pgEnum`** (see `shared/enums.schema.ts`), bounded codes use `varchar({ length: n })` or project column helpers, and timestamps must remain **`timestamptz`**—never `timestamp` without time zone. See **Appendix B** and `shared/columns.schema.ts`.

For scoped ownership tables, add:

- `ownership_level`
- `legal_entity_id`
- `business_unit_id`
- `location_id`

This means every serious master table must carry:

- identity
- scope
- lifecycle
- auditability
- extensibility
- temporal validity

---

## 6. Key doctrine

### Primary key rule

Use:

```sql
id uuid primary key
```

This is the permanent PK rule. 001 explicitly rejects composite PK everywhere as the default because it makes joins, FKs, ORM relations, refactoring, and API identity heavier.

### Business key rule

Do **not** stop at the surrogate PK.

Every important entity also needs scoped business uniqueness:

- `unique (tenant_id, code)`
- `unique (tenant_id, legal_entity_id, code)`
- `unique (tenant_id, legal_entity_id, location_id, code)`

### Alternate key rule

Preserve alternate keys when they are part of reconciliation or legal identity, such as:

- registration number
- tax registration number
- external ID
- external code
- alias value

---

## 7. FK doctrine

### Base rule

Use ordinary FKs where the reference is simple and tenant leakage is impossible.

### Tenant-safe rule

Where correctness matters, use **composite tenant-safe FK**:

```sql
foreign key (tenant_id, parent_id)
references parent_table (tenant_id, id)
```

001 explicitly identifies this as the safer enterprise pattern, because FK on `id` alone can allow cross-tenant leakage if the wrong ID is referenced.

### Parent support rule

If a child table must reference `(tenant_id, id)`, the parent must expose that pair as unique when necessary for the FK, even if `id` is already the PK. This is why 001 adds helper uniqueness like:

```sql
unique (tenant_id, id)
```

before child composite FK wiring.

---

## 8. Constraint doctrine

Every important table must carry explicit constraints, not implied assumptions.

### Required checks

At minimum:

```sql
check (effective_to is null or effective_to >= effective_from)
```

```sql
check (status in (...))
```

If ownership scope is modeled:

```sql
check (
  (ownership_level = 'tenant' and legal_entity_id is null and business_unit_id is null and location_id is null)
  or
  (ownership_level = 'legal_entity' and legal_entity_id is not null and business_unit_id is null and location_id is null)
  or
  (ownership_level = 'business_unit' and legal_entity_id is not null and business_unit_id is not null and location_id is null)
  or
  (ownership_level = 'location' and legal_entity_id is not null and location_id is not null)
)
```

For financial values, use positivity checks where appropriate, such as credit limits and controlled period states.

### Required uniqueness

Uniqueness must be scoped and explicit.

Plain `unique(code)` is rarely correct in an ERP; scope it by tenant or sub-scope.

---

## 9. Alias and external identity doctrine

001 gives three identity layers.

### 9.1 Array aliases

`aliases text[]` may exist for light synonym/search usage. It is acceptable as a helper.

### 9.2 Governed alias table

For real MDM, use a dedicated alias registry such as `master_aliases` with:

- `master_domain`
- `master_id`
- `alias_type`
- `alias_value`
- source attribution
- preference marker
- effective dates

### 9.3 External identity table

For source-system mapping, use `external_identities` with:

- source system
- external object type
- external ID
- external code
- sync status
- last synced time

#### Final rule (alias / external identity)

If aliasing is governed, **the alias table is the source of truth**.

Array aliases are optional helper/search material, not the authoritative integration surface.

---

## 10. Tenant customization doctrine

001 requires customization to be governed, not improvised.

### Required customization surfaces

- `tenant_policies`
- `custom_field_definitions`
- `custom_field_values`
- `tenant_label_overrides`
- `document_sequences`

### Permanent rule

Customization **must not** replace core relational structure.

JSONB and custom fields are for true extension, not for avoiding proper master/entity modeling. 001 says this explicitly in spirit and examples.

### Numbering rule

ERP numbering rules belong in the database model, not scattered through service code:

- document type
- prefix pattern
- suffix pattern
- next number
- padding
- reset rule
- scope
- default selection

---

## 11. Query doctrine

001 says the schema is incomplete unless the query model is also designed.

### Required query surfaces

- canonical master lookup
- effective-dated current record lookup
- alias-aware lookup
- customization resolution
- scope fallback resolution

### Required query characteristics

- indexed search paths
- canonical “active/current” filters
- tenant-scoped reads
- view-based read surfaces where repetition would drift
- room for denormalized read models where appropriate

### Canonical example

The item-setting resolution rule in 001 is explicit:

**location → business unit → legal entity** fallback.

#### Final rule (query)

Application code must centralize these query surfaces.

Do not let every feature invent its own “active/effective/current” filters.

---

## 12. PostgreSQL feature doctrine

001 is firmly PostgreSQL-first. Use the database engine.

### Required PostgreSQL features

- schemas
- `pgcrypto`
- `jsonb`
- GIN indexes
- partial indexes
- generated columns
- triggers
- views / materialized views
- RLS
- trigram/full-text candidates
- audit stamping
- partitioning only where justified

### Required schemas

At minimum, separate domains such as:

- `ref` — shared reference data (countries, currencies, locales, timezones, …) consumed by masters
- `iam` — authentication-adjacent identity, membership, roles, assignments
- `mdm` — tenants, enterprise structure, MDM masters, customization surfaces
- `finance` — chart of accounts and finance structures
- `governance` — governance and policy surfaces as modeled

The **`drizzle`** PostgreSQL schema holds **Drizzle Kit** metadata (journal / migration tracking); it is not business DDL. New business domains (e.g. `sales`, `procurement`, `inventory`) require an explicit architecture decision and `schemaFilter` / config alignment before use.

**Authoritative tree:** [`008-db-tree.md`](008-db-tree.md) lists registered `*.schema.ts` modules and path rules.

### JSONB rule

Use JSONB for:

- metadata
- policy payloads
- validation rules
- audit diffs
- controlled extension payloads

Do **not** use JSONB to replace relational structures that require FK integrity or transactional line-item correctness.

---

## 13. Audit and versioning doctrine

Every important mutable master table should carry:

- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- `version_no`

And there should also be a separate append-only audit/event history for change history. 001 explicitly calls for that level of enterprise discipline.

### Final rule (audit)

Use `version_no` for optimistic locking where stewardship or concurrent updates matter.

---

## 14. Soft delete doctrine

If soft delete exists, plain uniqueness is not enough.

001 explicitly recommends **partial unique indexes** for optional identifiers and active-state uniqueness.

### Final rule (soft delete)

Whenever a business key may be reused after delete, or may be null, prefer:

```sql
create unique index ...
where ... is not null and is_deleted = false;
```

This is not optional in a serious ERP.

---

## 15. ORM / Drizzle doctrine

001 allows Drizzle, but under discipline.

### Database owns

- PK/FK
- unique constraints
- check constraints
- default timestamps
- generated values
- indexes
- triggers
- views
- RLS
- invariant enforcement

### App / Drizzle owns

- relation mapping
- typed query composition
- migration orchestration
- transactions
- workflow orchestration
- tenant-context propagation
- higher-level command validation beyond pure DB constraints

### Final rule (ORM boundary)

**Database for invariants. App for orchestration.**

That is the permanent boundary.

### Serialization boundary (Zod)

**Zod** (or equivalent) validates and types **untrusted input** and **API payloads** at application boundaries. It must **mirror** PostgreSQL enums and column intent, not replace them:

- Shared enum labels are defined once in Drizzle (`shared/enums.schema.ts`) and reflected in `shared-boundary.schema.ts` / domain `*-boundary.schema.ts` using the same value sets.
- Prefer `safeParse` / `parse` at handlers; keep row-level invariants in **constraints, FKs, and triggers**.

Zod is **not** a substitute for missing `CHECK`, `UNIQUE`, or tenant-safe composite FKs in the database.

---

## 16. Reconciliations required to make 001 safe in real PostgreSQL

This section is the important part you asked for: the guardrails that must be made explicit so 001 does not get implemented sloppily.

### 16.1 Do not store “current active” using a generated column tied to `current_date`

001 gives a conceptual example of `is_active` on `tenant_policies` derived from current date. The correct final rule is:

- treat “current/active as of today” as a **query/view concept**
- do **not** rely on a stored generated column based on moving time

Use canonical views like `v_current_tenant_policies` instead. This preserves 001’s intent while keeping the implementation durable.

### 16.2 Nullable scoped uniqueness needs scope-specific hardening

001’s conceptual uniqueness like:

```sql
unique (tenant_id, legal_entity_id, document_type, sequence_code)
```

is not enough by itself when `legal_entity_id` is nullable, because NULL semantics can let duplicates slip through.

#### Final rule (nullable scope)

For mixed-scope tables such as `document_sequences`, enforce uniqueness with:

- one rule for tenant-wide rows (`legal_entity_id is null`)
- one rule for legal-entity-scoped rows (`legal_entity_id is not null`)

This is a critical guardrail and should be treated as permanent practice.

### 16.3 Soft delete plus alternate keys always needs partial indexing

If you keep `registration_number`, `tax_registration_number`, or alias values, never trust plain unique constraints once `is_deleted` exists.

### 16.4 Arrays are helpers, not governance

If both `aliases text[]` and `master_aliases` exist, the governed alias table is the source of truth. Arrays are optional helper/search material only.

### 16.5 Composite tenant-safe FK is the default when tenant leakage is possible

Do not simplify it away later “for convenience.”

### 16.6 RLS is powerful, but only after request/session tenant context is stable

001 itself warns that RLS is strong but assumes mature session management. Keep the design ready, but do not enable it blindly.

### 16.7 JSONB is for controlled flexibility, never for relational laziness

Do not push finance postings, legal-entity ownership, or core transactional relationships into JSONB blobs.

### 16.8 Effective-dated no-overlap is an advanced integrity step, not a casual app rule

001 requires date validity now. If later you need non-overlapping ranges per scoped key, use PostgreSQL range/exclusion mechanics rather than hand-waving it in app code.

These are the guardrails that turn 001 from “good blueprint” into “safe baseline.”

---

## 17. Permanent forbidden moves

These are now disallowed under 001-FINAL.

- Do **not** replace tenant-safe composite FK with simple `id` FK where tenant correctness matters.
- Do **not** replace governed alias/external identity surfaces with ad hoc text columns.
- Do **not** hide document numbering rules only in service code.
- Do **not** move invariant enforcement out of PostgreSQL into app-only logic.
- Do **not** use JSONB to avoid real relational design.
- Do **not** assume plain unique constraints are enough when soft delete or nullable scope exists.
- Do **not** partition small master tables early.
- Do **not** let every feature invent its own current/effective filter logic.

All of these violate the spirit or explicit doctrine of 001.

---

## 18. Permanent implementation order

001 is explicit on the correct order:

### Step 1

Canonical PostgreSQL DDL:

- schemas
- tables
- PK/FK
- checks
- unique constraints
- indexes
- triggers
- views
- helper functions

### Step 2

Drizzle mirror:

- modular schema files
- reusable columns
- enums
- relations
- typed JSONB
- migration coordination

### Step 3

Canonical query layer:

- effective/current views
- lookup queries
- fallback resolution
- runtime orchestration

That order is permanent unless you formally replace the baseline.

---

## 19. Final charter sentence

This is the shortest possible permanent statement of 001-FINAL:

> **AFENDA’s ERP database is a PostgreSQL-first, tenant-centered MDM architecture in six layers, using UUID surrogate PKs plus scoped business keys, tenant-safe composite FKs where correctness matters, effective-dated and soft-delete-aware integrity, governed alias/external identity/customization surfaces, canonical query views, and database-owned invariants mirrored by Drizzle rather than replaced by it.**

---

## 20. Operating rule from today

Use this rule without exception:

- **001-FINAL is doctrine**
- later files are implementation attempts
- if later files conflict with 001-FINAL, the later files are wrong until 001 is formally superseded

That is the clean, strict, complete version you asked for.

---

## Appendix A — `@afenda/database` package doctrine

This appendix subsumes the former `docs/DATABASE_ARCHITECTURE_DOCTRINE.md`. It states **package-level** rules that sit above any single table list: what the database package is for, how kinds of truth differ, and how documentation may be classified. The numbered sections above remain the **sovereign ERP/PostgreSQL charter**; where they overlap, those sections win.

### A.1 Purpose

`@afenda/database` is the **canonical PostgreSQL and Drizzle persistence boundary** for Afenda. It owns the durable relational model, authoritative schema and migrations, and invariants that must not rely only on application code. It is **not** a grab-bag of convenience tables, a mirror of every product idea before implementation, or a place where future ERP design and present runtime truth are mixed without labels.

### A.2 Doctrine vs baseline vs proposal

**Doctrine** (this document’s enduring rules) should survive multiple implementation phases. **Baseline** is what exists in the package today. **Proposal** is what might be built next. **Source/reference** material is exploratory or non-normative. Doctrine should change only when architecture changes—not because one migration landed.

### A.3 Core truth boundaries

Keep these separated in the model and in documentation:

| Boundary                 | Answers                                                                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication truth** | Who signed in, how, external auth identity, session/challenge state for audit correlation. Not ERP business truth.                  |
| **Principal truth**      | Internal actors, identity linkage to providers, tenant membership—moving from “who authenticated” to “who can act in Afenda”.       |
| **Tenant truth**         | Which organization owns data, isolation of rows, membership of principals. Not a mere filter tag.                                   |
| **Business truth**       | Domain state the product exists to manage (structure, masters, finance, transactions). Must not be collapsed into auth-only tables. |
| **Evidence truth**       | Append-oriented audit/governance used to explain actions after the fact—distinct from transactional truth.                          |

### A.4 Identity is not domain party

**Identity / principal** (who can act in the system) and **domain party** (customer, supplier, employee, contact) are different concepts. The same person may appear in both; tables must not be merged. Model identity and business entities separately and link explicitly when needed.

### A.5 Present truth vs planned truth

Do not mix, without labels:

- what the package **currently** implements, and
- what it is **expected** to implement later.

Current-state descriptions must match active code. Growth-sequence content must be labeled future-oriented. Slipping between the two makes docs unreliable.

### A.6 Documentation classes

Under `packages/_database/docs`:

- **Current-state** — only what exists in the active package (e.g. inventory/tree baselines).
- **Doctrine** — enduring principles (this charter + appendix).
- **Growth** — phased direction; labeled as future.
- **Source/reference** — exploration; marked non-normative.

### A.7 Phased package growth (alignment with the six layers)

Intentional build order for the **package** (related to **§3** layers and **§18** implementation order):

1. Identity and tenant root
2. Tenant membership and minimal principal context
3. Business organization structure
4. Authorization model
5. MDM and business master structures
6. Stewardship and governance extensions
7. Richer audit enrichment around stabilized workflows

Skipping order risks upstream concepts on unstable foundations.

### A.8 Decision checklist for schema changes

When evaluating a change, ask:

1. Which truth boundary (**A.3**) does this belong to?
2. Is it tenant-scoped where it should be?
3. Is it current truth or future design—and is the doc labeled?
4. What invariants belong in PostgreSQL?
5. Does it fit the current phase, or is it premature?

If these are unclear, the design is not ready.

### A.9 Maintenance

Update **this charter** when **architecture or non-negotiable rules** change. Update **baseline/inventory** docs (e.g. `008-db-tree.md`) when tables or exports change. Do not edit the charter only because a single table was added—unless that addition changes doctrine.

---

## Appendix B — `@afenda/database` implementation alignment

This appendix ties **§1–§20** and **Appendix A** to the **current** monorepo package so doctrine and code do not drift. If Appendix B conflicts with numbered charter sections above, the charter wins.

### B.1 Drizzle-managed PostgreSQL schemas

`drizzle.config.ts` and **`DRIZZLE_MANAGED_PG_SCHEMAS`** define what Drizzle Kit may reconcile: **`iam`**, **`mdm`**, **`ref`**, **`finance`**, **`governance`**, plus the **`drizzle`** schema for Kit’s own tables. Adding a new top-level `pgSchema()` domain is an **architecture** change (config, migrations, docs), not a drive-by rename.

### B.2 Enums, columns, and Zod boundaries

| Concern                                  | Location                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| Shared `pgEnum` catalog                  | `src/schema/shared/enums.schema.ts`                                          |
| Zod mirrors derived from enum value sets | `src/schema/shared/shared-boundary.schema.ts`, domain `*-boundary.schema.ts` |
| Reusable column shapes                   | `src/schema/shared/columns.schema.ts`                                        |

Do not scatter duplicate enum string literals in apps; derive from these sources or import the Zod schemas.

### B.3 Logical `tenancy/` vs physical `mdm` / `iam`

The folder **`src/schema/tenancy/`** is a **logical** module (services, boundary re-exports). Physical tables for tenants and memberships remain under **`mdm`** and **`iam`** as listed in [`008-db-tree.md`](008-db-tree.md).

### B.4 Quality gates (migrations and schema edits)

Before `drizzle-kit generate` / `push`, run **`pnpm run db:guard`** from `packages/_database` (TypeScript, `guard-schema-modules.ts`, hardening verification, contract tests). CI should run **`db:guard:ci`** or equivalent. Filenames under DDL domains must follow `*.schema.ts` / `_schema.ts` / `index.ts` rules—see `scripts/guard-schema-modules.ts`.

### B.5 SQL examples in this charter vs Drizzle DDL

Sections **§5–§8** use illustrative SQL. Production modules express the same invariants through Drizzle **`pgTable`**, **`check`**, **`uniqueIndex`**, **`foreignKey`**, and SQL hardening patches where applicable. When in doubt, compare to an existing table in the same layer and to [`practical-discipline.md`](../practical-discipline.md).

### B.6 Quick compliance checklist (DDL / Drizzle)

Use this when reviewing a migration or schema PR:

1. Tenant-scoped rows have **`tenant_id`** (or equivalent) where required; composite FKs used where cross-tenant mistakes are possible (**§7**).
2. Effective dates satisfy **`effective_to >= effective_from`** (or null) (**§8**, **§16.1**).
3. Nullable scope columns do not weaken uniqueness—partial or split uniqueness (**§16.2**).
4. Soft delete + business keys use **partial unique** indexes where needed (**§14**, **§16.3**).
5. Status / small closed sets use **`pgEnum`** or explicit checks aligned with **`shared/enums.schema.ts`**.
6. JSONB is for metadata / extension, not core relational edges (**§12**, **§16.7**).
7. RLS only when session/tenant context is defined (**§16.6**).

---

**Follow-up:** Extend **B.6** into a separate automation-friendly checklist (e.g. ast-grep rules) if you need CI enforcement beyond `db:guard`.

**Path inventory:** [`008-db-tree.md`](./008-db-tree.md) lists authorised paths under `src/schema/`; update it in the same PR as tree changes. **Machine-verified file list:** [`schema-inventory.json`](./schema-inventory.json) — `pnpm run db:inventory:sync` in `packages/_database` when the tree changes. **Foundation target** (namespaces, modules, must-have table families): [`002-foundation-inventory.md`](./002-foundation-inventory.md). **Architecture & tree** (schema + migrations + raw SQL + relations + queries): [`002A-foundation-inventory-architecture.md`](./002A-foundation-inventory-architecture.md).
