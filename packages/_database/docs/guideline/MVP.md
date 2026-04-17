Yes — the right center is **Tenant Master Data**, not DevOps.

For an ERP, tenant management is not “workspace provisioning.” It is the **governed business identity layer** that controls:

- who the enterprise is,
- how it is structured,
- which legal/reporting boundaries exist,
- which master data is shared vs isolated,
- who can act where,
- which policies, currencies, tax rules, calendars, and charts apply.

So the database should be designed as an **MDM-first ERP tenant model**, where tenant is a **business governance root**, not a technical container.

---

# 1. Core design position

## What “Tenant Management” should mean in ERP

In ERP, a tenant is usually the top-most commercial and governance boundary.

It should own:

- enterprise identity
- legal entities
- business units
- branches / locations
- org structure
- fiscal setup
- base currency / reporting currency
- localization policies
- chart of accounts policy
- item / customer / supplier master ownership
- user membership and access scope
- intercompany relationships
- audit and data ownership boundaries

So your schema should be:

> **Tenant → Enterprise Governance → Master Data Ownership → Transaction Authorization**

Not:

> Tenant → Deployment / cluster / environment / DevOps

---

# 2. ERP MDM principles for tenant design

A good tenant-centered MDM schema should follow these principles.

## A. Tenant is the governance root

Every master record must know whether it is:

- global/shared
- tenant-owned
- legal-entity-owned
- business-unit-owned
- site/location-owned

## B. Business identity must be separated from user identity

Do not mix:

- login account
- employee/person
- tenant membership
- business role
- approval authority

These are different things.

## C. Legal structure must be first-class

ERP cannot stop at “organization.”

You need:

- tenant
- legal entity
- branch
- establishment
- warehouse
- cost center
- department
- project
- profit center

## D. Master data must support golden record + local extension

MDM means:

- one canonical customer/item/supplier/employee record
- local per-tenant/per-entity extensions
- controlled deduplication
- survivorship / source precedence
- versioning / status governance

## E. Access must be scoped by business boundary

A user is not merely “in a tenant.”

A user may be limited to:

- one legal entity
- selected business units
- certain locations
- certain functions
- read-only on some dimensions
- approval rights up to thresholds

## F. Transactions should reference master data through governed ownership

A sales invoice should not point only to `tenant_id`.
It should also resolve:

- legal entity
- branch/location
- customer master
- currency/tax context
- document series/policy

---

# 3. Recommended domain architecture

I would split the ERP database into these domains:

## 1) Identity & Access

Technical + human identity

- user_account
- person
- employee
- tenant_membership
- role
- permission
- policy_scope
- delegation

## 2) Tenant Governance MDM

The heart of your ask

- tenant
- tenant_profile
- tenant_configuration
- tenant_policy
- tenant_brand
- tenant_calendar
- tenant_currency_policy
- tenant_localization_policy

## 3) Enterprise Structure MDM

Business structure

- legal_entity
- business_unit
- department
- cost_center
- profit_center
- project
- location
- warehouse
- store
- plant
- org_unit

## 4) Party MDM

Shared business counterparties

- party
- customer
- supplier
- contact
- address
- bank_account
- tax_registration
- party_relationship

## 5) Product / Service MDM

Commercial master

- item
- item_variant
- uom
- category
- brand
- pricing_policy
- tax_classification
- inventory_policy

## 6) Finance MDM

Accounting master

- chart_of_account_set
- account
- fiscal_year
- fiscal_period
- journal_template
- tax_code
- exchange_rate_policy

## 7) Document & Numbering Governance

Operational control

- document_type
- document_series
- approval_workflow
- approval_rule
- posting_policy

## 8) Audit / Data Governance

MDM discipline

- data_source
- master_record_link
- dedup_candidate
- merge_history
- survivorship_rule
- audit_log
- data_change_request

---

# 4. The central tenant data model

Here is the core MDM-first tenant structure.

## 4.1 Tenant root

### `tenants`

Represents the top-level ERP customer or enterprise boundary.

```sql
tenants
-------
id                      uuid pk
tenant_code             varchar unique not null
tenant_name             varchar not null
tenant_type             varchar not null   -- enterprise, group, franchise, nonprofit, holding
status                  varchar not null   -- draft, active, suspended, archived
base_currency_code      varchar not null
reporting_currency_code varchar null
default_locale          varchar not null
default_timezone        varchar not null
country_code            varchar not null
activation_date         date null
deactivation_date       date null
mdm_governance_level    varchar not null   -- centralized, federated, decentralized
created_at              timestamptz not null
updated_at              timestamptz not null
```

This is not infra. This is business root.

---

## 4.2 Tenant profile

### `tenant_profiles`

Descriptive enterprise master profile.

```sql
tenant_profiles
---------------
tenant_id                uuid pk fk -> tenants.id
registered_name          varchar not null
trading_name             varchar null
registration_number      varchar null
tax_group_number         varchar null
industry_code            varchar null
website                  varchar null
contact_email            varchar null
contact_phone            varchar null
primary_address_id       uuid null
logo_asset_id            uuid null
```

---

## 4.3 Tenant policy

### `tenant_policies`

Defines governance defaults.

```sql
tenant_policies
---------------
id                       uuid pk
tenant_id                uuid not null fk
policy_type              varchar not null
policy_key               varchar not null
policy_value_json        jsonb not null
effective_from           date not null
effective_to             date null
status                   varchar not null
unique (tenant_id, policy_type, policy_key, effective_from)
```

Examples:

- fiscal year pattern
- approval matrix mode
- customer code generation rule
- item naming rule
- intercompany posting policy
- period close rules
- document revision rules

---

## 4.4 Tenant membership

### `tenant_memberships`

Connects users to business boundary.

```sql
tenant_memberships
------------------
id                       uuid pk
tenant_id                uuid not null fk
user_account_id          uuid not null fk
person_id                uuid null fk
membership_status        varchar not null   -- invited, active, suspended, revoked
membership_type          varchar not null   -- employee, partner, auditor, consultant
joined_at                timestamptz not null
ended_at                 timestamptz null
default_legal_entity_id  uuid null
default_business_unit_id uuid null
default_location_id      uuid null
unique (tenant_id, user_account_id)
```

Important:
This is not role yet. This is only membership.

---

## 4.5 Tenant scoped roles

### `tenant_roles`

```sql
tenant_roles
------------
id                       uuid pk
tenant_id                uuid not null fk
role_code                varchar not null
role_name                varchar not null
role_category            varchar not null   -- finance, procurement, sales, hr, admin, audit
is_system_role           boolean not null default false
unique (tenant_id, role_code)
```

### `tenant_role_assignments`

```sql
tenant_role_assignments
-----------------------
id                       uuid pk
tenant_membership_id     uuid not null fk
tenant_role_id           uuid not null fk
scope_type               varchar not null   -- tenant, legal_entity, business_unit, location, warehouse
scope_id                 uuid null
effective_from           date not null
effective_to             date null
```

This is critical. Role assignment must be scope-aware.

---

# 5. Enterprise structure MDM under tenant

This is where ERP becomes serious.

## 5.1 Legal entities

### `legal_entities`

```sql
legal_entities
--------------
id                       uuid pk
tenant_id                uuid not null fk
entity_code              varchar not null
legal_name               varchar not null
trading_name             varchar null
entity_type              varchar not null   -- company, branch, subsidiary, foundation
registration_number      varchar null
tax_registration_number  varchar null
country_code             varchar not null
base_currency_code       varchar not null
fiscal_calendar_id       uuid null
status                   varchar not null
effective_from           date not null
effective_to             date null
unique (tenant_id, entity_code)
```

This is mandatory in ERP.
One tenant may own multiple legal entities.

---

## 5.2 Business units

### `business_units`

```sql
business_units
--------------
id                       uuid pk
tenant_id                uuid not null fk
legal_entity_id          uuid not null fk
bu_code                  varchar not null
bu_name                  varchar not null
bu_type                  varchar not null   -- division, segment, line_of_business
manager_person_id        uuid null
status                   varchar not null
effective_from           date not null
effective_to             date null
unique (tenant_id, legal_entity_id, bu_code)
```

---

## 5.3 Locations / branches / warehouses

### `locations`

```sql
locations
---------
id                       uuid pk
tenant_id                uuid not null fk
legal_entity_id          uuid not null fk
business_unit_id         uuid null fk
location_code            varchar not null
location_name            varchar not null
location_type            varchar not null   -- branch, office, warehouse, store, plant
address_id               uuid null
timezone                 varchar not null
country_code             varchar not null
is_operating_site        boolean not null default true
status                   varchar not null
unique (tenant_id, legal_entity_id, location_code)
```

---

## 5.4 Generic org units

Instead of hardcoding too many structures, add a generalized organizational unit model.

### `org_units`

```sql
org_units
---------
id                       uuid pk
tenant_id                uuid not null fk
legal_entity_id          uuid null fk
parent_org_unit_id       uuid null fk
unit_code                varchar not null
unit_name                varchar not null
unit_type                varchar not null   -- department, cost_center, profit_center, team, region
owner_person_id          uuid null
status                   varchar not null
effective_from           date not null
effective_to             date null
unique (tenant_id, unit_code)
```

This supports hierarchy and future growth.

---

# 6. MDM ownership model

This is one of the most important pieces.

Every master record should know its ownership level.

## 6.1 Ownership pattern

Use these columns broadly across master tables:

```sql
ownership_level          varchar not null
tenant_id                uuid not null
legal_entity_id          uuid null
business_unit_id         uuid null
location_id              uuid null
```

Where `ownership_level` could be:

- `global`
- `tenant`
- `legal_entity`
- `business_unit`
- `location`

This allows:

- shared item catalog across tenant
- entity-specific customer settings
- branch-specific warehouse policy
- local price overrides

---

# 7. Party MDM model

ERP master data lives heavily in parties.

## 7.1 Canonical party

### `parties`

```sql
parties
-------
id                       uuid pk
tenant_id                uuid not null fk
party_code               varchar not null
party_type               varchar not null   -- person, organization
display_name             varchar not null
canonical_name           varchar not null
status                   varchar not null   -- draft, active, blocked, archived
mdm_status               varchar not null   -- golden, candidate, duplicate, merged
source_system_id         uuid null
golden_record_id         uuid null
created_at               timestamptz not null
updated_at               timestamptz not null
unique (tenant_id, party_code)
```

## 7.2 Customer / supplier specialization

### `customers`

```sql
customers
---------
party_id                 uuid pk fk -> parties.id
tenant_id                uuid not null fk
customer_group_id        uuid null
credit_limit_amount      numeric(18,2) null
payment_term_id          uuid null
tax_profile_id           uuid null
pricing_profile_id       uuid null
customer_status          varchar not null
```

### `suppliers`

```sql
suppliers
---------
party_id                 uuid pk fk -> parties.id
tenant_id                uuid not null fk
supplier_group_id        uuid null
payment_term_id          uuid null
withholding_tax_profile_id uuid null
procurement_policy_id    uuid null
supplier_status          varchar not null
```

---

# 8. Product MDM model

## 8.1 Canonical item

### `items`

```sql
items
-----
id                       uuid pk
tenant_id                uuid not null fk
item_code                varchar not null
item_name                varchar not null
item_type                varchar not null   -- inventory, service, asset, expense
base_uom_code            varchar not null
category_id              uuid null
brand_id                 uuid null
tax_classification_id    uuid null
valuation_method         varchar null       -- fifo, moving_average, standard
status                   varchar not null
mdm_status               varchar not null
unique (tenant_id, item_code)
```

## 8.2 Item local extensions

### `item_entity_settings`

```sql
item_entity_settings
--------------------
id                       uuid pk
item_id                  uuid not null fk
tenant_id                uuid not null fk
legal_entity_id          uuid not null fk
business_unit_id         uuid null fk
location_id              uuid null fk
sales_account_id         uuid null
inventory_account_id     uuid null
cogs_account_id          uuid null
price_list_id            uuid null
reorder_policy_json      jsonb null
is_active                boolean not null default true
unique (item_id, legal_entity_id, coalesce(business_unit_id, '000...'), coalesce(location_id, '000...'))
```

This is classic MDM:

- one item master
- local accounting/operational behavior

---

# 9. Finance MDM under tenant

## 9.1 Chart of accounts set

### `chart_of_account_sets`

```sql
chart_of_account_sets
---------------------
id                       uuid pk
tenant_id                uuid not null fk
coa_code                 varchar not null
coa_name                 varchar not null
status                   varchar not null
is_group_chart           boolean not null default false
unique (tenant_id, coa_code)
```

## 9.2 Accounts

### `accounts`

```sql
accounts
--------
id                       uuid pk
tenant_id                uuid not null fk
coa_set_id               uuid not null fk
account_code             varchar not null
account_name             varchar not null
account_type             varchar not null   -- asset, liability, equity, revenue, expense
posting_type             varchar not null   -- posting, heading
parent_account_id        uuid null
normal_balance           varchar not null   -- debit, credit
is_control_account       boolean not null default false
status                   varchar not null
unique (coa_set_id, account_code)
```

## 9.3 Entity-COA assignment

### `legal_entity_coa_assignments`

```sql
legal_entity_coa_assignments
----------------------------
id                       uuid pk
tenant_id                uuid not null fk
legal_entity_id          uuid not null fk
coa_set_id               uuid not null fk
effective_from           date not null
effective_to             date null
unique (legal_entity_id, effective_from)
```

---

# 10. Tenant-aware fiscal and compliance setup

## 10.1 Fiscal calendars

### `fiscal_calendars`

```sql
fiscal_calendars
----------------
id                       uuid pk
tenant_id                uuid not null fk
calendar_code            varchar not null
calendar_name            varchar not null
calendar_type            varchar not null   -- monthly, 4-4-5, custom
start_month              int not null
status                   varchar not null
unique (tenant_id, calendar_code)
```

## 10.2 Fiscal periods

### `fiscal_periods`

```sql
fiscal_periods
--------------
id                       uuid pk
tenant_id                uuid not null fk
fiscal_calendar_id       uuid not null fk
period_code              varchar not null
period_name              varchar not null
start_date               date not null
end_date                 date not null
period_status            varchar not null   -- open, soft_closed, hard_closed
year_number              int not null
period_number            int not null
unique (fiscal_calendar_id, period_code)
```

---

# 11. Recommended MDM governance tables

This is what makes it MDM instead of ordinary CRUD.

## 11.1 Source systems

### `data_sources`

```sql
data_sources
------------
id                       uuid pk
tenant_id                uuid not null fk
source_code              varchar not null
source_name              varchar not null
source_type              varchar not null   -- manual, api, import, legacy_erp, crm
priority_rank            int not null
is_authoritative         boolean not null default false
unique (tenant_id, source_code)
```

## 11.2 Master record registry

### `master_records`

```sql
master_records
--------------
id                       uuid pk
tenant_id                uuid not null fk
master_domain            varchar not null   -- customer, supplier, item, account, employee
business_key             varchar not null
golden_record_ref        uuid not null
record_status            varchar not null
survivorship_status      varchar not null
created_at               timestamptz not null
updated_at               timestamptz not null
unique (tenant_id, master_domain, business_key)
```

## 11.3 Duplicate / merge tracking

### `master_record_matches`

```sql
master_record_matches
---------------------
id                       uuid pk
tenant_id                uuid not null fk
master_domain            varchar not null
left_record_id           uuid not null
right_record_id          uuid not null
match_score              numeric(5,2) not null
match_reason_json        jsonb not null
review_status            varchar not null   -- pending, accepted, rejected, merged
reviewed_by              uuid null
reviewed_at              timestamptz null
```

### `master_record_merges`

```sql
master_record_merges
--------------------
id                       uuid pk
tenant_id                uuid not null fk
master_domain            varchar not null
survivor_record_id       uuid not null
merged_record_id         uuid not null
merge_reason             varchar null
merged_by                uuid not null
merged_at                timestamptz not null
```

---

# 12. Access model for ERP tenant management

A proper ERP tenant model should not stop at RBAC.

You need:

- membership
- role
- scope
- authority limit
- segregation of duties

## 12.1 Approval / authority matrix

### `authority_policies`

```sql
authority_policies
------------------
id                       uuid pk
tenant_id                uuid not null fk
policy_code              varchar not null
policy_name              varchar not null
document_type            varchar not null
scope_type               varchar not null
currency_code            varchar not null
min_amount               numeric(18,2) null
max_amount               numeric(18,2) null
action_code              varchar not null   -- approve, release_payment, post_journal
role_id                  uuid not null
unique (tenant_id, policy_code)
```

This is much more ERP-correct than generic app permissions.

---

# 13. Transaction anchoring pattern

Every transaction table should carry the same ERP business anchors.

For example, sales invoice header should include:

```sql
tenant_id
legal_entity_id
business_unit_id
location_id
customer_party_id
document_type_id
document_series_id
currency_code
exchange_rate_set_id
fiscal_period_id
posting_status
approval_status
```

So every document is anchored to the tenant MDM structure.

---

# 14. Recommended schema layout

For cleanliness, I would separate schemas like this:

## `mdm`

- tenants
- tenant_profiles
- tenant_policies
- legal_entities
- business_units
- org_units
- locations
- parties
- customers
- suppliers
- items
- item_entity_settings
- addresses
- bank_accounts
- tax_registrations

## `iam`

- user_accounts
- persons
- tenant_memberships
- tenant_roles
- tenant_role_assignments
- permissions
- delegations

## `finance`

- chart_of_account_sets
- accounts
- fiscal_calendars
- fiscal_periods
- tax_codes
- exchange_rates

## `governance`

- data_sources
- master_records
- master_record_matches
- master_record_merges
- audit_logs
- change_requests
- approval_policies

## `sales`, `procurement`, `inventory`, `hr`

Transaction domains

---

# 15. Important invariants

These are the rules that keep the model enterprise-grade.

## Tenant invariants

- every legal entity belongs to exactly one tenant
- every business unit belongs to one legal entity and one tenant
- every location belongs to one tenant and one legal entity
- every role assignment must be scoped within the same tenant
- no transaction may reference master data outside its tenant
- master data ownership level must match provided scope columns
- soft delete should not break audit or business keys
- fiscal periods must not overlap within the same calendar
- only one active default configuration per policy type per effective date
- a merged master record cannot be reused as active golden record

---

# 16. What not to do

Avoid these common mistakes.

## 1. Do not model tenant as just app subscription

Too shallow for ERP.

## 2. Do not put everything directly under tenant_id only

You will fail on:

- legal reporting
- branch control
- intercompany
- local tax
- scoped access

## 3. Do not merge person, user, employee, and membership

They have different lifecycles.

## 4. Do not hardcode only one org hierarchy

ERP needs flexible org structures.

## 5. Do not make MDM tables only “lookup tables”

MDM needs:

- status
- ownership
- survivorship
- source traceability
- dedup/merge governance
- effective dating

---

# 17. Minimal core table set to start

If you want a strong Phase 1, start with these first:

## Tenant governance

- tenants
- tenant_profiles
- tenant_policies

## Structure

- legal_entities
- business_units
- locations
- org_units

## Identity

- user_accounts
- persons
- tenant_memberships
- tenant_roles
- tenant_role_assignments

## MDM parties/products

- parties
- customers
- suppliers
- items
- item_entity_settings

## Finance foundation

- chart_of_account_sets
- accounts
- fiscal_calendars
- fiscal_periods

## Governance

- data_sources
- master_records
- master_record_matches
- master_record_merges
- audit_logs

That already gives you a real ERP tenant-centered MDM base.

---

# 18. Best-practice relationship map

```text
Tenant
 ├── Tenant Profile
 ├── Tenant Policies
 ├── Legal Entities
 │    ├── Business Units
 │    │    ├── Locations
 │    │    └── Org Units
 │    └── Fiscal / COA assignments
 ├── Tenant Memberships
 │    ├── Role Assignments
 │    └── Scoped Authorities
 ├── Parties
 │    ├── Customers
 │    └── Suppliers
 ├── Items
 │    └── Entity / BU / Location Extensions
 ├── Finance Masters
 │    ├── COA
 │    ├── Fiscal Calendar
 │    └── Tax / FX policies
 └── MDM Governance
      ├── Source Systems
      ├── Golden Records
      ├── Match / Merge
      └── Audit / Change Control
```

---

# 19. My recommendation for your ERP

For AFENDA-style enterprise design, I would define the tenant layer as:

## Tenant = Business Truth Boundary

Meaning the tenant is the root of:

- commercial ownership
- legal/accounting scope
- policy control
- master data stewardship
- security boundary
- audit lineage

That is much stronger than common SaaS multi-tenancy.

---

# 20. Final verdict

The correct ERP database design is:

- **MDM-first**
- **tenant-governed**
- **legal-entity aware**
- **scope-based access controlled**
- **golden-record capable**
- **effective-dated**
- **audit-ready**

If you design tenant management like DevOps, you get a workspace app.

If you design tenant management like MDM, you get an ERP foundation.

---

I can turn this into a **full PostgreSQL DDL schema** next, with:

- schemas,
- tables,
- primary/foreign keys,
- enums,
- indexes,
- and Drizzle ORM structure.
