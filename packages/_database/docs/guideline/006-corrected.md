# Corrected Canonical ERP Tenant-MDM Pack

This pack fixes the earlier issues:

- no local stub table declarations in feature files
- no broken spread syntax
- one canonical schema owner per file
- DB-hard features remain in SQL migrations
- Drizzle mirrors structure and query surfaces only

---

## 1. `schema/shared/enums.ts`

```ts
import { pgEnum } from "drizzle-orm/pg-core"

export const genericStatusEnum = pgEnum("generic_status", [
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

export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
])

export const postingTypeEnum = pgEnum("posting_type", ["posting", "heading"])
export const normalBalanceEnum = pgEnum("normal_balance", ["debit", "credit"])

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

export const masterDomainEnum = pgEnum("master_domain", [
  "party",
  "item",
  "legal_entity",
  "business_unit",
  "location",
  "account",
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

export const tenantPolicyDataTypeEnum = pgEnum("tenant_policy_data_type", [
  "boolean",
  "integer",
  "numeric",
  "text",
  "json",
  "enum",
])
```

---

## 2. `schema/shared/columns.ts`

```ts
import { sql } from "drizzle-orm"
import {
  boolean,
  char,
  date,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
  type PgColumnBuilderBase,
} from "drizzle-orm/pg-core"

export const idColumn = {
  id: uuid("id").primaryKey().defaultRandom(),
}

export const tenantIdColumn = {
  tenantId: uuid("tenant_id").notNull(),
}

export const softDeleteColumn = {
  isDeleted: boolean("is_deleted").notNull().default(false),
}

export const effectiveDateColumns = {
  effectiveFrom: date("effective_from")
    .notNull()
    .default(sql`current_date`),
  effectiveTo: date("effective_to"),
}

export const createdUpdatedVersionColumns = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  versionNo: integer("version_no").notNull().default(1),
}

export const createdUpdatedVersionActorColumns = {
  ...createdUpdatedVersionColumns,
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
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

export function currencyCodeColumn(name: string) {
  return char(name, { length: 3 })
}

export function countryCodeColumn(name: string) {
  return char(name, { length: 2 })
}

export function codeVarchar(name: string, length = 50) {
  return varchar(name, { length }).notNull()
}

export function nameVarchar(name: string, length = 255) {
  return varchar(name, { length }).notNull()
}
```

---

## 3. `schema/ref/_schema.ts`

```ts
import { pgSchema } from "drizzle-orm/pg-core"

export const ref = pgSchema("ref")
```

## 4. `schema/mdm/_schema.ts`

```ts
import { pgSchema } from "drizzle-orm/pg-core"

export const mdm = pgSchema("mdm")
```

## 5. `schema/iam/_schema.ts`

```ts
import { pgSchema } from "drizzle-orm/pg-core"

export const iam = pgSchema("iam")
```

## 6. `schema/finance/_schema.ts`

```ts
import { pgSchema } from "drizzle-orm/pg-core"

export const finance = pgSchema("finance")
```

## 7. `schema/governance/_schema.ts`

```ts
import { pgSchema } from "drizzle-orm/pg-core"

export const governance = pgSchema("governance")
```

---

## 8. `schema/ref/currencies.ts`

```ts
import {
  boolean,
  char,
  check,
  index,
  integer,
  smallint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"
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
  (table) => ({
    idxName: index("idx_currencies_name").on(table.name),
    ckMinorUnit: check(
      "ck_currencies_minor_unit",
      sql`${table.minorUnit} between 0 and 6`
    ),
  })
)
```

---

## 9. `schema/ref/countries.ts`

```ts
import { boolean, char, integer, timestamp, varchar } from "drizzle-orm/pg-core"

import { ref } from "./_schema"

export const countries = ref.table("countries", {
  code: char("code", { length: 2 }).primaryKey(),
  alpha3Code: char("alpha3_code", { length: 3 }),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  versionNo: integer("version_no").notNull().default(1),
})
```

---

## 10. `schema/ref/locales.ts`

```ts
import { boolean, integer, timestamp, varchar } from "drizzle-orm/pg-core"

import { ref } from "./_schema"

export const locales = ref.table("locales", {
  code: varchar("code", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  versionNo: integer("version_no").notNull().default(1),
})
```

---

## 11. `schema/ref/timezones.ts`

```ts
import { boolean, integer, timestamp, varchar } from "drizzle-orm/pg-core"

import { ref } from "./_schema"

export const timezones = ref.table("timezones", {
  name: varchar("name", { length: 100 }).primaryKey(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  versionNo: integer("version_no").notNull().default(1),
})
```

---

## 12. `schema/ref/uoms.ts`

```ts
import {
  boolean,
  index,
  integer,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

import { ref } from "./_schema"

export const uoms = ref.table(
  "uoms",
  {
    code: varchar("code", { length: 20 }).primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    symbol: varchar("symbol", { length: 20 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    versionNo: integer("version_no").notNull().default(1),
  },
  (table) => ({
    idxCategory: index("idx_uoms_category").on(table.category),
  })
)
```

---

## 13. `schema/governance/data-sources.ts`

```ts
import {
  boolean,
  check,
  index,
  integer,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

import { governance } from "./_schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { genericStatusEnum, sourceTypeEnum } from "../shared/enums"

export const dataSources = governance.table(
  "data_sources",
  {
    ...idColumn,
    sourceCode: varchar("source_code", { length: 50 }).notNull(),
    sourceName: varchar("source_name", { length: 200 }).notNull(),
    sourceType: sourceTypeEnum("source_type").notNull(),
    priorityRank: integer("priority_rank").notNull().default(100),
    isAuthoritative: boolean("is_authoritative").notNull().default(false),
    status: genericStatusEnum("status").notNull().default("active"),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqSourceCode: uniqueIndex("uq_data_sources_source_code").on(
      table.sourceCode
    ),
    idxStatus: index("idx_data_sources_status").on(table.status),
    ckPriorityRank: check(
      "ck_data_sources_priority_rank",
      sql`${table.priorityRank} > 0`
    ),
  })
)
```

---

## 14. `schema/iam/user-accounts.ts`

```ts
import {
  boolean,
  check,
  index,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

import { iam } from "./_schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { locales } from "../ref/locales"
import { timezones } from "../ref/timezones"

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
      () => locales.code
    ),
    timezoneName: varchar("timezone_name", { length: 100 }).references(
      () => timezones.name
    ),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqUsername: uniqueIndex("uq_user_accounts_username").on(table.username),
    uqEmail: uniqueIndex("uq_user_accounts_email").on(table.email),
    idxStatus: index("idx_user_accounts_status").on(table.accountStatus),
    ckStatus: check(
      "ck_user_accounts_status",
      sql`${table.accountStatus} in ('invited','active','suspended','locked','archived')`
    ),
  })
)
```

---

## 15. `schema/iam/persons.ts`

```ts
import { date, index, varchar } from "drizzle-orm/pg-core"

import { iam } from "./_schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
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
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    idxFullName: index("idx_persons_full_name").on(table.fullName),
    idxPrimaryEmail: index("idx_persons_primary_email").on(table.primaryEmail),
  })
)
```

---

## 16. `schema/mdm/tenants.ts`

```ts
import { sql } from "drizzle-orm"
import { check, index, uniqueIndex, varchar, date } from "drizzle-orm/pg-core"

import { mdm } from "./_schema"
import {
  aliasesColumn,
  countryCodeColumn,
  createdUpdatedVersionActorColumns,
  currencyCodeColumn,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import {
  genericStatusEnum,
  governanceLevelEnum,
  tenantTypeEnum,
} from "../shared/enums"
import { countries } from "../ref/countries"
import { currencies } from "../ref/currencies"
import { locales } from "../ref/locales"
import { timezones } from "../ref/timezones"

export const tenants = mdm.table(
  "tenants",
  {
    ...idColumn,
    tenantCode: varchar("tenant_code", { length: 50 }).notNull(),
    tenantName: varchar("tenant_name", { length: 200 }).notNull(),
    tenantType: tenantTypeEnum("tenant_type").notNull(),
    status: genericStatusEnum("status").notNull(),
    baseCurrencyCode: currencyCodeColumn("base_currency_code")
      .notNull()
      .references(() => currencies.code),
    reportingCurrencyCode: currencyCodeColumn(
      "reporting_currency_code"
    ).references(() => currencies.code),
    defaultLocaleCode: varchar("default_locale_code", { length: 20 })
      .notNull()
      .references(() => locales.code),
    defaultTimezoneName: varchar("default_timezone_name", { length: 100 })
      .notNull()
      .references(() => timezones.name),
    countryCode: countryCodeColumn("country_code")
      .notNull()
      .references(() => countries.code),
    activationDate: date("activation_date"),
    deactivationDate: date("deactivation_date"),
    mdmGovernanceLevel: governanceLevelEnum("mdm_governance_level").notNull(),
    ...aliasesColumn,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_tenants_tenant_code").on(table.tenantCode),
    idxStatus: index("idx_tenants_status").on(table.status),
    ckDeactivationDate: check(
      "ck_tenants_deactivation_date",
      sql`${table.deactivationDate} is null or ${table.activationDate} is null or ${table.deactivationDate} >= ${table.activationDate}`
    ),
  })
)
```

---

## 17. `schema/mdm/legal-entities.ts`

```ts
import { sql } from "drizzle-orm"
import { check, index, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

import { mdm } from "./_schema"
import {
  aliasesColumn,
  countryCodeColumn,
  createdUpdatedVersionActorColumns,
  currencyCodeColumn,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { genericStatusEnum, legalEntityTypeEnum } from "../shared/enums"
import { countries } from "../ref/countries"
import { currencies } from "../ref/currencies"
import { tenants } from "./tenants"

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
    countryCode: countryCodeColumn("country_code")
      .notNull()
      .references(() => countries.code),
    baseCurrencyCode: currencyCodeColumn("base_currency_code")
      .notNull()
      .references(() => currencies.code),
    fiscalCalendarId: uuid("fiscal_calendar_id"),
    status: genericStatusEnum("status").notNull(),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_legal_entities_tenant_code").on(
      table.tenantId,
      table.entityCode
    ),
    uqTenantIdId: uniqueIndex("uq_legal_entities_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_legal_entities_tenant_status").on(
      table.tenantId,
      table.status
    ),
    ckEffectiveDates: check(
      "ck_legal_entities_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)
```

---

## 18. `schema/mdm/business-units.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { mdm } from "./_schema"
import {
  aliasesColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { businessUnitTypeEnum, genericStatusEnum } from "../shared/enums"
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
    status: genericStatusEnum("status").notNull(),
    ...aliasesColumn,
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantLegalEntityCode: uniqueIndex(
      "uq_business_units_tenant_legal_entity_code"
    ).on(table.tenantId, table.legalEntityId, table.buCode),
    uqTenantIdId: uniqueIndex("uq_business_units_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_business_units_tenant_status").on(
      table.tenantId,
      table.status
    ),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_business_units_tenant_legal_entity",
    }),
    ckEffectiveDates: check(
      "ck_business_units_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)
```

---

## 19. `schema/mdm/locations.ts`

```ts
import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { mdm } from "./_schema"
import {
  aliasesColumn,
  countryCodeColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { genericStatusEnum, locationTypeEnum } from "../shared/enums"
import { countries } from "../ref/countries"
import { timezones } from "../ref/timezones"
import { addresses } from "./addresses"
import { businessUnits } from "./business-units"
import { legalEntities } from "./legal-entities"

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
    timezoneName: varchar("timezone_name", { length: 100 })
      .notNull()
      .references(() => timezones.name),
    countryCode: countryCodeColumn("country_code")
      .notNull()
      .references(() => countries.code),
    isOperatingSite: boolean("is_operating_site").notNull().default(true),
    status: genericStatusEnum("status").notNull(),
    ...aliasesColumn,
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantLegalEntityCode: uniqueIndex(
      "uq_locations_tenant_legal_entity_code"
    ).on(table.tenantId, table.legalEntityId, table.locationCode),
    uqTenantIdId: uniqueIndex("uq_locations_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_locations_tenant_status").on(
      table.tenantId,
      table.status
    ),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_locations_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_locations_tenant_business_unit",
    }),
    ckEffectiveDates: check(
      "ck_locations_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)
```

---

## 20. `schema/mdm/addresses.ts`

```ts
import { timestamp, uuid, varchar, integer } from "drizzle-orm/pg-core"

import { mdm } from "./_schema"
import {
  countryCodeColumn,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { countries } from "../ref/countries"

export const addresses = mdm.table("addresses", {
  ...idColumn,
  countryCode: countryCodeColumn("country_code")
    .notNull()
    .references(() => countries.code),
  addressLine1: varchar("address_line_1", { length: 255 }).notNull(),
  addressLine2: varchar("address_line_2", { length: 255 }),
  addressLine3: varchar("address_line_3", { length: 255 }),
  city: varchar("city", { length: 120 }),
  stateRegion: varchar("state_region", { length: 120 }),
  postalCode: varchar("postal_code", { length: 30 }),
  ...metadataColumn,
  ...softDeleteColumn,
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  versionNo: integer("version_no").notNull().default(1),
})
```

---

## 21. `schema/finance/chart-of-account-sets.ts`

```ts
import { boolean, index, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

import { finance } from "./_schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { genericStatusEnum } from "../shared/enums"
import { tenants } from "../mdm/tenants"

export const chartOfAccountSets = finance.table(
  "chart_of_account_sets",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    coaCode: varchar("coa_code", { length: 50 }).notNull(),
    coaName: varchar("coa_name", { length: 200 }).notNull(),
    status: genericStatusEnum("status").notNull().default("active"),
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

## 22. `schema/finance/accounts.ts`

```ts
import {
  boolean,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { finance } from "./_schema"
import {
  aliasesColumn,
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import {
  accountTypeEnum,
  genericStatusEnum,
  normalBalanceEnum,
  postingTypeEnum,
} from "../shared/enums"
import { chartOfAccountSets } from "./chart-of-account-sets"

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
    status: genericStatusEnum("status").notNull().default("active"),
    ...aliasesColumn,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqCoaCode: uniqueIndex("uq_accounts_coa_code").on(
      table.coaSetId,
      table.accountCode
    ),
    uqTenantIdId: uniqueIndex("uq_accounts_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_accounts_tenant_status").on(
      table.tenantId,
      table.status
    ),
    fkCoaSet: foreignKey({
      columns: [table.tenantId, table.coaSetId],
      foreignColumns: [chartOfAccountSets.tenantId, chartOfAccountSets.id],
      name: "fk_accounts_coa_set",
    }),
    fkParent: foreignKey({
      columns: [table.parentAccountId],
      foreignColumns: [table.id],
      name: "fk_accounts_parent",
    }),
  })
)
```

---

## 23. `schema/mdm/items.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { mdm } from "./_schema"
import {
  aliasesColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import {
  genericStatusEnum,
  itemTypeEnum,
  mdmStatusEnum,
  ownershipLevelEnum,
  valuationMethodEnum,
} from "../shared/enums"
import { uoms } from "../ref/uoms"
import { dataSources } from "../governance/data-sources"
import { businessUnits } from "./business-units"
import { itemCategories } from "./item-categories"
import { legalEntities } from "./legal-entities"
import { locations } from "./locations"
import { tenants } from "./tenants"

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
    baseUomCode: varchar("base_uom_code", { length: 20 })
      .notNull()
      .references(() => uoms.code),
    categoryId: uuid("category_id"),
    ownershipLevel: ownershipLevelEnum("ownership_level")
      .notNull()
      .default("tenant"),
    legalEntityId: uuid("legal_entity_id"),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    valuationMethod: valuationMethodEnum("valuation_method"),
    status: genericStatusEnum("status").notNull(),
    mdmStatus: mdmStatusEnum("mdm_status").notNull().default("golden"),
    sourceSystemId: uuid("source_system_id").references(() => dataSources.id),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_items_tenant_code").on(
      table.tenantId,
      table.itemCode
    ),
    uqTenantIdId: uniqueIndex("uq_items_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_items_tenant_status").on(
      table.tenantId,
      table.status
    ),
    idxTenantMdmStatus: index("idx_items_tenant_mdm_status").on(
      table.tenantId,
      table.mdmStatus
    ),
    fkCategory: foreignKey({
      columns: [table.tenantId, table.categoryId],
      foreignColumns: [itemCategories.tenantId, itemCategories.id],
      name: "fk_items_category",
    }),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_items_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_items_tenant_business_unit",
    }),
    fkTenantLocation: foreignKey({
      columns: [table.tenantId, table.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_items_tenant_location",
    }),
    ckEffectiveDates: check(
      "ck_items_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    ckOwnershipScope: check(
      "ck_items_ownership_scope",
      sql`(
        (${table.ownershipLevel} = 'tenant' and ${table.legalEntityId} is null and ${table.businessUnitId} is null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'legal_entity' and ${table.legalEntityId} is not null and ${table.businessUnitId} is null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'business_unit' and ${table.legalEntityId} is not null and ${table.businessUnitId} is not null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'location' and ${table.legalEntityId} is not null and ${table.locationId} is not null)
      )`
    ),
  })
)
```

---

## 24. `schema/mdm/item-categories.ts`

```ts
import { index, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

import { mdm } from "./_schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { genericStatusEnum } from "../shared/enums"
import { tenants } from "./tenants"

export const itemCategories = mdm.table(
  "item_categories",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    categoryCode: varchar("category_code", { length: 50 }).notNull(),
    categoryName: varchar("category_name", { length: 200 }).notNull(),
    parentCategoryId: uuid("parent_category_id"),
    status: genericStatusEnum("status").notNull().default("active"),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_item_categories_tenant_code").on(
      table.tenantId,
      table.categoryCode
    ),
    uqTenantIdId: uniqueIndex("uq_item_categories_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_item_categories_tenant_status").on(
      table.tenantId,
      table.status
    ),
  })
)
```

---

## 25. `schema/mdm/item-entity-settings.ts`

```ts
import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { mdm } from "./_schema"
import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { accounts } from "../finance/accounts"
import { businessUnits } from "./business-units"
import { items } from "./items"
import { legalEntities } from "./legal-entities"
import { locations } from "./locations"

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

## 26. `schema/mdm/tenant-policies.ts`

```ts
import { sql } from "drizzle-orm"
import { check, index, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

import { mdm } from "./_schema"
import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { genericStatusEnum, tenantPolicyDataTypeEnum } from "../shared/enums"
import { tenants } from "./tenants"

export const tenantPolicies = mdm.table(
  "tenant_policies",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    policyDomain: varchar("policy_domain", { length: 50 }).notNull(),
    policyKey: varchar("policy_key", { length: 100 }).notNull(),
    dataType: tenantPolicyDataTypeEnum("data_type").notNull(),
    policyValue: metadataColumn.metadata,
    ...effectiveDateColumns,
    status: genericStatusEnum("status").notNull().default("active"),
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
    idxLookup: index("idx_tenant_policies_lookup").on(
      table.tenantId,
      table.policyDomain,
      table.policyKey,
      table.effectiveFrom
    ),
    ckEffectiveDates: check(
      "ck_tenant_policies_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)
```

---

## 27. `schema/mdm/master-aliases.ts`

```ts
import {
  boolean,
  check,
  index,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

import { mdm } from "./_schema"
import {
  createdUpdatedVersionColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { aliasTypeEnum, masterDomainEnum } from "../shared/enums"
import { dataSources } from "../governance/data-sources"
import { tenants } from "./tenants"

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

## 28. `schema/mdm/external-identities.ts`

```ts
import {
  index,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { mdm } from "./_schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { masterDomainEnum } from "../shared/enums"
import { dataSources } from "../governance/data-sources"
import { tenants } from "./tenants"

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
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
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

---

## 29. `schema/iam/tenant-memberships.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { iam } from "./_schema"
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
import { persons } from "./persons"
import { userAccounts } from "./user-accounts"

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

## 30. `schema/iam/tenant-roles.ts`

```ts
import { boolean, index, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core"

import { iam } from "./_schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { roleCategoryEnum } from "../shared/enums"
import { tenants } from "../mdm/tenants"

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

## 31. `schema/iam/tenant-role-assignments.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import { iam } from "./_schema"
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

## 32. `schema/finance/fiscal-calendars.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  index,
  smallint,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { finance } from "./_schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { fiscalCalendarTypeEnum, genericStatusEnum } from "../shared/enums"
import { tenants } from "../mdm/tenants"

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
    status: genericStatusEnum("status").notNull().default("active"),
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

## 33. `schema/finance/fiscal-periods.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  integer,
  uniqueIndex,
  uuid,
  varchar,
  date,
} from "drizzle-orm/pg-core"

import { finance } from "./_schema"
import {
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { fiscalPeriodStatusEnum } from "../shared/enums"
import { fiscalCalendars } from "./fiscal-calendars"

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

## 34. `queries/resolve-current-tenant-policy.ts`

```ts
import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"
import type { PgDatabase } from "drizzle-orm/pg-core"

import { tenantPolicies } from "../schema/mdm/tenant-policies"

export type TenantPolicyRecord = InferSelectModel<typeof tenantPolicies>

export type ResolveCurrentTenantPolicyParams = {
  tenantId: string
  policyDomain: string
  policyKey: string
  asOfDate?: string
}

export async function resolveCurrentTenantPolicy(
  db: PgDatabase<any, any, any>,
  params: ResolveCurrentTenantPolicyParams
): Promise<TenantPolicyRecord | null> {
  const {
    tenantId,
    policyDomain,
    policyKey,
    asOfDate = new Date().toISOString().slice(0, 10),
  } = params

  const rows = await db
    .select()
    .from(tenantPolicies)
    .where(
      and(
        eq(tenantPolicies.tenantId, tenantId),
        eq(tenantPolicies.policyDomain, policyDomain),
        eq(tenantPolicies.policyKey, policyKey),
        eq(tenantPolicies.status, "active"),
        eq(tenantPolicies.isDeleted, false),
        lte(tenantPolicies.effectiveFrom, asOfDate),
        or(
          isNull(tenantPolicies.effectiveTo),
          gte(tenantPolicies.effectiveTo, asOfDate)
        )
      )
    )
    .orderBy(desc(tenantPolicies.effectiveFrom), desc(tenantPolicies.createdAt))
    .limit(1)

  return rows[0] ?? null
}
```

---

## 35. `queries/resolve-item-settings.ts`

```ts
import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"
import type { PgDatabase } from "drizzle-orm/pg-core"

import { itemEntitySettings } from "../schema/mdm/item-entity-settings"

export type ItemEntitySettingsRecord = InferSelectModel<
  typeof itemEntitySettings
>

export type ResolveItemSettingsParams = {
  tenantId: string
  itemId: string
  legalEntityId: string
  businessUnitId?: string | null
  locationId?: string | null
  asOfDate?: string
}

export type ResolvedItemSettings = {
  record: ItemEntitySettingsRecord | null
  resolvedScope: "location" | "business_unit" | "legal_entity" | null
}

export async function resolveItemSettings(
  db: PgDatabase<any, any, any>,
  params: ResolveItemSettingsParams
): Promise<ResolvedItemSettings> {
  const {
    tenantId,
    itemId,
    legalEntityId,
    businessUnitId = null,
    locationId = null,
    asOfDate = new Date().toISOString().slice(0, 10),
  } = params

  if (locationId) {
    const rows = await db
      .select()
      .from(itemEntitySettings)
      .where(
        and(
          eq(itemEntitySettings.tenantId, tenantId),
          eq(itemEntitySettings.itemId, itemId),
          eq(itemEntitySettings.legalEntityId, legalEntityId),
          eq(itemEntitySettings.locationId, locationId),
          eq(itemEntitySettings.isDeleted, false),
          eq(itemEntitySettings.isActive, true),
          lte(itemEntitySettings.effectiveFrom, asOfDate),
          or(
            isNull(itemEntitySettings.effectiveTo),
            gte(itemEntitySettings.effectiveTo, asOfDate)
          )
        )
      )
      .orderBy(
        desc(itemEntitySettings.effectiveFrom),
        desc(itemEntitySettings.createdAt)
      )
      .limit(1)

    if (rows[0]) {
      return { record: rows[0], resolvedScope: "location" }
    }
  }

  if (businessUnitId) {
    const rows = await db
      .select()
      .from(itemEntitySettings)
      .where(
        and(
          eq(itemEntitySettings.tenantId, tenantId),
          eq(itemEntitySettings.itemId, itemId),
          eq(itemEntitySettings.legalEntityId, legalEntityId),
          eq(itemEntitySettings.businessUnitId, businessUnitId),
          isNull(itemEntitySettings.locationId),
          eq(itemEntitySettings.isDeleted, false),
          eq(itemEntitySettings.isActive, true),
          lte(itemEntitySettings.effectiveFrom, asOfDate),
          or(
            isNull(itemEntitySettings.effectiveTo),
            gte(itemEntitySettings.effectiveTo, asOfDate)
          )
        )
      )
      .orderBy(
        desc(itemEntitySettings.effectiveFrom),
        desc(itemEntitySettings.createdAt)
      )
      .limit(1)

    if (rows[0]) {
      return { record: rows[0], resolvedScope: "business_unit" }
    }
  }

  const rows = await db
    .select()
    .from(itemEntitySettings)
    .where(
      and(
        eq(itemEntitySettings.tenantId, tenantId),
        eq(itemEntitySettings.itemId, itemId),
        eq(itemEntitySettings.legalEntityId, legalEntityId),
        isNull(itemEntitySettings.businessUnitId),
        isNull(itemEntitySettings.locationId),
        eq(itemEntitySettings.isDeleted, false),
        eq(itemEntitySettings.isActive, true),
        lte(itemEntitySettings.effectiveFrom, asOfDate),
        or(
          isNull(itemEntitySettings.effectiveTo),
          gte(itemEntitySettings.effectiveTo, asOfDate)
        )
      )
    )
    .orderBy(
      desc(itemEntitySettings.effectiveFrom),
      desc(itemEntitySettings.createdAt)
    )
    .limit(1)

  if (rows[0]) {
    return { record: rows[0], resolvedScope: "legal_entity" }
  }

  return { record: null, resolvedScope: null }
}
```

---

## 36. `queries/resolve-membership-scope.ts`

```ts
import { and, eq, gte, isNull, lte, or } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"
import type { PgDatabase } from "drizzle-orm/pg-core"

import { tenantMemberships } from "../schema/iam/tenant-memberships"
import { tenantRoleAssignments } from "../schema/iam/tenant-role-assignments"
import { tenantRoles } from "../schema/iam/tenant-roles"

export type TenantMembershipRecord = InferSelectModel<typeof tenantMemberships>
export type TenantRoleAssignmentRecord = InferSelectModel<
  typeof tenantRoleAssignments
>
export type TenantRoleRecord = InferSelectModel<typeof tenantRoles>

export type ResolvedMembershipRoleScope = {
  assignment: TenantRoleAssignmentRecord
  role: TenantRoleRecord
}

export type ResolvedMembershipScope = {
  membership: TenantMembershipRecord | null
  roleScopes: ResolvedMembershipRoleScope[]
}

export type ResolveMembershipScopeParams = {
  tenantId: string
  userAccountId: string
  asOfDate?: string
}

export async function resolveMembershipScope(
  db: PgDatabase<any, any, any>,
  params: ResolveMembershipScopeParams
): Promise<ResolvedMembershipScope> {
  const {
    tenantId,
    userAccountId,
    asOfDate = new Date().toISOString().slice(0, 10),
  } = params

  const membershipRows = await db
    .select()
    .from(tenantMemberships)
    .where(
      and(
        eq(tenantMemberships.tenantId, tenantId),
        eq(tenantMemberships.userAccountId, userAccountId),
        eq(tenantMemberships.membershipStatus, "active"),
        eq(tenantMemberships.isDeleted, false)
      )
    )
    .limit(1)

  const membership = membershipRows[0] ?? null

  if (!membership) {
    return { membership: null, roleScopes: [] }
  }

  const roleRows = await db
    .select({
      assignment: tenantRoleAssignments,
      role: tenantRoles,
    })
    .from(tenantRoleAssignments)
    .innerJoin(
      tenantRoles,
      eq(tenantRoleAssignments.tenantRoleId, tenantRoles.id)
    )
    .where(
      and(
        eq(tenantRoleAssignments.tenantId, tenantId),
        eq(tenantRoleAssignments.tenantMembershipId, membership.id),
        eq(tenantRoleAssignments.isDeleted, false),
        eq(tenantRoles.isDeleted, false),
        lte(tenantRoleAssignments.effectiveFrom, asOfDate),
        or(
          isNull(tenantRoleAssignments.effectiveTo),
          gte(tenantRoleAssignments.effectiveTo, asOfDate)
        )
      )
    )

  return {
    membership,
    roleScopes: roleRows.map((row) => ({
      assignment: row.assignment,
      role: row.role,
    })),
  }
}
```

---

## 37. `schema/index.ts`

```ts
export * from "./shared/enums"
export * from "./shared/columns"

export * from "./ref/_schema"
export * from "./ref/currencies"
export * from "./ref/countries"
export * from "./ref/locales"
export * from "./ref/timezones"
export * from "./ref/uoms"

export * from "./governance/_schema"
export * from "./governance/data-sources"

export * from "./iam/_schema"
export * from "./iam/user-accounts"
export * from "./iam/persons"
export * from "./iam/tenant-memberships"
export * from "./iam/tenant-roles"
export * from "./iam/tenant-role-assignments"

export * from "./mdm/_schema"
export * from "./mdm/addresses"
export * from "./mdm/tenants"
export * from "./mdm/legal-entities"
export * from "./mdm/business-units"
export * from "./mdm/locations"
export * from "./mdm/item-categories"
export * from "./mdm/items"
export * from "./mdm/item-entity-settings"
export * from "./mdm/tenant-policies"
export * from "./mdm/master-aliases"
export * from "./mdm/external-identities"

export * from "./finance/_schema"
export * from "./finance/chart-of-account-sets"
export * from "./finance/accounts"
export * from "./finance/fiscal-calendars"
export * from "./finance/fiscal-periods"
```

---

## 38. `migrations/0002_hardening.sql`

```sql
create extension if not exists pg_trgm;
create extension if not exists btree_gist;

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

create trigger trg_business_units_set_updated_at
before update on mdm.business_units
for each row execute function governance.set_updated_at();

create trigger trg_business_units_bump_version
before update on mdm.business_units
for each row execute function governance.bump_version_no();

create trigger trg_locations_set_updated_at
before update on mdm.locations
for each row execute function governance.set_updated_at();

create trigger trg_locations_bump_version
before update on mdm.locations
for each row execute function governance.bump_version_no();

create trigger trg_items_set_updated_at
before update on mdm.items
for each row execute function governance.set_updated_at();

create trigger trg_items_bump_version
before update on mdm.items
for each row execute function governance.bump_version_no();

create trigger trg_accounts_set_updated_at
before update on finance.accounts
for each row execute function governance.set_updated_at();

create trigger trg_accounts_bump_version
before update on finance.accounts
for each row execute function governance.bump_version_no();

create unique index if not exists uq_legal_entities_registration_active
  on mdm.legal_entities (tenant_id, registration_number)
  where registration_number is not null and is_deleted = false;

create unique index if not exists uq_legal_entities_tax_registration_active
  on mdm.legal_entities (tenant_id, tax_registration_number)
  where tax_registration_number is not null and is_deleted = false;

create unique index if not exists uq_tenants_name_active
  on mdm.tenants (tenant_name)
  where is_deleted = false;

create unique index if not exists uq_item_entity_settings_le_only
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, effective_from)
  where business_unit_id is null
    and location_id is null
    and is_deleted = false;

create unique index if not exists uq_item_entity_settings_bu
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, business_unit_id, effective_from)
  where business_unit_id is not null
    and location_id is null
    and is_deleted = false;

create unique index if not exists uq_item_entity_settings_location
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, location_id, effective_from)
  where location_id is not null
    and is_deleted = false;

create unique index if not exists uq_master_aliases_preferred
  on mdm.master_aliases (tenant_id, master_domain, master_id, alias_type)
  where is_preferred = true and is_deleted = false;

create index if not exists idx_items_name_trgm
  on mdm.items using gin (item_name gin_trgm_ops);

create index if not exists idx_legal_entities_name_trgm
  on mdm.legal_entities using gin (legal_name gin_trgm_ops);

create index if not exists idx_items_aliases_gin
  on mdm.items using gin (aliases);

create index if not exists idx_legal_entities_aliases_gin
  on mdm.legal_entities using gin (aliases);

create index if not exists idx_tenants_aliases_gin
  on mdm.tenants using gin (aliases);

create index if not exists idx_tenant_policies_value_gin
  on mdm.tenant_policies using gin (policy_value);

create or replace function governance.validate_master_domain_reference()
returns trigger
language plpgsql
as $$
declare
  v_exists boolean;
begin
  if new.master_domain = 'item' then
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
    v_exists := false;
  end if;

  if not v_exists then
    raise exception 'Invalid master reference for domain %, tenant %, id %',
      new.master_domain, new.tenant_id, new.master_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_master_aliases_validate_domain_ref on mdm.master_aliases;
create trigger trg_master_aliases_validate_domain_ref
before insert or update on mdm.master_aliases
for each row execute function governance.validate_master_domain_reference();
```
