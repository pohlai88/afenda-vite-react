Excellent. The missing parts are exactly where an ERP database stops being “a set of tables” and becomes a **governed enterprise data platform**.

What you need now is not only entities, but the full database discipline around them:

- **PK / FK strategy**
- **unique constraints**
- **check constraints**
- **partial indexes**
- **effective-dated integrity**
- **tenant isolation rules**
- **alias / alternate keys**
- **MDM golden record support**
- **JSONB for controlled extensibility**
- **PostgreSQL functions / triggers / generated columns / views**
- **Drizzle patterns for strong typing and migration discipline**

So below I will turn the tenant-centered ERP MDM design into a **production-grade PostgreSQL + Drizzle blueprint**.

---

# 1. What was still missing

From your request, the missing layer is this:

## Structural completeness

You asked for:

- query
- constraint
- PK
- FK
- tenant customization
- alias
- Drizzle / ORM / PostgreSQL features
- important missing parts

The true missing items are broader:

### A. Keys

- surrogate PK
- business key
- alternate key
- composite uniqueness
- external/source key
- natural key preservation

### B. Constraints

- not null
- check
- unique
- exclusion-like logic
- scoped uniqueness
- soft-delete safe uniqueness
- temporal consistency constraints

### C. Queryability

- indexing strategy
- common search paths
- canonical views
- RLS-compatible query pattern
- denormalized read models where needed

### D. Tenant customization

- per-tenant policy
- per-tenant field extension
- per-tenant alias
- per-tenant code generation
- per-tenant master ownership rules

### E. PostgreSQL enterprise features

- schemas
- enums vs lookup tables
- jsonb
- GIN indexes
- generated columns
- views / materialized views
- triggers
- RLS
- partitioning candidates
- audit stamping
- full-text / trigram search candidates
- advisory locking where appropriate

### F. Drizzle discipline

- domain schemas
- enums
- relation declarations
- composite unique index
- migration safety
- typed jsonb
- reusable columns
- RLS awareness at app layer

---

# 2. Foundation design doctrine

For ERP MDM tenant management, every important master table should follow a common shape.

## 2.1 Recommended standard columns

For most tenant-owned master tables:

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

This shape gives you:

- ERP business key (`code`)
- human display (`name`)
- flexible synonyms (`aliases`)
- external system trace (`external_ref`)
- lifecycle (`status`)
- temporal governance (`effective_from`, `effective_to`)
- soft deletion (`is_deleted`)
- audit trail support (`created_at`, `updated_at`)
- extensibility (`metadata`)

---

## 2.2 Surrogate key + business key together

Never choose only one.

### Use:

- **surrogate key**: `id uuid`
- **business key**: `tenant_id + code`
- **alternate keys**: registration no, tax no, external ref, alias, etc.

Why:

- surrogate PK is stable for joins
- business key is meaningful for ERP operations
- alternate keys support MDM reconciliation and import

---

# 3. Key strategy

This is one of the most important missing parts.

## 3.1 Primary key strategy

Use:

```sql
id uuid primary key
```

Why not composite PK everywhere?
Because:

- foreign keys become large and repetitive
- ORM relations become noisy
- refactoring is harder
- API identity becomes awkward

But do **not** stop there.

---

## 3.2 Business uniqueness strategy

For tenant-owned entities:

```sql
unique (tenant_id, code)
```

For legal-entity owned entities:

```sql
unique (tenant_id, legal_entity_id, code)
```

For location-scoped entities:

```sql
unique (tenant_id, legal_entity_id, location_id, code)
```

This is the ERP-safe uniqueness pattern.

---

## 3.3 Alternate key strategy

Examples:

### Legal entity

```sql
unique (tenant_id, registration_number)
unique (tenant_id, tax_registration_number)
```

Only if not null. Best done via partial unique indexes.

### Party

```sql
unique (tenant_id, canonical_name, party_type)
```

Often too strict for production, so instead use:

- match rules
- duplicate candidate tables
- optional partial uniqueness on trusted IDs

---

# 4. Constraint design

This is where correctness lives.

---

## 4.1 Core check constraints

You need hard checks for all master tables.

### Effective date consistency

```sql
check (effective_to is null or effective_to >= effective_from)
```

### Status domain

If using text rather than enum:

```sql
check (status in ('draft', 'active', 'inactive', 'suspended', 'archived'))
```

### Ownership consistency

If you model ownership level:

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

This is extremely important.

### Currency positive precision

```sql
check (credit_limit_amount is null or credit_limit_amount >= 0)
```

### Closed-open period rule

```sql
check (period_status in ('open', 'soft_closed', 'hard_closed'))
```

---

## 4.2 Scoped referential integrity rule

A common ERP mistake is this:

- child row references a parent row from another tenant

Normal FK does not stop all cross-tenant leakage if only `id` is referenced.

So where correctness matters, use **composite FK with tenant_id**.

Example:

```sql
legal_entities (
  id uuid primary key,
  tenant_id uuid not null,
  unique (tenant_id, id)
)

business_units (
  ...
  tenant_id uuid not null,
  legal_entity_id uuid not null,
  foreign key (tenant_id, legal_entity_id)
    references legal_entities (tenant_id, id)
)
```

This is far safer than `foreign key (legal_entity_id) references legal_entities(id)` alone.

This is one of the most important missing enterprise-grade patterns.

---

# 5. Alias model

You mentioned alias. In MDM, alias is critical.

There are **three types** of alias you should support.

---

## 5.1 Simple aliases as array

Useful for search and UI.

```sql
aliases text[] not null default '{}'
```

Pros:

- simple
- fast for basic use
- easy GIN indexing

Cons:

- weak governance
- no effective dating
- no source attribution

Good for light aliasing only.

---

## 5.2 Strong alias table

For serious ERP MDM, use a dedicated table.

### Example: `master_aliases`

```sql
master_aliases
--------------
id                      uuid pk
tenant_id               uuid not null
master_domain           varchar not null
master_id               uuid not null
alias_type              varchar not null   -- short_name, external_code, legacy_code, search_synonym
alias_value             varchar not null
source_system_id        uuid null
is_preferred            boolean not null default false
effective_from          date not null default current_date
effective_to            date null
created_at              timestamptz not null default now()
unique (tenant_id, master_domain, alias_type, alias_value)
```

This is much better.

Examples:

- customer legacy code
- supplier old name
- item barcode
- tax alias
- import synonym

---

## 5.3 External identity table

For source-system mapping, use dedicated external identity mapping.

```sql
external_identities
-------------------
id                      uuid pk
tenant_id               uuid not null
master_domain           varchar not null
master_id               uuid not null
source_system_id        uuid not null
external_object_type    varchar not null
external_id             varchar not null
external_code           varchar null
sync_status             varchar not null
last_synced_at          timestamptz null
unique (tenant_id, source_system_id, external_object_type, external_id)
```

This is mandatory if you expect integration.

---

# 6. Tenant customization model

This is a major missing area in many schemas.

Tenant customization should not become uncontrolled schema chaos.

You want customization at **three levels**:

- policy
- extensible attributes
- display / terminology / numbering

---

## 6.1 Tenant policy table

Already mentioned conceptually, but it needs structure.

```sql
tenant_policies
---------------
id                      uuid pk
tenant_id               uuid not null
policy_domain           varchar not null   -- finance, sales, inventory, tax, ui, workflow, master_data
policy_key              varchar not null
policy_value            jsonb not null
data_type               varchar not null   -- boolean, integer, numeric, text, json, enum
effective_from          date not null
effective_to            date null
is_active               boolean generated always as (
  effective_to is null or effective_to >= current_date
) stored
created_at              timestamptz not null default now()
unique (tenant_id, policy_domain, policy_key, effective_from)
check (effective_to is null or effective_to >= effective_from)
```

Examples:

- require approval for PO over threshold
- default fiscal calendar
- customer code pattern
- item code prefix
- per-tenant tax rounding mode
- period-close enforcement

---

## 6.2 Extensible attribute model

Do **not** add random columns for every tenant request.

Use a governed EAV-like extension pattern only for true custom fields.

### `custom_field_definitions`

```sql
custom_field_definitions
------------------------
id                      uuid pk
tenant_id               uuid not null
entity_name             varchar not null   -- party, item, legal_entity, location
field_key               varchar not null
field_label             varchar not null
data_type               varchar not null   -- text, number, boolean, date, json, select
is_required             boolean not null default false
is_unique               boolean not null default false
validation_rule         jsonb not null default '{}'::jsonb
options_json            jsonb not null default '{}'::jsonb
status                  varchar not null
unique (tenant_id, entity_name, field_key)
```

### `custom_field_values`

```sql
custom_field_values
-------------------
id                      uuid pk
tenant_id               uuid not null
entity_name             varchar not null
entity_id               uuid not null
custom_field_definition_id uuid not null
value_text              text null
value_number            numeric null
value_boolean           boolean null
value_date              date null
value_json              jsonb null
updated_at              timestamptz not null default now()
unique (tenant_id, entity_name, entity_id, custom_field_definition_id)
```

This should be reserved for **true customization**, not core finance logic.

---

## 6.3 Tenant terminology / label overrides

This is underrated but important.

Different tenants may want:

- customer → client
- business unit → division
- warehouse → depot

Use:

```sql
tenant_label_overrides
----------------------
id                      uuid pk
tenant_id               uuid not null
label_key               varchar not null
default_label           varchar not null
override_label          varchar not null
locale                  varchar not null default 'en'
unique (tenant_id, label_key, locale)
```

This is excellent for enterprise localization and white-labeling.

---

## 6.4 Tenant document numbering rules

Critical for ERP.

```sql
document_sequences
------------------
id                      uuid pk
tenant_id               uuid not null
legal_entity_id         uuid null
document_type           varchar not null
sequence_code           varchar not null
prefix_pattern          varchar not null
suffix_pattern          varchar null
next_number             bigint not null
padding_length          integer not null default 6
reset_rule              varchar not null   -- never, yearly, monthly
is_default              boolean not null default false
status                  varchar not null
unique (tenant_id, legal_entity_id, document_type, sequence_code)
check (next_number > 0)
```

---

# 7. PostgreSQL features you should use

Now we go into the engine itself.

---

## 7.1 Schemas

Use PostgreSQL schemas to separate domains:

- `iam`
- `mdm`
- `finance`
- `governance`
- `sales`
- `procurement`
- `inventory`

This improves:

- clarity
- access control
- migration organization
- discoverability

---

## 7.2 UUID + default generation

Use UUID for PKs. In PostgreSQL:

```sql
gen_random_uuid()
```

Requires `pgcrypto`.

Recommended:

```sql
create extension if not exists pgcrypto;
```

---

## 7.3 JSONB

Use `jsonb` for:

- tenant policy payloads
- metadata
- custom validation rules
- source match rationale
- workflow configuration
- audit diffs

Do **not** use JSONB for:

- legal entity FK structure
- finance posting structure
- transactional line items that need relational integrity

JSONB is for controlled flexibility, not relational laziness.

---

## 7.4 GIN indexes

For JSONB and aliases:

```sql
create index idx_parties_metadata_gin on mdm.parties using gin (metadata);
create index idx_parties_aliases_gin on mdm.parties using gin (aliases);
```

---

## 7.5 Partial indexes

Very important.

### Example: unique registration number only when not deleted

```sql
create unique index uq_legal_entities_registration_active
on mdm.legal_entities (tenant_id, registration_number)
where registration_number is not null and is_deleted = false;
```

This is superior to plain unique constraints for soft-delete environments.

---

## 7.6 Generated columns

Great for normalized search or active flags.

Example:

```sql
canonical_name_normalized text generated always as (lower(regexp_replace(canonical_name, '\s+', ' ', 'g'))) stored
```

Then index it:

```sql
create index idx_parties_canonical_name_normalized on mdm.parties (tenant_id, canonical_name_normalized);
```

Very useful for MDM matching and query performance.

---

## 7.7 Triggers for updated_at

Common and important.

```sql
create or replace function governance.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```

Then attach to core tables.

---

## 7.8 Triggers for tenant consistency

In addition to FK, you can enforce advanced rules via triggers.

Example:

- ensure BU belongs to same legal entity + tenant
- ensure location belongs to same tenant
- ensure role scope matches membership tenant

This is useful where plain FK/check cannot express enough.

---

## 7.9 Full-text or trigram search

For party and item lookup:

```sql
create extension if not exists pg_trgm;
create index idx_parties_name_trgm
on mdm.parties using gin (canonical_name gin_trgm_ops);
```

This is excellent for ERP search boxes.

---

## 7.10 Views and materialized views

Use views for canonical business read models.

Examples:

- active legal entities
- active business units
- golden customers
- item effective settings resolved

### Example:

```sql
create view mdm.v_active_legal_entities as
select *
from mdm.legal_entities
where is_deleted = false
  and status = 'active'
  and (effective_to is null or effective_to >= current_date);
```

Materialized views are useful for:

- MDM match candidates
- financial dimensional rollups
- tenant master completeness dashboard

---

## 7.11 RLS

If you want database-enforced tenant isolation, PostgreSQL RLS is powerful.

Example concept:

```sql
alter table mdm.parties enable row level security;
create policy tenant_isolation_policy
on mdm.parties
using (tenant_id = current_setting('app.tenant_id')::uuid);
```

This is strong, but only use if your app session management is mature enough.

For enterprise SaaS ERP, RLS is often worth it.

---

## 7.12 Partitioning

Candidates:

- audit logs
- event logs
- large transaction headers/lines
- integration staging tables

Do **not** partition small master tables early.

Partition by:

- time for logs
- possibly tenant for ultra-large multi-tenant deployments, but only if necessary

---

# 8. Query design you asked for

You said include query. Good. A database is useless if the query model is poor.

You need standard query surfaces.

---

## 8.1 Canonical master lookup query

### Legal entity lookup

```sql
select
  le.id,
  le.entity_code,
  le.legal_name,
  le.tax_registration_number,
  le.country_code,
  le.status
from mdm.legal_entities le
where le.tenant_id = $1
  and le.is_deleted = false
  and le.status = 'active'
order by le.entity_code;
```

---

## 8.2 Effective-dated current record query

```sql
select *
from mdm.business_units bu
where bu.tenant_id = $1
  and bu.legal_entity_id = $2
  and bu.is_deleted = false
  and bu.effective_from <= current_date
  and (bu.effective_to is null or bu.effective_to >= current_date);
```

---

## 8.3 Alias lookup query

```sql
select p.*
from mdm.parties p
left join mdm.master_aliases a
  on a.tenant_id = p.tenant_id
 and a.master_domain = 'party'
 and a.master_id = p.id
where p.tenant_id = $1
  and (
    p.party_code = $2
    or p.canonical_name ilike '%' || $2 || '%'
    or a.alias_value ilike '%' || $2 || '%'
  );
```

---

## 8.4 Tenant customization resolved query

Example: resolve item local settings with fallback.

```sql
select
  i.id as item_id,
  i.item_code,
  i.item_name,
  coalesce(ies_loc.sales_account_id, ies_bu.sales_account_id, ies_le.sales_account_id) as sales_account_id
from mdm.items i
left join mdm.item_entity_settings ies_loc
  on ies_loc.item_id = i.id
 and ies_loc.tenant_id = i.tenant_id
 and ies_loc.legal_entity_id = $2
 and ies_loc.business_unit_id = $3
 and ies_loc.location_id = $4
left join mdm.item_entity_settings ies_bu
  on ies_bu.item_id = i.id
 and ies_bu.tenant_id = i.tenant_id
 and ies_bu.legal_entity_id = $2
 and ies_bu.business_unit_id = $3
 and ies_bu.location_id is null
left join mdm.item_entity_settings ies_le
  on ies_le.item_id = i.id
 and ies_le.tenant_id = i.tenant_id
 and ies_le.legal_entity_id = $2
 and ies_le.business_unit_id is null
 and ies_le.location_id is null
where i.tenant_id = $1;
```

This is real ERP logic: local override falls back to broader scope.

---

# 9. Missing MDM governance tables

To truly support MDM, you need more than master tables.

---

## 9.1 Data stewardship queue

```sql
data_quality_issues
-------------------
id                      uuid pk
tenant_id               uuid not null
entity_name             varchar not null
entity_id               uuid not null
issue_type              varchar not null   -- duplicate_candidate, missing_tax_id, invalid_address
severity                varchar not null   -- low, medium, high, critical
issue_payload           jsonb not null
status                  varchar not null   -- open, reviewed, resolved, ignored
assigned_to             uuid null
created_at              timestamptz not null default now()
resolved_at             timestamptz null
```

---

## 9.2 Survivorship rules

```sql
survivorship_rules
------------------
id                      uuid pk
tenant_id               uuid not null
master_domain           varchar not null
attribute_name          varchar not null
rule_type               varchar not null   -- source_priority, most_recent, non_null_preferred, manual
rule_config             jsonb not null
priority                integer not null
status                  varchar not null
unique (tenant_id, master_domain, attribute_name, priority)
```

This is proper MDM.

---

# 10. Concrete PostgreSQL DDL example

Let me show you a production-style example for core tenant tables.

---

## 10.1 Extensions

```sql
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
```

---

## 10.2 Tenant table

```sql
create schema if not exists mdm;
create schema if not exists governance;

create table mdm.tenants (
  id uuid primary key default gen_random_uuid(),
  tenant_code varchar(50) not null,
  tenant_name varchar(200) not null,
  tenant_type varchar(30) not null,
  status varchar(20) not null,
  base_currency_code char(3) not null,
  reporting_currency_code char(3),
  default_locale varchar(20) not null,
  default_timezone varchar(100) not null,
  country_code char(2) not null,
  activation_date date,
  deactivation_date date,
  mdm_governance_level varchar(20) not null,
  aliases text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  version_no integer not null default 1,

  constraint uq_tenants_tenant_code unique (tenant_code),

  constraint ck_tenants_status
    check (status in ('draft', 'active', 'suspended', 'archived')),

  constraint ck_tenants_type
    check (tenant_type in ('enterprise', 'group', 'franchise', 'nonprofit', 'holding')),

  constraint ck_tenants_mdm_governance_level
    check (mdm_governance_level in ('centralized', 'federated', 'decentralized')),

  constraint ck_tenants_deactivation_date
    check (deactivation_date is null or activation_date is null or deactivation_date >= activation_date)
);

create index idx_tenants_status on mdm.tenants(status) where is_deleted = false;
create index idx_tenants_aliases_gin on mdm.tenants using gin (aliases);
create index idx_tenants_metadata_gin on mdm.tenants using gin (metadata);
```

---

## 10.3 Legal entities

```sql
create table mdm.legal_entities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  entity_code varchar(50) not null,
  legal_name varchar(255) not null,
  trading_name varchar(255),
  entity_type varchar(30) not null,
  registration_number varchar(100),
  tax_registration_number varchar(100),
  country_code char(2) not null,
  base_currency_code char(3) not null,
  status varchar(20) not null,
  aliases text[] not null default '{}',
  external_ref varchar(100),
  effective_from date not null default current_date,
  effective_to date,
  is_deleted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_legal_entities_tenant
    foreign key (tenant_id) references mdm.tenants(id),

  constraint uq_legal_entities_tenant_code
    unique (tenant_id, entity_code),

  constraint ck_legal_entities_status
    check (status in ('draft', 'active', 'inactive', 'archived')),

  constraint ck_legal_entities_type
    check (entity_type in ('company', 'subsidiary', 'branch', 'foundation', 'partnership')),

  constraint ck_legal_entities_effective_date
    check (effective_to is null or effective_to >= effective_from)
);

create unique index uq_legal_entities_registration_active
  on mdm.legal_entities (tenant_id, registration_number)
  where registration_number is not null and is_deleted = false;

create unique index uq_legal_entities_tax_registration_active
  on mdm.legal_entities (tenant_id, tax_registration_number)
  where tax_registration_number is not null and is_deleted = false;

create index idx_legal_entities_tenant_status
  on mdm.legal_entities (tenant_id, status)
  where is_deleted = false;

create index idx_legal_entities_aliases_gin
  on mdm.legal_entities using gin (aliases);
```

---

## 10.4 Business units with tenant-safe FK

```sql
alter table mdm.legal_entities
  add constraint uq_legal_entities_tenant_id_id unique (tenant_id, id);

create table mdm.business_units (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  legal_entity_id uuid not null,
  bu_code varchar(50) not null,
  bu_name varchar(255) not null,
  bu_type varchar(30) not null,
  manager_person_id uuid,
  status varchar(20) not null,
  effective_from date not null default current_date,
  effective_to date,
  aliases text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_business_units_tenant_legal_entity_code
    unique (tenant_id, legal_entity_id, bu_code),

  constraint fk_business_units_tenant_legal_entity
    foreign key (tenant_id, legal_entity_id)
    references mdm.legal_entities (tenant_id, id),

  constraint ck_business_units_type
    check (bu_type in ('division', 'segment', 'line_of_business', 'function')),

  constraint ck_business_units_status
    check (status in ('draft', 'active', 'inactive', 'archived')),

  constraint ck_business_units_effective_date
    check (effective_to is null or effective_to >= effective_from)
);
```

This is the correct pattern.

---

# 11. Drizzle ORM design pattern

Now the Drizzle side.

I will show the structure style, not just isolated tables.

---

## 11.1 Recommended folder structure

```text
packages/db/src/
  schema/
    shared/
      columns.ts
      enums.ts
      helpers.ts
    mdm/
      tenants.ts
      legal-entities.ts
      business-units.ts
      locations.ts
      master-aliases.ts
    iam/
      user-accounts.ts
      tenant-memberships.ts
      tenant-roles.ts
    governance/
      tenant-policies.ts
      custom-fields.ts
      data-quality-issues.ts
  relations/
    mdm-relations.ts
    iam-relations.ts
  functions/
    sql-functions.ts
  views/
    active-legal-entities.ts
```

---

## 11.2 Shared reusable columns

This is very important in Drizzle.

```ts
import {
  boolean,
  date,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const idColumn = {
  id: uuid("id").defaultRandom().primaryKey(),
}

export const tenantColumn = {
  tenantId: uuid("tenant_id").notNull(),
}

export const lifecycleColumns = {
  status: varchar("status", { length: 20 }).notNull(),
  effectiveFrom: date("effective_from")
    .notNull()
    .default(sql`current_date`),
  effectiveTo: date("effective_to"),
  isDeleted: boolean("is_deleted").notNull().default(false),
}

export const auditColumns = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
  versionNo: integer("version_no").notNull().default(1),
}

export const metadataColumn = {
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
}
```

This keeps consistency high.

---

## 11.3 Enums

Drizzle supports `pgEnum`.

```ts
import { pgEnum } from "drizzle-orm/pg-core"

export const tenantStatusEnum = pgEnum("tenant_status", [
  "draft",
  "active",
  "suspended",
  "archived",
])
export const governanceLevelEnum = pgEnum("mdm_governance_level", [
  "centralized",
  "federated",
  "decentralized",
])
export const legalEntityTypeEnum = pgEnum("legal_entity_type", [
  "company",
  "subsidiary",
  "branch",
  "foundation",
  "partnership",
])
```

For stable bounded domains, PostgreSQL enums are good.

For rapidly changing business classifications, use lookup tables instead.

---

## 11.4 Tenant table in Drizzle

```ts
import {
  pgSchema,
  pgTable,
  uniqueIndex,
  index,
  varchar,
  uuid,
  date,
  text,
  jsonb,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { auditColumns, idColumn, metadataColumn } from "../shared/columns"
import { governanceLevelEnum, tenantStatusEnum } from "../shared/enums"

export const mdm = pgSchema("mdm")

export const tenants = mdm.table(
  "tenants",
  {
    ...idColumn,
    tenantCode: varchar("tenant_code", { length: 50 }).notNull(),
    tenantName: varchar("tenant_name", { length: 200 }).notNull(),
    tenantType: varchar("tenant_type", { length: 30 }).notNull(),
    status: tenantStatusEnum("status").notNull(),
    baseCurrencyCode: varchar("base_currency_code", { length: 3 }).notNull(),
    reportingCurrencyCode: varchar("reporting_currency_code", { length: 3 }),
    defaultLocale: varchar("default_locale", { length: 20 }).notNull(),
    defaultTimezone: varchar("default_timezone", { length: 100 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    activationDate: date("activation_date"),
    deactivationDate: date("deactivation_date"),
    mdmGovernanceLevel: governanceLevelEnum("mdm_governance_level").notNull(),
    aliases: text("aliases")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    ...metadataColumn,
    ...auditColumns,
  },
  (table) => ({
    tenantCodeUq: uniqueIndex("uq_tenants_tenant_code").on(table.tenantCode),
    statusIdx: index("idx_tenants_status").on(table.status),
  })
)
```

---

## 11.5 Legal entities with composite FK in Drizzle

```ts
import {
  foreignKey,
  uniqueIndex,
  index,
  varchar,
  uuid,
  date,
  text,
} from "drizzle-orm/pg-core"
import { tenants } from "./tenants"

export const legalEntities = mdm.table(
  "legal_entities",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    entityCode: varchar("entity_code", { length: 50 }).notNull(),
    legalName: varchar("legal_name", { length: 255 }).notNull(),
    tradingName: varchar("trading_name", { length: 255 }),
    entityType: legalEntityTypeEnum("entity_type").notNull(),
    registrationNumber: varchar("registration_number", { length: 100 }),
    taxRegistrationNumber: varchar("tax_registration_number", { length: 100 }),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    baseCurrencyCode: varchar("base_currency_code", { length: 3 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    aliases: text("aliases")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    effectiveFrom: date("effective_from")
      .notNull()
      .default(sql`current_date`),
    effectiveTo: date("effective_to"),
    isDeleted: boolean("is_deleted").notNull().default(false),
    ...metadataColumn,
    ...auditColumns,
  },
  (table) => ({
    tenantCodeUq: uniqueIndex("uq_legal_entities_tenant_code").on(
      table.tenantId,
      table.entityCode
    ),
    tenantStatusIdx: index("idx_legal_entities_tenant_status").on(
      table.tenantId,
      table.status
    ),
  })
)
```

For more advanced composite FK references, you may need raw SQL migration alongside Drizzle schema declarations, depending on exact version and convenience.

That is normal in serious PostgreSQL work.

---

# 12. What should be ORM-managed vs database-managed

This matters a lot.

## Let database manage:

- PK/FK
- unique constraints
- check constraints
- default timestamps
- generated values
- indexes
- row-level security
- triggers for integrity and audit stamping
- views/materialized views

## Let Drizzle/app manage:

- relation mapping
- typed query composition
- migration orchestration
- transactional services
- command validation beyond pure DB constraints
- tenant context propagation

Do not put all correctness in app code.
Do not put all business logic in DB either.

Use **database for invariant enforcement**, app for **workflow orchestration**.

---

# 13. Missing but critical enterprise features

These are often forgotten.

---

## 13.1 Soft-delete-aware uniqueness

If using soft delete, never rely on plain `unique` alone for optional fields.

Use partial unique indexes:

- active customer codes
- active registration numbers
- active aliases

---

## 13.2 Versioning / optimistic locking

Use:

```sql
version_no integer not null default 1
```

App updates should do:

```sql
update ...
set ..., version_no = version_no + 1
where id = $1 and version_no = $2
```

This is useful for MDM stewardship screens.

---

## 13.3 Temporal integrity

At least enforce:

- `effective_to >= effective_from`

If you later want no overlapping ranges for same entity key, PostgreSQL can do it with range/exclusion mechanics, but that is a more advanced phase.

---

## 13.4 Canonical “active” views

Do not repeat active filters in 500 places.

Create views like:

- `v_active_tenants`
- `v_active_legal_entities`
- `v_active_business_units`
- `v_current_tenant_policies`

This reduces drift.

---

## 13.5 Audit trail

At minimum, every important master table should have:

- created_at
- updated_at
- created_by
- updated_by
- version_no

And a separate append-only audit/event table for change history.

---

## 13.6 Code generation / naming rules

ERP needs code generation logic:

- customer code
- supplier code
- item code
- journal number
- invoice number

Do not bury this in random service code only.

Store rules in DB:

- sequence config
- prefix pattern
- scope
- reset rule

---

# 14. Suggested complete master table template

This is my recommended standard template for most tenant MDM tables:

```sql
id uuid primary key default gen_random_uuid(),
tenant_id uuid not null,
code varchar(50) not null,
name varchar(255) not null,
status varchar(20) not null,
aliases text[] not null default '{}',
external_ref varchar(100),
source_system_id uuid,
ownership_level varchar(20) not null default 'tenant',
legal_entity_id uuid,
business_unit_id uuid,
location_id uuid,
effective_from date not null default current_date,
effective_to date,
metadata jsonb not null default '{}'::jsonb,
is_deleted boolean not null default false,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
created_by uuid,
updated_by uuid,
version_no integer not null default 1,

unique (...business scope..., code),

check (effective_to is null or effective_to >= effective_from),
check (status in (...)),
check (ownership_level in (...)),
check (...ownership scope consistency...)
```

This template is extremely strong for ERP MDM.

---

# 15. My final architectural recommendation

For AFENDA-quality enterprise database design, I would formalize the tenant MDM layer as:

## Layer 1 — Business truth root

- tenants
- tenant_profiles
- tenant_policies
- tenant_label_overrides
- document_sequences

## Layer 2 — Enterprise structure

- legal_entities
- business_units
- locations
- org_units

## Layer 3 — Security scope

- tenant_memberships
- roles
- role_assignments
- authority_policies

## Layer 4 — MDM business masters

- parties
- customers
- suppliers
- items
- item_entity_settings
- accounts
- tax profiles

## Layer 5 — MDM governance

- master_aliases
- external_identities
- survivorship_rules
- duplicate matches
- merge history
- data quality issues

## Layer 6 — Platform-grade database mechanics

- partial indexes
- GIN indexes
- triggers
- views
- RLS
- audit trail
- generated columns
- controlled JSONB

That is no longer a generic database. That is a real ERP backbone.

---

# 16. Clear verdict

The missing parts you mentioned should be handled like this:

| Concern             | Recommended approach                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| PK                  | `uuid primary key`                                                                                      |
| FK                  | composite tenant-safe FK where correctness matters                                                      |
| Unique              | scoped by tenant / legal entity / location                                                              |
| Alias               | dedicated alias table, not only array                                                                   |
| Tenant customize    | policy table + custom field definition/value + label override + sequences                               |
| Query               | canonical active views + indexed current/effective queries                                              |
| Constraints         | checks for status, dates, ownership, positive amounts, scope consistency                                |
| PostgreSQL features | schemas, pgcrypto, jsonb, gin, partial indexes, trigram, triggers, views, RLS                           |
| Drizzle             | reusable columns, pgEnum, modular schema files, relations, raw SQL for advanced DB features when needed |

---

# 17. Best next step

The right next output is no longer just explanation.

It should be one of these two:

## Option A — full PostgreSQL DDL pack

I write:

- schemas
- tables
- PK/FK
- indexes
- checks
- triggers
- views
- helper functions

## Option B — full Drizzle schema pack

I write:

- `pgSchema`
- `pgTable`
- enums
- shared column builders
- relations
- indexes
- migration notes
- tenant-safe patterns

The best order is actually:

> **PostgreSQL canonical DDL first, then Drizzle mirror second**

because PostgreSQL is the true source of integrity, and Drizzle should reflect it — not define weaker substitutes.

Reply with:
**“Give me the full canonical PostgreSQL DDL first”**
and I will draft the full enterprise tenant-MDM schema end to end.
