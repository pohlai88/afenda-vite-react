Below is the **Drizzle mirror first**, followed by the **hardening patch set**.

I will keep this enterprise-grade and practical:

- **Drizzle mirror** = faithful reflection of the canonical PostgreSQL design
- **Hardening patch set** = raw SQL migrations for things Drizzle should not “fake”
- **Doctrine** = PostgreSQL remains source of truth for integrity; Drizzle mirrors it cleanly

---

# 1. Recommended repository structure

Use a structure that separates:

- shared column primitives
- enums
- domain tables
- relations
- raw SQL migration hardening

```text
packages/db/src/
  schema/
    shared/
      columns.ts
      enums.ts
      helpers.ts
    ref/
      currencies.ts
      countries.ts
      locales.ts
      timezones.ts
      uoms.ts
    iam/
      user-accounts.ts
      persons.ts
      tenant-memberships.ts
      tenant-roles.ts
      tenant-role-assignments.ts
      authority-policies.ts
    mdm/
      addresses.ts
      tenants.ts
      tenant-profiles.ts
      tenant-label-overrides.ts
      tenant-policies.ts
      document-sequences.ts
      legal-entities.ts
      business-units.ts
      locations.ts
      org-units.ts
      parties.ts
      party-addresses.ts
      tax-registrations.ts
      customers.ts
      suppliers.ts
      item-categories.ts
      items.ts
      item-entity-settings.ts
      master-aliases.ts
      external-identities.ts
      custom-field-definitions.ts
      custom-field-values.ts
    finance/
      fiscal-calendars.ts
      fiscal-periods.ts
      chart-of-account-sets.ts
      accounts.ts
      legal-entity-coa-assignments.ts
    governance/
      data-sources.ts
      audit-logs.ts
      master-records.ts
      master-record-matches.ts
      master-record-merges.ts
      survivorship-rules.ts
      data-quality-issues.ts
  relations/
    ref-relations.ts
    iam-relations.ts
    mdm-relations.ts
    finance-relations.ts
    governance-relations.ts
  views/
    active-views.sql
  migrations/
    0001_init.sql
    0002_hardening.sql
  index.ts
```

---

# 2. Shared Drizzle foundation

This is the most important part.
Do not handcraft columns repeatedly.

---

## `schema/shared/enums.ts`

```ts
import { pgEnum } from "drizzle-orm/pg-core"

export const statusEnum = pgEnum("generic_status", [
  "draft",
  "active",
  "inactive",
  "blocked",
  "suspended",
  "archived",
])

export const tenantTypeEnum = pgEnum("tenant_type", [
  "enterprise",
  "group",
  "franchise",
  "nonprofit",
  "holding",
])

export const governanceLevelEnum = pgEnum("mdm_governance_level", [
  "centralized",
  "federated",
  "decentralized",
])

export const ownershipLevelEnum = pgEnum("ownership_level", [
  "tenant",
  "legal_entity",
  "business_unit",
  "location",
])

export const partyTypeEnum = pgEnum("party_type", ["person", "organization"])

export const mdmStatusEnum = pgEnum("mdm_status", [
  "golden",
  "candidate",
  "duplicate",
  "merged",
])

export const legalEntityTypeEnum = pgEnum("legal_entity_type", [
  "company",
  "subsidiary",
  "branch",
  "foundation",
  "partnership",
])

export const businessUnitTypeEnum = pgEnum("business_unit_type", [
  "division",
  "segment",
  "line_of_business",
  "function",
])

export const locationTypeEnum = pgEnum("location_type", [
  "branch",
  "office",
  "warehouse",
  "store",
  "plant",
  "site",
])

export const orgUnitTypeEnum = pgEnum("org_unit_type", [
  "department",
  "cost_center",
  "profit_center",
  "team",
  "region",
  "function",
  "project_unit",
])

export const membershipStatusEnum = pgEnum("membership_status", [
  "invited",
  "active",
  "suspended",
  "revoked",
])

export const membershipTypeEnum = pgEnum("membership_type", [
  "employee",
  "partner",
  "auditor",
  "consultant",
  "system",
])

export const roleCategoryEnum = pgEnum("role_category", [
  "finance",
  "procurement",
  "sales",
  "inventory",
  "hr",
  "admin",
  "audit",
  "it",
  "executive",
])

export const roleScopeTypeEnum = pgEnum("role_scope_type", [
  "tenant",
  "legal_entity",
  "business_unit",
  "location",
])

export const fiscalCalendarTypeEnum = pgEnum("fiscal_calendar_type", [
  "monthly",
  "4-4-5",
  "custom",
])

export const fiscalPeriodStatusEnum = pgEnum("fiscal_period_status", [
  "open",
  "soft_closed",
  "hard_closed",
])

export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
])

export const postingTypeEnum = pgEnum("posting_type", ["posting", "heading"])

export const normalBalanceEnum = pgEnum("normal_balance", ["debit", "credit"])

export const itemTypeEnum = pgEnum("item_type", [
  "inventory",
  "service",
  "asset",
  "expense",
])

export const valuationMethodEnum = pgEnum("valuation_method", [
  "fifo",
  "moving_average",
  "standard",
])

export const aliasTypeEnum = pgEnum("alias_type", [
  "short_name",
  "external_code",
  "legacy_code",
  "search_synonym",
  "barcode",
  "sku",
  "other",
])

export const masterDomainEnum = pgEnum("master_domain", [
  "party",
  "item",
  "legal_entity",
  "business_unit",
  "location",
  "account",
])

export const sourceTypeEnum = pgEnum("source_type", [
  "manual",
  "api",
  "import",
  "legacy_erp",
  "crm",
  "ecommerce",
  "bank",
  "tax",
  "other",
])

export const dataTypeEnum = pgEnum("custom_data_type", [
  "boolean",
  "integer",
  "numeric",
  "text",
  "json",
  "enum",
])

export const customFieldDataTypeEnum = pgEnum("custom_field_data_type", [
  "text",
  "number",
  "boolean",
  "date",
  "json",
  "select",
])
```

---

## `schema/shared/columns.ts`

```ts
import { sql } from "drizzle-orm"
import {
  boolean,
  char,
  date,
  integer,
  jsonb,
  numeric,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

export const idColumn = {
  id: uuid("id").primaryKey().defaultRandom(),
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

export const lifecycleColumns = {
  isDeleted: boolean("is_deleted").notNull().default(false),
}

export const effectiveDateColumns = {
  effectiveFrom: date("effective_from")
    .notNull()
    .default(sql`current_date`),
  effectiveTo: date("effective_to"),
}

export const metadataColumn = {
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
}

export const aliasesColumn = {
  aliases: text("aliases")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
}

export const tenantFkColumn = {
  tenantId: uuid("tenant_id").notNull(),
}

export const currencyCodeColumn = (name: string) => char(name, { length: 3 })
export const countryCodeColumn = (name: string) => char(name, { length: 2 })
export const codeColumn = (name = "code", length = 50) =>
  varchar(name, { length }).notNull()
export const nameColumn = (name = "name", length = 255) =>
  varchar(name, { length }).notNull()

export const positiveAmountColumn = (name: string) =>
  numeric(name, { precision: 18, scale: 2 })

export const jsonbDefault = <T>() =>
  jsonb()
    .$type<T>()
    .notNull()
    .default(sql`'{}'::jsonb`)
```

---

## `schema/shared/helpers.ts`

```ts
import { sql } from "drizzle-orm"

export const currentDateSql = sql`current_date`
export const emptyJsonbSql = sql`'{}'::jsonb`
export const emptyTextArraySql = sql`'{}'::text[]`
```

---

# 3. Schema declarations

---

## `schema/ref/_schema.ts`

```ts
import { pgSchema } from "drizzle-orm/pg-core"
export const ref = pgSchema("ref")
```

## `schema/iam/_schema.ts`

```ts
import { pgSchema } from "drizzle-orm/pg-core"
export const iam = pgSchema("iam")
```

## `schema/mdm/_schema.ts`

```ts
import { pgSchema } from "drizzle-orm/pg-core"
export const mdm = pgSchema("mdm")
```

## `schema/finance/_schema.ts`

```ts
import { pgSchema } from "drizzle-orm/pg-core"
export const finance = pgSchema("finance")
```

## `schema/governance/_schema.ts`

```ts
import { pgSchema } from "drizzle-orm/pg-core"
export const governance = pgSchema("governance")
```

---

# 4. Reference tables mirror

---

## `schema/ref/currencies.ts`

```ts
import { check, index, smallint } from "drizzle-orm/pg-core"
import { char, boolean, timestamp, varchar, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { ref } from "./_schema"

export const currencies = ref.table(
  "currencies",
  {
    code: char("code", { length: 3 }).primaryKey(),
    numericCode: char("numeric_code", { length: 3 }),
    name: varchar("name", { length: 100 }).notNull(),
    symbol: varchar("symbol", { length: 10 }),
    minorUnit: smallint("minor_unit").notNull().default(2),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    versionNo: integer("version_no").notNull().default(1),
  },
  (t) => ({
    minorUnitCheck: check(
      "ck_currencies_minor_unit",
      sql`${t.minorUnit} >= 0 and ${t.minorUnit} <= 6`
    ),
    nameIdx: index("idx_currencies_name").on(t.name),
  })
)
```

You would mirror `countries`, `locales`, `timezones`, and `uoms` in the same style.

---

# 5. Governance support mirror

---

## `schema/governance/data-sources.ts`

```ts
import {
  check,
  index,
  uniqueIndex,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core"
import { governance } from "./_schema"
import {
  idColumn,
  auditColumns,
  lifecycleColumns,
  metadataColumn,
} from "../shared/columns"
import { sourceTypeEnum, statusEnum } from "../shared/enums"
import { sql } from "drizzle-orm"

export const dataSources = governance.table(
  "data_sources",
  {
    ...idColumn,
    sourceCode: varchar("source_code", { length: 50 }).notNull(),
    sourceName: varchar("source_name", { length: 200 }).notNull(),
    sourceType: sourceTypeEnum("source_type").notNull(),
    priorityRank: integer("priority_rank").notNull().default(100),
    isAuthoritative: boolean("is_authoritative").notNull().default(false),
    status: statusEnum("status").notNull().default("active"),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    sourceCodeUq: uniqueIndex("uq_data_sources_source_code").on(t.sourceCode),
    priorityCheck: check(
      "ck_data_sources_priority_rank",
      sql`${t.priorityRank} > 0`
    ),
    statusIdx: index("idx_data_sources_status").on(t.status),
  })
)
```

---

# 6. IAM mirror

---

## `schema/iam/user-accounts.ts`

```ts
import {
  check,
  index,
  uniqueIndex,
  varchar,
  boolean,
  uuid,
} from "drizzle-orm/pg-core"
import { iam } from "./_schema"
import { ref } from "../ref/_schema"
import {
  metadataColumn,
  lifecycleColumns,
  auditColumns,
  idColumn,
} from "../shared/columns"
import { sql } from "drizzle-orm"

export const userAccounts = iam.table(
  "user_accounts",
  {
    ...idColumn,
    username: varchar("username", { length: 100 }),
    email: varchar("email", { length: 320 }),
    displayName: varchar("display_name", { length: 200 }).notNull(),
    accountStatus: varchar("account_status", { length: 20 })
      .notNull()
      .default("active"),
    isServiceAccount: boolean("is_service_account").notNull().default(false),
    localeCode: varchar("locale_code", { length: 20 }).references(
      () => ref.table("locales", {} as any).code
    ),
    timezoneName: varchar("timezone_name", { length: 100 }).references(
      () => ref.table("timezones", {} as any).name
    ),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    usernameUq: uniqueIndex("uq_user_accounts_username").on(t.username),
    emailUq: uniqueIndex("uq_user_accounts_email").on(t.email),
    statusCheck: check(
      "ck_user_accounts_status",
      sql`${t.accountStatus} in ('invited','active','suspended','locked','archived')`
    ),
    statusIdx: index("idx_user_accounts_status").on(t.accountStatus),
  })
)
```

For actual project code, reference imported concrete tables directly rather than `ref.table(...)`; I am compressing some repetition here to keep the blueprint readable.

---

## `schema/iam/persons.ts`

```ts
import { iam } from "./_schema"
import { varchar, date, index } from "drizzle-orm/pg-core"
import {
  metadataColumn,
  lifecycleColumns,
  auditColumns,
  idColumn,
} from "../shared/columns"

export const persons = iam.table(
  "persons",
  {
    ...idColumn,
    givenName: varchar("given_name", { length: 100 }),
    familyName: varchar("family_name", { length: 100 }),
    fullName: varchar("full_name", { length: 200 }).notNull(),
    dateOfBirth: date("date_of_birth"),
    primaryEmail: varchar("primary_email", { length: 320 }),
    primaryPhone: varchar("primary_phone", { length: 50 }),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    fullNameIdx: index("idx_persons_full_name").on(t.fullName),
    emailIdx: index("idx_persons_primary_email").on(t.primaryEmail),
  })
)
```

---

## `schema/iam/tenant-memberships.ts`

```ts
import { check, index, uniqueIndex, uuid, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { iam } from "./_schema"
import { mdm } from "../mdm/_schema"
import { membershipStatusEnum, membershipTypeEnum } from "../shared/enums"
import {
  metadataColumn,
  lifecycleColumns,
  auditColumns,
  idColumn,
} from "../shared/columns"
import { tenants } from "../mdm/tenants"
import { userAccounts } from "./user-accounts"
import { persons } from "./persons"
import { legalEntities } from "../mdm/legal-entities"
import { businessUnits } from "../mdm/business-units"
import { locations } from "../mdm/locations"
import { foreignKey } from "drizzle-orm/pg-core"

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
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    tenantUserUq: uniqueIndex("uq_tenant_memberships_tenant_user").on(
      t.tenantId,
      t.userAccountId
    ),
    tenantIdIdUq: uniqueIndex("uq_tenant_memberships_tenant_id_id").on(
      t.tenantId,
      t.id
    ),
    endDateCheck: check(
      "ck_tenant_memberships_end_date",
      sql`${t.endedAt} is null or ${t.endedAt} >= ${t.joinedAt}`
    ),

    fkDefaultLegalEntity: foreignKey({
      columns: [t.tenantId, t.defaultLegalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_tenant_memberships_default_legal_entity",
    }),
    fkDefaultBusinessUnit: foreignKey({
      columns: [t.tenantId, t.defaultBusinessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_tenant_memberships_default_business_unit",
    }),
    fkDefaultLocation: foreignKey({
      columns: [t.tenantId, t.defaultLocationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_tenant_memberships_default_location",
    }),

    tenantStatusIdx: index("idx_tenant_memberships_tenant_status").on(
      t.tenantId,
      t.membershipStatus
    ),
  })
)
```

This is the right pattern: **composite foreign keys where tenant safety matters**.

---

# 7. MDM mirror

Now the most important domain.

---

## `schema/mdm/tenants.ts`

```ts
import { check, index, uniqueIndex, varchar, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { mdm } from "./_schema"
import { ref } from "../ref/_schema"
import {
  idColumn,
  auditColumns,
  lifecycleColumns,
  metadataColumn,
  aliasesColumn,
  countryCodeColumn,
  currencyCodeColumn,
} from "../shared/columns"
import {
  governanceLevelEnum,
  tenantTypeEnum,
  statusEnum,
} from "../shared/enums"
import { currencies } from "../ref/currencies"

export const tenants = mdm.table(
  "tenants",
  {
    ...idColumn,
    tenantCode: varchar("tenant_code", { length: 50 }).notNull(),
    tenantName: varchar("tenant_name", { length: 200 }).notNull(),
    tenantType: tenantTypeEnum("tenant_type").notNull(),
    status: statusEnum("status").notNull(),
    baseCurrencyCode: currencyCodeColumn("base_currency_code")
      .notNull()
      .references(() => currencies.code),
    reportingCurrencyCode: currencyCodeColumn(
      "reporting_currency_code"
    ).references(() => currencies.code),
    defaultLocaleCode: varchar("default_locale_code", { length: 20 }).notNull(),
    defaultTimezoneName: varchar("default_timezone_name", {
      length: 100,
    }).notNull(),
    countryCode: countryCodeColumn("country_code").notNull(),
    activationDate: date("activation_date"),
    deactivationDate: date("deactivation_date"),
    mdmGovernanceLevel: governanceLevelEnum("mdm_governance_level").notNull(),
    ...aliasesColumn,
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    tenantCodeUq: uniqueIndex("uq_tenants_tenant_code").on(t.tenantCode),
    tenantNameUq: uniqueIndex("uq_tenants_name_active").on(t.tenantName),
    deactivationCheck: check(
      "ck_tenants_deactivation_date",
      sql`${t.deactivationDate} is null or ${t.activationDate} is null or ${t.deactivationDate} >= ${t.activationDate}`
    ),
    statusIdx: index("idx_tenants_status").on(t.status),
  })
)
```

---

## `schema/mdm/legal-entities.ts`

```ts
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
  date,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { mdm } from "./_schema"
import { tenants } from "./tenants"
import { currencies } from "../ref/currencies"
import { legalEntityTypeEnum, statusEnum } from "../shared/enums"
import {
  idColumn,
  auditColumns,
  lifecycleColumns,
  metadataColumn,
  aliasesColumn,
  countryCodeColumn,
  currencyCodeColumn,
} from "../shared/columns"

export const legalEntities = mdm.table(
  "legal_entities",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityCode: varchar("entity_code", { length: 50 }).notNull(),
    legalName: varchar("legal_name", { length: 255 }).notNull(),
    tradingName: varchar("trading_name", { length: 255 }),
    entityType: legalEntityTypeEnum("entity_type").notNull(),
    registrationNumber: varchar("registration_number", { length: 100 }),
    taxRegistrationNumber: varchar("tax_registration_number", { length: 100 }),
    countryCode: countryCodeColumn("country_code").notNull(),
    baseCurrencyCode: currencyCodeColumn("base_currency_code")
      .notNull()
      .references(() => currencies.code),
    fiscalCalendarId: uuid("fiscal_calendar_id"),
    status: statusEnum("status").notNull(),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    effectiveFrom: date("effective_from")
      .notNull()
      .default(sql`current_date`),
    effectiveTo: date("effective_to"),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    tenantCodeUq: uniqueIndex("uq_legal_entities_tenant_code").on(
      t.tenantId,
      t.entityCode
    ),
    tenantIdIdUq: uniqueIndex("uq_legal_entities_tenant_id_id").on(
      t.tenantId,
      t.id
    ),
    effectiveCheck: check(
      "ck_legal_entities_effective_date",
      sql`${t.effectiveTo} is null or ${t.effectiveTo} >= ${t.effectiveFrom}`
    ),
    tenantStatusIdx: index("idx_legal_entities_tenant_status").on(
      t.tenantId,
      t.status
    ),
  })
)
```

The `fiscalCalendarId` composite FK is best added in a migration after both tables exist, just like in the canonical SQL.

---

## `schema/mdm/business-units.ts`

```ts
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
  date,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { mdm } from "./_schema"
import { businessUnitTypeEnum, statusEnum } from "../shared/enums"
import {
  idColumn,
  auditColumns,
  lifecycleColumns,
  metadataColumn,
  aliasesColumn,
} from "../shared/columns"
import { persons } from "../iam/persons"
import { legalEntities } from "./legal-entities"

export const businessUnits = mdm.table(
  "business_units",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    legalEntityId: uuid("legal_entity_id").notNull(),
    buCode: varchar("bu_code", { length: 50 }).notNull(),
    buName: varchar("bu_name", { length: 255 }).notNull(),
    buType: businessUnitTypeEnum("bu_type").notNull(),
    managerPersonId: uuid("manager_person_id").references(() => persons.id),
    status: statusEnum("status").notNull(),
    ...aliasesColumn,
    effectiveFrom: date("effective_from")
      .notNull()
      .default(sql`current_date`),
    effectiveTo: date("effective_to"),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    tenantLegalCodeUq: uniqueIndex(
      "uq_business_units_tenant_legal_entity_code"
    ).on(t.tenantId, t.legalEntityId, t.buCode),
    tenantIdIdUq: uniqueIndex("uq_business_units_tenant_id_id").on(
      t.tenantId,
      t.id
    ),
    effectiveCheck: check(
      "ck_business_units_effective_date",
      sql`${t.effectiveTo} is null or ${t.effectiveTo} >= ${t.effectiveFrom}`
    ),
    fkTenantLegalEntity: foreignKey({
      columns: [t.tenantId, t.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_business_units_tenant_legal_entity",
    }),
    statusIdx: index("idx_business_units_tenant_status").on(
      t.tenantId,
      t.status
    ),
  })
)
```

---

## `schema/mdm/locations.ts`

```ts
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
  boolean,
  date,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { mdm } from "./_schema"
import { addresses } from "./addresses"
import { legalEntities } from "./legal-entities"
import { businessUnits } from "./business-units"
import { locationTypeEnum, statusEnum } from "../shared/enums"
import {
  idColumn,
  auditColumns,
  lifecycleColumns,
  metadataColumn,
  aliasesColumn,
} from "../shared/columns"

export const locations = mdm.table(
  "locations",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    legalEntityId: uuid("legal_entity_id").notNull(),
    businessUnitId: uuid("business_unit_id"),
    locationCode: varchar("location_code", { length: 50 }).notNull(),
    locationName: varchar("location_name", { length: 255 }).notNull(),
    locationType: locationTypeEnum("location_type").notNull(),
    addressId: uuid("address_id").references(() => addresses.id),
    timezoneName: varchar("timezone_name", { length: 100 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }).notNull(),
    isOperatingSite: boolean("is_operating_site").notNull().default(true),
    status: statusEnum("status").notNull(),
    ...aliasesColumn,
    effectiveFrom: date("effective_from")
      .notNull()
      .default(sql`current_date`),
    effectiveTo: date("effective_to"),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    tenantLegalCodeUq: uniqueIndex("uq_locations_tenant_legal_entity_code").on(
      t.tenantId,
      t.legalEntityId,
      t.locationCode
    ),
    tenantIdIdUq: uniqueIndex("uq_locations_tenant_id_id").on(t.tenantId, t.id),
    fkTenantLegalEntity: foreignKey({
      columns: [t.tenantId, t.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_locations_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [t.tenantId, t.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_locations_tenant_business_unit",
    }),
    effectiveCheck: check(
      "ck_locations_effective_date",
      sql`${t.effectiveTo} is null or ${t.effectiveTo} >= ${t.effectiveFrom}`
    ),
    statusIdx: index("idx_locations_tenant_status").on(t.tenantId, t.status),
  })
)
```

---

## `schema/mdm/parties.ts`

This is central.

```ts
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
  text,
  date,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { mdm } from "./_schema"
import { tenants } from "./tenants"
import { legalEntities } from "./legal-entities"
import { businessUnits } from "./business-units"
import { locations } from "./locations"
import { dataSources } from "../governance/data-sources"
import {
  ownershipLevelEnum,
  partyTypeEnum,
  statusEnum,
  mdmStatusEnum,
} from "../shared/enums"
import {
  idColumn,
  auditColumns,
  lifecycleColumns,
  metadataColumn,
  aliasesColumn,
} from "../shared/columns"

export const parties = mdm.table(
  "parties",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    partyCode: varchar("party_code", { length: 50 }).notNull(),
    partyType: partyTypeEnum("party_type").notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    canonicalName: varchar("canonical_name", { length: 255 }).notNull(),
    canonicalNameNormalized: text("canonical_name_normalized"),
    ownershipLevel: ownershipLevelEnum("ownership_level")
      .notNull()
      .default("tenant"),
    legalEntityId: uuid("legal_entity_id"),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    status: statusEnum("status").notNull(),
    mdmStatus: mdmStatusEnum("mdm_status").notNull(),
    sourceSystemId: uuid("source_system_id").references(() => dataSources.id),
    goldenRecordId: uuid("golden_record_id"),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    effectiveFrom: date("effective_from")
      .notNull()
      .default(sql`current_date`),
    effectiveTo: date("effective_to"),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    tenantCodeUq: uniqueIndex("uq_parties_tenant_code").on(
      t.tenantId,
      t.partyCode
    ),
    tenantIdIdUq: uniqueIndex("uq_parties_tenant_id_id").on(t.tenantId, t.id),

    fkTenantLegalEntity: foreignKey({
      columns: [t.tenantId, t.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_parties_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [t.tenantId, t.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_parties_tenant_business_unit",
    }),
    fkTenantLocation: foreignKey({
      columns: [t.tenantId, t.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_parties_tenant_location",
    }),

    effectiveCheck: check(
      "ck_parties_effective_date",
      sql`${t.effectiveTo} is null or ${t.effectiveTo} >= ${t.effectiveFrom}`
    ),

    ownershipScopeCheck: check(
      "ck_parties_ownership_scope",
      sql`(
        (${t.ownershipLevel} = 'tenant' and ${t.legalEntityId} is null and ${t.businessUnitId} is null and ${t.locationId} is null)
        or
        (${t.ownershipLevel} = 'legal_entity' and ${t.legalEntityId} is not null and ${t.businessUnitId} is null and ${t.locationId} is null)
        or
        (${t.ownershipLevel} = 'business_unit' and ${t.legalEntityId} is not null and ${t.businessUnitId} is not null and ${t.locationId} is null)
        or
        (${t.ownershipLevel} = 'location' and ${t.legalEntityId} is not null and ${t.locationId} is not null)
      )`
    ),

    statusIdx: index("idx_parties_tenant_status").on(t.tenantId, t.status),
    mdmStatusIdx: index("idx_parties_tenant_mdm_status").on(
      t.tenantId,
      t.mdmStatus
    ),
  })
)
```

For the generated column `canonical_name_normalized`, I recommend keeping that in raw SQL migration rather than pretending Drizzle fully owns it. That is the right enterprise posture.

---

## `schema/mdm/customers.ts`

```ts
import { check, index, uuid, varchar, numeric } from "drizzle-orm/pg-core"
import { mdm } from "./_schema"
import { parties } from "./parties"
import { currencies } from "../ref/currencies"
import { metadataColumn, auditColumns } from "../shared/columns"
import { sql } from "drizzle-orm"
import { foreignKey } from "drizzle-orm/pg-core"

export const customers = mdm.table(
  "customers",
  {
    partyId: uuid("party_id")
      .primaryKey()
      .references(() => parties.id, { onDelete: "cascade" }),
    tenantId: uuid("tenant_id").notNull(),
    customerGroupCode: varchar("customer_group_code", { length: 50 }),
    creditLimitAmount: numeric("credit_limit_amount", {
      precision: 18,
      scale: 2,
    }),
    currencyCode: varchar("currency_code", { length: 3 }).references(
      () => currencies.code
    ),
    paymentTermCode: varchar("payment_term_code", { length: 50 }),
    taxProfileCode: varchar("tax_profile_code", { length: 50 }),
    pricingProfileCode: varchar("pricing_profile_code", { length: 50 }),
    customerStatus: varchar("customer_status", { length: 20 })
      .notNull()
      .default("active"),
    ...metadataColumn,
    ...auditColumns,
  },
  (t) => ({
    fkTenantParty: foreignKey({
      columns: [t.tenantId, t.partyId],
      foreignColumns: [parties.tenantId, parties.id],
      name: "fk_customers_tenant_party",
    }),
    creditCheck: check(
      "ck_customers_credit_limit",
      sql`${t.creditLimitAmount} is null or ${t.creditLimitAmount} >= 0`
    ),
    statusIdx: index("idx_customers_tenant_status").on(
      t.tenantId,
      t.customerStatus
    ),
  })
)
```

You would mirror `suppliers.ts` the same way.

---

## `schema/mdm/items.ts`

```ts
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
  date,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { mdm } from "./_schema"
import { tenants } from "./tenants"
import { itemCategories } from "./item-categories"
import { legalEntities } from "./legal-entities"
import { businessUnits } from "./business-units"
import { locations } from "./locations"
import { dataSources } from "../governance/data-sources"
import {
  ownershipLevelEnum,
  itemTypeEnum,
  mdmStatusEnum,
  statusEnum,
  valuationMethodEnum,
} from "../shared/enums"
import {
  idColumn,
  auditColumns,
  lifecycleColumns,
  metadataColumn,
  aliasesColumn,
} from "../shared/columns"

export const items = mdm.table(
  "items",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    itemCode: varchar("item_code", { length: 50 }).notNull(),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    itemType: itemTypeEnum("item_type").notNull(),
    baseUomCode: varchar("base_uom_code", { length: 20 }).notNull(),
    categoryId: uuid("category_id"),
    ownershipLevel: ownershipLevelEnum("ownership_level")
      .notNull()
      .default("tenant"),
    legalEntityId: uuid("legal_entity_id"),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    valuationMethod: valuationMethodEnum("valuation_method"),
    status: statusEnum("status").notNull(),
    mdmStatus: mdmStatusEnum("mdm_status").notNull().default("golden"),
    sourceSystemId: uuid("source_system_id").references(() => dataSources.id),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    effectiveFrom: date("effective_from")
      .notNull()
      .default(sql`current_date`),
    effectiveTo: date("effective_to"),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    tenantCodeUq: uniqueIndex("uq_items_tenant_code").on(
      t.tenantId,
      t.itemCode
    ),
    tenantIdIdUq: uniqueIndex("uq_items_tenant_id_id").on(t.tenantId, t.id),

    fkCategory: foreignKey({
      columns: [t.tenantId, t.categoryId],
      foreignColumns: [itemCategories.tenantId, itemCategories.id],
      name: "fk_items_category",
    }),
    fkTenantLegalEntity: foreignKey({
      columns: [t.tenantId, t.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_items_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [t.tenantId, t.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_items_tenant_business_unit",
    }),
    fkTenantLocation: foreignKey({
      columns: [t.tenantId, t.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_items_tenant_location",
    }),

    effectiveCheck: check(
      "ck_items_effective_date",
      sql`${t.effectiveTo} is null or ${t.effectiveTo} >= ${t.effectiveFrom}`
    ),

    ownershipScopeCheck: check(
      "ck_items_ownership_scope",
      sql`(
        (${t.ownershipLevel} = 'tenant' and ${t.legalEntityId} is null and ${t.businessUnitId} is null and ${t.locationId} is null)
        or
        (${t.ownershipLevel} = 'legal_entity' and ${t.legalEntityId} is not null and ${t.businessUnitId} is null and ${t.locationId} is null)
        or
        (${t.ownershipLevel} = 'business_unit' and ${t.legalEntityId} is not null and ${t.businessUnitId} is not null and ${t.locationId} is null)
        or
        (${t.ownershipLevel} = 'location' and ${t.legalEntityId} is not null and ${t.locationId} is not null)
      )`
    ),

    statusIdx: index("idx_items_tenant_status").on(t.tenantId, t.status),
    mdmStatusIdx: index("idx_items_tenant_mdm_status").on(
      t.tenantId,
      t.mdmStatus
    ),
  })
)
```

---

## `schema/mdm/item-entity-settings.ts`

```ts
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
  boolean,
  date,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { mdm } from "./_schema"
import { items } from "./items"
import { legalEntities } from "./legal-entities"
import { businessUnits } from "./business-units"
import { locations } from "./locations"
import { accounts } from "../finance/accounts"
import {
  idColumn,
  auditColumns,
  lifecycleColumns,
  metadataColumn,
} from "../shared/columns"

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
    effectiveFrom: date("effective_from")
      .notNull()
      .default(sql`current_date`),
    effectiveTo: date("effective_to"),
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    scopeUq: uniqueIndex("uq_item_entity_settings_scope").on(
      t.tenantId,
      t.itemId,
      t.legalEntityId,
      t.businessUnitId,
      t.locationId,
      t.effectiveFrom
    ),

    fkItem: foreignKey({
      columns: [t.tenantId, t.itemId],
      foreignColumns: [items.tenantId, items.id],
      name: "fk_item_entity_settings_item",
    }),
    fkLegalEntity: foreignKey({
      columns: [t.tenantId, t.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_item_entity_settings_legal_entity",
    }),
    fkBusinessUnit: foreignKey({
      columns: [t.tenantId, t.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_item_entity_settings_business_unit",
    }),
    fkLocation: foreignKey({
      columns: [t.tenantId, t.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_item_entity_settings_location",
    }),
    fkSalesAccount: foreignKey({
      columns: [t.tenantId, t.salesAccountId],
      foreignColumns: [accounts.tenantId, accounts.id],
      name: "fk_item_entity_settings_sales_account",
    }),
    fkInventoryAccount: foreignKey({
      columns: [t.tenantId, t.inventoryAccountId],
      foreignColumns: [accounts.tenantId, accounts.id],
      name: "fk_item_entity_settings_inventory_account",
    }),
    fkCogsAccount: foreignKey({
      columns: [t.tenantId, t.cogsAccountId],
      foreignColumns: [accounts.tenantId, accounts.id],
      name: "fk_item_entity_settings_cogs_account",
    }),

    effectiveCheck: check(
      "ck_item_entity_settings_dates",
      sql`${t.effectiveTo} is null or ${t.effectiveTo} >= ${t.effectiveFrom}`
    ),

    lookupIdx: index("idx_item_entity_settings_lookup").on(
      t.tenantId,
      t.itemId,
      t.legalEntityId,
      t.businessUnitId,
      t.locationId,
      t.effectiveFrom
    ),
  })
)
```

This table is where the later hardening patch becomes especially important because of `NULL` in composite uniqueness.

---

# 8. Finance mirror

---

## `schema/finance/fiscal-calendars.ts`

```ts
import {
  check,
  index,
  uniqueIndex,
  uuid,
  varchar,
  smallint,
} from "drizzle-orm/pg-core"
import { finance } from "./_schema"
import { tenants } from "../mdm/tenants"
import { fiscalCalendarTypeEnum, statusEnum } from "../shared/enums"
import {
  idColumn,
  auditColumns,
  lifecycleColumns,
  metadataColumn,
} from "../shared/columns"
import { sql } from "drizzle-orm"

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
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    tenantCodeUq: uniqueIndex("uq_fiscal_calendars_tenant_code").on(
      t.tenantId,
      t.calendarCode
    ),
    tenantIdIdUq: uniqueIndex("uq_fiscal_calendars_tenant_id_id").on(
      t.tenantId,
      t.id
    ),
    startMonthCheck: check(
      "ck_fiscal_calendars_start_month",
      sql`${t.startMonth} between 1 and 12`
    ),
    statusIdx: index("idx_fiscal_calendars_tenant_status").on(
      t.tenantId,
      t.status
    ),
  })
)
```

---

## `schema/finance/accounts.ts`

```ts
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
  boolean,
} from "drizzle-orm/pg-core"
import { finance } from "./_schema"
import { chartOfAccountSets } from "./chart-of-account-sets"
import {
  accountTypeEnum,
  postingTypeEnum,
  normalBalanceEnum,
  statusEnum,
} from "../shared/enums"
import {
  idColumn,
  auditColumns,
  lifecycleColumns,
  metadataColumn,
  aliasesColumn,
} from "../shared/columns"

export const accounts = finance.table(
  "accounts",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    coaSetId: uuid("coa_set_id").notNull(),
    parentAccountId: uuid("parent_account_id"),
    accountCode: varchar("account_code", { length: 50 }).notNull(),
    accountName: varchar("account_name", { length: 200 }).notNull(),
    accountType: accountTypeEnum("account_type").notNull(),
    postingType: postingTypeEnum("posting_type").notNull(),
    normalBalance: normalBalanceEnum("normal_balance").notNull(),
    isControlAccount: boolean("is_control_account").notNull().default(false),
    status: statusEnum("status").notNull().default("active"),
    ...aliasesColumn,
    ...metadataColumn,
    ...lifecycleColumns,
    ...auditColumns,
  },
  (t) => ({
    coaCodeUq: uniqueIndex("uq_accounts_coa_code").on(
      t.coaSetId,
      t.accountCode
    ),
    tenantIdIdUq: uniqueIndex("uq_accounts_tenant_id_id").on(t.tenantId, t.id),
    fkCoaSet: foreignKey({
      columns: [t.tenantId, t.coaSetId],
      foreignColumns: [chartOfAccountSets.tenantId, chartOfAccountSets.id],
      name: "fk_accounts_coa_set",
    }),
    statusIdx: index("idx_accounts_tenant_status").on(t.tenantId, t.status),
  })
)
```

---

# 9. Relations layer

Keep table files focused on shape and constraints.
Put `relations()` separately.

---

## `relations/mdm-relations.ts`

```ts
import { relations } from "drizzle-orm"
import { tenants } from "../schema/mdm/tenants"
import { legalEntities } from "../schema/mdm/legal-entities"
import { businessUnits } from "../schema/mdm/business-units"
import { locations } from "../schema/mdm/locations"
import { parties } from "../schema/mdm/parties"
import { items } from "../schema/mdm/items"
import { itemEntitySettings } from "../schema/mdm/item-entity-settings"

export const tenantsRelations = relations(tenants, ({ many }) => ({
  legalEntities: many(legalEntities),
  businessUnits: many(businessUnits),
  locations: many(locations),
  parties: many(parties),
  items: many(items),
}))

export const legalEntitiesRelations = relations(
  legalEntities,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [legalEntities.tenantId],
      references: [tenants.id],
    }),
    businessUnits: many(businessUnits),
    locations: many(locations),
  })
)

export const itemsRelations = relations(items, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [items.tenantId],
    references: [tenants.id],
  }),
  entitySettings: many(itemEntitySettings),
}))
```

Keep these explicit and boring. That is good architecture.

---

# 10. Barrel export

---

## `index.ts`

```ts
export * from "./schema/shared/enums"
export * from "./schema/shared/columns"

export * from "./schema/ref/currencies"
export * from "./schema/ref/countries"
export * from "./schema/ref/locales"
export * from "./schema/ref/timezones"
export * from "./schema/ref/uoms"

export * from "./schema/governance/data-sources"
export * from "./schema/governance/audit-logs"
export * from "./schema/governance/master-records"
export * from "./schema/governance/master-record-matches"
export * from "./schema/governance/master-record-merges"
export * from "./schema/governance/survivorship-rules"
export * from "./schema/governance/data-quality-issues"

export * from "./schema/iam/user-accounts"
export * from "./schema/iam/persons"
export * from "./schema/iam/tenant-memberships"
export * from "./schema/iam/tenant-roles"
export * from "./schema/iam/tenant-role-assignments"
export * from "./schema/iam/authority-policies"

export * from "./schema/mdm/addresses"
export * from "./schema/mdm/tenants"
export * from "./schema/mdm/tenant-profiles"
export * from "./schema/mdm/tenant-label-overrides"
export * from "./schema/mdm/tenant-policies"
export * from "./schema/mdm/document-sequences"
export * from "./schema/mdm/legal-entities"
export * from "./schema/mdm/business-units"
export * from "./schema/mdm/locations"
export * from "./schema/mdm/org-units"
export * from "./schema/mdm/parties"
export * from "./schema/mdm/party-addresses"
export * from "./schema/mdm/tax-registrations"
export * from "./schema/mdm/customers"
export * from "./schema/mdm/suppliers"
export * from "./schema/mdm/item-categories"
export * from "./schema/mdm/items"
export * from "./schema/mdm/item-entity-settings"
export * from "./schema/mdm/master-aliases"
export * from "./schema/mdm/external-identities"
export * from "./schema/mdm/custom-field-definitions"
export * from "./schema/mdm/custom-field-values"

export * from "./schema/finance/fiscal-calendars"
export * from "./schema/finance/fiscal-periods"
export * from "./schema/finance/chart-of-account-sets"
export * from "./schema/finance/accounts"
export * from "./schema/finance/legal-entity-coa-assignments"

export * from "./relations/mdm-relations"
export * from "./relations/iam-relations"
export * from "./relations/finance-relations"
export * from "./relations/governance-relations"
```

---

# 11. What should stay as raw SQL migrations

This is crucial.

Do **not** force Drizzle to pretend it natively owns every advanced PostgreSQL feature.

These should stay as raw SQL migration files:

- extensions
- trigger functions
- trigger attachment
- generated columns
- trigram indexes
- GIN indexes
- partial unique indexes
- views
- RLS
- exclusion / overlap prevention
- advanced custom validation triggers

That is the correct split of responsibility.

---

# 12. Hardening patch set

Now the second half: the patch set that makes this truly enterprise-grade.

This patch set is intentionally **raw PostgreSQL**.

---

## Patch A — trigger functions and trigger wiring

```sql
create or replace function governance.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function governance.bump_version_no()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.version_no = old.version_no + 1;
  end if;
  return new;
end;
$$;
```

Attach to all mutable master tables:

```sql
create trigger trg_tenants_set_updated_at
before update on mdm.tenants
for each row execute function governance.set_updated_at();

create trigger trg_tenants_bump_version
before update on mdm.tenants
for each row execute function governance.bump_version_no();

create trigger trg_legal_entities_set_updated_at
before update on mdm.legal_entities
for each row execute function governance.set_updated_at();

create trigger trg_legal_entities_bump_version
before update on mdm.legal_entities
for each row execute function governance.bump_version_no();

create trigger trg_parties_set_updated_at
before update on mdm.parties
for each row execute function governance.set_updated_at();

create trigger trg_parties_bump_version
before update on mdm.parties
for each row execute function governance.bump_version_no();

create trigger trg_items_set_updated_at
before update on mdm.items
for each row execute function governance.set_updated_at();

create trigger trg_items_bump_version
before update on mdm.items
for each row execute function governance.bump_version_no();
```

Repeat for the rest.

---

## Patch B — generated normalized search column for parties

```sql
alter table mdm.parties
  add column if not exists canonical_name_normalized text
  generated always as (
    lower(regexp_replace(canonical_name, '\s+', ' ', 'g'))
  ) stored;
```

Index it:

```sql
create index if not exists idx_parties_canonical_name_normalized
  on mdm.parties (tenant_id, canonical_name_normalized);
```

Why this matters:

- search
- dedup
- match candidate generation

---

## Patch C — GIN and trigram indexes

```sql
create extension if not exists pg_trgm;

create index if not exists idx_parties_display_name_trgm
  on mdm.parties using gin (display_name gin_trgm_ops);

create index if not exists idx_parties_canonical_name_trgm
  on mdm.parties using gin (canonical_name gin_trgm_ops);

create index if not exists idx_items_name_trgm
  on mdm.items using gin (item_name gin_trgm_ops);

create index if not exists idx_legal_entities_name_trgm
  on mdm.legal_entities using gin (legal_name gin_trgm_ops);

create index if not exists idx_parties_aliases_gin
  on mdm.parties using gin (aliases);

create index if not exists idx_items_aliases_gin
  on mdm.items using gin (aliases);

create index if not exists idx_tenant_policies_value_gin
  on mdm.tenant_policies using gin (policy_value);

create index if not exists idx_item_entity_settings_reorder_policy_gin
  on mdm.item_entity_settings using gin (reorder_policy);
```

---

## Patch D — partial unique indexes for soft-delete-aware alternates

These are more correct than plain unique constraints when optional values and soft deletes are involved.

```sql
create unique index if not exists uq_legal_entities_registration_active
  on mdm.legal_entities (tenant_id, registration_number)
  where registration_number is not null and is_deleted = false;

create unique index if not exists uq_legal_entities_tax_registration_active
  on mdm.legal_entities (tenant_id, tax_registration_number)
  where tax_registration_number is not null and is_deleted = false;

create unique index if not exists uq_tenants_name_active
  on mdm.tenants (tenant_name)
  where is_deleted = false;
```

---

## Patch E — nullable-scope uniqueness hardening

This is one of the most important real fixes.

The ordinary unique constraint on:

```sql
(tenant_id, item_id, legal_entity_id, business_unit_id, location_id, effective_from)
```

is not enough when nullable columns are present.

### Better solution: scope-specific partial unique indexes

#### Tenant-level item settings

```sql
create unique index if not exists uq_item_entity_settings_le_only
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, effective_from)
  where business_unit_id is null
    and location_id is null
    and is_deleted = false;
```

#### Business-unit-level item settings

```sql
create unique index if not exists uq_item_entity_settings_bu
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, business_unit_id, effective_from)
  where business_unit_id is not null
    and location_id is null
    and is_deleted = false;
```

#### Location-level item settings

```sql
create unique index if not exists uq_item_entity_settings_location
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, location_id, effective_from)
  where location_id is not null
    and is_deleted = false;
```

This is much stronger than relying on a single nullable composite unique.

The same strategy should be applied to any scoped table with nullable hierarchy columns.

---

## Patch F — “one preferred alias” per master/type

```sql
create unique index if not exists uq_master_aliases_preferred
  on mdm.master_aliases (tenant_id, master_domain, master_id, alias_type)
  where is_preferred = true and is_deleted = false;
```

This ensures:

- only one preferred barcode
- only one preferred short name
- only one preferred legacy code per alias type

---

## Patch G — one default sequence per scope

```sql
create unique index if not exists uq_document_sequences_default
  on mdm.document_sequences (tenant_id, legal_entity_id, document_type)
  where is_default = true and is_deleted = false;
```

This is operationally critical.

---

## Patch H — temporal overlap prevention

For serious ERP, date validity cannot overlap for same scope.

Simplest advanced strategy: use range type + exclusion constraint.
That needs `btree_gist`.

```sql
create extension if not exists btree_gist;
```

Example for `tenant_policies`:

```sql
alter table mdm.tenant_policies
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;
```

Then:

```sql
alter table mdm.tenant_policies
  add constraint ex_tenant_policies_no_overlap
  exclude using gist (
    tenant_id with =,
    policy_domain with =,
    policy_key with =,
    effective_range with &&
  )
  where (is_deleted = false);
```

This is powerful.

Apply the same pattern to:

- `tenant_policies`
- `business_units`
- `locations`
- `party_addresses`
- `tax_registrations`
- `item_entity_settings`
- `legal_entity_coa_assignments`
- `tenant_role_assignments`

---

## Patch I — polymorphic master reference validation trigger

Tables like:

- `master_aliases`
- `external_identities`
- `master_records`

use `master_domain + master_id`.

A plain FK cannot validate domain-target pair.
So use a trigger.

```sql
create or replace function governance.validate_master_domain_reference()
returns trigger
language plpgsql
as $$
declare
  v_exists boolean;
begin
  if new.master_domain = 'party' then
    select exists (
      select 1 from mdm.parties
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'item' then
    select exists (
      select 1 from mdm.items
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'legal_entity' then
    select exists (
      select 1 from mdm.legal_entities
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'business_unit' then
    select exists (
      select 1 from mdm.business_units
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'location' then
    select exists (
      select 1 from mdm.locations
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'account' then
    select exists (
      select 1 from finance.accounts
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  else
    raise exception 'Unsupported master_domain: %', new.master_domain;
  end if;

  if not v_exists then
    raise exception 'Invalid master reference for domain %, tenant %, id %',
      new.master_domain, new.tenant_id, new.master_id;
  end if;

  return new;
end;
$$;
```

Attach it:

```sql
create trigger trg_master_aliases_validate_domain_ref
before insert or update on mdm.master_aliases
for each row execute function governance.validate_master_domain_reference();

create trigger trg_external_identities_validate_domain_ref
before insert or update on mdm.external_identities
for each row execute function governance.validate_master_domain_reference();
```

This is absolutely the right hardening.

---

## Patch J — sequence allocation function

Do not allocate document numbers with naive app-side increments.

Use a SQL function.

```sql
create or replace function mdm.allocate_document_number(
  p_tenant_id uuid,
  p_legal_entity_id uuid,
  p_document_type varchar,
  p_sequence_code varchar
)
returns table (
  sequence_id uuid,
  allocated_number bigint,
  formatted_number text
)
language plpgsql
as $$
declare
  v_seq record;
begin
  select *
  into v_seq
  from mdm.document_sequences
  where tenant_id = p_tenant_id
    and document_type = p_document_type
    and (
      (legal_entity_id is null and p_legal_entity_id is null)
      or legal_entity_id = p_legal_entity_id
    )
    and sequence_code = p_sequence_code
    and is_deleted = false
    and status = 'active'
  for update;

  if not found then
    raise exception 'No active document sequence found';
  end if;

  update mdm.document_sequences
  set next_number = next_number + 1
  where id = v_seq.id;

  sequence_id := v_seq.id;
  allocated_number := v_seq.next_number;
  formatted_number := coalesce(v_seq.prefix_pattern, '')
    || lpad(v_seq.next_number::text, v_seq.padding_length, '0')
    || coalesce(v_seq.suffix_pattern, '');

  return next;
end;
$$;
```

This prevents race conditions.

---

## Patch K — canonical views

```sql
create or replace view mdm.v_current_tenant_policies as
select *
from mdm.tenant_policies
where is_deleted = false
  and status = 'active'
  and effective_from <= current_date
  and (effective_to is null or effective_to >= current_date);
```

```sql
create or replace view mdm.v_golden_parties as
select *
from mdm.parties
where is_deleted = false
  and status = 'active'
  and mdm_status = 'golden'
  and effective_from <= current_date
  and (effective_to is null or effective_to >= current_date);
```

```sql
create or replace view mdm.v_golden_items as
select *
from mdm.items
where is_deleted = false
  and status = 'active'
  and mdm_status = 'golden'
  and effective_from <= current_date
  and (effective_to is null or effective_to >= current_date);
```

This prevents filter drift across services.

---

## Patch L — row-level security preparation

Do not enable immediately unless your request context propagation is stable.
But design for it now.

```sql
alter table mdm.parties enable row level security;

create policy tenant_isolation_parties
on mdm.parties
using (
  tenant_id = current_setting('app.tenant_id', true)::uuid
);
```

Replicate for:

- items
- legal_entities
- business_units
- locations
- customers
- suppliers
- item_entity_settings
- tenant_policies

This is optional but excellent.

---

# 13. How to use this in Drizzle migrations

Recommended split:

## Migration 0001

- schemas
- enums
- tables
- base PK/FK/checks
- basic indexes

## Migration 0002

- trigger functions
- trigger bindings
- generated columns
- GIN/trigram indexes
- partial unique indexes
- exclusion constraints
- validation triggers
- views
- sequence allocation function
- RLS

This separation is clean and auditable.

---

# 14. Practical discipline for the team

Use these rules:

## Rule 1

**Every tenant-owned table must have `tenant_id`.**

## Rule 2

Where a child references a tenant-owned parent, prefer:

- composite FK `(tenant_id, parent_id)`
  over
- FK on `parent_id` only

## Rule 3

Where nullable scope columns exist, never trust plain composite unique alone.
Use partial unique indexes.

## Rule 4

Where temporal records matter, no-overlap must be enforced in PostgreSQL, not only in service code.

## Rule 5

Use Drizzle for:

- type-safe queries
- schema mirror
- relations
- basic constraints

Use raw PostgreSQL migrations for:

- advanced integrity
- performance
- concurrency correctness

---

# 15. Final verdict

The correct implementation path is:

## Drizzle mirror

- clean modular table definitions
- reusable columns
- bounded enums
- composite FK where tenant safety matters
- separate relations layer
- schema barrels

## Hardening patch set

- generated columns
- trigger functions
- partial unique indexes
- overlap prevention
- sequence allocation function
- polymorphic master-domain validation
- views
- RLS

That combination gives you:

- **ORM ergonomics**
- **PostgreSQL truth**
- **enterprise-grade integrity**
- **MDM-ready tenant architecture**

---

# 16. Strong next step

The next best deliverable is a **drop-in code pack** for the most critical files only, in this order:

1. `shared/enums.ts`
2. `shared/columns.ts`
3. `mdm/tenants.ts`
4. `mdm/legal-entities.ts`
5. `mdm/business-units.ts`
6. `mdm/locations.ts`
7. `mdm/parties.ts`
8. `mdm/items.ts`
9. `finance/accounts.ts`
10. `0002_hardening.sql`

That would give you the real spine first, not just the outline.
