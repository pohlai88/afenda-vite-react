Below is the **next wave pack** to complete the spine around:

- tenant policy
- item scoped settings
- alias / external identity
- fiscal calendar / period / COA
- tenant membership / roles / scoped assignment

I will keep the same doctrine:

- **tenant-safe composite FK**
- **Drizzle mirror first**
- **hardening stays in SQL**
- **bounded enums + reusable columns**
- **no generic fluff**

---

# 1. `mdm/tenant-policies.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { statusEnum } from "../shared/enums"
import { tenants } from "./tenants"

const mdm = pgSchema("mdm")

/**
 * Tenant policy is the canonical customization / governance surface.
 *
 * Use for:
 * - finance rules
 * - numbering rules
 * - posting controls
 * - tax behavior
 * - workflow thresholds
 * - tenant terminology / operational defaults
 *
 * Do not use this table as an excuse to avoid relational modeling.
 */
export const tenantPolicies = mdm.table(
  "tenant_policies",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    policyDomain: varchar("policy_domain", { length: 50 }).notNull(),
    policyKey: varchar("policy_key", { length: 100 }).notNull(),
    dataType: varchar("data_type", { length: 20 }).notNull(),
    policyValue: metadataColumn.metadata,
    ...effectiveDateColumns,
    status: statusEnum("status").notNull().default("active"),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantPolicy: uniqueIndex("uq_tenant_policies").on(
      table.tenantId,
      table.policyDomain,
      table.policyKey,
      table.effectiveFrom
    ),
    idxTenantPolicyLookup: index("idx_tenant_policies_lookup").on(
      table.tenantId,
      table.policyDomain,
      table.policyKey,
      table.effectiveFrom
    ),
    ckDataType: check(
      "ck_tenant_policies_data_type",
      sql`${table.dataType} in ('boolean','integer','numeric','text','json','enum')`
    ),
    ckEffectiveDates: check(
      "ck_tenant_policies_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)
```

---

# 2. `mdm/item-entity-settings.ts`

```ts
import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  foreignKey,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { items } from "./items"
import { legalEntities } from "./legal-entities"
import { businessUnits } from "./business-units"
import { locations } from "./locations"
import { accounts } from "../finance/accounts"

const mdm = pgSchema("mdm")

/**
 * Item entity settings resolve operational / finance behavior by scope.
 *
 * Intended fallback order:
 * - location
 * - business unit
 * - legal entity
 *
 * Nullable scoped uniqueness is hardened in SQL migration, not only here.
 */
export const itemEntitySettings = mdm.table(
  "item_entity_settings",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    itemId: uuid("item_id").notNull(),
    legalEntityId: uuid("legal_entity_id").notNull(),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    salesAccountId: uuid("sales_account_id"),
    inventoryAccountId: uuid("inventory_account_id"),
    cogsAccountId: uuid("cogs_account_id"),
    priceListCode: varchar("price_list_code", { length: 50 }),
    reorderPolicy: metadataColumn.metadata,
    isActive: boolean("is_active").notNull().default(true),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqScopeRaw: uniqueIndex("uq_item_entity_settings_scope").on(
      table.tenantId,
      table.itemId,
      table.legalEntityId,
      table.businessUnitId,
      table.locationId,
      table.effectiveFrom
    ),
    idxLookup: index("idx_item_entity_settings_lookup").on(
      table.tenantId,
      table.itemId,
      table.legalEntityId,
      table.businessUnitId,
      table.locationId,
      table.effectiveFrom
    ),
    fkItem: foreignKey({
      columns: [table.tenantId, table.itemId],
      foreignColumns: [items.tenantId, items.id],
      name: "fk_item_entity_settings_item",
    }),
    fkLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_item_entity_settings_legal_entity",
    }),
    fkBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_item_entity_settings_business_unit",
    }),
    fkLocation: foreignKey({
      columns: [table.tenantId, table.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_item_entity_settings_location",
    }),
    fkSalesAccount: foreignKey({
      columns: [table.tenantId, table.salesAccountId],
      foreignColumns: [accounts.tenantId, accounts.id],
      name: "fk_item_entity_settings_sales_account",
    }),
    fkInventoryAccount: foreignKey({
      columns: [table.tenantId, table.inventoryAccountId],
      foreignColumns: [accounts.tenantId, accounts.id],
      name: "fk_item_entity_settings_inventory_account",
    }),
    fkCogsAccount: foreignKey({
      columns: [table.tenantId, table.cogsAccountId],
      foreignColumns: [accounts.tenantId, accounts.id],
      name: "fk_item_entity_settings_cogs_account",
    }),
    ckEffectiveDates: check(
      "ck_item_entity_settings_dates",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)
```

---

# 3. `mdm/master-aliases.ts`

```ts
import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  foreignKey,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { aliasTypeEnum, masterDomainEnum } from "../shared/enums"
import { tenants } from "./tenants"

const mdm = pgSchema("mdm")
const governance = pgSchema("governance")

const dataSources = governance.table("data_sources", {
  id: uuid("id").primaryKey(),
})

/**
 * Dedicated alias registry for strong MDM identity handling.
 *
 * alias_value must be queryable and governable.
 * master_domain + master_id polymorphism is validated in SQL trigger.
 */
export const masterAliases = mdm.table(
  "master_aliases",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    masterDomain: masterDomainEnum("master_domain").notNull(),
    masterId: uuid("master_id").notNull(),
    aliasType: aliasTypeEnum("alias_type").notNull(),
    aliasValue: varchar("alias_value", { length: 255 }).notNull(),
    sourceSystemId: uuid("source_system_id").references(() => dataSources.id),
    isPreferred: boolean("is_preferred").notNull().default(false),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqAliasValue: uniqueIndex("uq_master_aliases_value").on(
      table.tenantId,
      table.masterDomain,
      table.aliasType,
      table.aliasValue
    ),
    idxMasterLookup: index("idx_master_aliases_master").on(
      table.tenantId,
      table.masterDomain,
      table.masterId
    ),
    ckEffectiveDates: check(
      "ck_master_aliases_dates",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)
```

---

# 4. `mdm/external-identities.ts`

```ts
import {
  foreignKey,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { masterDomainEnum } from "../shared/enums"
import { tenants } from "./tenants"

const mdm = pgSchema("mdm")
const governance = pgSchema("governance")

const dataSources = governance.table("data_sources", {
  id: uuid("id").primaryKey(),
})

/**
 * Source-system identity mapping for integration-safe synchronization.
 *
 * This is mandatory for serious ERP integration.
 */
export const externalIdentities = mdm.table(
  "external_identities",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    masterDomain: masterDomainEnum("master_domain").notNull(),
    masterId: uuid("master_id").notNull(),
    sourceSystemId: uuid("source_system_id")
      .notNull()
      .references(() => dataSources.id),
    externalObjectType: varchar("external_object_type", {
      length: 50,
    }).notNull(),
    externalId: varchar("external_id", { length: 255 }).notNull(),
    externalCode: varchar("external_code", { length: 100 }),
    syncStatus: varchar("sync_status", { length: 20 })
      .notNull()
      .default("pending"),
    lastSyncedAt: varchar("last_synced_at", { length: 50 }),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqExternalIdentity: uniqueIndex("uq_external_identities").on(
      table.tenantId,
      table.sourceSystemId,
      table.externalObjectType,
      table.externalId
    ),
    idxMasterLookup: index("idx_external_identities_master").on(
      table.tenantId,
      table.masterDomain,
      table.masterId
    ),
  })
)
```

Note: `lastSyncedAt` should ideally be `timestamp with time zone`; if your project standard allows, replace it with timestamp. I kept it visible here because some teams stage external sync time differently, but **timestamp is preferred**.

Better version:

```ts
import { timestamp } from "drizzle-orm/pg-core"
// ...
lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
```

Use that in the real code.

---

# 5. `finance/fiscal-calendars.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  index,
  pgSchema,
  smallint,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { fiscalCalendarTypeEnum, statusEnum } from "../shared/enums"
import { tenants } from "../mdm/tenants"

const finance = pgSchema("finance")

/**
 * Fiscal calendar is tenant-owned and later assigned to legal entity.
 */
export const fiscalCalendars = finance.table(
  "fiscal_calendars",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    calendarCode: varchar("calendar_code", { length: 50 }).notNull(),
    calendarName: varchar("calendar_name", { length: 200 }).notNull(),
    calendarType: fiscalCalendarTypeEnum("calendar_type").notNull(),
    startMonth: smallint("start_month").notNull(),
    status: statusEnum("status").notNull().default("active"),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_fiscal_calendars_tenant_code").on(
      table.tenantId,
      table.calendarCode
    ),
    uqTenantIdId: uniqueIndex("uq_fiscal_calendars_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_fiscal_calendars_tenant_status").on(
      table.tenantId,
      table.status
    ),
    ckStartMonth: check(
      "ck_fiscal_calendars_start_month",
      sql`${table.startMonth} between 1 and 12`
    ),
  })
)
```

---

# 6. `finance/fiscal-periods.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  integer,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
  date,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { fiscalPeriodStatusEnum } from "../shared/enums"
import { fiscalCalendars } from "./fiscal-calendars"

const finance = pgSchema("finance")

/**
 * Fiscal periods should later receive overlap hardening if needed.
 */
export const fiscalPeriods = finance.table(
  "fiscal_periods",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    fiscalCalendarId: uuid("fiscal_calendar_id").notNull(),
    periodCode: varchar("period_code", { length: 50 }).notNull(),
    periodName: varchar("period_name", { length: 200 }).notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    periodStatus: fiscalPeriodStatusEnum("period_status").notNull(),
    yearNumber: integer("year_number").notNull(),
    periodNumber: integer("period_number").notNull(),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqCalendarCode: uniqueIndex("uq_fiscal_periods_calendar_period_code").on(
      table.fiscalCalendarId,
      table.periodCode
    ),
    uqCalendarYearPeriod: uniqueIndex(
      "uq_fiscal_periods_calendar_year_period"
    ).on(table.fiscalCalendarId, table.yearNumber, table.periodNumber),
    idxTenantStatus: index("idx_fiscal_periods_tenant_status").on(
      table.tenantId,
      table.periodStatus
    ),
    idxCalendarDates: index("idx_fiscal_periods_calendar_dates").on(
      table.fiscalCalendarId,
      table.startDate,
      table.endDate
    ),
    fkCalendar: foreignKey({
      columns: [table.tenantId, table.fiscalCalendarId],
      foreignColumns: [fiscalCalendars.tenantId, fiscalCalendars.id],
      name: "fk_fiscal_periods_calendar",
    }),
    ckDateRange: check(
      "ck_fiscal_periods_date_range",
      sql`${table.endDate} >= ${table.startDate}`
    ),
    ckPeriodNumber: check(
      "ck_fiscal_periods_period_number",
      sql`${table.periodNumber} > 0`
    ),
  })
)
```

---

# 7. `finance/chart-of-account-sets.ts`

```ts
import {
  boolean,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { statusEnum } from "../shared/enums"
import { tenants } from "../mdm/tenants"

const finance = pgSchema("finance")

/**
 * COA set is tenant-owned and can be assigned to legal entities over time.
 */
export const chartOfAccountSets = finance.table(
  "chart_of_account_sets",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    coaCode: varchar("coa_code", { length: 50 }).notNull(),
    coaName: varchar("coa_name", { length: 200 }).notNull(),
    status: statusEnum("status").notNull().default("active"),
    isGroupChart: boolean("is_group_chart").notNull().default(false),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_chart_of_account_sets_tenant_code").on(
      table.tenantId,
      table.coaCode
    ),
    uqTenantIdId: uniqueIndex("uq_chart_of_account_sets_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_chart_of_account_sets_tenant_status").on(
      table.tenantId,
      table.status
    ),
  })
)
```

---

# 8. `iam/tenant-memberships.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { membershipStatusEnum, membershipTypeEnum } from "../shared/enums"
import { tenants } from "../mdm/tenants"
import { legalEntities } from "../mdm/legal-entities"
import { businessUnits } from "../mdm/business-units"
import { locations } from "../mdm/locations"

const iam = pgSchema("iam")

export const userAccounts = iam.table("user_accounts", {
  id: uuid("id").primaryKey(),
})

export const persons = iam.table("persons", {
  id: uuid("id").primaryKey(),
})

/**
 * Membership connects a user/person to a tenant business boundary.
 *
 * This is not the same thing as role.
 */
export const tenantMemberships = iam.table(
  "tenant_memberships",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userAccountId: uuid("user_account_id")
      .notNull()
      .references(() => userAccounts.id),
    personId: uuid("person_id").references(() => persons.id),
    membershipStatus: membershipStatusEnum("membership_status").notNull(),
    membershipType: membershipTypeEnum("membership_type").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    defaultLegalEntityId: uuid("default_legal_entity_id"),
    defaultBusinessUnitId: uuid("default_business_unit_id"),
    defaultLocationId: uuid("default_location_id"),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantUser: uniqueIndex("uq_tenant_memberships_tenant_user").on(
      table.tenantId,
      table.userAccountId
    ),
    uqTenantIdId: uniqueIndex("uq_tenant_memberships_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_tenant_memberships_tenant_status").on(
      table.tenantId,
      table.membershipStatus
    ),
    fkDefaultLegalEntity: foreignKey({
      columns: [table.tenantId, table.defaultLegalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_tenant_memberships_default_legal_entity",
    }),
    fkDefaultBusinessUnit: foreignKey({
      columns: [table.tenantId, table.defaultBusinessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_tenant_memberships_default_business_unit",
    }),
    fkDefaultLocation: foreignKey({
      columns: [table.tenantId, table.defaultLocationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_tenant_memberships_default_location",
    }),
    ckEndDate: check(
      "ck_tenant_memberships_end_date",
      sql`${table.endedAt} is null or ${table.endedAt} >= ${table.joinedAt}`
    ),
  })
)
```

---

# 9. `iam/tenant-roles.ts`

```ts
import {
  boolean,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { roleCategoryEnum } from "../shared/enums"
import { tenants } from "../mdm/tenants"

const iam = pgSchema("iam")

/**
 * Role catalog is tenant-owned.
 *
 * Assignments remain separate and scoped.
 */
export const tenantRoles = iam.table(
  "tenant_roles",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    roleCode: varchar("role_code", { length: 50 }).notNull(),
    roleName: varchar("role_name", { length: 200 }).notNull(),
    roleCategory: roleCategoryEnum("role_category").notNull(),
    isSystemRole: boolean("is_system_role").notNull().default(false),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantRoleCode: uniqueIndex("uq_tenant_roles_tenant_role_code").on(
      table.tenantId,
      table.roleCode
    ),
    uqTenantIdId: uniqueIndex("uq_tenant_roles_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantCategory: index("idx_tenant_roles_tenant_category").on(
      table.tenantId,
      table.roleCategory
    ),
  })
)
```

---

# 10. `iam/tenant-role-assignments.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { roleScopeTypeEnum } from "../shared/enums"
import { tenantMemberships } from "./tenant-memberships"
import { tenantRoles } from "./tenant-roles"

const iam = pgSchema("iam")

/**
 * Role assignment is scope-aware.
 *
 * Scope resolution examples:
 * - tenant => scope_id null
 * - legal_entity => scope_id = legal_entities.id
 * - business_unit => scope_id = business_units.id
 * - location => scope_id = locations.id
 *
 * Physical target validation can be expanded later with scope-domain trigger.
 */
export const tenantRoleAssignments = iam.table(
  "tenant_role_assignments",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    tenantMembershipId: uuid("tenant_membership_id").notNull(),
    tenantRoleId: uuid("tenant_role_id").notNull(),
    scopeType: roleScopeTypeEnum("scope_type").notNull(),
    scopeId: uuid("scope_id"),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqAssignment: uniqueIndex("uq_role_assignments").on(
      table.tenantId,
      table.tenantMembershipId,
      table.tenantRoleId,
      table.scopeType,
      table.scopeId,
      table.effectiveFrom
    ),
    idxTenantMembership: index("idx_role_assignments_tenant_membership").on(
      table.tenantId,
      table.tenantMembershipId
    ),
    fkMembership: foreignKey({
      columns: [table.tenantId, table.tenantMembershipId],
      foreignColumns: [tenantMemberships.tenantId, tenantMemberships.id],
      name: "fk_role_assignments_membership",
    }),
    fkRole: foreignKey({
      columns: [table.tenantId, table.tenantRoleId],
      foreignColumns: [tenantRoles.tenantId, tenantRoles.id],
      name: "fk_role_assignments_role",
    }),
    ckEffectiveDates: check(
      "ck_role_assignments_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    ckScopePresence: check(
      "ck_role_assignments_scope_presence",
      sql`(
        (${table.scopeType} = 'tenant' and ${table.scopeId} is null)
        or
        (${table.scopeType} in ('legal_entity','business_unit','location') and ${table.scopeId} is not null)
      )`
    ),
  })
)
```

---

# 11. Important corrections and tightening

There are a few places from the previous pack that I want to tighten explicitly.

## A. `external-identities.ts`

Use `timestamp`, not `varchar`, for `lastSyncedAt`.

**Correct field:**

```ts
import { timestamp } from "drizzle-orm/pg-core"

lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
```

## B. Generated columns

Do not rely on the Drizzle table definition alone for generated columns like normalized party names.
Keep them in raw SQL migration.

## C. Scope polymorphism

For `tenant_role_assignments.scope_id`, the table only validates null/non-null shape now.
If you want full runtime integrity, add a **scope target validator trigger** in SQL, similar to `master_domain` validator.

---

# 12. Next hardening SQL additions for this wave

Add these to your hardening migration after the previous pack.

## A. Role assignment temporal overlap hardening

```sql
alter table iam.tenant_role_assignments
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;

alter table iam.tenant_role_assignments
  drop constraint if exists ex_role_assignments_no_overlap;

alter table iam.tenant_role_assignments
  add constraint ex_role_assignments_no_overlap
  exclude using gist (
    tenant_id with =,
    tenant_membership_id with =,
    tenant_role_id with =,
    scope_type with =,
    scope_id with =,
    effective_range with &&
  )
  where (is_deleted = false);
```

## B. Fiscal period overlap hardening

```sql
alter table finance.fiscal_periods
  add column if not exists period_range daterange
  generated always as (
    daterange(start_date, end_date + 1, '[)')
  ) stored;

alter table finance.fiscal_periods
  drop constraint if exists ex_fiscal_periods_no_overlap;

alter table finance.fiscal_periods
  add constraint ex_fiscal_periods_no_overlap
  exclude using gist (
    fiscal_calendar_id with =,
    period_range with &&
  )
  where (is_deleted = false);
```

## C. Item settings no-overlap hardening

```sql
alter table mdm.item_entity_settings
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;
```

Then use **scope-specific exclusion constraints** if you want full temporal enforcement. That is stronger than uniqueness alone.

---

# 13. Recommended relations files next

The next thing to add in code is not more tables first.
It is:

- `relations/iam-relations.ts`
- `relations/finance-relations.ts`
- `relations/mdm-relations.ts`

Because once the spine exists, navigation across domains becomes the next source of drift.

A good next file pack would be:

- `relations/iam-relations.ts`
- `relations/finance-relations.ts`
- `relations/mdm-relations.ts`
- `queries/resolve-item-settings.ts`
- `queries/resolve-current-tenant-policy.ts`
- `queries/resolve-membership-scope.ts`

Those query surfaces are where ERP starts becoming usable instead of only modeled.

---

# 14. Final verdict

At this point, your schema spine now covers:

## Business truth root

- tenants
- tenant_policies

## Enterprise structure

- legal_entities
- business_units
- locations

## MDM master core

- parties
- items
- item_entity_settings
- master_aliases
- external_identities

## Finance master core

- fiscal_calendars
- fiscal_periods
- chart_of_account_sets
- accounts

## Access core

- tenant_memberships
- tenant_roles
- tenant_role_assignments

That is no longer a conceptual sketch.
That is a real **ERP tenant-MDM core backbone**.

Reply with:

**“continue with relations + query resolvers”**

and I’ll draft the next pack around:

- Drizzle `relations(...)`
- current-policy resolver
- scoped item-settings resolver
- membership authorization scope resolver
